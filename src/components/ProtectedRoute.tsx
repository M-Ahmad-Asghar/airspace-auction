"use client";

import { type ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isFirebaseConfigured } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isFirebaseConfigured || !user) {
      router.push('/');
      return;
    }
    
  }, [user, loading, router, isFirebaseConfigured]);

  // Show skeleton while loading, or if user is being redirected.
  if (loading || !user) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    )
  }

  // If user is logged in, show the content
  return <>{children}</>;
}
