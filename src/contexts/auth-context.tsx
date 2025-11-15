"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

interface AuthContextType {
  user: User | null;
  profile: any | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GlobalLoader = () => (
    <div className="w-full h-screen flex items-center justify-center flex-col gap-4 bg-background">
        <Logo />
        <div className="text-center">
            <p className="text-lg font-medium text-foreground">
                Getting things ready...
            </p>
            <p className="text-sm text-muted-foreground">Please wait a moment while we load the app.</p>
        </div>
      </div>
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const ref = doc(db, "profiles", firebaseUser.uid);
          const snap = await getDoc(ref);
          setProfile(snap.exists() ? snap.data() : null);
        } catch (error) {
          console.error("Profile error:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, [isClient]);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (!isClient || initializing) {
    return <GlobalLoader />;
  }

  const value = { user, profile, initializing, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
