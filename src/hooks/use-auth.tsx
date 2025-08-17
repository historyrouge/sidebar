
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
  getAdditionalUserInfo,
  GithubAuthProvider,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useToast } from "./use-toast";
import { useRouter } from "next/navigation";
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
  getIdToken: () => Promise<string | null>;
  updateUserProfileInAuth: (displayName: string, photoURL?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const setCookie = (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

const eraseCookie = (name: string) => {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const handleNewUser = useCallback(async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
        const profile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            name: user.displayName || "ScholarSage User",
            college: "",
            favoriteSubject: "",
            photoURL: user.photoURL || "",
        };
        await setDoc(userRef, profile);
        return true; // Indicates a new user was created
    }
    return false; // Indicates an existing user
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken(true);
        setCookie("firebaseIdToken", token, 1);
      } else {
        eraseCookie("firebaseIdToken");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
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
  }, [router, toast, handleNewUser]);

  const signUp = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await handleNewUser(userCredential.user);
    return userCredential;
  };

  const signIn = (email: string, pass: string) => {
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

  const logout = () => {
    router.push('/login');
    return signOut(auth);
  };
  
  const getIdToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  }

  const updateUserProfileInAuth = async (displayName: string, photoURL?: string) => {
    if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName, photoURL });
        // Manually update the user object to reflect changes immediately
        setUser({ ...auth.currentUser });
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
    getIdToken,
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
