'use server';

/**
 * @fileOverview Tenant name generator.
 *
 * - generateTenantName - A function that generates a tenant project name.
 * - GenerateTenantNameInput - The input type for the generateTenantName function.
 * - GenerateTenantNameOutput - The return type for the generateTenantName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTenantNameInputSchema = z.object({
  description: z
    .string()
    .describe("A description of the project or business."),
});
export type GenerateTenantNameInput = z.infer<typeof GenerateTenantNameInputSchema>;

const GenerateTenantNameOutputSchema = z.object({
  name: z.string().describe('The generated name of the project.'),
});
export type GenerateTenantNameOutput = z.infer<typeof GenerateTenantNameOutputSchema>;

export async function generateTenantName(input: GenerateTenantNameInput): Promise<GenerateTenantNameOutput> {
  return generateTenantNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTenantNamePrompt',
  input: {schema: GenerateTenantNameInputSchema},
  output: {schema: GenerateTenantNameOutputSchema},
  prompt: `You are a naming expert, skilled at generating creative and relevant names for new software projects.

  Generate a unique and appealing name for a project based on the following description:

  Description: {{{description}}}

  The name should be concise, memorable, and relevant to the project's purpose. It should sound like a modern tech company or project name.
  Return only the name.`,
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
