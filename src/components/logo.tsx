import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6 text-primary"
        {...props}
      >
        <path d="M22 12c0-4-2-4-2-4H4s-2 0-2 4c0 4 6 8 8 8s8-4 8-8" />
        <path d="M17.5 12c0-2-1-4-1-4" />
        <path d="M6.5 12c0-2 1-4 1-4" />
      </svg>
      <span className="font-headline text-xl font-bold text-foreground">
        TenantFlow
      </span>
    </div>
  );
}
