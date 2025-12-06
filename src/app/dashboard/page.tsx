'use client';

import * as React from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { TenantSummary } from '@/lib/types';
import { CreateTenantDialog } from '@/components/tenants/create-tenant-dialog';
import { TenantCard } from '@/components/tenants/tenant-card';
import { useUser } from '@/firebase/provider';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, profile, loading: isUserLoading } = useUser();

  const tenantsQuery = useMemoFirebase(() => {
    if (!firestore || !user || !profile) {
      return null; // Return null if dependencies are not ready
    }

    // Admins can see all tenants.
    if (profile.role === 'admin') {
      return collection(firestore, 'tenants');
    }

    // Regular users can only see their own tenants.
    return query(
      collection(firestore, 'tenants'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user, profile]);

  const {
    data: tenants,
    isLoading: tenantsLoading,
    error,
  } = useCollection<TenantSummary>(tenantsQuery);

  const isLoading = isUserLoading || tenantsLoading;

  if (error) {
    // You can render a more user-friendly error message here
    return <p>Error loading tenants: {error.message}</p>;
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">Tenants</h1>
        <div className="ml-auto flex items-center gap-4">
          <CreateTenantDialog />
        </div>
      </div>
      {isLoading && <p>Loading tenants...</p>}
      {!isLoading && tenants && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tenants.map(tenant => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
      {!isLoading && (!tenants || tenants.length === 0) && (
        <div className="py-10 text-center">
          <h3 className="text-lg font-semibold">No Tenants Found</h3>
          <p className="text-muted-foreground">
            Get started by creating a new tenant.
          </p>
        </div>
      )}
    </>
  );
}