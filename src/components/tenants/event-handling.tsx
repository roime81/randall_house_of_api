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
import { MoreHorizontal, PlusCircle, Trash2, Zap } from 'lucide-react';
import { EventStream } from '@/lib/types';
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
import {
  addEventStream,
  deleteEventStream,
  updateEventStreamStatus,
} from '@/firebase/firestore/tenants';
import { useToast } from '@/hooks/use-toast';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

type EventHandlingProps = {
  tenantId: string;
  initialStreams?: EventStream[];
};

const statusColor: { [key in EventStream['status']]: string } = {
  active: 'bg-green-500',
  inactive: 'bg-gray-500',
  running: 'bg-green-500',
  stopped: 'bg-gray-500',
  processing: 'bg-yellow-500 animate-pulse',
  error: 'bg-red-500',
};

export default function EventHandling({
  tenantId,
  initialStreams = [],
}: EventHandlingProps) {
  const [open, setOpen] = React.useState(false);
  const [topic, setTopic] = React.useState('');
  const firestore = useFirestore();
  const { toast } = useToast();
  const [streamToDelete, setStreamToDelete] = React.useState<EventStream | null>(
    null
  );

  const handleAddStream = async () => {
    if (!firestore || !topic) return;

    try {
      await addEventStream(firestore, tenantId, { topic });
      toast({
        title: 'Event Stream Added',
        description: `Stream for topic "${topic}" is being configured.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Add Stream',
        description: 'Could not add the new event stream.',
      });
    } finally {
      setTopic('');
      setOpen(false);
    }
  };

  const handleDeleteStream = async () => {
    if (!firestore || !streamToDelete) return;

    try {
      await deleteEventStream(firestore, tenantId, streamToDelete.id);
      toast({
        title: 'Event Stream Deleted',
        description: `Stream for topic "${streamToDelete.topic}" has been deleted.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to Delete Stream',
        description: 'Could not delete the event stream.',
      });
    } finally {
      setStreamToDelete(null);
    }
  };

  const handleAction = async (
    action: 'restart' | 'stop' | 'start',
    stream: EventStream
  ) => {
    if (!firestore) return;

    try {
      switch (action) {
        case 'restart':
          await updateEventStreamStatus(
            firestore,
            tenantId,
            stream.id,
            'processing'
          );
          setTimeout(() => {
            updateEventStreamStatus(firestore, tenantId, stream.id, 'running');
          }, 3000);
          break;
        case 'stop':
          await updateEventStreamStatus(
            firestore,
            tenantId,
            stream.id,
            'stopped'
          );
          break;
        case 'start':
          await updateEventStreamStatus(
            firestore,
            tenantId,
            stream.id,
            'running'
          );
          break;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: `Could not perform action on "${stream.topic}". Please try again.`,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start">
            <div className="flex-1">
              <CardTitle className="font-headline flex items-center gap-2">
                <Zap /> Event Streams
              </CardTitle>
              <CardDescription>
                Real-time event feeds from your toolchain.
              </CardDescription>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1" variant="outline">
                  <PlusCircle className="h-4 w-4" />
                  New Stream
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Event Stream</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="topic" className="text-right">
                      Topic
                    </Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g., github:push:main, kafka:orders"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddStream}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {initialStreams.map(stream => (
              <div
                key={stream.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2.5 w-2.5 rounded-full ${
                      statusColor[stream.status] || 'bg-gray-400'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{stream.topic}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {stream.status}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleAction('restart', stream)}
                      disabled={
                        stream.status === 'processing' ||
                        stream.status === 'stopped' ||
                        stream.status === 'inactive'
                      }
                    >
                      Restart
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleAction(
                          stream.status === 'running' || stream.status === 'active' ? 'stop' : 'start',
                          stream
                        )
                      }
                      disabled={stream.status === 'processing'}
                    >
                      {stream.status === 'running' || stream.status === 'active' ? 'Stop' : 'Start'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setStreamToDelete(stream)}
                      disabled={stream.status !== 'stopped' && stream.status !== 'inactive'}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
            {initialStreams.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No streams configured.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <AlertDialog
        open={!!streamToDelete}
        onOpenChange={open => !open && setStreamToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              event stream for the topic{' '}
              <span className="font-semibold text-foreground">
                {streamToDelete?.topic}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteStream}
            >
              Yes, delete stream
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
