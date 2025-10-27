"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, onAuthStateChanged, updateProfile, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUserProfileInAuth: (displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, check if their profile is complete
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists() && pathname !== '/onboarding') {
          // Profile is not complete, redirect to onboarding
          router.push('/onboarding');
        } else if (userDoc.exists() && pathname === '/onboarding') {
           router.push('/');
        }
        setUser(user);
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const updateUserProfileInAuth = async (displayName: string) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName });
        // Manually update user state to reflect change immediately
        setUser(auth.currentUser);
    } else {
        throw new Error("No user is currently signed in.");
    }
  };

  const signOutUser = useCallback(async () => {
    try {
        await signOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Sign out error", error);
    }
  }, [router]);

  const value = {
    user,
    loading,
    updateUserProfileInAuth,
    signOutUser,
  };
  
  const publicRoutes = ['/login', '/signup', '/onboarding'];
  if (loading && !publicRoutes.includes(pathname)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
