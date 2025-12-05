'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating sample telemetry data for a HailingHub project based on a description of the business.
 *
 * It exports:
 * - `generateSampleData`: An async function that takes a business description and returns sample data as a JSON string.
 * - `GenerateSampleDataInput`: The TypeScript type for the input to `generateSampleData`.
 * - `GenerateSampleDataOutput`: The TypeScript type for the output of `generateSampleData`.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

// Define the input schema for the flow
const GenerateSampleDataInputSchema = z.object({
  tenantBusinessDescription: z
    .string()
    .describe('A description of the HailingHub project.'),
});

export type GenerateSampleDataInput = z.infer<
  typeof GenerateSampleDataInputSchema
>;

// Define the output schema for the flow
const GenerateSampleDataOutputSchema = z.object({
  sampleData: z
    .string()
    .describe(
      'Sample telemetry data, formatted as a JSON string. The JSON should contain fields like "timestamp", "level", "message", "service", and "cloud_provider" relevant to the project described in the input.'
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
  prompt: `You are an expert data generator specializing in cloud telemetry and log data. Given the following description of a HailingHub project, generate a realistic set of sample log entries in JSON format.

  Project Description: {{{tenantBusinessDescription}}}

  The JSON data should be an array of log objects. Each object should include fields like "timestamp", "level" (e.g., "INFO", "WARN", "ERROR"), "message", "service" (e.g., "auth-service", "payment-gateway"), and "cloud_provider" (e.g., "gcp", "aws", "azure").

  Ensure that the output is a valid JSON string representing an array of these log objects.
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
