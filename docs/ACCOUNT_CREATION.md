# Instagram Account Creation System

This document explains how to use the InstaBooster account creation system to create and manage Instagram accounts for use with the engagement boost services.

## Overview

The account creation system provides:

- **Automated account creation**: Create Instagram accounts without manual intervention
- **CAPTCHA solving**: Uses 2Captcha service to bypass Instagram's CAPTCHAs
- **Proxy rotation**: Supports using rotating proxies to avoid IP bans
- **Email verification**: Uses temporary email addresses to verify accounts
- **Secure storage**: Encrypts and securely stores created accounts
- **Easy integration**: Automatically adds created accounts to the engagement services

## Prerequisites

Before using the account creation system, you need:

1. **2Captcha API key**: For solving CAPTCHAs (get one at [2captcha.com](https://2captcha.com))
2. **Proxies**: A list of HTTP/HTTPS proxies to use for account creation
3. **Node.js & npm**: For running the scripts
4. **Environment setup**: Proper configuration in `.env.local`

## Installation

1. Install the required dependencies:

```bash
npm install
```

2. Configure environment variables in `.env.local`:

```env
# Required for CAPTCHA solving
CAPTCHA_API_KEY=your_2captcha_api_key

# Optional - for secure account storage
ACCOUNT_ENCRYPTION_KEY=your_secure_encryption_key
```

## Usage

### Basic Usage

To create accounts with the production script:

```bash
npm run create-accounts -- --count 5 --proxies ./proxies.json
```

Or using ts-node directly:

```bash
npx ts-node scripts/create-accounts-production.ts --count 5 --proxies ./proxies.json
```

### Command-line Options

The script supports the following options:

- `-c, --count <number>`: Number of accounts to create (default: 1)
- `-p, --proxies <file>`: JSON file containing proxy configurations
- `-o, --output-dir <dir>`: Directory to store account data (default: ./accounts)
- `--captcha-key <key>`: 2Captcha API key (can also be set in .env.local)
- `--encryption-key <key>`: Key for encrypting account data (can also be set in .env.local)
- `--headless`: Run in headless mode (no browser UI)
- `-h, --help`: Show help message

### Proxy Configuration

Create a JSON file with your proxies in the following format:

```json
[
  {
    "host": "proxy1.example.com",
    "port": 8080,
    "username": "user1",
    "password": "pass1"
  },
  {
    "host": "proxy2.example.com",
    "port": 8080
  }
]
```

For best results, use residential proxies to avoid detection.

## Programmatic Usage

You can also use the account creation system programmatically:

```typescript
import AutomationService from '../src/lib/automation/automationService';

async function createAccounts() {
  const service = new AutomationService({
    proxies: [
      { host: 'proxy.example.com', port: 8080 }
    ],
    captchaApiKey: 'your_2captcha_api_key',
    accountStorageSettings: {
      encryptionKey: 'your_secure_key',
      storageDir: './accounts'
    }
  });
  
  // Create 5 accounts
  const results = await service.createAccounts(5);
  
  // Process results
  console.log(`Created ${results.filter(r => r.success).length} accounts successfully`);
}
```

## Integration with Boost Services

Created accounts are automatically added to all of the boost services:

```typescript
// Create accounts and use them for a like boost
await service.processBoostWithAccounts('likes', 'https://instagram.com/p/example_post', 5, true);

// Create accounts and use them for a follow boost
await service.processBoostWithAccounts('followers', 'https://instagram.com/example_profile', 3, true);
```

## Account Storage

Accounts are encrypted and stored in the specified `storageDir` (defaults to `./accounts`). You can:

- **Export accounts**: `service.exportAccounts('./path/to/export.json')`
- **Import accounts**: `service.importAccounts('./path/to/import.json')`
- **Get statistics**: `service.getAccountStats()`

## Troubleshooting

### Common Issues

1. **CAPTCHA solving fails**:
   - Check your 2Captcha API key
   - Ensure you have enough balance in your 2Captcha account
   - Try running in non-headless mode to see what's happening

2. **Proxy issues**:
   - Verify that your proxies are working
   - Use the `ProxyManager.testProxy()` method to test proxies
   - Try using residential proxies instead of data center proxies

3. **Account creation fails**:
   - Check the screenshot captures in the account directory
   - Try with different proxies
   - Instagram may have changed their UI or detection methods

## Best Practices

1. **Use high-quality proxies**: Residential proxies are less likely to be banned.
2. **Limit creation rate**: Don't create too many accounts in a short period.
3. **Secure your accounts**: Use a strong encryption key for storage.
4. **Randomize creation**: Vary the timing between account creations.
5. **Monitor account health**: Regularly check for banned accounts.

## Disclaimer

**IMPORTANT**: Using automation tools may violate Instagram's Terms of Service. Your accounts may be banned if detected. Use this tool at your own risk and only for legitimate purposes.

## Support

For issues, please contact the administrator or submit issues to the repository. 