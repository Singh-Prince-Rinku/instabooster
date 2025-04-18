# InstaBooster 🚀

InstaBooster is a full-stack web application that helps users boost their Instagram engagement through likes, followers, and reels views.

## Features

- 🔐 **Firebase Authentication** - Secure authentication with email and Google sign-in
- 🪙 **Coin System** - Virtual currency for purchasing engagement boosts
- 📈 **Engagement Boosts**:
  - Like boosts for Instagram posts
  - Follower boosts for Instagram profiles
  - Views boosts for Instagram reels
- 📊 **User Dashboard** - Track boost history and manage coins
- 👑 **Admin Panel** - Search users, manage coins, view all boosts

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Authentication & Database**: Firebase (Auth, Firestore)
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/instabooster.git
   cd instabooster
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your Firebase project:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database

4. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase configuration details

5. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your project to Vercel
3. Set environment variables in the Vercel dashboard
4. Deploy!

## Automation Features

### Account Creation Automation

InstaBooster includes powerful automation tools for creating and managing Instagram accounts:

- 🤖 **Automated Account Creation** - Create multiple Instagram accounts with random usernames and passwords
- 📧 **Temporary Email Integration** - Uses 1secmail API for account verification
- 🌐 **Proxy Support** - Rotate through proxies to avoid IP bans
- 🧩 **CAPTCHA Solving** - Handles Instagram CAPTCHAs during registration
- 🎭 **User Agent Spoofing** - Mimics different devices and browsers

### Automation Setup

1. Install additional dependencies:
   ```bash
   npm install puppeteer-extra puppeteer-extra-plugin-stealth axios
   ```

2. Set up proxy configuration (optional but recommended):
   - Create a JSON file with your proxy configurations
   - Format: `[{"host": "example.com", "port": 8080, "username": "user", "password": "pass"}]`
   - See `/scripts/sample-proxies.json` for an example

3. Create accounts using the command-line script:
   ```bash
   npx ts-node scripts/create-accounts.ts --count 5 --proxies ./scripts/sample-proxies.json
   ```

### Command-Line Options

The account creation script supports the following options:

- `-c, --count <number>`: Number of accounts to create (default: 1)
- `-o, --output <file>`: Output JSON file for created accounts (default: created_accounts.json)
- `-p, --proxies <file>`: JSON file containing proxy configurations
- `-h, --help`: Show help message

### Integration with Boost Services

The account creation feature integrates with the existing boost services:

```typescript
// Example: Create accounts and use them for a boost
const service = new AutomationService();
const accounts = await service.createAccounts(5);
await service.processBoostWithAccounts('likes', 'https://instagram.com/p/example', 5, true);
```

### Important Notes

- 🚨 **Terms of Service Warning**: Using automation tools may violate Instagram's Terms of Service
- 🛡️ **Use at Your Own Risk**: Your accounts may be banned if detected as automated
- 🔒 **Residential Proxies**: For best results, use residential proxies to avoid detection

## Project Structure

```
instabooster/
├── public/               # Public assets
├── scripts/              # Utility scripts
│   ├── create-accounts.ts    # Account creation CLI
│   ├── sample-proxies.json   # Example proxy configuration
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── admin/        # Admin panel
│   │   ├── api/          # API routes
│   │   ├── boost/        # Boost pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── login/        # Authentication pages
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   ├── ui/           # UI components
│   ├── context/          # React context
│   ├── lib/              # Utility functions
│   │   ├── api.ts        # API client
│   │   ├── firebase.ts   # Firebase configuration
│   │   ├── firestore.ts  # Firestore operations
│   ├── automation/       # Automation tools
│   │   ├── accountCreator.ts  # Instagram account creator
│   │   ├── automationService.ts  # Main automation service
│   │   ├── instagram.ts  # Instagram automation
│   │   ├── examples/     # Example usage scripts
```

## Firebase Data Structure

### Users Collection

```
users/{uid}
├── uid: string
├── email: string
├── coins: number
├── isAdmin: boolean
├── createdAt: timestamp
```

### Boosts Collection

```
boosts/{id}
├── userId: string
├── type: 'likes' | 'followers' | 'reels'
├── target: string (URL)
├── amount: number
├── status: 'pending' | 'completed' | 'failed'
├── cost: number
├── createdAt: timestamp
```

## License

This project is licensed under the MIT License.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Firebase](https://firebase.google.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Icons](https://react-icons.github.io/react-icons/)
