'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRightLeft,
  Copy,
  Eye,
  Loader2,
  Search,
  Send,
} from 'lucide-react';
import { ApiRoute, Tenant } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { runApiRequest } from '@/lib/actions';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

type ApiGatewayProps = {
  tenantId: string;
  servers: Tenant['apiServers'];
  gateway: Tenant['apiGateway'];
};

const methodVariant: {
  [key: string]: 'default' | 'secondary' | 'destructive' | 'outline';
} = {
  GET: 'default',
  POST: 'outline',
  PUT: 'secondary',
  DELETE: 'destructive',
};

const methodColors: { [key: string]: string } = {
  GET: 'bg-blue-500/20 text-blue-700 border-blue-500/30',
  POST: 'bg-orange-500/20 text-orange-700 border-orange-500/30',
  PUT: 'bg-purple-500/20 text-purple-700 border-purple-500/30',
  DELETE: 'bg-red-500/20 text-red-700 border-red-500/30',
};

const statusColors: { [key: string]: string } = {
  healthy: 'bg-green-500',
  degraded: 'bg-yellow-500',
  down: 'bg-red-500',
};

type ApiTestState = {
  requestBody: string;
  responseBody: string;
  responseStatus: number | null;
  isLoading: boolean;
};

export default function ApiGateway({
  tenantId,
  servers,
  gateway,
}: ApiGatewayProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { toast } = useToast();
  const [testState, setTestState] = React.useState<ApiTestState>({
    requestBody: '{\n  "key": "value"\n}',
    responseBody: '',
    responseStatus: null,
    isLoading: false,
  });

  const routes = gateway?.routes || [];
  const endpoint = gateway?.endpoint || 'Not configured';

  const serversWithRoutes = React.useMemo(() => {
    const serverMap = new Map(
      servers.map(s => ({ ...s, routes: [] as ApiRoute[] }))
    );
    routes.forEach(route => {
      const server = serverMap.get(route.targetServer);
      if (server) {
        server.routes.push(route);
      } else {
        const foundServer = servers.find(s => s.id === route.targetServer);
        if (foundServer) {
          serverMap.set(route.targetServer, { ...foundServer, routes: [route]});
        }
      }
    });

    return Array.from(serverMap.values());
  }, [servers, routes]);

  const filteredServers = React.useMemo(() => {
    if (!searchTerm) {
      return serversWithRoutes;
    }
    return serversWithRoutes
      .map(server => {
        const filteredRoutes = server.routes.filter(
          route =>
            route.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
            route.method.toLowerCase().includes(searchTerm.toLowerCase())
        );
        return { ...server, routes: filteredRoutes };
      })
      .filter(server => server.routes.length > 0);
  }, [searchTerm, serversWithRoutes]);

  const handleCopy = (text: string, entity: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${entity} Copied!`,
      description: `The ${entity.toLowerCase()} has been copied to your clipboard.`,
    });
  };

  const handleSendRequest = async (route: ApiRoute) => {
    setTestState(prev => ({ ...prev, isLoading: true, responseBody: '', responseStatus: null }));

    try {
      const result = await runApiRequest({
        url: `${endpoint}${route.path}`,
        method: route.method,
        body:
          route.method === 'POST' || route.method === 'PUT'
            ? testState.requestBody
            : undefined,
      });

      setTestState(prev => ({
        ...prev,
        responseBody: JSON.stringify(result.body, null, 2),
        responseStatus: result.status,
      }));
    } catch (error) {
       setTestState(prev => ({
        ...prev,
        responseBody: 'An error occurred while sending the request.',
        responseStatus: 500,
      }));
       toast({
        variant: 'destructive',
        title: 'Request Failed',
        description: 'Could not send API request. See response for details.',
      });
    } finally {
      setTestState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start">
          <div className="flex-1">
            <CardTitle className="font-headline flex items-center gap-2">
              <ArrowRightLeft /> API Gateway
            </CardTitle>
            <CardDescription>
              A single endpoint to access all your deployed services.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="gap-1">
            <Link href={`/tenants/${tenantId}/reference`}>
              <Eye className="h-4 w-4" />
              View API Homepage
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm mb-1">API Endpoint</h4>
          <div className="flex items-center gap-2 rounded-md bg-muted p-2">
            <code className="text-sm flex-1">{endpoint}</code>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleCopy(endpoint, 'Endpoint')}
              disabled={!gateway?.endpoint}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search routes..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-4">
          {filteredServers.map(server => (
            <div key={server.id}>
              <h3 className="font-semibold text-base mb-2">
                {server.name} ({server.id})
              </h3>
              <Accordion type="single" collapsible className="space-y-2">
                {server.routes.map(route => (
                  <AccordionItem
                    value={route.path}
                    key={route.path}
                    className="border rounded-md px-3"
                  >
                    <AccordionTrigger className="py-2 hover:no-underline">
                      <div className="flex items-center gap-4 flex-1">
                        <Badge
                          className={`w-20 justify-center text-base py-1 ${
                            methodColors[route.method]
                          }`}
                        >
                          {route.method}
                        </Badge>
                        <code className="text-base font-medium font-mono">
                          {route.path}
                        </code>
                      </div>
                      <div className="flex items-center gap-2 mr-2">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            statusColors[route.status]
                          }`}
                        ></div>
                        <span className="text-sm capitalize text-muted-foreground">
                          {route.status}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-muted/50 p-4 rounded-b-md -mx-3 -mb-3 mt-1 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                          Target Service:{' '}
                          <span className="font-mono bg-background px-1 py-0.5 rounded">
                            {route.targetServer}
                          </span>
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopy(`${endpoint}${route.path}`, 'Route URL')
                          }
                        >
                          <Copy className="mr-2 h-4 w-4" /> Copy full URL
                        </Button>
                      </div>

                      {/* API Tester */}
                      <div className="border-t border-border/50 pt-4">
                        <h4 className="font-semibold text-sm mb-2">
                          API Tester
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="request-body">Request Body</Label>
                            {(route.method === 'POST' || route.method === 'PUT') ? (
                              <Textarea
                                id="request-body"
                                rows={8}
                                className="font-mono text-xs"
                                value={testState.requestBody}
                                onChange={(e) => setTestState(prev => ({...prev, requestBody: e.target.value}))}
                                placeholder="Enter JSON body..."
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-background rounded-md border text-sm text-muted-foreground">
                                No request body for {route.method}
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                             <Label htmlFor="response-body">Response</Label>
                             <div className="bg-background rounded-md border h-full p-2">
                               {testState.responseStatus && (
                                   <div className="text-sm mb-2 font-medium">Status: {testState.responseStatus}</div>
                               )}
                               <pre className="text-xs font-mono overflow-auto h-[150px]">
                                 <code>
                                     {testState.isLoading ? 'Sending...' : testState.responseBody || 'Response will appear here...'}
                                 </code>
                               </pre>
                             </div>
                          </div>
                        </div>
                         <Button
                            className="mt-2 w-full"
                            onClick={() => handleSendRequest(route)}
                            disabled={testState.isLoading}
                          >
                            {testState.isLoading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            Send Request
                          </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
          {searchTerm && filteredServers.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No routes match your search.
            </p>
          )}
          {routes.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No routes configured.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
