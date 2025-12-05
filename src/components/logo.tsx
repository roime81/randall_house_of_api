import { Sprout } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <Sprout className="h-10 w-10 text-primary" {...props} />
      <span className="font-headline text-3xl font-bold text-foreground">
        HailingHub
      </span>
    </div>
  );
}
