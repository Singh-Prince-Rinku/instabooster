#!/usr/bin/env ts-node
import AutomationService from '../src/lib/automation/automationService';
import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
let numAccounts = 1;
let outputFile = 'created_accounts.json';
let proxyFile = '';

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' || args[i] === '-c') {
    numAccounts = parseInt(args[i + 1], 10) || 1;
    i++;
  } else if (args[i] === '--output' || args[i] === '-o') {
    outputFile = args[i + 1] || outputFile;
    i++;
  } else if (args[i] === '--proxies' || args[i] === '-p') {
    proxyFile = args[i + 1] || '';
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: create-accounts [options]

Options:
  -c, --count <number>    Number of accounts to create (default: 1)
  -o, --output <file>     Output JSON file for created accounts (default: created_accounts.json)
  -p, --proxies <file>    JSON file containing proxy configurations
  -h, --help              Show this help message
    `);
    process.exit(0);
  }
}

// Load proxies if provided
let proxies: { host: string; port: number; username?: string; password?: string; }[] = [];
if (proxyFile && fs.existsSync(proxyFile)) {
  try {
    const proxyData = fs.readFileSync(proxyFile, 'utf8');
    proxies = JSON.parse(proxyData);
    console.log(`Loaded ${proxies.length} proxies from ${proxyFile}`);
  } catch (error) {
    console.error(`Error loading proxies from ${proxyFile}:`, error);
    process.exit(1);
  }
}

async function createAccounts() {
  console.log(`Starting account creation process for ${numAccounts} accounts...`);
  
  // Initialize the automation service
  const service = new AutomationService({
    proxies
  });
  
  try {
    // Create accounts
    const results = await service.createAccounts(numAccounts);
    
    // Log results
    console.log('Account creation completed:');
    console.log(`- Success: ${results.filter(r => r.success).length}`);
    console.log(`- Failed: ${results.filter(r => !r.success).length}`);
    
    // Extract successful accounts
    const successfulAccounts = results.filter(r => r.success);
    
    if (successfulAccounts.length > 0) {
      // Save accounts to a JSON file
      const accountData = successfulAccounts.map(account => ({
        username: account.username,
        password: account.password,
        email: account.email,
        created_at: new Date().toISOString(),
      }));
      
      const outputPath = path.resolve(process.cwd(), outputFile);
      
      // Check if file exists and append if it does
      let existingAccounts = [];
      if (fs.existsSync(outputPath)) {
        try {
          const existingData = fs.readFileSync(outputPath, 'utf8');
          existingAccounts = JSON.parse(existingData);
          console.log(`Appending to existing accounts file with ${existingAccounts.length} accounts`);
        } catch (error) {
          console.error(`Error reading existing accounts file:`, error);
          // Continue with an empty array if there's an error
        }
      }
      
      // Combine existing and new accounts
      const allAccounts = [...existingAccounts, ...accountData];
      
      // Write to file
      fs.writeFileSync(outputPath, JSON.stringify(allAccounts, null, 2));
      
      console.log(`Successfully saved ${successfulAccounts.length} accounts to ${outputPath}`);
      console.log(`Total accounts in file: ${allAccounts.length}`);
    } else {
      console.log('No accounts were successfully created.');
    }
  } catch (error) {
    console.error('Error in account creation process:', error);
    process.exit(1);
  }
}

// Run the account creation
createAccounts().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 