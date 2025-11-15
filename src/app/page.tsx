'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  const router = useRouter();
  const { initializing } = useAuth();

  useEffect(() => {
    if (!initializing) {
      router.replace('/dashboard');
    }
  }, [initializing, router]);
  
  // Show a loader while the auth state is being determined
  // to avoid a flash of content before redirecting.
  return (
      <div className="w-full h-screen flex items-center justify-center flex-col gap-4 bg-background">
        <Logo />
        <div className="text-center">
            <p className="text-lg font-medium text-foreground">
                Getting things ready...
            </p>
            <p className="text-sm text-muted-foreground">Please wait a moment while we load the app.</p>
        </div>
      </div>
  );
}
