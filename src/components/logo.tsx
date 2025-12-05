import { BookCopy } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <BookCopy className="h-8 w-8 text-primary" {...props} />
      <span className="font-headline text-2xl font-bold text-foreground">
        TenantFlow
      </span>
    </div>
  );
}
