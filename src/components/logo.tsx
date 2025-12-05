import { Sprout } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <Sprout className="h-6 w-6 text-primary" {...props} />
      <span className="font-headline text-lg font-bold text-foreground whitespace-nowrap">
        Randall's House of API
      </span>
    </div>
  );
}
