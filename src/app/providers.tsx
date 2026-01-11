'use client';

import React from 'react';
import { ThemeProvider } from '@/components/app/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseProvider, initializeFirebase } from '@/firebase';

const firebaseServices = initializeFirebase();

export function Providers({ children }: { children: React.ReactNode }) {
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
