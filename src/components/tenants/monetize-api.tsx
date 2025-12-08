'use client';
import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Settings, CheckCircle, XCircle } from 'lucide-react';
import type { MonetizationSettings, Tenant } from '@/lib/types';
import { MonetizationDialog } from './monetization-dialog';
import { useFirestore } from '@/firebase';
import { updateDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

type MonetizeApiProps = {
  tenant: Tenant;
};

export default function MonetizeApi({ tenant }: MonetizeApiProps) {
  const [settings, setSettings] = React.useState<MonetizationSettings>(
    tenant.monetization || {
      enabled: false,
      stripePublicKey: '',
      stripeSecretKey: '',
      tiers: [
        { id: 'hobby', name: 'Hobby', price: 0, requests: 1000, rateLimit: 60, features: ['Basic Analytics', 'Community Support'], enabled: true },
        { id: 'pro', name: 'Pro', price: 25, requests: 100000, rateLimit: 600, features: ['Advanced Analytics', 'Email Support', 'Webhooks'], enabled: true },
        { id: 'enterprise', name: 'Enterprise', price: -1, requests: -1, rateLimit: -1, features: ['Custom Integrations', 'Dedicated Support', '99.9% Uptime SLA'], enabled: true },
      ]
    }
  );

  const firestore = useFirestore();
  const { toast } = useToast();

  const handleSaveSettings = async (newSettings: MonetizationSettings) => {
    if (!firestore) return;
    const tenantRef = doc(firestore, 'tenants', tenant.id);
    try {
      await updateDoc(tenantRef, { monetization: newSettings });
      setSettings(newSettings);
      toast({
        title: 'Monetization Settings Saved',
        description: 'Your configuration has been successfully updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save monetization settings.',
      });
    }
  };

  const isConnected = !!(settings.stripePublicKey && settings.stripeSecretKey);

  return (
    <Card className="border-accent">
      <CardHeader>
        <div className="flex items-start">
          <div className="flex-1">
            <CardTitle className="font-headline flex items-center gap-2 text-accent">
              <DollarSign /> Monetize your API
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {settings.enabled ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Monetization is active.</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Monetization is disabled.</span>
                </>
              )}
               <span className="text-muted-foreground/50 mx-1">|</span>
               {isConnected ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Stripe is connected.</span>
                </>
              ) : (
                 <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span>Stripe is not connected.</span>
                </>
              )}
            </CardDescription>
          </div>
          <MonetizationDialog
            settings={settings}
            onSave={handleSaveSettings}
            trigger={
              <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
                <Settings className="h-4 w-4" />
                Configure Monetization
              </Button>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {settings.tiers.filter(t => t.enabled).map(tier => (
          <div key={tier.id} className="rounded-lg border bg-card p-4 flex flex-col">
            <div className="flex-1">
              <h3 className="font-semibold">{tier.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tier.id === 'hobby' ? 'For personal projects & exploration.' :
                 tier.id === 'pro' ? 'For production applications with scaling needs.' :
                 'For large-scale, mission-critical applications.'}
              </p>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {tier.price === -1 ? 'Custom' : tier.price === 0 ? 'Free' : `$${tier.price}`}
                {tier.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                {tier.requests === -1 ? 'Unlimited requests' : `${tier.requests.toLocaleString()} requests/month`}
              </p>
            </div>
            <Button
              variant={tier.id === 'pro' ? 'default' : 'outline'}
              className="mt-4 w-full"
              disabled={tier.id === 'hobby'}
            >
              {tier.id === 'hobby' ? 'Current Plan' : tier.id === 'enterprise' ? 'Contact Sales' : 'Upgrade to Pro'}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
