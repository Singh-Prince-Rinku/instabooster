"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';

type UserData = {
  uid: string;
  email: string | null;
  coins: number;
  isAdmin: boolean;
  createdAt: Date | any; // Using any to handle Firestore timestamp
  displayName?: string;
  phoneNumber?: string;
  website?: string;
  instagramUsername?: string;
  updatedAt?: Date | any;
}

type AuthContextType = {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
        } else {
          // Create new user document if it doesn't exist
          const newUserData: UserData = {
            uid: user.uid,
            email: user.email,
            coins: 0,
            isAdmin: false,
            createdAt: new Date(),
          };
          
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);
    
    // If user doesn't exist, create a new document
    if (!userSnap.exists()) {
      const newUserData: UserData = {
        uid: result.user.uid,
        email: result.user.email,
        coins: 0,
        isAdmin: false,
        createdAt: new Date(),
      };
      
      await setDoc(userRef, newUserData);
      return true; // Return true for new user
    }
    
    return false; // Return false for existing user
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    logOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 