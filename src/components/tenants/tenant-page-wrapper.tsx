'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function TenantPageWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(true);

  React.useEffect(() => {
    // If the sheet was closed (e.g. by pressing Esc), navigate back.
    if (!isOpen) {
      router.back();
    }
  }, [isOpen, router]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        className="w-full max-w-full overflow-y-auto p-0 sm:max-w-full md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%]"
        side="right"
      >
        <div className="sticky top-0 z-20 flex items-center justify-between border-b bg-card p-4">
          <SheetHeader className="text-left">
            <SheetTitle className="font-headline text-2xl">
              Manage Tenant
            </SheetTitle>
          </SheetHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
