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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal, Server } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ApiServer, Tenant } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { CreateServerSheet } from './create-server-sheet';
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
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import {
  updateApiServerStatus,
  deleteApiServer,
} from '@/firebase/firestore/tenants';

type ApiServersProps = {
  tenant: Tenant;
};

const statusColor: { [key in ApiServer['status']]: string } = {
  running: 'bg-green-500',
  stopped: 'bg-gray-500',
  deploying: 'bg-yellow-500 animate-pulse',
  error: 'bg-red-500',
};

export default function ApiServers({ tenant }: ApiServersProps) {
  const [serverToDelete, setServerToDelete] = React.useState<ApiServer | null>(
    null
  );
  const { toast } = useToast();
  const firestore = useFirestore();

  const handleAction = async (
    action: 'restart' | 'stop' | 'start' | 'delete',
    server: ApiServer
  ) => {
    if (!firestore || !tenant.id) return;

    try {
      switch (action) {
        case 'restart':
          await updateApiServerStatus(
            firestore,
            tenant.id,
            server.id,
            'deploying'
          );
          setTimeout(() => {
            updateApiServerStatus(firestore, tenant.id, server.id, 'running');
          }, 3000);
          break;
        case 'stop':
          await updateApiServerStatus(firestore, tenant.id, server.id, 'stopped');
          break;
        case 'start':
          await updateApiServerStatus(firestore, tenant.id, server.id, 'running');
          break;
        case 'delete':
          if (server.status !== 'stopped') {
            toast({
              variant: 'destructive',
              title: 'Delete Failed',
              description: `Server "${server.name}" must be stopped before deletion.`,
            });
            return;
          }
          setServerToDelete(server);
          break;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: `Could not perform action on "${server.name}". Please try again.`,
      });
    }
  };

  const executeDelete = async () => {
    if (!firestore || !tenant.id || !serverToDelete) return;
  
    try {
      await deleteApiServer(firestore, tenant.id, serverToDelete.id);
      toast({
        title: 'Server Deleted',
        description: `Server "${serverToDelete.name}" has been permanently deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete Failed',
        description: `Could not delete server "${serverToDelete.name}".`,
      });
    } finally {
      setServerToDelete(null);
    }
  };

  const servers = tenant.apiServers || [];

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start">
            <div className="flex-1">
              <CardTitle className="font-headline flex items-center gap-2">
                <Server /> API Servers
              </CardTitle>
              <CardDescription>
                Your services deployed across multiple cloud providers.
              </CardDescription>
            </div>
            <CreateServerSheet tenantId={tenant.id} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Provider/Region</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servers.map(server => (
                <TableRow key={server.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          statusColor[server.status]
                        }`}
                      ></span>
                      <span className="capitalize">{server.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{server.name}</TableCell>
                  <TableCell>{server.region}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(server.createdAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAction('restart', server)}
                          disabled={
                            server.status === 'deploying' ||
                            server.status === 'stopped'
                          }
                        >
                          Restart
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleAction(
                              server.status === 'running' ? 'stop' : 'start',
                              server
                            )
                          }
                          disabled={server.status === 'deploying'}
                        >
                          {server.status === 'running' ? 'Stop' : 'Start'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:bg-red-500/10 focus:text-red-600"
                          onClick={() => handleAction('delete', server)}
                          disabled={server.status !== 'stopped'}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {servers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No servers deployed yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog
        open={!!serverToDelete}
        onOpenChange={open => !open && setServerToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              <span className="font-semibold text-foreground">
                {serverToDelete?.name}
              </span>{' '}
              server and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={executeDelete}
            >
              Yes, delete server
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
