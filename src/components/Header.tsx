"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LogOut } from 'lucide-react';
import { Logo } from './Logo';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const router = useRouter();
  const { toast } = useToast();
  const { isFirebaseConfigured } = useAuth();

  const handleLogout = async () => {
    if (!isFirebaseConfigured || !auth) {
      return;
    }
    try {
      await signOut(auth);
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'There was an error while logging out.',
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center">
        <Link href="/home" className="mr-6 flex items-center">
          <Logo className="h-8 w-auto" />
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button asChild disabled={!isFirebaseConfigured}>
              <Link href="/create-listing">
                Create Listing
              </Link>
            </Button>
            <Button variant="ghost" onClick={handleLogout} disabled={!isFirebaseConfigured}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
