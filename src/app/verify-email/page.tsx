"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { MailCheck, LogOut, RefreshCw } from 'lucide-react';
import { PublicHeader } from '@/components/PublicHeader';
import { Skeleton } from '@/components/ui/skeleton';


export default function VerifyEmailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (user.emailVerified) {
        router.push('/home');
      }
    }
  }, [user, loading, router]);


  const handleResendEmail = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You are not logged in.' });
      return;
    }
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast({ title: 'Email Sent', description: 'A new verification email has been sent to your address.' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to send verification email.' });
    } finally {
      setIsSending(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleRefresh = () => {
    if(auth.currentUser) {
      auth.currentUser.reload().then(() => {
        if (auth.currentUser?.emailVerified) {
          toast({ title: 'Success!', description: 'Your email has been verified. Welcome!' });
          router.push('/home');
        } else {
          toast({ variant: 'destructive', title: 'Not Verified', description: 'Your email is still not verified. Please check your inbox.' });
        }
      });
    }
  }

  if (loading || !user || user.emailVerified) {
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
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PublicHeader />
      <main className="flex-grow container py-16 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 text-primary rounded-full p-3 w-fit">
              <MailCheck className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold mt-4">Verify Your Email</CardTitle>
            <CardDescription className="mt-2">
              A verification link has been sent to <span className="font-semibold text-foreground">{user.email}</span>. Please check your inbox and spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-center text-muted-foreground">
              Click the link in the email to activate your account. Once verified, you can continue.
            </p>
            <div className="flex flex-col gap-4 pt-4">
               <Button onClick={handleRefresh}>
                I've Verified My Email, Continue
              </Button>
              <Button onClick={handleResendEmail} variant="secondary" disabled={isSending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isSending ? 'animate-spin' : ''}`} />
                {isSending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Logout and Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
