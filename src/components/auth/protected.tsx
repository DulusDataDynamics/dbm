'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function Protected({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) router.replace('/login');
  }, [user, initializing, router]);

  if (initializing || !user) return null;

  return <>{children}</>;
}
