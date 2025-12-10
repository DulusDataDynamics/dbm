
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, Auth } from "firebase/auth";
import { doc, getDoc, DocumentData, Firestore } from "firebase/firestore";
import { getFirebase, waitForFirebaseReady } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";

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

const GlobalLoader = () => (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="text-center">
            <p className="text-lg font-medium text-foreground">
                Getting things ready...
            </p>
            <p className="text-sm text-muted-foreground">Please wait a moment while we load the app.</p>
        </div>
      </div>
    </div>
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<DocumentData | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [authInstance, setAuthInstance] = useState<Auth | null>(null);
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const firebase = getFirebase();
    if (!firebase) {
      setInitializing(false); // If firebase fails to initialize, stop loading
      return;
    };

    setAuthInstance(firebase.auth);
    setDbInstance(firebase.db);
    
    const unsubscribe = onAuthStateChanged(firebase.auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser && firebase.db) {
        try {
          // This check is crucial, we wait for auth to be fully ready
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
  }, [router]);

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
      {initializing ? <GlobalLoader /> : children}
    </AuthContext.Provider>
  );
};
