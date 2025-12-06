import Image from 'next/image';
import { Tenant } from '@/lib/types';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Eye } from 'lucide-react';

type TenantHeaderProps = {
  tenant: Tenant;
};

export default function TenantHeader({ tenant }: TenantHeaderProps) {
  return (
    <div className="flex items-center gap-6">
      <Image
        src={tenant.logoUrl}
        alt={`${tenant.name} Logo`}
        width={80}
        height={80}
        className="rounded-xl shadow-md"
        data-ai-hint="logo"
      />
      <div className='flex-1'>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
          {tenant.name}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground max-w-2xl">
          {tenant.description}
        </p>
      </div>
       <Button asChild size="sm" variant="outline" className="gap-1">
            <Link href={`/tenants/${tenant.id}/reference`}>
              <Eye className="h-4 w-4" />
              View API Reference
            </Link>
        </Button>
    </div>
  );
}
