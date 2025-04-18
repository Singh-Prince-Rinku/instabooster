import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin for server-side operations
const serverApps = getApps();
const adminApp = serverApps.length === 0 
  ? initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      // For server-side operations in development, we can use the default credential mechanism
      // In production on Firebase hosting or Google Cloud, this should use implicit credentials
    }) 
  : serverApps[0];

const adminDb = getFirestore(adminApp);

// Server-side Firestore operations
export const serverCreateBoost = async (
  userId: string,
  type: string,
  target: string,
  amount: number,
  cost: number,
  metadata?: Record<string, any>
) => {
  const boostsRef = adminDb.collection('boosts');
  
  const boostData = {
    userId,
    type,
    target,
    amount,
    cost,
    status: 'pending',
    createdAt: new Date(),
    metadata: metadata || undefined
  };
  
  const docRef = await boostsRef.add(boostData);
  return { id: docRef.id, ...boostData };
};

export const serverGetUserData = async (userId: string) => {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  
  if (userDoc.exists) {
    return userDoc.data();
  }
  
  return null;
};

export const serverUpdateUserCoins = async (userId: string, amount: number) => {
  const userRef = adminDb.collection('users').doc(userId);
  await userRef.update({
    coins: FieldValue.increment(amount)
  });
}; 