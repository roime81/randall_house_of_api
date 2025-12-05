import { BookCopy } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <BookCopy className="h-6 w-6 text-primary" {...props} />
      <span className="font-headline text-xl font-bold text-foreground">
        TenantFlow
      </span>
    </div>
  );
}
