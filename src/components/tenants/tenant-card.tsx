'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TenantSummary } from '@/lib/types';

type TenantCardProps = {
  tenant: TenantSummary;
};

export function TenantCard({ tenant }: TenantCardProps) {
  return (
    <Card
      key={tenant.id}
      className="transition-shadow duration-300 hover:shadow-lg"
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Image
          src={tenant.logoUrl}
          alt={`${tenant.name} logo`}
          width={48}
          height={48}
          className="rounded-lg"
          data-ai-hint="logo"
        />
        <div className="grid gap-1">
          <CardTitle className="font-headline text-xl">{tenant.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{tenant.description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" className="w-full">
          <Link href={`/tenants/${tenant.id}`}>Manage Tenant</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
