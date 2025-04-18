#!/usr/bin/env ts-node
/**
 * Instagram Account Creator - Production Script
 * 
 * This script creates multiple Instagram accounts using:
 * - Proxy rotation (to avoid IP bans)
 * - 2Captcha for CAPTCHA solving
 * - Temporary email addresses for verification
 * - Secure encrypted storage for the created accounts
 * 
 * The accounts are automatically added to the application's account pool
 * and can be used for various engagement boost services.
 */
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import AutomationService from '../src/lib/automation/automationService';
import ProxyManager, { Proxy } from '../src/lib/automation/proxyManager';
import { execSync } from 'child_process';

// Load environment variables
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.warn('Warning: .env.local file not found. Using environment variables.');
}

// Parse command line arguments
interface CommandArgs {
  count: number;
  proxyFile: string;
  outputDir: string;
  captchaApiKey: string;
  encryptionKey: string;
  headless: boolean;
}

function parseArgs(): CommandArgs {
  const args = process.argv.slice(2);
  const result: CommandArgs = {
    count: 1,
    proxyFile: '',
    outputDir: './accounts',
    captchaApiKey: process.env.CAPTCHA_API_KEY || '',
    encryptionKey: process.env.ACCOUNT_ENCRYPTION_KEY || 'instabooster-secure-key',
    headless: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count' || args[i] === '-c') {
      result.count = parseInt(args[i + 1], 10) || 1;
      i++;
    } else if (args[i] === '--proxies' || args[i] === '-p') {
      result.proxyFile = args[i + 1] || '';
      i++;
    } else if (args[i] === '--output-dir' || args[i] === '-o') {
      result.outputDir = args[i + 1] || result.outputDir;
      i++;
    } else if (args[i] === '--captcha-key') {
      result.captchaApiKey = args[i + 1] || result.captchaApiKey;
      i++;
    } else if (args[i] === '--encryption-key') {
      result.encryptionKey = args[i + 1] || result.encryptionKey;
      i++;
    } else if (args[i] === '--headless') {
      result.headless = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
Instagram Account Creator - Production Script

Usage: ts-node scripts/create-accounts-production.ts [options]

Options:
  -c, --count <number>      Number of accounts to create (default: 1)
  -p, --proxies <file>      JSON file containing proxy configurations (required for production)
  -o, --output-dir <dir>    Directory to store account data (default: ./accounts)
  --captcha-key <key>       2Captcha API key (can also be set in .env.local)
  --encryption-key <key>    Key for encrypting account data (can also be set in .env.local)
  --headless                Run in headless mode (no browser UI)
  -h, --help                Show this help message
      `);
      process.exit(0);
    }
  }
  
  return result;
}

// Load proxies from file
function loadProxies(proxyFile: string): Proxy[] {
  if (!proxyFile || !fs.existsSync(proxyFile)) {
    console.warn('Warning: No proxy file provided or file not found. Running without proxies is not recommended for production.');
    return [];
  }
  
  try {
    const data = fs.readFileSync(proxyFile, 'utf8');
    const proxies: Proxy[] = JSON.parse(data);
    console.log(`Loaded ${proxies.length} proxies from ${proxyFile}`);
    return proxies;
  } catch (error) {
    console.error('Error loading proxies:', error);
    return [];
  }
}

// Main function
async function main() {
  console.log('\n========== INSTAGRAM ACCOUNT CREATOR - PRODUCTION ==========\n');
  
  // Parse arguments
  const args = parseArgs();
  
  // Load proxies
  const proxies = loadProxies(args.proxyFile);
  
  // Check 2Captcha API key
  if (!args.captchaApiKey) {
    console.warn('Warning: No 2Captcha API key provided. CAPTCHA solving will not work properly.');
    console.warn('Set the CAPTCHA_API_KEY environment variable or use --captcha-key option.');
  }
  
  console.log(`Starting account creation process for ${args.count} accounts...`);
  
  // Set up automation service
  const service = new AutomationService({
    proxies,
    captchaApiKey: args.captchaApiKey,
    accountStorageSettings: {
      encryptionKey: args.encryptionKey,
      storageDir: args.outputDir
    }
  });
  
  // Create accounts
  try {
    const results = await service.createAccounts(args.count);
    
    // Log results
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log('\n===================== RESULTS =====================');
    console.log(`Total accounts attempted: ${args.count}`);
    console.log(`Successfully created: ${successCount}`);
    console.log(`Failed: ${failCount}`);
    
    if (successCount > 0) {
      // Export the accounts to a JSON backup file for reference
      const jsonBackupPath = path.join(args.outputDir, `account_backup_${Date.now()}.json`);
      await service.exportAccounts(jsonBackupPath);
      console.log(`Created accounts have been encrypted and stored in ${args.outputDir}`);
      console.log(`A plaintext backup was also saved to ${jsonBackupPath}`);
      
      // Print stats
      const stats = service.getAccountStats();
      console.log('\nAccount Pool Statistics:');
      console.log(`Total accounts available: ${stats.available}`);
      console.log(`Like service accounts: ${stats.likes}`);
      console.log(`Follow service accounts: ${stats.follows}`);
      console.log(`Comment service accounts: ${stats.comments}`);
    }
    
    console.log('\n===================================================');
  } catch (error) {
    console.error('Error during account creation process:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 