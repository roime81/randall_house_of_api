'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tenant } from '@/lib/types';
import { runSummarizeTenantData } from '@/lib/actions';

type AiSummaryProps = {
  tenantId: string;
  dataStore: Tenant['dataStore'];
};

export default function AiSummary({ tenantId, dataStore }: AiSummaryProps) {
  const { toast } = useToast();
  const [summary, setSummary] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setSummary('');
    try {
      const result = await runSummarizeTenantData({
        tenantId,
        dataUsage: dataStore.usage,
        activityLog: dataStore.activityLog,
      });
      setSummary(result.summary);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Summary Failed',
        description: 'Could not generate AI summary. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Sparkles className="text-accent" /> AI Summary
        </CardTitle>
        <CardDescription>Generate an AI-powered summary of your infrastructure activity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
        {summary && (
          <div className="text-sm p-4 bg-muted rounded-md border">
            <p>{summary}</p>
          </div>
        )}
         {!summary && !isLoading && (
          <div className="text-sm text-center p-4 bg-muted/50 rounded-md border border-dashed">
            <p className="text-muted-foreground">Click the button to generate a summary.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
