
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "./use-toast";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signInWithGitHub: () => Promise<User | null>;
  signInWithEmail: (email: string, pass: string) => Promise<User | null>;
  signUpWithEmail: (email: string, pass: string) => Promise<User | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => null,
  signInWithGitHub: async () => null,
  signInWithEmail: async () => null,
  signUpWithEmail: async () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const handleSignIn = async (provider: GoogleAuthProvider | GithubAuthProvider): Promise<User | null> => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            provider: provider.providerId,
            lastSignIn: serverTimestamp()
        }, { merge: true });

        return user;
    } catch (error: any) {
        console.error(`${provider.providerId} Sign-In Error:`, error);
        toast({ title: "Sign-In Failed", description: error.message, variant: "destructive" });
        return null;
    }
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    return handleSignIn(provider);
  };
  
  const signInWithGitHub = async (): Promise<User | null> => {
    const provider = new GithubAuthProvider();
    return handleSignIn(provider);
  };

  const signInWithEmail = async (email: string, pass: string): Promise<User | null> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      return result.user;
    } catch (error: any) {
      console.error("Email Sign-In Error:", error);
      toast({ title: "Sign-In Failed", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const signUpWithEmail = async (email: string, pass: string): Promise<User | null> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      const user = result.user;
       await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.email, // Default display name to email
            photoURL: '',
            provider: 'password',
            createdAt: serverTimestamp(),
            lastSignIn: serverTimestamp()
        }, { merge: true });
      return user;
    } catch (error: any) {
      console.error("Email Sign-Up Error:", error);
      toast({ title: "Sign-Up Failed", description: error.message, variant: "destructive" });
      return null;
    }
  };

  const signOut = async () => {
    try {
        await firebaseSignOut(auth);
        router.push('/login');
    } catch (error) {
        console.error("Sign Out Error:", error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signInWithGitHub,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
        {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
