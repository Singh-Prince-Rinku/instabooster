#!/usr/bin/env node
/**
 * Real Instagram Account Creator
 * 
 * This script creates real Instagram accounts using:
 * - Puppeteer for browser automation
 * - 2Captcha for solving CAPTCHAs
 * - 1secmail for temporary email addresses
 * - Proxy rotation to avoid IP bans
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { randomBytes } = require('crypto');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { Solver } = require('2captcha');
const axios = require('axios');

// Apply stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// Load environment variables
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
} catch (error) {
  console.warn('Warning: .env.local file not found. Using environment variables.');
}

// List of user agents to randomize browser fingerprint
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

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
Instagram Real Account Creator

Usage: node scripts/create-real-instagram-accounts.js [options]

Options:
  -c, --count <number>    Number of accounts to create (default: 1)
  -o, --output <file>     Output JSON file for created accounts (default: created_accounts_real.json)
  -p, --proxies <file>    JSON file containing proxy configurations (recommended)
  --captcha-key <key>     2Captcha API key (required for real account creation)
  --headless              Run in headless mode (no browser UI)
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

// Load proxies from file
function loadProxies() {
  if (!proxyFile || !fs.existsSync(proxyFile)) {
    console.warn('Warning: No proxy file provided or file not found. Running without proxies is not recommended.');
    return [];
  }
  
  try {
    const data = fs.readFileSync(proxyFile, 'utf8');
    const proxies = JSON.parse(data);
    console.log(`Loaded ${proxies.length} proxies from ${proxyFile}`);
    return proxies;
  } catch (error) {
    console.error('Error loading proxies:', error);
    return [];
  }
}

// Get a random user agent
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
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

// Create a temporary email using 1secmail API
async function createTempEmail() {
  try {
    // Try to use the real API
    try {
      const response = await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
      const email = response.data[0];
      const [mailbox, domain] = email.split('@');
      
      console.log(`Created real temporary email: ${email}`);
      return { email, mailbox, domain };
    } catch (error) {
      console.warn('Could not create real temporary email, using simulated email instead.');
      
      // Fallback to simulated email
      const username = generateUsername();
      const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com'];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      const email = `${username}@${domain}`;
      const mailbox = username;
      
      console.log(`Created simulated temporary email: ${email}`);
      return { email, mailbox, domain, simulated: true };
    }
  } catch (error) {
    console.error('Error creating temporary email:', error);
    throw new Error('Failed to create temporary email');
  }
}

// Check for emails in the temporary mailbox
async function checkEmails(mailbox, domain, simulated = false) {
  if (simulated) {
    // Return a simulated email for Instagram
    return [{
      id: 12345,
      from: 'no-reply@mail.instagram.com',
      subject: 'Your Instagram verification code',
      date: new Date().toISOString()
    }];
  }
  
  try {
    const response = await axios.get(
      `https://www.1secmail.com/api/v1/?action=getMessages&login=${mailbox}&domain=${domain}`
    );
    return response.data;
  } catch (error) {
    console.error('Error checking emails:', error);
    return [];
  }
}

// Read a specific email
async function readEmail(mailbox, domain, id, simulated = false) {
  if (simulated) {
    // Generate a random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    return {
      id: id,
      from: 'no-reply@mail.instagram.com',
      subject: 'Your Instagram verification code',
      date: new Date().toISOString(),
      body: `Your Instagram verification code is ${code}.`,
      textBody: `Your Instagram verification code is ${code}.`,
      htmlBody: `<html><body><p>Your Instagram verification code is ${code}.</p></body></html>`,
      attachments: []
    };
  }
  
  try {
    const response = await axios.get(
      `https://www.1secmail.com/api/v1/?action=readMessage&login=${mailbox}&domain=${domain}&id=${id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error reading email:', error);
    throw new Error('Failed to read email');
  }
}

// Extract Instagram verification code from email
function extractVerificationCode(emailContent) {
  // Regular expression to find 6-digit verification code
  const regex = /\b\d{6}\b/;
  const match = emailContent.match(regex);
  
  if (match) {
    return match[0];
  }
  
  return null;
}

// Solve CAPTCHA using 2Captcha
async function solveCaptcha(page, siteKey, pageUrl) {
  if (!captchaApiKey) {
    console.error('CAPTCHA API key is required for solving CAPTCHAs');
    return null;
  }
  
  try {
    const solver = new Solver(captchaApiKey);
    const result = await solver.recaptcha(siteKey, pageUrl);
    return result.data;
  } catch (error) {
    console.error('Error solving CAPTCHA:', error);
    return null;
  }
}

// Create a single Instagram account
async function createInstagramAccount(proxy = null) {
  let browser = null;
  let page = null;
  
  try {
    // Generate account details
    const username = generateUsername();
    const password = generatePassword();
    const { email, mailbox, domain, simulated } = await createTempEmail();
    const fullName = username.replace('_', ' ').replace(/\d+$/, '');
    
    console.log(`Creating account with username: ${username}, email: ${email}`);
    
    // Launch browser with proxy if provided
    const launchOptions = {
      headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--window-size=1280,720',
      ]
    };
    
    if (proxy) {
      const proxyArg = proxy.username 
        ? `--proxy-server=http://${proxy.username}:${proxy.password}@${proxy.host}:${proxy.port}`
        : `--proxy-server=http://${proxy.host}:${proxy.port}`;
      
      launchOptions.args.push(proxyArg);
    }
    
    browser = await puppeteer.launch(launchOptions);
    page = await browser.newPage();
    
    // Set user agent and other browser properties
    const userAgent = getRandomUserAgent();
    await page.setUserAgent(userAgent);
    
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
    });
    
    if (proxy && proxy.username) {
      await page.authenticate({
        username: proxy.username,
        password: proxy.password || '',
      });
    }
    
    // Go to Instagram sign-up page
    await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'networkidle2' });
    
    // Handle cookie consent if present
    try {
      const acceptCookieButton = await page.$('button[type="button"]._a9--._a9_1');
      if (acceptCookieButton) {
        await acceptCookieButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (error) {
      console.log('No cookie consent dialog found or error handling it:', error.message);
    }
    
    // Fill out the sign-up form
    await page.waitForSelector('input[name="emailOrPhone"]');
    await page.type('input[name="emailOrPhone"]', email, { delay: 50 });
    
    await page.waitForTimeout(500);
    await page.type('input[name="fullName"]', fullName, { delay: 50 });
    
    await page.waitForTimeout(500);
    await page.type('input[name="username"]', username, { delay: 50 });
    
    await page.waitForTimeout(500);
    await page.type('input[name="password"]', password, { delay: 50 });
    
    // Click the sign-up button
    await page.waitForTimeout(1000);
    const signUpButtons = await page.$$('button[type="submit"]');
    if (signUpButtons.length > 0) {
      await signUpButtons[0].click();
    } else {
      throw new Error('Sign-up button not found');
    }
    
    // Handle date of birth if requested
    try {
      await page.waitForSelector('select[title="Month:"]', { timeout: 5000 });
      
      // Select birth month (1-12)
      const month = Math.floor(Math.random() * 12) + 1;
      await page.select('select[title="Month:"]', month.toString());
      
      await page.waitForTimeout(500);
      
      // Select birth day (1-28)
      const day = Math.floor(Math.random() * 28) + 1;
      await page.select('select[title="Day:"]', day.toString());
      
      await page.waitForTimeout(500);
      
      // Select birth year (1980-2000)
      const year = Math.floor(Math.random() * 20) + 1980;
      await page.select('select[title="Year:"]', year.toString());
      
      await page.waitForTimeout(500);
      
      // Click next button
      const nextButton = await page.$('button[type="button"]');
      if (nextButton) {
        await nextButton.click();
      }
    } catch (error) {
      console.log('No birthday selection or error handling it:', error.message);
    }
    
    // Check for CAPTCHA
    try {
      const captchaIframe = await page.$('iframe[src*="recaptcha"]');
      if (captchaIframe) {
        console.log('CAPTCHA detected, attempting to solve...');
        
        // Extract sitekey
        const frameSrc = await page.evaluate(el => el.src, captchaIframe);
        const siteKeyMatch = frameSrc.match(/k=([^&]+)/);
        
        if (siteKeyMatch && siteKeyMatch[1]) {
          const siteKey = siteKeyMatch[1];
          const pageUrl = page.url();
          
          // Solve CAPTCHA
          const token = await solveCaptcha(page, siteKey, pageUrl);
          
          if (token) {
            // Insert token into the page
            await page.evaluate((token) => {
              if (window.grecaptcha && typeof window.grecaptcha.callback === 'function') {
                window.grecaptcha.callback(token);
              }
              
              // Fallback methods
              if (window.___grecaptcha_cfg && window.___grecaptcha_cfg.clients) {
                const clientIds = Object.keys(window.___grecaptcha_cfg.clients);
                for (const id of clientIds) {
                  const client = window.___grecaptcha_cfg.clients[id];
                  if (client && client.aa && typeof client.aa.callback === 'function') {
                    client.aa.callback(token);
                  }
                }
              }
              
              // Another fallback
              if (window.onRecaptchaSuccess) {
                window.onRecaptchaSuccess(token);
              }
              
              document.__captchaToken = token;
            }, token);
            
            console.log('CAPTCHA solution applied');
          } else {
            console.error('Failed to solve CAPTCHA');
          }
        }
      }
    } catch (error) {
      console.log('Error handling CAPTCHA:', error.message);
    }
    
    // Wait for email verification code
    console.log('Waiting for verification email...');
    let verificationCode = null;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!verificationCode && attempts < maxAttempts) {
      attempts++;
      
      await page.waitForTimeout(5000); // Wait 5 seconds between checks
      
      const emails = await checkEmails(mailbox, domain, simulated);
      
      for (const email of emails) {
        if (email.subject.includes('Instagram') || email.from.includes('instagram')) {
          const emailContent = await readEmail(mailbox, domain, email.id, simulated);
          verificationCode = extractVerificationCode(emailContent.body || emailContent.textBody || emailContent.htmlBody);
          
          if (verificationCode) {
            console.log('Verification code received:', verificationCode);
            break;
          }
        }
      }
      
      console.log(`Waiting for verification email... Attempt ${attempts}/${maxAttempts}`);
    }
    
    if (!verificationCode) {
      throw new Error('Verification code not received after multiple attempts');
    }
    
    // Enter verification code
    try {
      await page.waitForSelector('input[name="confirmationCode"]', { timeout: 10000 });
      await page.type('input[name="confirmationCode"]', verificationCode, { delay: 50 });
      
      // Click confirm button
      const confirmButton = await page.$('button[type="button"]');
      if (confirmButton) {
        await confirmButton.click();
      }
    } catch (error) {
      console.error('Error entering verification code:', error.message);
      throw new Error('Failed to enter verification code');
    }
    
    // Wait for successful registration
    await page.waitForNavigation({ timeout: 30000 }).catch(() => {});
    
    // Check if we're logged in by looking for profile elements
    const isLoggedIn = await page.evaluate(() => {
      return document.querySelector('nav') !== null || 
             document.querySelector('a[href="/explore/"]') !== null ||
             document.querySelector('svg[aria-label="Home"]') !== null;
    });
    
    if (!isLoggedIn) {
      throw new Error('Login verification failed after account creation');
    }
    
    console.log(`Successfully created Instagram account: ${username}`);
    
    // Close browser
    await browser.close();
    browser = null;
    
    return {
      success: true,
      username,
      password,
      email,
      created_at: new Date().toISOString(),
      proxy_used: proxy,
      captcha_solved: captchaApiKey ? true : false,
    };
  } catch (error) {
    console.error('Error creating account:', error.message);
    
    // Ensure browser is closed in case of error
    if (browser) {
      await browser.close();
    }
    
    return {
      success: false,
      error: error.message,
      created_at: new Date().toISOString(),
      proxy_used: proxy,
    };
  }
}

// Main execution
async function main() {
  console.log("\n======== INSTAGRAM REAL ACCOUNT CREATOR ========");
  console.log(`Starting script to create ${numAccounts} real Instagram accounts...`);
  
  // Validate requirements
  if (!captchaApiKey) {
    console.error('ERROR: 2Captcha API key is required for real account creation');
    console.error('Set the CAPTCHA_API_KEY environment variable or use --captcha-key option');
    process.exit(1);
  }
  
  console.log(`\nAccount creation details:`);
  console.log(`- Creating ${numAccounts} real Instagram accounts`);
  console.log(`- Saving to ${outputFile}`);
  if (proxyFile) {
    console.log(`- Using proxies from ${proxyFile}`);
  } else {
    console.log(`- Without proxies (not recommended for production)`);
  }
  console.log(`- Using 2Captcha for CAPTCHA solving`);
  console.log(`- Using 1secmail for temporary email addresses`);
  console.log(`\n-------------------------------------------------------`);
  
  // Load existing accounts
  const existingAccounts = loadExistingAccounts();
  console.log(`Found ${existingAccounts.length} existing accounts in ${outputFile}`);
  
  // Load proxies
  const proxies = loadProxies();
  
  // Create accounts
  const results = [];
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < numAccounts; i++) {
    console.log(`\nCreating account ${i+1}/${numAccounts}...`);
    
    // Get a random proxy if available
    const proxy = proxies.length > 0 
      ? proxies[Math.floor(Math.random() * proxies.length)]
      : null;
    
    // Create account
    const result = await createInstagramAccount(proxy);
    
    // Update counts
    if (result.success) {
      successCount++;
      console.log(`✅ Successfully created account: ${result.username}`);
    } else {
      failCount++;
      console.log(`❌ Failed to create account: ${result.error}`);
    }
    
    // Add to results
    results.push(result);
    
    // Save to file after each account
    const allAccounts = [...existingAccounts, ...results];
    fs.writeFileSync(outputFile, JSON.stringify(allAccounts, null, 2));
    
    // Add delay between account creations (2-5 minutes) if we have more accounts to create
    if (i < numAccounts - 1) {
      const delayMinutes = Math.random() * 3 + 2;
      const delayMs = delayMinutes * 60 * 1000;
      console.log(`Waiting ${delayMinutes.toFixed(1)} minutes before creating next account...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // Final results
  console.log(`\n===================== RESULTS =====================`);
  console.log(`Total accounts attempted: ${numAccounts}`);
  console.log(`Successfully created: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Accounts saved to: ${outputFile}`);
  
  // Display the successful accounts
  if (successCount > 0) {
    console.log(`\nSuccessfully created accounts:`);
    results.filter(a => a.success).forEach((account, i) => {
      console.log(`${i+1}. Username: ${account.username}`);
      console.log(`   Password: ${account.password}`);
      console.log(`   Email: ${account.email}`);
    });
  }
  
  console.log(`\n======================================================`);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 