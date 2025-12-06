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
  SheetClose
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
import {
  RadioGroup,
  RadioGroupItem
} from '@/components/ui/radio-group';
import { PlusCircle, Loader2, Server, Cloud, Building, HardDrive } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import type { ApiServer } from '@/lib/types';


type DeploymentType = 'public' | 'private' | 'on-prem';

type CreateServerSheetProps = {
    onServerCreate: (server: Omit<ApiServer, 'id' | 'createdAt' | 'status'>) => void;
}

export function CreateServerSheet({ onServerCreate }: CreateServerSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [isDeploying, setIsDeploying] = React.useState(false);
  const [deploymentType, setDeploymentType] = React.useState<DeploymentType>('public');
  
  const [name, setName] = React.useState('');
  const [provider, setProvider] = React.useState('gcp-us-central1');
  const [privateEndpoint, setPrivateEndpoint] = React.useState('');
  const [onPremIp, setOnPremIp] = React.useState('');

  const handleSubmit = () => {
    setIsDeploying(true);

    let newServerData: Omit<ApiServer, 'id' | 'createdAt' | 'status'>;

    switch(deploymentType) {
        case 'public':
            newServerData = { name, region: provider };
            break;
        case 'private':
            newServerData = { name, region: 'Private Cloud' };
            // In a real app, you'd use the privateEndpoint
            break;
        case 'on-prem':
            newServerData = { name, region: 'On-Premise' };
            // In a real app, you'd use the onPremIp
            break;
    }
    
    // Simulate API call
    setTimeout(() => {
        onServerCreate(newServerData);
        setIsDeploying(false);
        setOpen(false);
        // Reset form
        setName('');
        setProvider('gcp-us-central1');
        setPrivateEndpoint('');
        setOnPremIp('');

    }, 1500);
  };


  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
         <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            New Server
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-headline flex items-center gap-2">
            <Server /> Deploy New API Server
          </SheetTitle>
          <SheetDescription>
            Configure and deploy a new server to your infrastructure.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
            <div className='space-y-2'>
                <Label>Deployment Type</Label>
                <RadioGroup defaultValue="public" onValueChange={(value: DeploymentType) => setDeploymentType(value)} className="grid grid-cols-3 gap-2">
                    <div>
                        <RadioGroupItem value="public" id="public" className="peer sr-only" />
                        <Label htmlFor="public" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           <Cloud className="mb-2"/> Public Cloud
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="private" id="private" className="peer sr-only" />
                        <Label htmlFor="private" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           <Building className="mb-2"/> Private Cloud
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="on-prem" id="on-prem" className="peer sr-only" />
                        <Label htmlFor="on-prem" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           <HardDrive className="mb-2"/> On-Premise
                        </Label>
                    </div>
                </RadioGroup>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Server Name</Label>
                <Input id="name" placeholder="e.g., Auth Service" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            {deploymentType === 'public' && (
                 <div className="space-y-2">
                    <Label htmlFor="provider">Provider & Region</Label>
                    <Select value={provider} onValueChange={setProvider}>
                        <SelectTrigger id="provider">
                            <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="gcp-us-central1">Google Cloud (us-central1)</SelectItem>
                            <SelectItem value="aws-us-east-1">Amazon Web Services (us-east-1)</SelectItem>
                            <SelectItem value="azure-westus">Microsoft Azure (westus)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {deploymentType === 'private' && (
                <div className="space-y-2">
                    <Label htmlFor="private-endpoint">Endpoint URL</Label>
                    <Input id="private-endpoint" placeholder="https://private.cloud.internal/api" value={privateEndpoint} onChange={(e) => setPrivateEndpoint(e.target.value)} />
                </div>
            )}

             {deploymentType === 'on-prem' && (
                <div className="space-y-2">
                    <Label htmlFor="on-prem-ip">Server IP Address</Label>
                    <Input id="on-prem-ip" placeholder="e.g., 192.168.1.100" value={onPremIp} onChange={(e) => setOnPremIp(e.target.value)} />
                     <Textarea placeholder="Notes about this server (optional)..." />
                </div>
            )}

        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" variant="ghost" disabled={isDeploying}>Cancel</Button>
          </SheetClose>
          <Button type="submit" onClick={handleSubmit} disabled={isDeploying || !name}>
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
