import InstagramAutomation from './instagram';
import { BoostType } from '@/lib/api';

// Bot account credentials for different services
interface BotAccount {
  username: string;
  password: string;
}

// Configuration for the automation service
interface AutomationConfig {
  botAccounts: {
    likes: BotAccount[];
    follows: BotAccount[];
    comments: BotAccount[];
  };
  commentTemplates: string[];
  defaultViewDuration: number;
}

// Store bot accounts and configuration
const defaultConfig: AutomationConfig = {
  botAccounts: {
    likes: [
      // Add your bot accounts here
      // { username: 'like_bot1', password: 'password123' },
    ],
    follows: [
      // Add your bot accounts here
      // { username: 'follow_bot1', password: 'password123' },
    ],
    comments: [
      // Add your bot accounts here
      // { username: 'comment_bot1', password: 'password123' },
    ],
  },
  commentTemplates: [
    'Amazing post! 🔥',
    'Love this content! 👍',
    'Great work! 💯',
    'This is awesome! 🙌',
    'Keep it up! 👏',
    'Incredible! 🤩',
    'So inspiring! ✨',
    'Well done! 👌',
    'This made my day! 😊',
    'Fantastic! 🌟',
  ],
  defaultViewDuration: 20000, // 20 seconds
};

// Class to handle all Instagram automation
class AutomationService {
  private config: AutomationConfig;
  
  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
      botAccounts: {
        ...defaultConfig.botAccounts,
        ...(config.botAccounts || {}),
      },
    };
  }
  
  // Generate a random comment from the templates
  private getRandomComment(): string {
    const templates = this.config.commentTemplates;
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }
  
  // Get a random bot account for the specified service
  private getRandomBotAccount(service: 'likes' | 'follows' | 'comments'): BotAccount | null {
    const accounts = this.config.botAccounts[service];
    if (!accounts || accounts.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * accounts.length);
    return accounts[randomIndex];
  }
  
  // Process Instagram reels views
  async processReelsViews(reelUrl: string, amount: number): Promise<boolean> {
    console.log(`Processing ${amount} reels views for ${reelUrl}`);
    
    // For reels views, we don't need to log in
    let successCount = 0;
    let failCount = 0;
    const maxRetries = 3;
    
    // Process in smaller batches to avoid detection
    const batchSize = Math.min(10, amount);
    const batches = Math.ceil(amount / batchSize);
    
    for (let batch = 0; batch < batches; batch++) {
      console.log(`Processing batch ${batch + 1}/${batches}`);
      
      // Calculate views for this batch
      const viewsToProcess = Math.min(batchSize, amount - (batch * batchSize));
      const viewPromises = [];
      
      // Create and process views in parallel (up to batchSize)
      for (let i = 0; i < viewsToProcess; i++) {
        viewPromises.push(this.processReelView(reelUrl, maxRetries));
      }
      
      // Wait for all views in this batch to complete
      const results = await Promise.all(viewPromises);
      
      // Count successes and failures
      results.forEach(success => {
        if (success) {
          successCount++;
        } else {
          failCount++;
        }
      });
      
      // Add delay between batches
      if (batch < batches - 1) {
        const delay = Math.floor(Math.random() * 5000) + 5000; // 5-10 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log(`Reels view processing complete. Success: ${successCount}, Failed: ${failCount}`);
    
    // Return true if at least 80% of the views were successful
    return (successCount / amount) >= 0.8;
  }
  
  // Process a single reel view
  private async processReelView(reelUrl: string, maxRetries: number): Promise<boolean> {
    let retries = 0;
    let success = false;
    
    while (!success && retries < maxRetries) {
      const automation = new InstagramAutomation();
      
      try {
        await automation.initialize();
        
        // Randomize the view duration a bit to appear more natural
        const viewDuration = this.config.defaultViewDuration + 
          Math.floor(Math.random() * 10000); // Add 0-10 seconds randomly
        
        await automation.viewReel(reelUrl, viewDuration);
        success = true;
      } catch (error) {
        console.error(`Error viewing reel (attempt ${retries + 1}):`, error);
        retries++;
      } finally {
        await automation.close();
      }
      
      // Add a short delay between retries
      if (!success && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return success;
  }
  
  // Process Instagram likes
  async processLikes(postUrl: string, amount: number): Promise<boolean> {
    console.log(`Processing ${amount} likes for ${postUrl}`);
    
    let successCount = 0;
    let failCount = 0;
    const maxRetries = 3;
    const availableAccounts = this.config.botAccounts.likes;
    
    if (!availableAccounts || availableAccounts.length === 0) {
      console.error('No bot accounts configured for likes');
      return false;
    }
    
    // Limit amount to the number of available accounts
    const actualAmount = Math.min(amount, availableAccounts.length);
    
    // Process likes in sequence (one per account)
    for (let i = 0; i < actualAmount; i++) {
      const account = availableAccounts[i];
      const result = await this.processLike(postUrl, account, maxRetries);
      
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Add delay between likes
      if (i < actualAmount - 1) {
        const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log(`Likes processing complete. Success: ${successCount}, Failed: ${failCount}`);
    
    // Return true if at least 80% of the likes were successful
    return (successCount / actualAmount) >= 0.8;
  }
  
  // Process a single like
  private async processLike(
    postUrl: string, 
    account: BotAccount, 
    maxRetries: number
  ): Promise<boolean> {
    let retries = 0;
    let success = false;
    
    while (!success && retries < maxRetries) {
      const automation = new InstagramAutomation();
      
      try {
        await automation.initialize();
        await automation.setCredentials(account).login();
        await automation.likePost(postUrl);
        success = true;
      } catch (error) {
        console.error(`Error liking post (attempt ${retries + 1}):`, error);
        retries++;
      } finally {
        await automation.close();
      }
      
      // Add a short delay between retries
      if (!success && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return success;
  }
  
  // Process Instagram followers
  async processFollowers(profileUrl: string, amount: number): Promise<boolean> {
    console.log(`Processing ${amount} followers for ${profileUrl}`);
    
    let successCount = 0;
    let failCount = 0;
    const maxRetries = 3;
    const availableAccounts = this.config.botAccounts.follows;
    
    if (!availableAccounts || availableAccounts.length === 0) {
      console.error('No bot accounts configured for follows');
      return false;
    }
    
    // Limit amount to the number of available accounts
    const actualAmount = Math.min(amount, availableAccounts.length);
    
    // Process follows in sequence (one per account)
    for (let i = 0; i < actualAmount; i++) {
      const account = availableAccounts[i];
      const result = await this.processFollow(profileUrl, account, maxRetries);
      
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Add delay between follows
      if (i < actualAmount - 1) {
        const delay = Math.floor(Math.random() * 5000) + 5000; // 5-10 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log(`Followers processing complete. Success: ${successCount}, Failed: ${failCount}`);
    
    // Return true if at least 80% of the follows were successful
    return (successCount / actualAmount) >= 0.8;
  }
  
  // Process a single follow
  private async processFollow(
    profileUrl: string, 
    account: BotAccount, 
    maxRetries: number
  ): Promise<boolean> {
    let retries = 0;
    let success = false;
    
    while (!success && retries < maxRetries) {
      const automation = new InstagramAutomation();
      
      try {
        await automation.initialize();
        await automation.setCredentials(account).login();
        await automation.followProfile(profileUrl);
        success = true;
      } catch (error) {
        console.error(`Error following profile (attempt ${retries + 1}):`, error);
        retries++;
      } finally {
        await automation.close();
      }
      
      // Add a short delay between retries
      if (!success && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return success;
  }
  
  // Process Instagram comments
  async processComments(postUrl: string, amount: number): Promise<boolean> {
    console.log(`Processing ${amount} comments for ${postUrl}`);
    
    let successCount = 0;
    let failCount = 0;
    const maxRetries = 3;
    const availableAccounts = this.config.botAccounts.comments;
    
    if (!availableAccounts || availableAccounts.length === 0) {
      console.error('No bot accounts configured for comments');
      return false;
    }
    
    // Limit amount to the number of available accounts
    const actualAmount = Math.min(amount, availableAccounts.length);
    
    // Process comments in sequence (one per account)
    for (let i = 0; i < actualAmount; i++) {
      const account = availableAccounts[i];
      const comment = this.getRandomComment();
      const result = await this.processComment(postUrl, comment, account, maxRetries);
      
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Add delay between comments
      if (i < actualAmount - 1) {
        const delay = Math.floor(Math.random() * 10000) + 5000; // 5-15 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    console.log(`Comments processing complete. Success: ${successCount}, Failed: ${failCount}`);
    
    // Return true if at least 80% of the comments were successful
    return (successCount / actualAmount) >= 0.8;
  }
  
  // Process a single comment
  private async processComment(
    postUrl: string, 
    comment: string,
    account: BotAccount, 
    maxRetries: number
  ): Promise<boolean> {
    let retries = 0;
    let success = false;
    
    while (!success && retries < maxRetries) {
      const automation = new InstagramAutomation();
      
      try {
        await automation.initialize();
        await automation.setCredentials(account).login();
        await automation.commentOnPost(postUrl, comment);
        success = true;
      } catch (error) {
        console.error(`Error commenting on post (attempt ${retries + 1}):`, error);
        retries++;
      } finally {
        await automation.close();
      }
      
      // Add a short delay between retries
      if (!success && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return success;
  }
  
  // Process a boost based on type
  async processBoost(type: BoostType, target: string, amount: number): Promise<boolean> {
    switch (type) {
      case 'reels':
        return this.processReelsViews(target, amount);
      case 'likes':
        return this.processLikes(target, amount);
      case 'followers':
        return this.processFollowers(target, amount);
      case 'comments':
        return this.processComments(target, amount);
      default:
        console.error(`Unsupported boost type: ${type}`);
        return false;
    }
  }
}

export default AutomationService; 