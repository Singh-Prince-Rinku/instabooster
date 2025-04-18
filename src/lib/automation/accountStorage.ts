import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Interface for Instagram account
export interface InstagramAccount {
  username: string;
  password: string;
  email: string;
  created_at: string;
  last_used?: string;
  is_banned?: boolean;
  usage_count?: number;
  category?: 'likes' | 'follows' | 'comments' | 'general';
}

// Account storage settings
interface AccountStorageSettings {
  encryptionKey?: string;
  storageDir?: string;
  saveFormat?: 'json' | 'encrypted';
}

// Default storage settings
const defaultSettings: AccountStorageSettings = {
  storageDir: './accounts',
  saveFormat: 'encrypted',
  encryptionKey: process.env.ACCOUNT_ENCRYPTION_KEY || 'instabooster-secure-key'
};

/**
 * Account Storage Manager
 * Handles storing Instagram bot accounts securely with encryption
 */
class AccountStorage {
  private accounts: InstagramAccount[] = [];
  private settings: AccountStorageSettings;
  private mainFilePath: string;
  
  constructor(settings: AccountStorageSettings = {}) {
    this.settings = { ...defaultSettings, ...settings };
    this.ensureStorageDir();
    this.mainFilePath = path.join(this.settings.storageDir || './accounts', 'instagram_accounts.dat');
  }
  
  // Ensure storage directory exists
  private ensureStorageDir(): void {
    if (!this.settings.storageDir) return;
    
    if (!fs.existsSync(this.settings.storageDir)) {
      fs.mkdirSync(this.settings.storageDir, { recursive: true });
      console.log(`Created storage directory: ${this.settings.storageDir}`);
    }
  }
  
  // Load accounts from storage
  public async loadAccounts(): Promise<InstagramAccount[]> {
    try {
      if (!fs.existsSync(this.mainFilePath)) {
        console.log(`No account storage file found at ${this.mainFilePath}`);
        return [];
      }
      
      const data = fs.readFileSync(this.mainFilePath, 'utf8');
      
      // Decrypt if necessary
      if (this.settings.saveFormat === 'encrypted') {
        this.accounts = this.decryptData(data);
      } else {
        this.accounts = JSON.parse(data);
      }
      
      console.log(`Loaded ${this.accounts.length} Instagram accounts from storage`);
      return this.accounts;
    } catch (error) {
      console.error('Error loading accounts:', error);
      return [];
    }
  }
  
  // Save accounts to storage
  public async saveAccounts(): Promise<boolean> {
    try {
      // Prepare data for saving
      let dataToSave: string;
      
      if (this.settings.saveFormat === 'encrypted') {
        dataToSave = this.encryptData(this.accounts);
      } else {
        dataToSave = JSON.stringify(this.accounts, null, 2);
      }
      
      // Save to file
      fs.writeFileSync(this.mainFilePath, dataToSave);
      console.log(`Saved ${this.accounts.length} accounts to ${this.mainFilePath}`);
      
      // Create backup
      const backupPath = `${this.mainFilePath}.backup.${Date.now()}`;
      fs.writeFileSync(backupPath, dataToSave);
      
      return true;
    } catch (error) {
      console.error('Error saving accounts:', error);
      return false;
    }
  }
  
  // Add new accounts
  public addAccounts(newAccounts: InstagramAccount[]): void {
    // Filter out duplicates
    const uniqueAccounts = newAccounts.filter(newAccount => 
      !this.accounts.some(existing => existing.username === newAccount.username)
    );
    
    // Add new accounts
    this.accounts.push(...uniqueAccounts);
    console.log(`Added ${uniqueAccounts.length} new accounts to storage`);
    
    // Save changes
    this.saveAccounts();
  }
  
  // Get accounts by category
  public getAccountsByCategory(category: string): InstagramAccount[] {
    return this.accounts.filter(account => 
      account.category === category || !account.category
    );
  }
  
  // Get available (non-banned) accounts
  public getAvailableAccounts(): InstagramAccount[] {
    return this.accounts.filter(account => !account.is_banned);
  }
  
  // Mark account as used
  public markAccountUsed(username: string): void {
    const account = this.accounts.find(acc => acc.username === username);
    if (account) {
      account.last_used = new Date().toISOString();
      account.usage_count = (account.usage_count || 0) + 1;
    }
  }
  
  // Mark account as banned
  public markAccountBanned(username: string): void {
    const account = this.accounts.find(acc => acc.username === username);
    if (account) {
      account.is_banned = true;
      console.log(`Marked account ${username} as banned`);
    }
  }
  
  // Encrypt data
  private encryptData(data: any): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    // Prepend IV to the encrypted data (need it for decryption)
    return iv.toString('hex') + ':' + encrypted;
  }
  
  // Decrypt data
  private decryptData(encryptedData: string): any {
    try {
      const key = this.getEncryptionKey();
      const parts = encryptedData.split(':');
      
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      // Return empty array if decryption fails
      return [];
    }
  }
  
  // Get the encryption key (normalize to 32 bytes for AES-256)
  private getEncryptionKey(): Buffer {
    if (!this.settings.encryptionKey) {
      throw new Error('Encryption key not set');
    }
    
    // Create a 32-byte key from the provided string
    return crypto.createHash('sha256')
      .update(String(this.settings.encryptionKey))
      .digest();
  }
  
  // Export accounts to a regular JSON file (for backup)
  public exportToJson(filePath: string): boolean {
    try {
      fs.writeFileSync(filePath, JSON.stringify(this.accounts, null, 2));
      console.log(`Exported ${this.accounts.length} accounts to ${filePath}`);
      return true;
    } catch (error) {
      console.error('Error exporting accounts:', error);
      return false;
    }
  }
  
  // Import accounts from a JSON file
  public importFromJson(filePath: string): boolean {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(`Import file not found: ${filePath}`);
        return false;
      }
      
      const data = fs.readFileSync(filePath, 'utf8');
      const importedAccounts: InstagramAccount[] = JSON.parse(data);
      
      this.addAccounts(importedAccounts);
      return true;
    } catch (error) {
      console.error('Error importing accounts:', error);
      return false;
    }
  }
}

export default AccountStorage; 