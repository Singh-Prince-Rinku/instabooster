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

## Project Structure

```
instabooster/
├── public/               # Public assets
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
├── .env.local            # Environment variables
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
