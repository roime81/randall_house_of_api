'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Zap } from 'lucide-react';
import { EventStream } from '@/lib/types';

type EventHandlingProps = {
  initialStreams: EventStream[];
};

export default function EventHandling({ initialStreams }: EventHandlingProps) {
    const [streams, setStreams] = React.useState(initialStreams);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start">
                <div className="flex-1">
                    <CardTitle className="font-headline flex items-center gap-2"><Zap /> Event Streams</CardTitle>
                    <CardDescription>Real-time event feeds from your toolchain.</CardDescription>
                </div>
                <Button size="sm" className="gap-1" variant="outline">
                    <PlusCircle className="h-4 w-4" />
                    New Stream
                </Button>
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
