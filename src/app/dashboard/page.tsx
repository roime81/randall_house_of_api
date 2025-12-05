'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2, Wand2, Sparkles } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { collection, query, where } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

import type { Tenant, TenantSummary } from '@/lib/types';
import {
  runGenerateTenantName,
  runGenerateSampleData,
  runGenerateTenantConfig,
  runGenerateBusinessDescription,
} from '@/lib/actions';
import { useCollection, useFirestore, useUser } from '@/firebase';
import { addTenant } from '@/firebase/firestore/mutations';
import { useMemo } from 'react';

const createTenantSchema = z.object({
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});

export default function DashboardPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, profile } = useUser();
  const firestore = useFirestore();

  const tenantsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    const tenantsRef = collection(firestore, 'tenants');
    if (profile?.role === 'admin') {
      return tenantsRef;
    }
    return query(tenantsRef, where('userId', '==', user.uid));
  }, [firestore, user, profile]);

  const { data: tenants, loading: tenantsLoading } =
    useCollection<TenantSummary>(tenantsQuery);

  const [isCreating, setIsCreating] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [suggestionKeyword, setSuggestionKeyword] = React.useState('');
  const [isSuggesting, setIsSuggesting] = React.useState(false);

  const form = useForm<z.infer<typeof createTenantSchema>>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      description: '',
    },
  });

  const handleSuggestDescription = async () => {
    if (!suggestionKeyword) return;
    setIsSuggesting(true);
    try {
      const result = await runGenerateBusinessDescription({
        keyword: suggestionKeyword,
      });
      if (result.descriptions.length > 0) {
        // Pick a random description from the list
        const randomDescription =
          result.descriptions[
            Math.floor(Math.random() * result.descriptions.length)
          ];
        form.setValue('description', randomDescription);
        toast({
          title: 'Suggestion applied!',
          description: 'A new business description has been generated.',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'Could not generate a description. Please try again.',
      });
    } finally {
      setIsSuggesting(false);
    }
  };


  async function onSubmit(values: z.infer<typeof createTenantSchema>) {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'User not authenticated.',
      });
      return;
    }
    setIsCreating(true);
    try {
      const [nameResult, dataResult, configResult] = await Promise.all([
        runGenerateTenantName({ description: values.description }),
        runGenerateSampleData({
          tenantBusinessDescription: values.description,
        }),
        runGenerateTenantConfig({
          tenantBusinessDescription: values.description,
        }),
      ]);

      const { name } = nameResult;
      const { sampleData } = dataResult;
      const { mcpServers, apiGatewayRoutes, eventStreams, upstreamApis } =
        configResult;

      const newTenant: Omit<Tenant, 'id'> = {
        name,
        userId: user.uid,
        description: values.description,
        logoUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
        createdAt: new Date().toISOString(),
        mcpServers,
        apiGateway: {
          endpoint: `https://${name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}.tenantflow.dev/api`,
          routes: apiGatewayRoutes,
        },
        eventStreams,
        upstreamApis,
        dataStore: {
          sampleData: JSON.parse(sampleData),
          usage: '0 GB of 10 GB used.',
          activityLog: 'Tenant created.',
        },
      };

      const newTenantId = await addTenant(firestore, newTenant);

      toast({
        title: 'Tenant Created!',
        description: `Successfully created new tenant: ${name}`,
      });
      setOpen(false);
      form.reset();

      router.push(`/tenants/${newTenantId}`);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Creation Failed',
        description: 'Could not create the tenant. Please try again.',
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
              <Button
                size="sm"
                className="h-8 gap-1 bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  New Tenant
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-2">
                      <Wand2 className="text-accent" /> Create New Tenant with AI
                    </DialogTitle>
                    <DialogDescription>
                      Describe your tenant's business or purpose, and we'll
                      generate a name and sample data for you.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                     <div className="space-y-2">
                        <FormLabel>Need inspiration?</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. 'coffee shop', 'SaaS'"
                            value={suggestionKeyword}
                            onChange={(e) => setSuggestionKeyword(e.target.value)}
                            disabled={isSuggesting}
                          />
                           <Button type="button" variant="outline" onClick={handleSuggestDescription} disabled={isSuggesting || !suggestionKeyword}>
                              {isSuggesting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="mr-2 h-4 w-4" />
                              )}
                              Suggest Ideas
                          </Button>
                        </div>
                      </div>
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
                              rows={5}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setOpen(false)}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isCreating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create Tenant
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {tenantsLoading && <p>Loading tenants...</p>}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tenants?.map(tenant => (
          <Card
            key={tenant.id}
            className="transition-shadow duration-300 hover:shadow-lg"
          >
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
                <CardTitle className="font-headline text-xl">
                  {tenant.name}
                </CardTitle>
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
