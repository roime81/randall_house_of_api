'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  PlusCircle,
  Loader2,
  Server,
  Cloud,
  Building,
  HardDrive,
} from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { ApiServer } from '@/lib/types';
import { useFirestore } from '@/firebase';
import { addApiServer } from '@/firebase/firestore/tenants';
import { useToast } from '@/hooks/use-toast';

type DeploymentType = 'public' | 'private' | 'on-prem';

type CreateServerSheetProps = {
  tenantId: string;
};

export function CreateServerSheet({ tenantId }: CreateServerSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [deploymentType, setDeploymentType] =
    React.useState<DeploymentType>('public');

  const [name, setName] = React.useState('');
  const [provider, setProvider] = React.useState('gcp-us-central1');
  const [instanceSize, setInstanceSize] = React.useState('standard-2');
  const [privateEndpoint, setPrivateEndpoint] = React.useState('');
  const [apiKey, setApiKey] = React.useState('');
  const [onPremIp, setOnPremIp] = React.useState('');
  const [onPremPort, setOnPremPort] = React.useState('');
  
  const firestore = useFirestore();
  const { toast } = useToast();

  const resetForm = () => {
    setName('');
    setProvider('gcp-us-central1');
    setInstanceSize('standard-2');
    setPrivateEndpoint('');
    setApiKey('');
    setOnPremIp('');
    setOnPremPort('');
    setDeploymentType('public');
  }

  const handleSubmit = async () => {
    if (!firestore || !name || !tenantId) return;
    setIsDeploying(true);

    let newServerData: Omit<ApiServer, 'id' | 'createdAt' | 'status'>;

    switch (deploymentType) {
      case 'public':
        newServerData = { name, region: provider };
        break;
      case 'private':
        newServerData = { name, region: 'Private Cloud' };
        // In a real app, you'd use the privateEndpoint and apiKey
        break;
      case 'on-prem':
        newServerData = { name, region: 'On-Premise' };
        // In a real app, you'd use the onPremIp and onPremPort
        break;
    }

    try {
        await addApiServer(firestore, tenantId, newServerData);
        toast({
            title: 'Deployment Started',
            description: `Server "${name}" is being deployed.`
        });
    } catch (error) {
         toast({
            variant: 'destructive',
            title: 'Deployment Failed',
            description: `Could not start deployment for "${name}".`,
        });
    } finally {
        setIsDeploying(false);
        setOpen(false);
        resetForm();
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" />
          New Server
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-headline flex items-center gap-2">
            <Server /> Deploy New API Server
          </SheetTitle>
          <SheetDescription>
            Configure and deploy a new server to your infrastructure.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label>Deployment Type</Label>
            <RadioGroup
              value={deploymentType}
              onValueChange={(value: any) => setDeploymentType(value)}
              className="grid grid-cols-3 gap-2"
            >
              <div>
                <RadioGroupItem
                  value="public"
                  id="public"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="public"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Cloud className="mb-2 h-5 w-5" /> Public Cloud
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="private"
                  id="private"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="private"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Building className="mb-2 h-5 w-5" /> Private Cloud
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="on-prem"
                  id="on-prem"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="on-prem"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <HardDrive className="mb-2 h-5 w-5" /> On-Premise
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Server Name</Label>
            <Input
              id="name"
              placeholder="e.g., Auth Service, Payment Gateway"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {deploymentType === 'public' && (
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-semibold text-sm">
                Public Cloud Configuration
              </h4>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider & Region</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gcp-us-central1">
                      Google Cloud (us-central1)
                    </SelectItem>
                    <SelectItem value="aws-us-east-1">
                      Amazon Web Services (us-east-1)
                    </SelectItem>
                    <SelectItem value="azure-westus">
                      Microsoft Azure (westus)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instance-size">Instance Size</Label>
                <Select value={instanceSize} onValueChange={setInstanceSize}>
                  <SelectTrigger id="instance-size">
                    <SelectValue placeholder="Select an instance size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard-1">
                      Small (1 vCPU, 2GB RAM)
                    </SelectItem>
                    <SelectItem value="standard-2">
                      Medium (2 vCPU, 4GB RAM)
                    </SelectItem>
                    <SelectItem value="standard-4">
                      Large (4 vCPU, 8GB RAM)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {deploymentType === 'private' && (
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-semibold text-sm">
                Private Cloud Configuration
              </h4>
              <div className="space-y-2">
                <Label htmlFor="private-endpoint">Endpoint URL</Label>
                <Input
                  id="private-endpoint"
                  placeholder="https://private.cloud.internal/api"
                  value={privateEndpoint}
                  onChange={e => setPrivateEndpoint(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key (optional)</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your secret API key"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                />
              </div>
            </div>
          )}

          {deploymentType === 'on-prem' && (
            <div className="space-y-4 rounded-md border p-4">
              <h4 className="font-semibold text-sm">
                On-Premise Configuration
              </h4>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="on-prem-ip">Server IP Address</Label>
                  <Input
                    id="on-prem-ip"
                    placeholder="e.g., 192.168.1.100"
                    value={onPremIp}
                    onChange={e => setOnPremIp(e.target.value)}
                  />
                </div>
                <div className="space-y-2 w-24">
                  <Label htmlFor="on-prem-port">Port</Label>
                  <Input
                    id="on-prem-port"
                    placeholder="e.g., 8080"
                    value={onPremPort}
                    onChange={e => setOnPremPort(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="auth-token">Auth Token</Label>
                <Input
                  id="auth-token"
                  type="password"
                  placeholder="Enter the authentication token"
                />
              </div>
              <Textarea placeholder="Notes about this server (OS, location, etc.)..." />
            </div>
          )}
        </div>
        <SheetFooter className="pt-6">
          <SheetClose asChild>
            <Button type="button" variant="ghost" disabled={isDeploying}>
              Cancel
            </Button>
          </SheetClose>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isDeploying || !name}
          >
            {isDeploying ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Server className="mr-2 h-4 w-4" />
            )}
            Deploy Server
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
