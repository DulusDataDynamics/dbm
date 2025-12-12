import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// Check if the environment variable is set
if (!process.env.FIREBASE_ADMIN_KEY) {
  throw new Error('The FIREBASE_ADMIN_KEY environment variable is not set.');
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);
} catch (e) {
  throw new Error('Failed to parse the FIREBASE_ADMIN_KEY. Please ensure it is a valid JSON string.');
}


// Check if any apps are already initialized
const app = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : getApp();

export const adminDb = getFirestore(app);
