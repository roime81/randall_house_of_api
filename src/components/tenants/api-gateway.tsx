import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Copy } from 'lucide-react';
import { Tenant } from '@/lib/types';
import { Button } from '../ui/button';

type ApiGatewayProps = {
  gateway: Tenant['apiGateway'];
};

const methodVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  GET: 'default',
  POST: 'outline',
  PUT: 'secondary',
  DELETE: 'destructive',
};

export default function ApiGateway({ gateway }: ApiGatewayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <ArrowRightLeft /> Unified API Gateway
        </CardTitle>
        <CardDescription>A single endpoint to access all your deployed services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
            <h4 className="font-semibold text-sm mb-1">Hub Endpoint</h4>
            <div className="flex items-center gap-2 rounded-md bg-muted p-2">
                <code className="text-sm flex-1">{gateway.endpoint}</code>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Copy className="h-4 w-4"/>
                </Button>
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-sm mb-2">Configured Routes</h4>
            <div className="space-y-2">
            {gateway.routes.map((route) => (
                <div key={route.path} className="flex items-center justify-between rounded-md border p-2">
                <div className="flex items-center gap-2">
                    <Badge variant={methodVariant[route.method]} className="w-16 justify-center">{route.method}</Badge>
                    <code className="text-sm">{route.path}</code>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>&rarr;</span>
                    <span className="font-mono">{route.targetServer}</span>
                </div>
                </div>
            ))}
            {gateway.routes.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No routes configured.</p>}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
