'use server';
/**
 * @fileOverview A flow for generating sample business descriptions for a new tenant.
 *
 * It exports:
 * - `generateBusinessDescription`: An async function that takes a keyword and returns a list of descriptions.
 * - `GenerateBusinessDescriptionInput`: The TypeScript type for the input.
 * - `GenerateBusinessDescriptionOutput`: The TypeScript type for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBusinessDescriptionInputSchema = z.object({
  keyword: z.string().describe('A keyword to base the business description on.'),
});
export type GenerateBusinessDescriptionInput = z.infer<
  typeof GenerateBusinessDescriptionInputSchema
>;

const GenerateBusinessDescriptionOutputSchema = z.object({
  descriptions: z
    .array(z.string())
    .describe(
      'A list of 3 creative and diverse business descriptions based on the keyword.'
    ),
});
export type GenerateBusinessDescriptionOutput = z.infer<
  typeof GenerateBusinessDescriptionOutputSchema
>;

export async function generateBusinessDescription(
  input: GenerateBusinessDescriptionInput
): Promise<GenerateBusinessDescriptionOutput> {
  return generateBusinessDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBusinessDescriptionPrompt',
  input: { schema: GenerateBusinessDescriptionInputSchema },
  output: { schema: GenerateBusinessDescriptionOutputSchema },
  prompt: `You are a business consultant who is expert at brainstorming new business ideas.

  Generate 3 creative and diverse business descriptions based on the following keyword: {{{keyword}}}.

  The descriptions should be concise and suitable for a new business venture.
  `,
});

const generateBusinessDescriptionFlow = ai.defineFlow(
  {
    name: 'generateBusinessDescriptionFlow',
    inputSchema: GenerateBusinessDescriptionInputSchema,
    outputSchema: GenerateBusinessDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
