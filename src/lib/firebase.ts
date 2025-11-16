'use client';
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

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

// NOTE: Disabling persistence to prevent "client is offline" errors in Next.js
// try {
//   enableIndexedDbPersistence(db)
// } catch (err: any) {
//   if (err.code === "failed-precondition") {
//     console.log("Multiple tabs open — persistence disabled");
//   } else if (err.code === "unimplemented") {
//     console.log("Persistence not supported by browser");
//   }
// }

export { app, auth, db };
