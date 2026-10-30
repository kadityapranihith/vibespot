'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';
import { isUserAdmin } from '@/lib/admin';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured()) throw new Error('Firebase is not configured');
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isFirebaseConfigured()) throw new Error('Firebase is not configured');
    await createUserWithEmailAndPassword(auth, email, password);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!isFirebaseConfigured()) throw new Error('Firebase is not configured');
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOutUser = useCallback(async () => {
    if (!isFirebaseConfigured()) return;
    await signOut(auth);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    if (!isFirebaseConfigured()) throw new Error('Firebase is not configured');
    await sendPasswordResetEmail(auth, email);
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  }, []);

  const isAdmin = useMemo(() => isUserAdmin(user?.email), [user?.email]);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      signIn,
      signUp,
      signInWithGoogle,
      signOutUser,
      resetPassword,
      getIdToken,
    }),
    [user, isAdmin, loading, signIn, signUp, signInWithGoogle, signOutUser, resetPassword, getIdToken]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
