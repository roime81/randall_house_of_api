'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Lock, PlusCircle, Unlock } from 'lucide-react';
import { UpstreamApi } from '@/lib/types';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

type UpstreamApisProps = {
  initialApis: UpstreamApi[];
};

export default function UpstreamApis({ initialApis = [] }: UpstreamApisProps) {
    const [apis, setApis] = React.useState(initialApis);
    const [open, setOpen] = React.useState(false);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start">
                    <div className="flex-1">
                        <CardTitle className="font-headline flex items-center gap-2"><ExternalLink /> Upstream APIs</CardTitle>
                        <CardDescription>Connect with external services to extend functionality.</CardDescription>
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
                                    <Label htmlFor="name" className="text-right">Name</Label>
                                    <Input id="name" placeholder="e.g., GitHub API" className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="url" className="text-right">Base URL</Label>
                                    <Input id="url" placeholder="https://api.github.com" className="col-span-3" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={()=>setOpen(false)}>Cancel</Button>
                                <Button onClick={()=>setOpen(false)}>Save</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="space-y-2">
                    {apis.map(api => (
                        <div key={api.id} className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <p className="font-medium">{api.name}</p>
                                <p className="text-sm text-muted-foreground">{api.baseUrl}</p>
                            </div>
                             <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {api.authenticated ? <Lock className="h-4 w-4"/> : <Unlock className="h-4 w-4" />}
                                <span>{api.authenticated ? 'Auth Required' : 'Open'}</span>
                            </div>
                        </div>
                    ))}
                    {apis.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No upstream APIs registered.</p>}
                </div>
            </CardContent>
        </Card>
    )
}
