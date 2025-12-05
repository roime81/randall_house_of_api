'use client';
import { notFound, useParams } from 'next/navigation';
import * as React from 'react';
import { initialTenants } from '@/lib/data';
import type { Tenant } from '@/lib/types';
import TenantHeader from '@/components/tenants/tenant-header';
import McpServers from '@/components/tenants/mcp-servers';
import ApiGateway from '@/components/tenants/api-gateway';
import DataStorage from '@/components/tenants/data-storage';
import AiSummary from '@/components/tenants/ai-summary';
import EventHandling from '@/components/tenants/event-handling';
import UpstreamApis from '@/components/tenants/upstream-apis';

const SESSION_STORAGE_KEY = 'tenantflow-tenants';


function getTenant(id: string): Tenant | undefined {
  // Try sessionStorage first
  if (typeof window !== 'undefined') {
    const storedTenant = sessionStorage.getItem(`tenant-${id}`);
    if (storedTenant) {
      try {
        return JSON.parse(storedTenant);
      } catch (e) {
        console.error("Failed to parse tenant from sessionStorage", e);
        // Continue to check other sources
      }
    }

    const allTenants = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (allTenants) {
        try {
            const tenants: Tenant[] = JSON.parse(allTenants);
            const tenant = tenants.find((t) => t.id === id);
            if (tenant) return tenant;
        } catch (e) {
            console.error("Failed to parse all tenants from sessionStorage", e);
        }
    }
  }

  // Fallback to initial mock data
  return initialTenants.find((tenant) => tenant.id === id);
}

export default function TenantDetailPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const [tenant, setTenant] = React.useState<Tenant | null | undefined>(undefined);

  React.useEffect(() => {
    if (tenantId) {
      const foundTenant = getTenant(tenantId);
      setTenant(foundTenant);
    }
  }, [tenantId]);

  if (tenant === undefined) {
    // Still loading or checking storage
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading tenant...</p>
      </div>
    );
  }

  if (tenant === null) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <TenantHeader tenant={tenant} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <McpServers initialServers={tenant.mcpServers} />
          <ApiGateway gateway={tenant.apiGateway} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
           <AiSummary tenantId={tenant.id} dataStore={tenant.dataStore} />
           <DataStorage data={tenant.dataStore.sampleData} />
        </div>
         <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
            <EventHandling initialStreams={tenant.eventStreams} />
            <UpstreamApis initialApis={tenant.upstreamApis} />
        </div>
      </div>
    </div>
  );
}
