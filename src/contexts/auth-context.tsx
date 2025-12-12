
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth } from "firebase/auth";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { auth as authInstance, db } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";

export interface AuthContextType {
  user: User | null;
  auth: Auth | null;
  profile: any | null;
  initializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DocumentData | null>(null);
  const [initializing, setInitializing] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, async (firebaseUser) => {
      setInitializing(true);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const ref = doc(db, "profiles", firebaseUser.uid);
          const snap = await getDoc(ref);
          setProfile(snap.exists() ? snap.data() : null);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(authInstance, email, password);
  };

  const signup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(authInstance, email, password);
  };

  const logout = async () => {
    await signOut(authInstance);
    router.push('/login');
  };

  const value = { user, auth: authInstance, profile, initializing, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
