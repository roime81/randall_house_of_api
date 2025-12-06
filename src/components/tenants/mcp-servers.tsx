'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, Server } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ApiServer } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { CreateServerSheet } from './create-server-sheet';

type ApiServersProps = {
  initialServers: ApiServer[];
};

const statusColor: { [key in ApiServer['status']]: string } = {
    running: 'bg-green-500',
    stopped: 'bg-gray-500',
    deploying: 'bg-yellow-500 animate-pulse',
    error: 'bg-red-500',
};

export default function ApiServers({ initialServers = [] }: ApiServersProps) {
  const [servers, setServers] = React.useState<ApiServer[]>(initialServers);

  const addServer = (newServer: Omit<ApiServer, 'id' | 'createdAt' | 'status'>) => {
    const serverToAdd: ApiServer = {
      ...newServer,
      id: `srv-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'deploying',
    };

    setServers(prev => [...prev, serverToAdd]);

    // Simulate deployment time
    setTimeout(() => {
      setServers(prev =>
        prev.map(s =>
          s.id === serverToAdd.id ? { ...s, status: 'running' } : s
        )
      );
    }, 5000);
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex items-start">
          <div className="flex-1">
            <CardTitle className="font-headline flex items-center gap-2">
              <Server /> API Servers
            </CardTitle>
            <CardDescription>Your services deployed across multiple cloud providers.</CardDescription>
          </div>
          <CreateServerSheet onServerCreate={addServer} />
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
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {servers.map(server => (
              <TableRow key={server.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusColor[server.status]}`}></span>
                    <span className="capitalize">{server.status}</span>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{server.name}</TableCell>
                <TableCell>{server.region}</TableCell>
                <TableCell>{formatDistanceToNow(new Date(server.createdAt), { addSuffix: true })}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Restart</DropdownMenuItem>
                      <DropdownMenuItem>Stop</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-500">Terminate</DropdownMenuItem>
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
  );
}
