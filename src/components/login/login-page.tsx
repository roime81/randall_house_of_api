'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase/provider';
import { storeUserProfile } from '@/firebase/auth/user-profile';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, loading } = useUser();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  const handleSignIn = async () => {
    if (!auth || !firestore) return;
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await storeUserProfile(firestore, result.user);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    } finally {
      setIsSigningIn(false);
    }
  };


  if (loading || user) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-background">
         <p>Loading...</p>
       </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo />
          </div>
          <CardTitle className="font-headline text-3xl">
            Randall House
          </CardTitle>
          <CardDescription>
            The Multi-Cloud Integration Platform for modern applications.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
           <Button onClick={handleSignIn} disabled={isSigningIn}>
            {isSigningIn ? 'Signing In...' : 'Sign in with Google'}
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
