'use server';
/**
 * @fileOverview Summarizes tenant data and activity using AI.
 *
 * - summarizeTenantData - A function that summarizes the data usage and activity of a specific tenant.
 * - SummarizeTenantDataInput - The input type for the summarizeTenantData function.
 * - SummarizeTenantDataOutput - The return type for the summarizeTenantData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTenantDataInputSchema = z.object({
  tenantId: z.string().describe('The ID of the StyleVault to summarize.'),
  dataUsage: z.string().describe('The data usage of the StyleVault.'),
  activityLog: z.string().describe('The activity log of the StyleVault.'),
});
export type SummarizeTenantDataInput = z.infer<typeof SummarizeTenantDataInputSchema>;

const SummarizeTenantDataOutputSchema = z.object({
  summary: z.string().describe('A summary of the StyleVault data usage and activity.'),
});
export type SummarizeTenantDataOutput = z.infer<typeof SummarizeTenantDataOutputSchema>;

export async function summarizeTenantData(input: SummarizeTenantDataInput): Promise<SummarizeTenantDataOutput> {
  return summarizeTenantDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeTenantDataPrompt',
  input: {schema: SummarizeTenantDataInputSchema},
  output: {schema: SummarizeTenantDataOutputSchema},
  prompt: `You are an AI assistant helping platform administrators understand tenant data usage and activity.

  Summarize the following data usage and activity log for StyleVault ID {{{tenantId}}}. Use concise and informative language to highlight key trends and potential issues.

  Data Usage: {{{dataUsage}}}
  Activity Log: {{{activityLog}}}
  `,
});

const summarizeTenantDataFlow = ai.defineFlow(
  {
    name: 'summarizeTenantDataFlow',
    inputSchema: SummarizeTenantDataInputSchema,
    outputSchema: SummarizeTenantDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
