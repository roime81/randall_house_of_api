'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Trash2, PlusCircle, Info, Settings } from 'lucide-react';
import type { MonetizationSettings, MonetizationTier } from '@/lib/types';
import { produce } from 'immer';
import { ScrollArea } from '../ui/scroll-area';

type MonetizationDialogProps = {
  settings: MonetizationSettings;
  onSave: (settings: MonetizationSettings) => void;
  trigger: React.ReactNode;
};

export function MonetizationDialog({
  settings,
  onSave,
  trigger,
}: MonetizationDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [localSettings, setLocalSettings] =
    React.useState<MonetizationSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    setOpen(false);
  };

  const handleTierChange = <K extends keyof MonetizationTier>(
    tierId: string,
    field: K,
    value: MonetizationTier[K]
  ) => {
    setLocalSettings(
      produce(draft => {
        const tier = draft.tiers.find(t => t.id === tierId);
        if (tier) {
          tier[field] = value;
        }
      })
    );
  };
  
  const handleFeatureChange = (tierId: string, featureIndex: number, value: string) => {
    setLocalSettings(
      produce(draft => {
        const tier = draft.tiers.find(t => t.id === tierId);
        if (tier) {
          tier.features[featureIndex] = value;
        }
      })
    );
  };
  
  const addFeature = (tierId: string) => {
    setLocalSettings(
      produce(draft => {
        const tier = draft.tiers.find(t => t.id === tierId);
        if (tier) {
          tier.features.push('');
        }
      })
    );
  }

  const removeFeature = (tierId: string, featureIndex: number) => {
     setLocalSettings(
      produce(draft => {
        const tier = draft.tiers.find(t => t.id === tierId);
        if (tier) {
          tier.features.splice(featureIndex, 1);
        }
      })
    );
  }

  const isConnected = !!(localSettings.stripePublicKey && localSettings.stripeSecretKey);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <Settings /> Configure Monetization
          </DialogTitle>
          <DialogDescription>
            Manage payment integration, pricing tiers, and rate limits for your
            API.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-6">
          <div className="space-y-8 py-4">
            {/* General Settings */}
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold text-lg">General Settings</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="monetization-enabled" className="flex flex-col gap-1">
                  <span>Enable Monetization</span>
                  <span className="font-normal text-muted-foreground text-sm">
                    Allow users to subscribe to paid plans.
                  </span>
                </Label>
                <Switch
                  id="monetization-enabled"
                  checked={localSettings.enabled}
                  onCheckedChange={checked =>
                    setLocalSettings(
                      produce(draft => {
                        draft.enabled = checked;
                      })
                    )
                  }
                />
              </div>
            </div>

            {/* Stripe Integration */}
            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-lg">Stripe Integration</h3>
                 {isConnected ? (
                     <Badge variant="secondary" className="border-green-500/50 bg-green-500/10 text-green-700">Connected</Badge>
                 ) : (
                     <Badge variant="outline">Not Connected</Badge>
                 )}
              </div>
             
              <div className="space-y-2">
                <Label htmlFor="stripe-pk">Stripe Public Key</Label>
                <Input
                  id="stripe-pk"
                  placeholder="pk_live_..."
                  value={localSettings.stripePublicKey}
                  onChange={e =>
                    setLocalSettings(
                      produce(draft => {
                        draft.stripePublicKey = e.target.value;
                      })
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stripe-sk">Stripe Secret Key</Label>
                <Input
                  id="stripe-sk"
                  type="password"
                  placeholder="sk_live_..."
                  value={localSettings.stripeSecretKey}
                  onChange={e =>
                    setLocalSettings(
                      produce(draft => {
                        draft.stripeSecretKey = e.target.value;
                      })
                    )
                  }
                />
              </div>
               <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>Your keys are stored securely and are only used to communicate with the Stripe API for billing.</span>
               </div>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-6">
              <h3 className="font-semibold text-lg">Pricing Tiers</h3>
              {localSettings.tiers.map(tier => (
                <div key={tier.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-base capitalize">
                      {tier.name} Plan
                    </h4>
                    <div className="flex items-center gap-2">
                         <Label htmlFor={`tier-enabled-${tier.id}`} className="text-sm font-normal">Enable</Label>
                         <Switch id={`tier-enabled-${tier.id}`} checked={tier.enabled} onCheckedChange={(checked) => handleTierChange(tier.id, 'enabled', checked)} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`price-${tier.id}`}>Price (/month)</Label>
                      <Input
                        id={`price-${tier.id}`}
                        type="number"
                        placeholder="e.g., 25"
                        value={tier.price === -1 ? '' : tier.price}
                        onChange={(e) => handleTierChange(tier.id, 'price', e.target.value === '' ? -1 : Number(e.target.value))}
                        disabled={!tier.enabled || tier.id === 'hobby'}
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor={`requests-${tier.id}`}>Requests (/month)</Label>
                      <Input
                        id={`requests-${tier.id}`}
                        type="number"
                        placeholder="e.g., 100000"
                         value={tier.requests === -1 ? '' : tier.requests}
                        onChange={(e) => handleTierChange(tier.id, 'requests', e.target.value === '' ? -1 : Number(e.target.value))}
                        disabled={!tier.enabled}
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor={`rate-limit-${tier.id}`}>Rate Limit (/min)</Label>
                      <Input
                        id={`rate-limit-${tier.id}`}
                        type="number"
                        placeholder="e.g., 600"
                        value={tier.rateLimit === -1 ? '' : tier.rateLimit}
                        onChange={(e) => handleTierChange(tier.id, 'rateLimit', e.target.value === '' ? -1 : Number(e.target.value))}
                        disabled={!tier.enabled}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="space-y-2">
                        {tier.features.map((feature, index) => (
                           <div key={index} className="flex items-center gap-2">
                                <Input value={feature} onChange={(e) => handleFeatureChange(tier.id, index, e.target.value)} placeholder="e.g., Advanced Analytics" disabled={!tier.enabled} />
                                <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => removeFeature(tier.id, index)} disabled={!tier.enabled}>
                                    <Trash2 className="h-4 w-4"/>
                                </Button>
                           </div>
                        ))}
                    </div>
                     <Button type="button" variant="outline" size="sm" className="gap-1 mt-2" onClick={() => addFeature(tier.id)} disabled={!tier.enabled}>
                        <PlusCircle className="h-4 w-4"/> Add Feature
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
