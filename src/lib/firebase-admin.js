import { initializeApp, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminDb = null;

// Only initialize admin if the key is provided and valid.
// This prevents build failures on platforms like Netlify where server-side
// environment variables might not be available during the build process.
if (process.env.FIREBASE_ADMIN_KEY && process.env.FIREBASE_ADMIN_KEY !== '{}') {
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

        // Use a unique name for the admin app to avoid conflicts with the client app.
        const appName = 'firebase-admin';
        const adminApp = getApps().find(app => app.name === appName) || initializeApp({
            credential: cert(serviceAccount),
        }, appName);

        adminDb = getFirestore(adminApp);

    } catch (e) {
        console.error('Failed to parse FIREBASE_ADMIN_KEY or initialize Firebase Admin. Admin-only features will be disabled.', e);
    }
}

export { adminDb };
