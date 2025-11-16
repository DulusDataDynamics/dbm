
// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBI6ZGvLdzW1k2_EgWDw0GU99HblD1L_cs",
    authDomain: "studio-7996997189-78be3.firebaseapp.com",
    projectId: "studio-7996997189-78be3",
    storageBucket: "studio-7996997189-78be3.firebasestorage.app",
    messagingSenderId: "567409477647",
    appId: "1:567409477647:web:846147bd1d96e51b467b7a",
    measurementId: "G-VP7JPGVJ7Z"
  };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
