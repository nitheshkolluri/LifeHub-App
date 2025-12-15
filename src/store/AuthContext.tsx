import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
  resendVerification: () => Promise<void>;
  checkVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let userData: User;

        if (userDoc.exists()) {
          const data = userDoc.data();
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: data.name || 'User',
            isPremium: data.isPremium || false,
            plan: data.plan || 'free',
            emailVerified: firebaseUser.emailVerified,
            notificationPreferences: data.notificationPreferences,
            createdAt: data.createdAt || Date.now() // Default to now for fallback (gives old users a trial)
          };
        } else {
          // Initialize user in Firestore if new (e.g. first Google login)
          userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || 'User',
            isPremium: false,
            plan: 'free',
            emailVerified: firebaseUser.emailVerified,
            createdAt: Date.now()
          };
          await setDoc(userDocRef, userData);
        }

        setState({
          user: userData,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      console.error("Login failed:", e);
      throw e;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send verification email safely
      try {
        await sendEmailVerification(user);
      } catch (error) {
        console.warn("Failed to send verification email:", error);
        // Continue account creation even if email fails
      }

      // Create user profile
      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name: name,
        isPremium: false,
        plan: 'free',
        emailVerified: false,
        createdAt: Date.now()
      };

      await setDoc(doc(db, 'users', user.uid), newUser);
    } catch (e) {
      console.error("Signup failed:", e);
      throw e;
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Google login failed:", e);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  const upgradeToPremium = async () => {
    if (state.user) {
      const userRef = doc(db, 'users', state.user.id);
      await updateDoc(userRef, { isPremium: true, plan: 'pro' });

      // Optimistic update
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, isPremium: true, plan: 'pro' } : null
      }));
    }
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const checkVerification = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const firebaseUser = auth.currentUser;

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, emailVerified: firebaseUser.emailVerified } : null
      }));
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signup, loginWithGoogle, logout, upgradeToPremium, resendVerification, checkVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};