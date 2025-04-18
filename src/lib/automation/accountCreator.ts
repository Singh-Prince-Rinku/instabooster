import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Browser, Page } from 'puppeteer';
import { randomBytes } from 'crypto';
import axios from 'axios';
import { Solver } from '2captcha';

// Add Window interface extension at the top of the file
declare global {
  interface Window {
    grecaptcha?: {
      callback?: Function;
      execute?: Function;
      render?: Function;
    };
    onRecaptchaSuccess?: Function;
    captchaCallback?: Function;
    __captchaToken?: string;
  }
}

// Apply stealth plugin
puppeteer.use(StealthPlugin());

// User agent list for spoofing
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36',
];

// Proxy configuration interface
interface ProxyConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
}

// Account creation result interface
export interface AccountCreationResult {
  success: boolean;
  username: string;
  password: string;
  email: string;
  error?: string;
}

// 1secmail API response interfaces
interface TempEmailResponse {
  [index: number]: string;
}

interface EmailMessage {
  id: number;
  from: string;
  subject: string;
  date: string;
}

interface EmailContent {
  id: number;
  from: string;
  subject: string;
  date: string;
  body: string;
  textBody: string;
  htmlBody: string;
  attachments: any[];
}

// Instagram Account Creator Class
class InstagramAccountCreator {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private proxy: ProxyConfig | null = null;
  private userAgent: string = '';
  private captchaSolver: Solver | null = null;
  private captchaApiKey: string = '';
  
  constructor(captchaApiKey?: string) {
    if (captchaApiKey) {
      this.captchaApiKey = captchaApiKey;
      this.captchaSolver = new Solver(captchaApiKey);
    }
  }
  
  // Set proxy configuration
  setProxy(proxy: ProxyConfig) {
    this.proxy = proxy;
    return this;
  }
  
  // Get a random user agent
  private getRandomUserAgent(): string {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }
  
  // Initialize browser with proxy and user agent spoofing
  async initialize() {
    this.userAgent = this.getRandomUserAgent();
    
    const launchOptions: any = {
      headless: false, // Set to true in production
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--window-size=1280,720',
      ],
      defaultViewport: { width: 1280, height: 720 },
    };
    
    // Add proxy if configured
    if (this.proxy) {
      const proxyArg = this.proxy.username 
        ? `--proxy-server=http://${this.proxy.username}:${this.proxy.password}@${this.proxy.host}:${this.proxy.port}`
        : `--proxy-server=http://${this.proxy.host}:${this.proxy.port}`;
      
      launchOptions.args.push(proxyArg);
    }
    
    this.browser = await puppeteer.launch(launchOptions);
    this.page = await this.browser.newPage();
    
    // Set user agent
    await this.page.setUserAgent(this.userAgent);
    
