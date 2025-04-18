import AutomationService from '../automationService';
import { writeFileSync } from 'fs';
import path from 'path';

/**
 * Example script for creating multiple Instagram accounts
 * 
 * This script demonstrates how to:
 * 1. Create a batch of Instagram accounts
 * 2. Save the created accounts to a JSON file
 * 3. Use the accounts for boosting activities
 */
async function createAccountsExample() {
  // Initialize the automation service
  const service = new AutomationService({
    // Optional: Configure proxies for account creation
    proxies: [
      // Add your proxies here
      // { host: 'proxy.example.com', port: 8080 },
      // { host: 'proxy2.example.com', port: 8080, username: 'user', password: 'pass' },
    ]
  });
  
  // Number of accounts to create
  const accountsToCreate = 3;
  
  console.log(`Starting account creation process for ${accountsToCreate} accounts...`);
  
  try {
    // Create accounts
    const results = await service.createAccounts(accountsToCreate);
    
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
      
      const outputPath = path.join(process.cwd(), 'created_accounts.json');
      writeFileSync(outputPath, JSON.stringify(accountData, null, 2));
      
      console.log(`Successfully saved ${successfulAccounts.length} accounts to ${outputPath}`);
      
      // Example: Use the accounts for a boost
      console.log('Using newly created accounts for a boost action...');
      
      // Target post URL to like (example)
      const targetPostUrl = 'https://www.instagram.com/p/EXAMPLE_POST_ID/';
      
      // Use the accounts we just created for a boost
      const boostResult = await service.processBoost('likes', targetPostUrl, successfulAccounts.length);
      
      console.log(`Boost result: ${boostResult ? 'Success' : 'Failed'}`);
    } else {
      console.log('No accounts were successfully created.');
    }
  } catch (error) {
    console.error('Error in account creation example:', error);
  }
}

// Run the example
// Uncomment this line to run the example directly:
// createAccountsExample().catch(console.error);

export default createAccountsExample; 