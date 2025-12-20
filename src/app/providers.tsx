'use client';

import { AuthProvider } from '@/contexts/auth-context';
import { ThemeProvider } from '@/components/app/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <FirebaseErrorListener />
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
