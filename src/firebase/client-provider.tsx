'use client';

import React, { ReactNode } from 'react';
import { FirebaseProvider, initializeFirebase } from '@/firebase';
import { ThemeProvider } from '@/components/app/theme-provider';
import { Toaster } from '@/components/ui/toaster';

let firebaseInitialized = false;
let firebaseServices: ReturnType<typeof initializeFirebase>;

if (typeof window !== 'undefined' && !firebaseInitialized) {
  firebaseServices = initializeFirebase();
  firebaseInitialized = true;
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  if (!firebaseInitialized) {
    // This can be a loading spinner or null while waiting for client-side execution
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <FirebaseProvider
        firebaseApp={firebaseServices.firebaseApp}
        firestore={firebaseServices.firestore}
        auth={firebaseServices.auth}
      >
        {children}
        <Toaster />
      </FirebaseProvider>
    </ThemeProvider>
  );
}
