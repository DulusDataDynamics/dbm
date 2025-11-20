'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error("Firebase config environment variables are not set. Please check your .env file.");
}


type FirebaseServices = {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
} | null;

export function getFirebase(): FirebaseServices {
  if (typeof window === "undefined") return null; 

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);

  return { app, db, auth };
}


export async function waitForFirebaseReady(auth: Auth) {
  // Wait for auth to initialize
  await new Promise<void>((resolve) => {
    const unsub = auth.onAuthStateChanged(() => {
      unsub();
      resolve();
    });
  });
}
