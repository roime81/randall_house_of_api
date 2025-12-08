'use client';
import { notFound, useParams } from 'next/navigation';
import * as React from 'react';
import type { Tenant } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy } from 'lucide-react';
import Link from 'next/link';

const methodVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
    GET: 'default',
    POST: 'outline',
    PUT: 'secondary',
    DELETE: 'destructive',
  };
  

export default function TenantApiReferencePage() {
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
      <div className="flex h-screen items-center justify-center bg-background">
        <p>Loading API Details...</p>
      </div>
    );
  }

  if (!tenant) {
    notFound();
  }

  const curlExample = `curl -X GET ${tenant.apiGateway.endpoint}${tenant.apiGateway.routes[0]?.path || '/example'}`;

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b py-4 px-6">
        <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Image
                    src={tenant.logoUrl}
                    alt={`${tenant.name} Logo`}
                    width={48}
                    height={48}
                    className="rounded-lg shadow-sm"
                    data-ai-hint="logo"
                />
                <div>
                    <h1 className="font-headline text-2xl font-bold text-foreground">
                    {tenant.name}
                    </h1>
                    <p className="text-sm text-muted-foreground">API Reference</p>
                </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/tenants/${tenantId}`} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tenant Details
              </Link>
            </Button>
        </div>
      </header>

      <main className="container mx-auto py-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
                <section id="introduction">
                    <h2 className="font-headline text-2xl font-bold border-b pb-2 mb-4">Introduction</h2>
                    <p className="text-muted-foreground mb-4">{tenant.description}</p>
                    <h3 className="font-semibold text-lg mb-2">API Endpoint</h3>
                    <div className="flex items-center gap-2 rounded-md bg-muted p-3">
                        <code className="text-sm flex-1 font-mono">{tenant.apiGateway.endpoint}</code>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigator.clipboard.writeText(tenant.apiGateway.endpoint)}>
                            <Copy className="h-4 w-4"/>
                        </Button>
                    </div>
                </section>
                
                <section id="routes" className="mt-8">
                    <h2 className="font-headline text-2xl font-bold border-b pb-2 mb-4">API Routes</h2>
                    <div className="space-y-4">
                        {tenant.apiGateway.routes.map(route => (
                            <div key={route.path} className="border rounded-lg p-4">
                                <div className="flex items-center gap-4">
                                    <Badge variant={methodVariant[route.method]} className="w-20 justify-center text-base py-1">{route.method}</Badge>
                                    <code className="text-lg font-medium font-mono">{route.path}</code>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 ml-24">Target Service: <span className="font-mono bg-muted px-1 py-0.5 rounded">{route.targetServer}</span></p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="md:col-span-1">
                 <aside className="sticky top-24">
                    <div className="bg-card border rounded-lg p-4">
                        <h3 className="font-headline text-xl font-bold mb-3">Example Request</h3>
                        <div className="bg-gray-900 text-white rounded-md p-4">
                        <pre className="text-sm font-mono whitespace-pre-wrap relative">
                            <code>{curlExample}</code>
                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-gray-400 hover:text-white" onClick={() => navigator.clipboard.writeText(curlExample)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </pre>
                        </div>
                         <p className="text-xs text-muted-foreground mt-2">A simple cURL example to get you started.</p>
                    </div>
                 </aside>
            </div>
        </div>
      </main>
    </div>
  );
}
