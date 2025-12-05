'use client';

import * as React from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { TenantSummary } from '@/lib/types';
import { CreateTenantDialog } from '@/components/tenants/create-tenant-dialog';
import { TenantCard } from '@/components/tenants/tenant-card';
import { Button } from '@/components/ui/button';
import { signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { storeUserProfile } from '@/firebase/auth/user-profile';

export default function DashboardPage() {
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, profile, loading: userLoading } = useUser();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleSignIn = async () => {
    if (!auth) return;
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await storeUserProfile(firestore, result.user);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  const tenantsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tenants'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: tenants, loading: tenantsLoading } =
    useCollection<TenantSummary>(tenantsQuery);

  if (userLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <h1 className="text-4xl font-bold font-headline mb-4">Welcome to MCP Gateway</h1>
        <p className="text-muted-foreground mb-8">Please sign in to manage your tenants.</p>
        <Button onClick={handleSignIn} disabled={isSigningIn}>
          {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">Tenants</h1>
        <div className="ml-auto flex items-center gap-4">
          <CreateTenantDialog />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                <Avatar>
                  {profile?.photoURL && <AvatarImage src={profile.photoURL} alt={profile.displayName || ''} />}
                  <AvatarFallback>{profile?.displayName?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{profile?.displayName}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
       {tenantsLoading && <p>Loading tenants...</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tenants?.map(tenant => <TenantCard key={tenant.id} tenant={tenant} />)}
      </div>
       {tenants && tenants.length === 0 && !tenantsLoading && (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold">No Tenants Found</h3>
          <p className="text-muted-foreground">Get started by creating a new tenant.</p>
        </div>
      )}
    </>
  );
}
