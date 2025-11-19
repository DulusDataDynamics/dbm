
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth }from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// This file is now intended for SERVER-SIDE use only, like in API routes.
// Client-side components should use `getFirebase` from `firebaseClient.ts`.

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBI6ZGvLdzW1k2_EgWDw0GU99HblD1L_cs",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-7996997189-78be3.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-7996997189-78be3",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-7996997189-78be3.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "567409477647",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:567409477647:web:846147bd1d96e51b467b7a",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-VP7JPGVJ7Z"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
