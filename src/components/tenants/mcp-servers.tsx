'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Server, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ApiServer } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type ApiServersProps = {
  initialServers: ApiServer[];
};

const statusVariant: { [key in ApiServer['status']]: 'default' | 'secondary' | 'destructive' } = {
  running: 'default',
  stopped: 'secondary',
  deploying: 'outline',
  error: 'destructive',
};

const statusColor: { [key in ApiServer['status']]: string } = {
    running: 'bg-green-500',
    stopped: 'bg-gray-500',
    deploying: 'bg-yellow-500 animate-pulse',
    error: 'bg-red-500',
  };

export default function ApiServers({ initialServers }: ApiServersProps) {
  const [servers, setServers] = React.useState<ApiServer[]>(initialServers);
  const [isDeploying, setIsDeploying] = React.useState(false);

  const handleDeploy = () => {
    setIsDeploying(true);
    const newServerId = servers.length + 1;
    const newServer: ApiServer = {
      id: `depl-${Date.now()}`,
      name: `New Server #${newServerId}`,
      status: 'deploying',
      createdAt: new Date().toISOString(),
      region: ['aws-us-east-1', 'gcp-us-central1', 'azure-westeurope'][Math.floor(Math.random() * 3)],
    };
    setServers(prev => [...prev, newServer]);

    // Simulate deployment time
    setTimeout(() => {
      setServers(prev =>
        prev.map(s =>
          s.id === newServer.id ? { ...s, status: 'running' } : s
        )
      );
      setIsDeploying(false);
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
          <Button size="sm" className="gap-1" onClick={handleDeploy} disabled={isDeploying}>
            {isDeploying ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <PlusCircle className="h-4 w-4" />
            )}
            New Server
          </Button>
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
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
