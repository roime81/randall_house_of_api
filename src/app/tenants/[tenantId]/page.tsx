'use client';
import { notFound, useParams } from 'next/navigation';
import * as React from 'react';
import type { Tenant } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import TenantHeader from '@/components/tenants/tenant-header';
import ApiServers from '@/components/tenants/mcp-servers';
import ApiGateway from '@/components/tenants/api-gateway';
import DataStorage from '@/components/tenants/data-storage';
import AiSummary from '@/components/tenants/ai-summary';
import EventHandling from '@/components/tenants/event-handling';
import UpstreamApis from '@/components/tenants/upstream-apis';
import MonetizeApi from '@/components/tenants/monetize-api';

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const firestore = useFirestore();

  const tenantRef = useMemoFirebase(() => {
    if (!firestore || !tenantId) return null;
    return doc(firestore, 'tenants', tenantId);
  }, [firestore, tenantId]);

  const { data: tenant, isLoading } = useDoc<Tenant>(tenantRef);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p>Loading Tenant...</p>
      </div>
    );
  }

  if (!tenant) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <TenantHeader tenant={tenant} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ApiServers initialServers={tenant.apiServers || []} />
          <ApiGateway tenantId={tenant.id} gateway={tenant.apiGateway} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
          <AiSummary tenantId={tenant.id} dataStore={tenant.dataStore} />
          <DataStorage data={tenant.dataStore.sampleData} />
        </div>
        <div className="lg:col-span-3 flex flex-col gap-6">
            <MonetizeApi />
        </div>
        <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
          <EventHandling initialStreams={tenant.eventStreams || []} />
          <UpstreamApis initialApis={tenant.upstreamApis || []} />
        </div>
      </div>
    </div>
  );
}
