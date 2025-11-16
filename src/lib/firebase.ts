'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBI6ZGvLdzW1k2_EgWDw0GU99HblD1L_cs",
  authDomain: "studio-7996997189-78be3.firebaseapp.com",
  projectId: "studio-7996997189-78be3",
  storageBucket: "studio-7996997189-78be3.appspot.com",
  messagingSenderId: "567409477647",
  appId: "1:567409477647:web:846147bd1d96e51b467b7a",
  measurementId: "G-VP7JPGVJ7Z"
};

// Initialize Firebase safely for both server and client
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
