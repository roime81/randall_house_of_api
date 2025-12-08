'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ExternalLink,
  Lock,
  PlusCircle,
  Unlock,
  Trash2,
} from 'lucide-react';
import { UpstreamApi } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import {
  addUpstreamApi,
  deleteUpstreamApi,
} from '@/firebase/firestore/tenants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type UpstreamApisProps = {
  tenantId: string;
  initialApis?: UpstreamApi[];
};

export default function UpstreamApis({
  tenantId,
  initialApis = [],
}: UpstreamApisProps) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [url, setUrl] = React.useState('');
  const [apiToDelete, setApiToDelete] = React.useState<UpstreamApi | null>(
    null
  );
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleAddApi = async () => {
    if (!firestore || !name || !url) return;

    try {
      await addUpstreamApi(firestore, tenantId, {
        name,
        baseUrl: url,
        authenticated: false,
      });
      toast({
        title: 'Upstream API Added',
        description: `API "${name}" has been registered.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Add API',
        description: 'Could not add the new upstream API.',
      });
    } finally {
      setName('');
      setUrl('');
      setOpen(false);
    }
  };

  const handleDeleteApi = async () => {
    if (!firestore || !apiToDelete) return;

    try {
      await deleteUpstreamApi(firestore, tenantId, apiToDelete.id);
      toast({
        title: 'Upstream API Deleted',
        description: `API "${apiToDelete.name}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Delete API',
        description: 'Could not delete the upstream API.',
      });
    } finally {
      setApiToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start">
            <div className="flex-1">
              <CardTitle className="font-headline flex items-center gap-2">
                <ExternalLink /> Upstream APIs
              </CardTitle>
              <CardDescription>
                Connect with external services to extend functionality.
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1" variant="outline">
                  <PlusCircle className="h-4 w-4" />
                  Add API
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Upstream API</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g., GitHub API"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="url" className="text-right">
                      Base URL
                    </Label>
                    <Input
                      id="url"
                      value={url}
                      onChange={e => setUrl(e.target.value)}
                      placeholder="https://api.github.com"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddApi}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {initialApis.map(api => (
              <div
                key={api.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">{api.name}</p>
                  <p className="text-sm text-muted-foreground">{api.baseUrl}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {api.authenticated ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                    <span>{api.authenticated ? 'Auth Required' : 'Open'}</span>
                  </div>
                   <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setApiToDelete(api)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
            {initialApis.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No upstream APIs registered.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!apiToDelete}
        onOpenChange={open => !open && setApiToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              upstream API integration for{' '}
              <span className="font-semibold text-foreground">
                {apiToDelete?.name}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteApi}
            >
              Yes, delete API
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
