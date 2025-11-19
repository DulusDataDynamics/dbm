'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

// Validate that required env vars exist
function validate(key: string, value: string | undefined) {
  if (!value || value.trim() === "") {
    throw new Error(`❌ Missing Firebase env var: NEXT_PUBLIC_${key}`);
  }
  return value;
}

const firebaseConfig = {
  apiKey: validate("FIREBASE_API_KEY", process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: validate("FIREBASE_AUTH_DOMAIN", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: validate("FIREBASE_PROJECT_ID", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: validate("FIREBASE_STORAGE_BUCKET", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: validate("FIREBASE_MESSAGING_SENDER_ID", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: validate("FIREBASE_APP_ID", process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? undefined,
};

type FirebaseServices = {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
} | null;

export function getFirebase(): FirebaseServices {
  if (typeof window === "undefined") return null; // Prevent SSR crash

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

  // Ensure Firestore goes online
  await auth.app
    .firestore()
    .enableNetwork()
    .catch(() => {});
}
