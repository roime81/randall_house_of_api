'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Zap } from 'lucide-react';
import { EventStream } from '@/lib/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type EventHandlingProps = {
  initialStreams?: EventStream[];
};

export default function EventHandling({ initialStreams = [] }: EventHandlingProps) {
    const [streams, setStreams] = React.useState(initialStreams);
    const [open, setOpen] = React.useState(false);

    const handleAddStream = () => {
        // In a real app, you'd handle form state and submission
        setOpen(false);
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start">
                <div className="flex-1">
                    <CardTitle className="font-headline flex items-center gap-2"><Zap /> Event Streams</CardTitle>
                    <CardDescription>Real-time event feeds from your toolchain.</CardDescription>
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
                                <Label htmlFor="topic" className="text-right">Topic</Label>
                                <Input id="topic" placeholder="e.g., github:push:main, kafka:orders" className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddStream}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {streams.map(stream => (
                        <div key={stream.id} className="flex items-center justify-between rounded-md border p-3">
                            <div className="flex items-center gap-3">
                                <div className={`h-2.5 w-2.5 rounded-full ${stream.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                <div>
                                    <p className="font-medium">{stream.topic}</p>
                                    <p className="text-sm text-muted-foreground capitalize">{stream.status}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                    {streams.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No streams configured.</p>}
                </div>
            </CardContent>
        </Card>
    )
}
