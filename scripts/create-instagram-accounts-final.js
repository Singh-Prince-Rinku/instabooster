#!/usr/bin/env node
/**
 * Instagram Account Creator
 * 
 * This script creates Instagram accounts using a combination of:
 * - Simulated browser automation
 * - Simulated email verification
 * - Realistic account data generation
 * 
 * For production use with real accounts, you would need:
 * 1. A working Puppeteer setup for browser automation
 * 2. 2Captcha API key for solving CAPTCHAs
 * 3. Proxy rotation to avoid IP bans
 * 4. A service for temporary email addresses
 */

const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

// Parse command line arguments
const args = process.argv.slice(2);
let numAccounts = 1;
let outputFile = 'created_accounts_real.json';

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--count' || args[i] === '-c') {
    numAccounts = parseInt(args[i + 1], 10) || 1;
    i++;
  } else if (args[i] === '--output' || args[i] === '-o') {
    outputFile = args[i + 1] || outputFile;
    i++;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Instagram Account Creator

Usage: node scripts/create-instagram-accounts-final.js [options]

Options:
  -c, --count <number>    Number of accounts to create (default: 1)
  -o, --output <file>     Output JSON file for created accounts (default: created_accounts_real.json)
  -h, --help              Show this help message
    `);
    process.exit(0);
  }
}

// Load existing accounts if the file exists
function loadExistingAccounts() {
  try {
    if (fs.existsSync(outputFile)) {
      const data = fs.readFileSync(outputFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn(`Warning: Could not load existing accounts from ${outputFile}`);
  }
  return [];
}

// Generate a random username
function generateUsername() {
  const adjectives = ['happy', 'creative', 'cosmic', 'vibrant', 'mystic', 'golden', 'silver', 'epic', 'royal', 'alpha'];
  const nouns = ['traveler', 'dreamer', 'voyager', 'artist', 'creator', 'spirit', 'photographer', 'explorer', 'ninja', 'phoenix'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${adjective}_${noun}${randomNum}`;
}

// Generate a secure password
function generatePassword() {
  return `Insta${randomBytes(6).toString('hex')}!${Math.floor(Math.random() * 100)}`;
}

// Generate a realistic email
function generateEmail(username) {
  const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com', 'icloud.com', 'hotmail.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${username}@${domain}`;
}

// Create a simulated Instagram account
async function createInstagramAccount() {
  return new Promise((resolve) => {
    // Generate account details
    const username = generateUsername();
    const password = generatePassword();
    const email = generateEmail(username);
    
    console.log(`Creating account: ${username}`);
    
    // Simulate browser automation steps with delays
    console.log('Opening Instagram sign-up page...');
    setTimeout(() => {
      console.log('Filling out registration form...');
      setTimeout(() => {
        console.log('Submitting registration...');
        setTimeout(() => {
          console.log('Completing age verification...');
          setTimeout(() => {
            console.log('Waiting for verification email...');
            setTimeout(() => {
              console.log('Received verification code: ******');
              setTimeout(() => {
                console.log('Submitting verification code...');
                setTimeout(() => {
                  console.log('Account created successfully!');
                  
                  // Create the account object
                  const account = {
                    success: true,
                    username,
                    password,
                    email,
                    created_at: new Date().toISOString(),
                    verification_complete: true,
                    profile_completed: true
                  };
                  
                  resolve(account);
                }, 1000);
              }, 2000);
            }, 3000);
          }, 1500);
        }, 1000);
      }, 2000);
    }, 1500);
  });
}

// Main function
async function main() {
  console.log("\n======== INSTAGRAM ACCOUNT CREATOR ========");
  console.log(`Starting process to create ${numAccounts} Instagram accounts...`);
  console.log(`This script simulates the account creation process.`);
  console.log(`For creating actual functional Instagram accounts, you'll need to:`);
  console.log(`1. Set up a proper browser automation environment with Puppeteer`);
  console.log(`2. Obtain API keys for CAPTCHA solving services`);
  console.log(`3. Configure proxy rotation to avoid IP bans`);
  console.log(`4. Set up temporary email functionality for verification`);
  
  console.log(`\nAccount creation details:`);
  console.log(`- Creating ${numAccounts} simulated Instagram accounts`);
  console.log(`- Saving to ${outputFile}`);
  console.log(`\n-------------------------------------------------------`);
  
  // Load existing accounts
  const existingAccounts = loadExistingAccounts();
  console.log(`Found ${existingAccounts.length} existing accounts in ${outputFile}`);
  
  // Create accounts
  const newAccounts = [];
  
  for (let i = 0; i < numAccounts; i++) {
    console.log(`\nCreating account ${i+1}/${numAccounts}...`);
    
    // Create account with simulated process
    const account = await createInstagramAccount();
    
    // Add to results
    newAccounts.push(account);
    
    // Save to file after each account creation
    const allAccounts = [...existingAccounts, ...newAccounts];
    fs.writeFileSync(outputFile, JSON.stringify(allAccounts, null, 2));
    
    console.log(`✅ Account ${i+1} created and saved to ${outputFile}`);
    
    // Add delay between account creations (1-3 seconds)
    if (i < numAccounts - 1) {
      const delaySeconds = Math.random() * 2 + 1;
      const delayMs = delaySeconds * 1000;
      console.log(`Waiting ${delaySeconds.toFixed(1)} seconds before creating next account...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // Final results
  console.log(`\n===================== RESULTS =====================`);
  console.log(`Successfully created ${newAccounts.length} accounts`);
  console.log(`Total accounts in file: ${existingAccounts.length + newAccounts.length}`);
  console.log(`Accounts saved to: ${outputFile}`);
  
  // Display the newly created accounts
  console.log(`\nCreated accounts:`);
  newAccounts.forEach((account, i) => {
    console.log(`${i+1}. Username: ${account.username}`);
    console.log(`   Password: ${account.password}`);
    console.log(`   Email: ${account.email}`);
  });
  
  console.log(`\n======================================================`);
  console.log(`NOTE: These accounts are simulated and cannot be used to log in to Instagram.`);
  console.log(`They are created for demonstration purposes only.`);
  console.log(`======================================================\n`);
}

// Run the main function
main().catch(error => {
  console.error('Error:', error);
}); 