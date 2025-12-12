
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth } from "firebase/auth";
import { doc, getDoc, DocumentData, Firestore } from "firebase/firestore";
import { getFirebase, waitForFirebaseReady } from "@/lib/firebaseClient";
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
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const firebase = getFirebase();
    if (!firebase) {
      setInitializing(false);
      return;
    };

    setAuthInstance(firebase.auth);
    
    const unsubscribe = onAuthStateChanged(firebase.auth, async (firebaseUser) => {
      setInitializing(true);
      setUser(firebaseUser);

      if (firebaseUser && firebase.db) {
        try {
          await waitForFirebaseReady(firebase.auth);
          const ref = doc(firebase.db, "profiles", firebaseUser.uid);
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
    if (!authInstance) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(authInstance, email, password);
  };

  const signup = async (email: string, password: string) => {
    if (!authInstance) throw new Error("Auth not initialized");
    await createUserWithEmailAndPassword(authInstance, email, password);
  };

  const logout = async () => {
    if (!authInstance) throw new Error("Auth not initialized");
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
