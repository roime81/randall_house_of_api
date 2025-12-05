'use client';

import * as React from 'react';
import Link from 'next/link';
import { PlusCircle, Loader2, Wand2 } from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

import { initialTenants } from '@/lib/data';
import type { Tenant, TenantSummary } from '@/lib/types';
import { runGenerateTenantName, runGenerateSampleData } from '@/lib/actions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const createTenantSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

export default function DashboardPage() {
  const { toast } = useToast();
  const [tenants, setTenants] = React.useState<TenantSummary[]>(initialTenants);
  const [isCreating, setIsCreating] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const form = useForm<z.infer<typeof createTenantSchema>>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      description: "",
    },
  })

  async function onSubmit(values: z.infer<typeof createTenantSchema>) {
    setIsCreating(true);
    try {
      const { name } = await runGenerateTenantName({ description: values.description });
      const { sampleData } = await runGenerateSampleData({ tenantBusinessDescription: values.description });
      
      const newTenant: Tenant = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description: values.description,
        logoUrl: PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl,
        createdAt: new Date().toISOString(),
        mcpServers: [],
        apiGateway: {
          endpoint: `https://acme.tenantflow.dev/api`,
          routes: [],
        },
        eventStreams: [],
        upstreamApis: [],
        dataStore: {
          sampleData: JSON.parse(sampleData),
          usage: '0 GB of 10 GB used.',
          activityLog: 'Tenant created.',
        },
      };

      // In a real app, you would save this to a database.
      // Here we're just updating the client-side state.
      setTenants(prev => [...prev, newTenant]);

      toast({
        title: "Tenant Created!",
        description: `Successfully created new tenant: ${name}`,
      });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "Could not create the tenant. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  }


  return (
    <>
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold">Tenants</h1>
        <div className="ml-auto flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1 bg-primary hover:bg-primary/90">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New Tenant
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2"><Wand2 className="text-accent" /> Create New Tenant with AI</DialogTitle>
                    <DialogDescription>
                      Describe your tenant's business or purpose, and we'll generate a name and sample data for you.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., 'An e-commerce platform for selling artisanal coffee beans'"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={isCreating}>Cancel</Button>
                    <Button type="submit" disabled={isCreating} className="bg-accent text-accent-foreground hover:bg-accent/90">
                      {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create Tenant
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center gap-4">
              <Image
                  src={tenant.logoUrl}
                  alt={`${tenant.name} logo`}
                  width={48}
                  height={48}
                  className="rounded-lg"
                  data-ai-hint="logo"
                />
              <div className="grid gap-1">
                <CardTitle className="font-headline text-xl">{tenant.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{tenant.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" className="w-full">
                <Link href={`/tenants/${tenant.id}`}>Manage Tenant</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
