import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  increment,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { BoostData, BoostType } from './api';
import { getAuth } from 'firebase/auth';

// User related operations
export const getUserData = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    return userDoc.data();
  }
  
  return null;
};

export const updateUserCoins = async (userId: string, amount: number) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    coins: increment(amount)
  });
};

export const searchUsers = async (searchQuery: string, searchType: 'email' | 'uid' = 'email') => {
  // First, check if current user is admin
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('Authentication required');
  }
  
  // Get current user data to verify admin status
  const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
  if (!currentUserDoc.exists() || !currentUserDoc.data().isAdmin) {
    throw new Error('Admin privileges required');
  }
  
  // Firebase doesn't support text search directly, so we'll query by exact email or uid
  // For a more robust solution, you might want to implement Algolia or similar
  const usersRef = collection(db, 'users');
  let q;
  
  if (searchType === 'email') {
    q = query(usersRef, where('email', '==', searchQuery));
  } else {
    // Search by user ID
    try {
      const userDoc = await getDoc(doc(db, 'users', searchQuery));
      if (userDoc.exists()) {
        return [{ id: userDoc.id, ...userDoc.data() }];
      }
      return [];
    } catch (error) {
      console.error('Error searching user by ID:', error);
      return [];
    }
  }
  
  const querySnapshot = await getDocs(q);
  
  const users: DocumentData[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ id: doc.id, ...doc.data() });
  });
  
  return users;
};

// Boost related operations
export const createBoost = async (
  userId: string,
  type: BoostType,
  target: string,
  amount: number,
  cost: number,
  metadata?: Record<string, any>
) => {
  const boostsRef = collection(db, 'boosts');
  
  const boostData: Omit<BoostData, 'id'> = {
    userId,
    type,
    target,
    amount,
    cost,
    status: 'pending',
    createdAt: new Date(),
    metadata: metadata || undefined
  };
  
  const docRef = await addDoc(boostsRef, boostData);
  return { id: docRef.id, ...boostData };
};

export const getUserBoosts = async (userId: string) => {
  const boostsRef = collection(db, 'boosts');
  const q = query(
    boostsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  const boosts: BoostData[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    boosts.push({
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate()
    } as BoostData);
  });
  
  return boosts;
};

export const getAllBoosts = async () => {
  // First, check if current user is admin
  const auth = getAuth();
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('Authentication required');
  }
  
  // Get current user data to verify admin status
  const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
  if (!currentUserDoc.exists() || !currentUserDoc.data().isAdmin) {
    throw new Error('Admin privileges required');
  }

  const boostsRef = collection(db, 'boosts');
  const q = query(boostsRef, orderBy('createdAt', 'desc'));
  
  const querySnapshot = await getDocs(q);
  
  const boosts: BoostData[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    boosts.push({
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate()
    } as BoostData);
  });
  
  return boosts;
}; 