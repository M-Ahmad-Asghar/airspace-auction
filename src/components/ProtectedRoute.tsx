"use client";

import { type ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from './ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isFirebaseConfigured } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isFirebaseConfigured || !user) {
      router.push('/');
      return;
    }

    // Redirect to verification page if email is not verified and we are not on that page
    if (user && !user.emailVerified && pathname !== '/verify-email') {
      router.push('/verify-email');
    }
    
  }, [user, loading, router, isFirebaseConfigured, pathname]);

  // Show skeleton while loading, or if user is being redirected.
  if (loading || !user || (user && !user.emailVerified && pathname !== '/verify-email')) {
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

  // If user is logged in and verified (or on the verify page), show the content
  return <>{children}</>;
}
