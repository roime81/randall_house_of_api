'use client';

import * as React from 'react';
import { collection, query, where } from 'firebase/firestore';
import { useMemo } from 'react';
import { useCollection, useFirestore, useUser } from '@/firebase';
import type { TenantSummary } from '@/lib/types';
import { CreateTenantDialog } from '@/components/tenants/create-tenant-dialog';
import { TenantCard } from '@/components/tenants/tenant-card';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const firestore = useFirestore();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const tenantsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tenants'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: tenants, loading: tenantsLoading } =
    useCollection<TenantSummary>(tenantsQuery);

  if (userLoading || !user) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">Tenants</h1>
        <div className="ml-auto flex items-center gap-4">
          <CreateTenantDialog />
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
