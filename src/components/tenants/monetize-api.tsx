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
import { DollarSign, Settings, Zap } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

export default function MonetizeApi() {
  return (
    <Card className="border-accent">
      <CardHeader>
        <div className="flex items-start">
          <div className="flex-1">
            <CardTitle className="font-headline flex items-center gap-2 text-accent">
              <DollarSign /> Monetize your API
            </CardTitle>
            <CardDescription>
              Generate revenue by charging for API access. Connect to Stripe and
              set your pricing tiers.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1 bg-accent hover:bg-accent/90">
            <Settings className="h-4 w-4" />
            Configure Monetization
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-lg border bg-card p-4 flex flex-col">
            <div className="flex-1">
                <h3 className="font-semibold">Hobby</h3>
                <p className="text-sm text-muted-foreground mt-1">For personal projects & exploration.</p>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold">Free</p>
                <p className="text-xs text-muted-foreground">1,000 requests/month</p>
            </div>
             <Button variant="outline" className="mt-4 w-full" disabled>
                Current Plan
            </Button>
        </div>
         <div className="rounded-lg border bg-card p-4 flex flex-col">
            <div className="flex-1">
                <h3 className="font-semibold">Pro</h3>
                <p className="text-sm text-muted-foreground mt-1">For production applications with scaling needs.</p>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold">$25<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                <p className="text-xs text-muted-foreground">100,000 requests/month</p>
            </div>
            <Button className="mt-4 w-full">
                Upgrade to Pro
            </Button>
        </div>
         <div className="rounded-lg border bg-card p-4 flex flex-col">
            <div className="flex-1">
                <h3 className="font-semibold">Enterprise</h3>
                <p className="text-sm text-muted-foreground mt-1">For large-scale, mission-critical applications.</p>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold">Custom</p>
                <p className="text-xs text-muted-foreground">Unlimited requests & premium support</p>
            </div>
            <Button variant="outline" className="mt-4 w-full">
                Contact Sales
            </Button>
        </div>

      </CardContent>
    </Card>
  );
}
