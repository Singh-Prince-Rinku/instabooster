import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
// Check if the app has already been initialized to prevent multiple instances
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Export the admin SDK components
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

export default admin; 