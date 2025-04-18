import InstagramAutomation from './instagram';
import InstagramAccountCreator, { AccountCreationResult } from './accountCreator';
import { BoostType } from '@/lib/api';
import ProxyManager, { Proxy } from './proxyManager';
import AccountStorage, { InstagramAccount } from './accountStorage';
import path from 'path';

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
  proxies: Proxy[];
  captchaApiKey?: string;
  accountStorageSettings?: {
    encryptionKey?: string;
    storageDir?: string;
  };
}

// Store bot accounts and configuration
const defaultConfig: AutomationConfig = {
  botAccounts: {
    likes: [],
    follows: [],
    comments: [],
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
    // Added more varied comment templates
    'This is exactly what I needed to see today! 💖',
    'Your content always brightens my day! ✨',
    'Such a creative post! 🎨',
    'You are so talented! 👏👏👏',
    'This deserves more attention! 👀',
    'Mind blown! 🤯',
    'Cannot stop looking at this! 👌',
    'This is goals! 🙌',
    'Obsessed with this! 😍',
    'Top tier content! 💯',
  ],
  defaultViewDuration: 20000, // 20 seconds
  proxies: [],
  captchaApiKey: process.env.CAPTCHA_API_KEY || '',
};

// Class to handle all Instagram automation
class AutomationService {
  private config: AutomationConfig;
  private proxyManager: ProxyManager | null = null;
  private accountStorage: AccountStorage;
  
  constructor(config: Partial<AutomationConfig> = {}) {
    this.config = {
      ...defaultConfig,
      ...config,
      botAccounts: {
        ...defaultConfig.botAccounts,
        ...(config.botAccounts || {}),
      },
    };
    
    // Initialize proxy manager if proxies provided
    if (this.config.proxies && this.config.proxies.length > 0) {
      this.proxyManager = new ProxyManager(this.config.proxies);
    }
    
    // Initialize account storage
    this.accountStorage = new AccountStorage(this.config.accountStorageSettings);
    this.initializeAccounts();
  }
  
  // Initialize accounts from storage
  private async initializeAccounts() {
    const accounts = await this.accountStorage.loadAccounts();
    
    // Add accounts to the appropriate bot categories
    accounts.forEach(account => {
      const botAccount = { username: account.username, password: account.password };
      
      // Skip banned accounts
      if (account.is_banned) return;
      
      if (account.category === 'likes' || !account.category) {
        this.config.botAccounts.likes.push(botAccount);
      }
      
      if (account.category === 'follows' || !account.category) {
        this.config.botAccounts.follows.push(botAccount);
      }
      
      if (account.category === 'comments' || !account.category) {
        this.config.botAccounts.comments.push(botAccount);
      }
    });
    
    console.log(`Initialized with ${this.config.botAccounts.likes.length} like accounts, ${this.config.botAccounts.follows.length} follow accounts, ${this.config.botAccounts.comments.length} comment accounts`);
  }
  
  // Get a random proxy
  private getRandomProxy(): Proxy | null {
    if (this.proxyManager) {
      return this.proxyManager.getProxy();
    }
    
    if (this.config.proxies && this.config.proxies.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.config.proxies.length);
      return this.config.proxies[randomIndex];
    }
    
    return null;
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
  
  // Create multiple Instagram accounts
  async createAccounts(amount: number): Promise<AccountCreationResult[]> {
    console.log(`Creating ${amount} Instagram accounts`);
    
    const results: AccountCreationResult[] = [];
    
    for (let i = 0; i < amount; i++) {
      console.log(`Creating account ${i + 1}/${amount}`);
      
      // Get a proxy to use
      const proxy = this.getRandomProxy();
      
      // Create an account creator instance with CAPTCHA API key
      const creator = new InstagramAccountCreator(this.config.captchaApiKey);
      
      if (proxy) {
        creator.setProxy(proxy);
      }
      
      try {
        await creator.initialize();
        const result = await creator.createAccount();
        
        if (result.success) {
          // Add successful account to storage
          this.addAccountToStorage(result);
          
          // Add to bot account lists
          this.addBotAccount(result);
          
          // Mark proxy as successful if using proxy manager
          if (proxy && this.proxyManager) {
            this.proxyManager.markProxySuccess(proxy);
          }
        } else if (proxy && this.proxyManager) {
          // Mark proxy as failed
          this.proxyManager.markProxyFailed(proxy);
        }
        
        results.push(result);
      } catch (error) {
        console.error('Error during account creation:', error);
        
        // Mark proxy as failed
        if (proxy && this.proxyManager) {
          this.proxyManager.markProxyFailed(proxy);
        }
        
        results.push({
          success: false,
          username: '',
          password: '',
          email: '',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        await creator.close();
      }
      
      // Add delay between account creations to avoid detection
      if (i < amount - 1) {
        const delay = Math.floor(Math.random() * 60000) + 60000; // 1-2 minutes
        console.log(`Waiting ${Math.round(delay / 1000)} seconds before creating next account...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Save proxy stats if we're using proxy manager
    if (this.proxyManager) {
      this.proxyManager.saveProxyStats();
    }
    
    console.log(`Account creation complete. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);
    
    return results;
  }
  
  // Add a new account to secure storage
  private addAccountToStorage(account: AccountCreationResult): void {
    const instagramAccount: InstagramAccount = {
      username: account.username,
      password: account.password,
      email: account.email,
      created_at: new Date().toISOString(),
      usage_count: 0,
      is_banned: false
    };
    
    this.accountStorage.addAccounts([instagramAccount]);
  }
  
  // Add a new bot account to the configuration
  private addBotAccount(account: AccountCreationResult) {
    const { username, password } = account;
    
    // Add to all three categories for versatility
    this.config.botAccounts.likes.push({ username, password });
    this.config.botAccounts.follows.push({ username, password });
    this.config.botAccounts.comments.push({ username, password });
    
    console.log(`Added ${username} to bot accounts pool`);
  }
  
  // Process boost with account creation option
  async processBoostWithAccounts(type: BoostType, target: string, amount: number, createAccounts: boolean = false): Promise<boolean> {
    if (createAccounts) {
      // First create accounts if needed
      const accountResults = await this.createAccounts(amount);
      const successfulAccounts = accountResults.filter(account => account.success);
      
      if (successfulAccounts.length === 0) {
        console.error('Failed to create any accounts, cannot proceed with boost');
        return false;
      }
      
      // Use the newly created accounts for the boost
      console.log(`Using ${successfulAccounts.length} newly created accounts for the boost`);
    }
    
    // Proceed with regular boost process
    return this.processBoost(type, target, amount);
  }
  
  // Export accounts to JSON
  async exportAccounts(filePath: string): Promise<boolean> {
    return this.accountStorage.exportToJson(filePath);
  }
  
  // Import accounts from JSON
  async importAccounts(filePath: string): Promise<boolean> {
    const success = this.accountStorage.importFromJson(filePath);
    
    // Re-initialize accounts if import was successful
    if (success) {
      await this.initializeAccounts();
    }
    
    return success;
  }
  
  // Get account statistics
  getAccountStats(): { total: number, available: number, likes: number, follows: number, comments: number } {
    return {
      total: this.config.botAccounts.likes.length + 
             this.config.botAccounts.follows.length + 
             this.config.botAccounts.comments.length,
      available: (this.accountStorage.getAvailableAccounts() || []).length,
      likes: this.config.botAccounts.likes.length,
      follows: this.config.botAccounts.follows.length,
      comments: this.config.botAccounts.comments.length
    };
  }
}

export default AutomationService; 