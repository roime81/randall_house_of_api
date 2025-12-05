import Image from 'next/image';
import { Tenant } from '@/lib/types';

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
      <div>
        <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground">
          {tenant.name}
        </h1>
        <p className="mt-1 text-lg text-muted-foreground max-w-2xl">
          {tenant.description}
        </p>
      </div>
    </div>
  );
}
