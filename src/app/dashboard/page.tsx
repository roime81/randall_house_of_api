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
    // Fetch all tenants since there is no user context.
    return collection(firestore, 'tenants');
  }, [firestore]);

  const { data: tenants, loading: tenantsLoading } =
    useCollection<TenantSummary>(tenantsQuery);

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">Tenants</h1>
        <div className="ml-auto flex items-center gap-2">
          <CreateTenantDialog />
        </div>
      </div>
      {tenantsLoading && <p>Loading tenants...</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tenants?.map(tenant => <TenantCard key={tenant.id} tenant={tenant} />)}
      </div>
    </>
  );
}
