import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let adminDb = null;
let isAdminEnabled = false;

// Only initialize admin if the key is provided and valid.
// This prevents build failures on platforms like Netlify where server-side
// environment variables might not be available during the build process.
if (process.env.FIREBASE_ADMIN_KEY && process.env.FIREBASE_ADMIN_KEY !== '{}') {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_KEY);

        // Use a unique name for the admin app to avoid conflicts with the client app.
        const appName = 'firebase-admin';
        const existingApp = getApps().find(app => app.name === appName);
        
        const adminApp = existingApp || initializeApp({
            credential: cert(serviceAccount),
        }, appName);

        adminDb = getFirestore(adminApp);
        isAdminEnabled = true;
        console.log('Firebase Admin initialized.');

    } catch (e) {
        console.warn('Failed to parse FIREBASE_ADMIN_KEY or initialize Firebase Admin. Admin-only features will be disabled.', e);
        // Ensure they are null/false on error
        adminDb = null;
        isAdminEnabled = false;
    }
} else {
    console.warn('FIREBASE_ADMIN_KEY not set. Admin-only features will be disabled.');
}

export { adminDb, isAdminEnabled };
