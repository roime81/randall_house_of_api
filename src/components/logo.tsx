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
        <path d="M18.5 7.5c0 3.87-3.13 7-7 7s-7-3.13-7-7" />
        <path d="M11.5 14.5v-5" />
        <path d="M8.5 12.5L11.5 10l3 2.5" />
        <path d="M11.5 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        <path d="M15.5 11.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5" />
        <path d="M14 8.5c0-1.5-1.5-3-3-3s-3 1.5-3 3" />
      </svg>
      <span className="font-headline text-xl font-bold text-foreground">
        TenantFlow
      </span>
    </div>
  );
}
