import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import { ElementHandle } from 'puppeteer';

// Apply stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

interface InstagramCredentials {
  username: string;
  password: string;
}

class InstagramAutomation {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;
  private credentials: InstagramCredentials | null = null;

  // Initialize browser and page
  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080',
      ],
      defaultViewport: { width: 1280, height: 720 },
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to mimic a real user
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
    );
    
    // Set extra HTTP headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });
    
    // Enable request interception to fake browser fingerprint
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      request.continue();
    });
    
    return this;
  }

  // Set Instagram credentials for login
  setCredentials(credentials: InstagramCredentials) {
    this.credentials = credentials;
    return this;
  }

  // Login to Instagram
  async login() {
    if (!this.page || !this.credentials) {
      throw new Error('Browser not initialized or credentials not set');
    }
    
    try {
      await this.page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
      
      // Accept cookies if present
      try {
        const cookieButton = await this.page.$('button:has-text("Accept")');
        if (cookieButton) {
          await cookieButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.log('No cookie banner found or unable to click accept');
      }

      // Input username
      await this.page.waitForSelector('input[name="username"]');
      await this.page.type('input[name="username"]', this.credentials.username, { delay: 50 });
      
      // Input password
      await this.page.type('input[name="password"]', this.credentials.password, { delay: 50 });
      
      // Click login button
      await this.page.waitForSelector('button[type="submit"]');
      await this.page.click('button[type="submit"]');
      
      // Wait for navigation to complete
      await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      // Check if login was successful
      const url = this.page.url();
      this.isLoggedIn = url.includes('instagram.com/') && !url.includes('accounts/login');
      
      if (!this.isLoggedIn) {
        // Check for security challenge
        if (url.includes('challenge')) {
          throw new Error('Login failed: Security challenge encountered');
        }
        throw new Error('Login failed');
      }
      
      console.log('Successfully logged in to Instagram');
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  // View a reel
  async viewReel(reelUrl: string, viewDurationMs: number = 15000) {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    
    try {
      await this.page.goto(reelUrl, { waitUntil: 'networkidle2' });
      
      // Check if it's a valid reel page
      const isValidReel = await this.page.evaluate(() => {
        return !!document.querySelector('video') || 
               !!document.querySelector('div[role="button"][aria-label*="Play"]');
      });
      
      if (!isValidReel) {
        throw new Error('Invalid reel or reel not found');
      }
      
      // Try to play the reel if it's not already playing
      try {
        const playButton = await this.page.$('div[role="button"][aria-label*="Play"]');
        if (playButton) {
          await playButton.click();
        }
      } catch (error) {
        console.log('No play button found or already playing');
      }
      
      // Wait for the specified duration to view the reel
      await new Promise(resolve => setTimeout(resolve, viewDurationMs));
      
      return true;
    } catch (error) {
      console.error('Error viewing reel:', error);
      throw error;
    }
  }

  // Like a post
  async likePost(postUrl: string) {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Browser not initialized or not logged in');
    }
    
    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2' });
      
      // Check if like button exists
      const likeButton = await this.page.$('svg[aria-label="Like"]');
      if (!likeButton) {
        // Check if already liked
        const unlikeButton = await this.page.$('svg[aria-label="Unlike"]');
        if (unlikeButton) {
          console.log('Post already liked');
          return true;
        }
        throw new Error('Like button not found');
      }
      
      // Click the like button
      await likeButton.click();
      
      // Wait for the like to register
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verify like was successful
      const likeSuccessful = await this.page.evaluate(() => {
        return !!document.querySelector('svg[aria-label="Unlike"]');
      });
      
      if (!likeSuccessful) {
        throw new Error('Like action failed');
      }
      
      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  // Follow a profile
  async followProfile(profileUrl: string) {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Browser not initialized or not logged in');
    }
    
    try {
      await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
      
      // Look for the follow button
      const followButton = await this.page.$('button:has-text("Follow")');
      
      if (!followButton) {
        // Check if already following
        const followingButton = await this.page.$('button:has-text("Following")');
        if (followingButton) {
          console.log('Already following this profile');
          return true;
        }
        throw new Error('Follow button not found');
      }
      
      // Click the follow button
      await followButton.click();
      
      // Wait for the follow action to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify follow was successful
      const followSuccessful = await this.page.$('button:has-text("Following")');
      
      if (!followSuccessful) {
        throw new Error('Follow action failed');
      }
      
      return true;
    } catch (error) {
      console.error('Error following profile:', error);
      throw error;
    }
  }

  // Comment on a post
  async commentOnPost(postUrl: string, comment: string) {
    if (!this.page || !this.isLoggedIn) {
      throw new Error('Browser not initialized or not logged in');
    }
    
    try {
      await this.page.goto(postUrl, { waitUntil: 'networkidle2' });
      
      // Click on the comment section to focus
      const commentButton = await this.page.$('svg[aria-label="Comment"]');
      if (!commentButton) {
        throw new Error('Comment button not found');
      }
      
      await commentButton.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Type the comment
      const commentTextarea = await this.page.$('textarea[aria-label="Add a comment…"]');
      if (!commentTextarea) {
        throw new Error('Comment textarea not found');
      }
      
      await commentTextarea.type(comment, { delay: 100 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Submit the comment
      const postButton = await this.page.$('button:has-text("Post")');
      if (!postButton) {
        throw new Error('Post button not found');
      }
      
      await postButton.click();
      
      // Wait for the comment to be posted
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return true;
    } catch (error) {
      console.error('Error commenting on post:', error);
      throw error;
    }
  }

  // Close the browser
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.isLoggedIn = false;
    }
  }
}

// Export the automation class
export default InstagramAutomation; 