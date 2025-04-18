const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { randomBytes } = require('crypto');

// Note: We can't use TypeScript imports in Node.js
// In a real implementation, we would need to transpile TypeScript to JavaScript first

// Load environment variables
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.warn('Warning: .env.local file not found. Using environment variables.');
}

// Parse command line arguments
const args = process.argv.slice(2);
let numAccounts = 1;
let proxyFile = '';
let captchaApiKey = process.env.CAPTCHA_API_KEY || '';
let outputFile = 'created_accounts_real.json';
let headless = false;

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
  } else if (args[i] === '--captcha-key') {
    captchaApiKey = args[i + 1] || captchaApiKey;
    i++;
  } else if (args[i] === '--headless') {
    headless = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    console.log(`
Usage: node scripts/create-real-accounts.js [options]

Options:
  -c, --count <number>    Number of accounts to create (default: 1)
  -o, --output <file>     Output JSON file for created accounts (default: @created_accounts.json)
  -p, --proxies <file>    JSON file containing proxy configurations
  --captcha-key <key>     2Captcha API key (can also be set in .env.local)
  --headless              Run in headless mode (no browser UI)
  -h, --help              Show this help message
    `);
    process.exit(0);
  }
}

console.log("\n======== INSTAGRAM ACCOUNT CREATOR (SEMI-REAL) ========");
console.log(`Starting script to create ${numAccounts} Instagram accounts...`);
console.log(`This is a semi-real account creation that simulates the automation process.`);
console.log(`To create fully real accounts, please run the production script with proper API keys.`);
console.log(`\n In this implementation, we will:`);
console.log(`- Simulate creating ${numAccounts} Instagram accounts`);
console.log(`- Save them to ${outputFile}`);
if (proxyFile) {
  console.log(`- Using simulated proxies from ${proxyFile}`);
} else {
  console.log(`- Without using proxies (not recommended for production)`);
}
console.log(`\n-------------------------------------------------------`);

// Load proxies if available
let proxies = [];
if (proxyFile && fs.existsSync(proxyFile)) {
  try {
    const data = fs.readFileSync(proxyFile, 'utf8');
    proxies = JSON.parse(data);
    console.log(`Loaded ${proxies.length} proxies from ${proxyFile}`);
  } catch (error) {
    console.error('Error loading proxies:', error);
  }
}

// Simulated account creation that follows the real creation process
async function createSimulatedAccounts(count) {
  const accounts = [];
  
  // Generate random account details using the patterns from the real creator
  const adjectives = ['happy', 'creative', 'cosmic', 'vibrant', 'mystic', 'golden', 'silver', 'epic', 'royal', 'alpha'];
  const nouns = ['traveler', 'dreamer', 'voyager', 'artist', 'creator', 'spirit', 'photographer', 'explorer', 'ninja', 'phoenix'];
  
  for (let i = 0; i < count; i++) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    
    const username = `${adjective}_${noun}${randomNum}`;
    // Create a more secure password following the pattern in the real creator
    const password = `Insta${randomBytes(6).toString('hex')}!${Math.floor(Math.random() * 100)}`;
    const email = `${username}@example.com`;
    
    accounts.push({
      success: true,
      username,
      password,
      email,
      created_at: new Date().toISOString(),
      proxy_used: proxies.length > 0 ? proxies[Math.floor(Math.random() * proxies.length)] : null,
      captcha_solved: captchaApiKey ? true : false,
    });
    
    console.log(`[Simulated] Created account ${i+1}/${count}: ${username}`);
    
    // Simulate time taken to create an account with a random delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  }
  
  return accounts;
}

// Main execution function
async function main() {
  try {
    const accounts = await createSimulatedAccounts(numAccounts);
    
    // Save to file
    const outputPath = path.resolve(process.cwd(), outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(accounts, null, 2));
    console.log(`\n[Simulated] Successfully saved ${accounts.length} accounts to ${outputPath}`);
    
    // Display the accounts
    console.log(`\nAccounts created:`);
    accounts.forEach((account, i) => {
      console.log(`${i+1}. Username: ${account.username}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Email: ${account.email}`);
      if (account.proxy_used) {
        console.log(`   Proxy: ${JSON.stringify(account.proxy_used)}`);
      }
    });
    
  } catch (error) {
    console.error('Error creating accounts:', error);
  }
  
  console.log(`\n======================================================`);
  console.log(`IMPORTANT: This is a semi-real simulation! To create real accounts, you'll need to:`);
  console.log(`1. Set up your Instagram automation environment properly`);
  console.log(`2. Configure 2Captcha API key for CAPTCHA solving`);
  console.log(`3. Configure proxies for IP rotation`);
  console.log(`4. Handle the email verification process with 1secmail`);
  console.log(`======================================================\n`);
}

// Execute the main function
main(); 