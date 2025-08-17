
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import {
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  UserCredential,
  updateProfile,
  GithubAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "./use-toast";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, pass: string) => Promise<UserCredential>;
  signIn: (email: string, pass: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  logout: () => Promise<any>;
  updateUserProfileInAuth: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days: number) => {
    if (typeof window === 'undefined') return;
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const eraseCookie = (name: string) => {   
    if (typeof window === 'undefined') return;
    document.cookie = name+'=; Max-Age=-99999999; path=/;';  
}

const publicRoutes = ['/login', '/signup'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handleNewUser = useCallback(async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
        const profile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            name: user.displayName || "New User", 
            college: "",
            favoriteSubject: "",
            photoURL: user.photoURL || "",
        };
        await setDoc(userRef, profile);
        return true; // Indicates a new user was created
    }
    return false; // Existing user
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        const token = await user.getIdToken();
        setCookie("firebaseIdToken", token, 1);
        setUser(user);
        
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists() || !user.displayName) {
          router.push('/onboarding');
        } else if (publicRoutes.includes(pathname)){
          router.push('/');
        }

      } else {
        eraseCookie("firebaseIdToken");
        setUser(null);
        if (!publicRoutes.includes(pathname)) {
            router.push('/login');
        }
      }
      setLoading(false);
    });
    
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const isNewUser = await handleNewUser(result.user);
          if(isNewUser) {
             router.push('/onboarding');
          } else {
             router.push('/');
          }
        }
      })
      .catch((error) => {
        toast({
            title: "Sign-In Failed",
            description: error.message,
            variant: "destructive",
        });
      });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await handleNewUser(userCredential.user);
    return userCredential;
  };

  const signIn = async (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  }

  const signInWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    await signInWithRedirect(auth, provider);
  }

  const logout = async () => {
    await signOut(auth);
    eraseCookie("firebaseIdToken");
    router.push('/login');
  };

  const updateUserProfileInAuth = async (displayName: string, photoURL?: string) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName, photoURL });
        const refreshedUser = {...auth.currentUser};
        setUser(refreshedUser);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithGitHub,
    logout,
    updateUserProfileInAuth,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context as AuthContextType;
};
