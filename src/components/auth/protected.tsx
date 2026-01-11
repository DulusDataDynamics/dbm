'use client';

import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function Protected({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) router.replace('/login');
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) return null;

  return <>{children}</>;
}
