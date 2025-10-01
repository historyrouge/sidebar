
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  getAuth,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  updateProfile as firebaseUpdateProfile,
  Auth,
} from "firebase/auth";
import { app } from "@/lib/firebase";

// Helper function to convert Firebase error codes to user-friendly messages
function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, pass: string) => Promise<any>;
  signIn: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
  signInWithGitHub: () => Promise<any>;
  updateUserProfileInAuth: (displayName: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const auth: Auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  const signUp = async (email: string, pass: string) => {
    try {
      setError(null);
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      return result;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  const signIn = async (email: string, pass: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };
  
  const signInWithGitHub = async () => {
    try {
      setError(null);
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result;
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      throw error;
    }
  };

  const updateUserProfileInAuth = async (displayName: string) => {
    try {
      setError(null);
      if (auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, { displayName });
        // Manually update the user state to reflect the change immediately
        setUser(prevUser => prevUser ? { ...prevUser, displayName } : null);
      } else {
        throw new Error("No user is signed in to update the profile.");
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code) || error.message;
      setError(errorMessage);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    signInWithGoogle,
    signInWithGitHub,
    updateUserProfileInAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
