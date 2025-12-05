'use server';

/**
 * @fileOverview Tenant name generator.
 *
 * - generateTenantName - A function that generates a tenant name.
 * - GenerateTenantNameInput - The input type for the generateTenantName function.
 * - GenerateTenantNameOutput - The return type for the generateTenantName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTenantNameInputSchema = z.object({
  description: z
    .string()
    .describe("A description of the tenant's business or purpose."),
});
export type GenerateTenantNameInput = z.infer<typeof GenerateTenantNameInputSchema>;

const GenerateTenantNameOutputSchema = z.object({
  name: z.string().describe('The generated name of the tenant.'),
});
export type GenerateTenantNameOutput = z.infer<typeof GenerateTenantNameOutputSchema>;

export async function generateTenantName(input: GenerateTenantNameInput): Promise<GenerateTenantNameOutput> {
  return generateTenantNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTenantNamePrompt',
  input: {schema: GenerateTenantNameInputSchema},
  output: {schema: GenerateTenantNameOutputSchema},
  prompt: `You are a naming expert, skilled at generating creative and relevant names for new tenants on a multi-tenant platform.

  Generate a unique and appealing name for a tenant based on the following description:

  Description: {{{description}}}

  The name should be concise, memorable, and relevant to the tenant's business or purpose.
  Return only the name of the tenant.`,
});

const generateTenantNameFlow = ai.defineFlow(
  {
    name: 'generateTenantNameFlow',
    inputSchema: GenerateTenantNameInputSchema,
    outputSchema: GenerateTenantNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
