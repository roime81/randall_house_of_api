'use client';

import * as React from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { TenantSummary } from '@/lib/types';
import { CreateTenantDialog } from '@/components/tenants/create-tenant-dialog';
import { TenantCard } from '@/components/tenants/tenant-card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase/provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, profile, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const tenantsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !profile) return null;

    // Admins can see all tenants. Regular users can only see their own.
    if (profile.role === 'admin') {
      return collection(firestore, 'tenants');
    }

    // This query now filters tenants by the current user's ID for non-admins.
    return query(collection(firestore, 'tenants'), where('userId', '==', user.uid));
  }, [firestore, user, profile]);

  const { data: tenants, loading: tenantsLoading } =
    useCollection<TenantSummary>(tenantsQuery);
    
  const handleSignOut = async () => {
    if(auth) {
        await auth.signOut();
        router.push('/login');
    }
  };
  
  const isLoading = isUserLoading || tenantsLoading;

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">Tenants</h1>
        <div className="ml-auto flex items-center gap-4">
          <CreateTenantDialog />
            {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="overflow-hidden rounded-full"
                >
                  <Avatar>
                    <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{profile?.role === 'admin' ? `Admin: ${user.displayName}` : user.displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      {isLoading && <p>Loading tenants...</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tenants?.map(tenant => <TenantCard key={tenant.id} tenant={tenant} />)}
      </div>
      {tenants && tenants.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold">No Tenants Found</h3>
          <p className="text-muted-foreground">Get started by creating a new tenant.</p>
        </div>
      )}
    </>
  );
}
