'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating sample data for a StyleVault based on a description of their business.
 *
 * It exports:
 * - `generateSampleData`: An async function that takes a StyleVault business description and returns sample data as a JSON string.
 * - `GenerateSampleDataInput`: The TypeScript type for the input to `generateSampleData`.
 * - `GenerateSampleDataOutput`: The TypeScript type for the output of `generateSampleData`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the flow
const GenerateSampleDataInputSchema = z.object({
  tenantBusinessDescription: z
    .string()
    .describe('A description of the StyleVault\u0027s business.'),
});

export type GenerateSampleDataInput = z.infer<
  typeof GenerateSampleDataInputSchema
>;

// Define the output schema for the flow
const GenerateSampleDataOutputSchema = z.object({
  sampleData: z
    .string()
    .describe(
      'Sample data for the StyleVault, formatted as a JSON string. The JSON should contain fields relevant to the StyleVault\u0027s business as described in the input.'
    ),
});

export type GenerateSampleDataOutput = z.infer<
  typeof GenerateSampleDataOutputSchema
>;

// Define the prompt
const generateSampleDataPrompt = ai.definePrompt({
  name: 'generateSampleDataPrompt',
  input: {schema: GenerateSampleDataInputSchema},
  output: {schema: GenerateSampleDataOutputSchema},
  prompt: `You are an expert data generator. Given the following description of a StyleVault's business, generate sample data for them, in JSON format.  The JSON data should be appropriate and realistic for the described business.

StyleVault Business Description: {{{tenantBusinessDescription}}}

Ensure that the output is valid JSON.
`,
});

// Define the flow
const generateSampleDataFlow = ai.defineFlow(
  {
    name: 'generateSampleDataFlow',
    inputSchema: GenerateSampleDataInputSchema,
    outputSchema: GenerateSampleDataOutputSchema,
  },
  async input => {
    const {output} = await generateSampleDataPrompt(input);
    return output!;
  }
);

// Exported function to call the flow
export async function generateSampleData(
  input: GenerateSampleDataInput
): Promise<GenerateSampleDataOutput> {
  return generateSampleDataFlow(input);
}
