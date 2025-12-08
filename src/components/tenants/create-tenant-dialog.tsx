'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Loader2, Wand2, Sparkles } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import type { Tenant } from '@/lib/types';
import {
  runGenerateTenantName,
  runGenerateSampleData,
  runGenerateTenantConfig,
  runGenerateBusinessDescription,
} from '@/lib/actions';
import { useFirestore, useUser } from '@/firebase/provider';
import { addTenant } from '@/firebase/firestore/mutations';


const createTenantSchema = z.object({
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
});


export function CreateTenantDialog() {
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();

  const [isCreating, setIsCreating] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [suggestionKeyword, setSuggestionKeyword] = React.useState('');
  const [isSuggesting, setIsSuggesting] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof createTenantSchema>>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: {
      description: '',
    },
  });

  const handleSuggestDescription = () => {
    if (!suggestionKeyword) return;
    
    startTransition(async () => {
      setIsSuggesting(true);
      try {
        const result = await runGenerateBusinessDescription({
          keyword: suggestionKeyword,
        });
        if (result.descriptions.length > 0) {
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
    });
  };

  async function onSubmit(values: z.infer<typeof createTenantSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not available.',
      });
      return;
    }
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'You must be signed in to create a tenant.',
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
      const { apiServers, apiGatewayRoutes, eventStreams, upstreamApis } =
        configResult;

      const newTenant: Omit<Tenant, 'id'| 'createdAt'> = {
        userId: user.uid,
        name,
        description: values.description,
        logoUrl: `https://picsum.photos/seed/${Math.random()}/100/100`,
        apiServers,
        apiGateway: {
          endpoint: `https://${name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}.mcp.dev/api`,
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

      await addTenant(firestore, newTenant);

      toast({
        title: 'Tenant Created!',
        description: `${name} has been successfully created.`,
      });
      setOpen(false);
      form.reset();

      // Force a hard reload to ensure the new tenant is fetched and displayed.
      window.location.href = '/dashboard';

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle className="font-headline flex items-center gap-2">
                <Wand2 className="text-accent" /> Create New Tenant with AI
              </DialogTitle>
              <DialogDescription>
                Describe your project, and we'll generate a multi-cloud
                configuration and sample data.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <FormLabel>Need inspiration?</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 'ride sharing app', 'e-commerce backend'"
                    value={suggestionKeyword}
                    onChange={e => setSuggestionKeyword(e.target.value)}
                    disabled={isSuggesting || isPending}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSuggestDescription}
                    disabled={isSuggesting || isPending || !suggestionKeyword}
                  >
                    {isSuggesting || isPending ? (
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
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'A geo-distributed ride hailing platform with real-time driver tracking and payment processing.'"
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
  );
}
