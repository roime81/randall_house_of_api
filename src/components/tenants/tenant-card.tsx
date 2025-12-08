'use client';

import * as React from 'react';
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
import type { TenantSummary, UserProfile } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { deleteTenant } from '@/firebase/firestore/mutations';
import { Trash2 } from 'lucide-react';

type TenantCardProps = {
  tenant: TenantSummary;
  userProfile: UserProfile | null;
};

export function TenantCard({ tenant, userProfile }: TenantCardProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!firestore) return;
    setIsDeleting(true);
    try {
      await deleteTenant(firestore, tenant.id);
      toast({
        title: 'Tenant Deleted',
        description: `Tenant "${tenant.name}" has been permanently deleted.`,
      });
      // The UI will update reactively due to the real-time listener on the dashboard page.
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the tenant. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      key={tenant.id}
      className="flex flex-col transition-shadow duration-300 hover:shadow-lg"
    >
      <CardHeader className="flex flex-row items-start gap-4">
        <Image
          src={tenant.logoUrl}
          alt={`${tenant.name} logo`}
          width={48}
          height={48}
          className="rounded-lg"
          data-ai-hint="logo"
        />
        <div className="grid flex-1 gap-1">
          <CardTitle className="font-headline text-xl">{tenant.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <CardDescription>{tenant.description}</CardDescription>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild size="sm" className="w-full">
          <Link href={`/tenants/${tenant.id}`}>Manage Tenant</Link>
        </Button>
        {userProfile?.role === 'admin' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="shrink-0"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the{' '}
                  <span className="font-semibold text-foreground">
                    {tenant.name}
                  </span>{' '}
                  tenant and all of its associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete tenant'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </CardFooter>
    </Card>
  );
}