    // Set extra HTTP headers for more realistic browsing
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
    });
    
    // Set up proxy authentication if needed
    if (this.proxy && this.proxy.username) {
      await this.page.authenticate({
        username: this.proxy.username,
        password: this.proxy.password || '',
      });
    }
    
    return this;
  }
  
  // Create a temporary email using 1secmail API
  async createTempEmail(): Promise<{ email: string, mailbox: string, domain: string }> {
    try {
      const response = await axios.get<TempEmailResponse>('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
      const email = response.data[0];
      const [mailbox, domain] = email.split('@');
      
      return { email, mailbox, domain };
    } catch (error) {
      console.error('Error creating temporary email:', error);
      throw new Error('Failed to create temporary email');
    }
  }
  
  // Check for emails in the temporary mailbox
  async checkEmails(mailbox: string, domain: string): Promise<EmailMessage[]> {
    try {
      const response = await axios.get<EmailMessage[]>(
        `https://www.1secmail.com/api/v1/?action=getMessages&login=${mailbox}&domain=${domain}`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking emails:', error);
      return [];
    }
  }
  
  // Read a specific email
  async readEmail(mailbox: string, domain: string, id: number): Promise<EmailContent> {
    try {
      const response = await axios.get<EmailContent>(
        `https://www.1secmail.com/api/v1/?action=readMessage&login=${mailbox}&domain=${domain}&id=${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error reading email:', error);
      throw new Error('Failed to read email');
    }
  }
  
  // Generate a random username
  private generateUsername(): string {
    const adjectives = ['happy', 'creative', 'cosmic', 'vibrant', 'mystic', 'golden', 'silver', 'epic', 'royal', 'alpha'];
    const nouns = ['traveler', 'dreamer', 'voyager', 'artist', 'creator', 'spirit', 'photographer', 'explorer', 'ninja', 'phoenix'];
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    
    return `${adjective}_${noun}${randomNum}`;
  }
  
  // Generate a random password
  private generatePassword(): string {
    const length = 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    
    let password = '';
    const bytes = randomBytes(length);
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(bytes[i] % chars.length);
    }
    
    return password;
  }
  
  // Solve CAPTCHA using 2Captcha
  private async solveCaptcha(siteKey: string, pageUrl: string): Promise<string | null> {
    if (!this.captchaSolver) {
      console.log('No CAPTCHA solver configured. To use 2Captcha, provide an API key.');
      return null;
    }
    
    try {
      console.log(`Solving CAPTCHA with site key: ${siteKey}`);
      const result = await this.captchaSolver.recaptcha(siteKey, pageUrl);
      console.log('CAPTCHA solved successfully');
      return result.data;
    } catch (error) {
      console.error('Error solving CAPTCHA:', error);
      return null;
    }
  }
  
  // Insert CAPTCHA solution into the page
  private async insertCaptchaSolution(token: string): Promise<boolean> {
    if (!this.page) return false;
    
    try {
      await this.page.evaluate((token) => {
        // This targets common reCAPTCHA callback functions
        if (!window.grecaptcha) window.grecaptcha = {};
        const callback = window.grecaptcha.callback || window.onRecaptchaSuccess || window.captchaCallback;
        
        if (typeof callback === 'function') {
          callback(token);
          return true;
        }
        
        // If no callback is found, try to insert the token into any hidden input
        const inputs = document.querySelectorAll('input[type="hidden"][name*="captcha"]');
        if (inputs.length > 0) {
          for (const input of inputs) {
            (input as HTMLInputElement).value = token;
          }
          return true;
        }
        
        // Last resort: set the token in window for debugging
        window.__captchaToken = token;
        return false;
      }, token);
      
      return true;
    } catch (error) {
      console.error('Error inserting CAPTCHA solution:', error);
      return false;
    }
  }
  
  // Create an Instagram account
  async createAccount(): Promise<AccountCreationResult> {
    if (!this.page) {
      throw new Error('Browser not initialized');
    }
    
    const username = this.generateUsername();
    const password = this.generatePassword();
    
    try {
      // Create temporary email
      const { email, mailbox, domain } = await this.createTempEmail();
      console.log(`Using temporary email: ${email}`);
      
      // Go to Instagram signup page
      await this.page.goto('https://www.instagram.com/accounts/emailsignup/', { 
        waitUntil: 'networkidle2',
        timeout: 60000
      });
      
      // Accept cookies if the banner appears
      try {
        const cookieButton = await this.page.$('button:has-text("Accept")');
        if (cookieButton) {
          await cookieButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.log('No cookie banner found or unable to click accept');
      }
      
      // Fill out the form
      await this.page.waitForSelector('input[name="emailOrPhone"]', { timeout: 10000 });
      
      // Email
      await this.page.type('input[name="emailOrPhone"]', email, { delay: 50 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Full name
      const fullName = `${username.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
      await this.page.type('input[name="fullName"]', fullName, { delay: 50 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Username
      await this.page.type('input[name="username"]', username, { delay: 50 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Password
      await this.page.type('input[name="password"]', password, { delay: 50 });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Click sign up button
      const signupButton = await this.page.$('button[type="submit"]');
      if (!signupButton) {
        throw new Error('Sign up button not found');
      }
      await signupButton.click();
      
      // Handle birthday selection if presented
      try {
        await this.page.waitForSelector('select[title="Month"]', { timeout: 10000 });
        
        // Select random birthday (staying above 18 years old)
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const year = 2000 - Math.floor(Math.random() * 20); // Between 1980-2000
        
        await this.page.select('select[title="Month"]', month.toString());
        await this.page.select('select[title="Day"]', day.toString());
        await this.page.select('select[title="Year"]', year.toString());
        
        const nextButton = await this.page.$('button:has-text("Next")');
        if (nextButton) {
          await nextButton.click();
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.log('No birthday selection or error selecting birthday:', error);
      }
      
      // Solve CAPTCHA if present
      try {
        // Check if CAPTCHA is present
        const hasCaptcha = await this.page.evaluate(() => {
          return document.body.innerHTML.includes('captcha') || 
                document.body.innerHTML.includes('recaptcha') ||
                document.querySelector('iframe[src*="recaptcha"]') !== null;
        });
        
        if (hasCaptcha) {
          console.log('CAPTCHA detected. Using 2Captcha service...');
          
          // Get the site key from the page
          const siteKey = await this.page.evaluate(() => {
            // Try to find recaptcha site key in the page
            const recaptchaElements = Array.from(document.querySelectorAll('div[class*="captcha"], iframe[src*="recaptcha"], div[data-sitekey]'));
            for (const el of recaptchaElements) {
              const sitekey = el.getAttribute('data-sitekey');
              if (sitekey) return sitekey;
            }
            
            // Try to extract from iframe URL
            const iframe = document.querySelector('iframe[src*="recaptcha"]');
            if (iframe) {
              const src = iframe.getAttribute('src') || '';
              const match = src.match(/[?&]k=([^&]+)/);
              if (match) return match[1];
            }
            
            return null;
          });
          
          if (siteKey && this.captchaSolver) {
            // Solve CAPTCHA using 2Captcha
            const token = await this.solveCaptcha(siteKey, this.page.url());
            
            if (token) {
              // Insert the solution
              await this.insertCaptchaSolution(token);
              
              // Wait for processing
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              // Look for any continue button
              const continueButtons = await this.page.$$('button:has-text("Continue"), button:has-text("Submit"), button:has-text("Verify")');
              if (continueButtons.length > 0) {
                await continueButtons[0].click();
                await new Promise(resolve => setTimeout(resolve, 5000));
              }
            } else {
              console.log('Failed to solve CAPTCHA');
            }
          } else if (!this.captchaSolver) {
            console.log('CAPTCHA solver not configured. Waiting for manual solving...');
            // Wait longer for manual solving (in non-headless mode)
            await new Promise(resolve => setTimeout(resolve, 30000));
          }
        }
      } catch (error) {
        console.log('No CAPTCHA found or error handling CAPTCHA:', error);
      }
      
      // Check for verification requests (email verification)
      const needsEmailVerification = await this.page.evaluate(() => {
        return document.body.innerText.includes('Verification') || 
               document.body.innerText.includes('confirmation') ||
               document.body.innerText.includes('verify');
      });
      
      if (needsEmailVerification) {
        console.log('Email verification required. Checking temporary email...');
        
        // Wait for email to arrive (up to 60 seconds)
        let verificationCode = '';
        let attempts = 0;
        
        while (!verificationCode && attempts < 12) {
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
          
          const emails = await this.checkEmails(mailbox, domain);
          console.log(`Found ${emails.length} emails in inbox`);
          
          for (const email of emails) {
            if (email.subject.includes('Instagram') || email.from.includes('instagram')) {
              const fullEmail = await this.readEmail(mailbox, domain, email.id);
              
              // Extract verification code (this pattern may need adjustment)
              const match = fullEmail.body.match(/\b\d{6}\b/);
              if (match) {
                verificationCode = match[0];
                console.log(`Found verification code: ${verificationCode}`);
                break;
              }
            }
          }
          
          attempts++;
        }
        
        if (verificationCode) {
          // Enter verification code
          const codeInput = await this.page.$('input[name="verificationCode"], input[placeholder*="code"], input[aria-label*="code"]');
          if (codeInput) {
            await codeInput.type(verificationCode, { delay: 50 });
            
            // Click confirm button
            const confirmButton = await this.page.$('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("Next"), button[type="submit"]');
            if (confirmButton) {
              await confirmButton.click();
              await new Promise(resolve => setTimeout(resolve, 5000));
            }
          } else {
            throw new Error('Could not find verification code input field');
          }
        } else {
          throw new Error('Failed to receive verification code');
        }
      }
      
      // Check if account creation was successful
      const success = await this.page.evaluate(() => {
        return !document.body.innerText.includes('Something went wrong') && 
               !document.body.innerText.includes('problem creating your account');
      });
      
      if (!success) {
        throw new Error('Account creation failed');
      }
      
      console.log(`Successfully created Instagram account: ${username}`);
      
      // Take a screenshot for verification
      await this.page.screenshot({ path: `account_${username}_created.png` });
      
      return {
        success: true,
        username,
        password,
        email
      };
    } catch (error: any) {
      console.error('Error creating account:', error);
      
      // Take a screenshot of the error state
      if (this.page) {
        await this.page.screenshot({ path: `account_creation_error_${Date.now()}.png` });
      }
      
      return {
        success: false,
        username,
        password,
        email: '',
        error: error.message || 'Unknown error'
      };
    }
  }
  
  // Close browser
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

export default InstagramAccountCreator; 