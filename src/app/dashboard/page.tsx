'use client';

import * as React from 'react';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import type { TenantSummary } from '@/lib/types';
import { CreateTenantDialog } from '@/components/tenants/create-tenant-dialog';
import { TenantCard } from '@/components/tenants/tenant-card';

export default function DashboardPage() {
  const firestore = useFirestore();

  const tenantsQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, 'tenants');
  }, [firestore]);

  const { data: tenants, loading: tenantsLoading } =
    useCollection<TenantSummary>(tenantsQuery);

  if (tenantsLoading) {
    return <p>Loading StyleVaults...</p>;
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">StyleVaults</h1>
        <div className="ml-auto flex items-center gap-2">
          <CreateTenantDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tenants?.map(tenant => <TenantCard key={tenant.id} tenant={tenant} />)}
      </div>
       {tenants && tenants.length === 0 && (
        <div className="text-center py-10">
          <h3 className="text-lg font-semibold">No StyleVaults Found</h3>
          <p className="text-muted-foreground">Get started by creating a new StyleVault.</p>
        </div>
      )}
    </>
  );
}
