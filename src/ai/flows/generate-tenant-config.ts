'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a full multi-cloud configuration for a HailingHub based on a project description.
 *
 * It exports:
 * - `generateTenantConfig`: An async function that takes a project description and returns a full configuration.
 * - `GenerateTenantConfigInput`: The TypeScript type for the input.
 * - `GenerateTenantConfigOutput`: The TypeScript type for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schemas based on src/lib/types.ts
const ApiRouteSchema = z.object({
  path: z.string().describe('The API path, e.g., /users, /rides/book.'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).describe('The HTTP method.'),
  targetServer: z.string().describe('The ID of the deployment that handles this route, e.g., "depl-auth-gcp".'),
});

const McpServerSchema = z.object({
    id: z.string().describe("A unique deployment ID, e.g., 'depl-auth-gcp'."),
    name: z.string().describe('A descriptive name for the service, e.g., "Auth Service" or "Ride Booker".'),
    status: z.enum(['running', 'stopped', 'deploying', 'error']).describe('The current status of the deployment.'),
    createdAt: z.string().datetime().describe('The ISO 8601 timestamp of when the service was deployed.'),
    region: z.string().describe('The cloud provider and region, e.g., "gcp-us-central1", "aws-eu-west-2", "azure-eastus".'),
});

const EventStreamSchema = z.object({
    id: z.string().describe("A unique webhook ID, e.g., 'wh-github-1'."),
    topic: z.string().describe('The name of the event topic, e.g., "github:push:main", "dockerhub:build:success".'),
    status: z.enum(['active', 'inactive']).describe('The status of the webhook.'),
});

const UpstreamApiSchema = z.object({
    id: z.string().describe("A unique integration ID, e.g., 'int-github'."),
    name: z.string().describe('The name of the external service, e.g., "GitHub", "Docker Hub", "Global Payments API".'),
    baseUrl: z.string().url().describe('The base URL of the external service.'),
    authenticated: z.boolean().describe('Whether the integration requires authentication.'),
});


const GenerateTenantConfigInputSchema = z.object({
  tenantBusinessDescription: z
    .string()
    .describe('A description of the HailingHub project or business.'),
});
export type GenerateTenantConfigInput = z.infer<
  typeof GenerateTenantConfigInputSchema
>;

const GenerateTenantConfigOutputSchema = z.object({
    mcpServers: z.array(McpServerSchema).describe('A list of 1 to 3 realistic cloud deployments for the business, preferably across different cloud providers (gcp, aws, azure).'),
    apiGatewayRoutes: z.array(ApiRouteSchema).describe("A list of 2 to 4 realistic API routes for the business. The targetServer ID must exist in the 'mcpServers' list."),
    eventStreams: z.array(EventStreamSchema).describe('A list of 1 to 2 realistic CI/CD webhooks for the project (e.g., from GitHub or Docker Hub).'),
    upstreamApis: z.array(UpstreamApiSchema).describe('A list of 1 to 2 realistic 3rd-party integrations the business might use (e.g., GitHub, a mapping API, a payment provider).'),
});
export type GenerateTenantConfigOutput = z.infer<
  typeof GenerateTenantConfigOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'generateTenantConfigPrompt',
  input: { schema: GenerateTenantConfigInputSchema },
  output: { schema: GenerateTenantConfigOutputSchema },
  prompt: `You are an expert multi-cloud solutions architect. Based on the following project description, design a realistic initial cloud infrastructure configuration for a new HailingHub project.

  Project Description: {{{tenantBusinessDescription}}}

  Your design should be multi-cloud and demonstrate integration with common DevOps tools.
  - Generate a list of service deployments, spreading them across different cloud providers (GCP, AWS, Azure) and regions.
  - Create API Gateway routes that point to those deployments.
  - Add CI/CD webhook integrations from services like GitHub or Docker Hub.
  - Include 1 or 2 relevant third-party API integrations.
  
  Ensure the 'targetServer' in each API route corresponds to a deployment 'id' in the generated deployments list.
  
  Generate between 1 and 3 deployments.
  Generate between 2 and 4 API routes.
  Generate between 1 and 2 webhooks.
  Generate between 1 and 2 upstream integrations.
  `,
});

const generateTenantConfigFlow = ai.defineFlow(
  {
    name: 'generateTenantConfigFlow',
    inputSchema: GenerateTenantConfigInputSchema,
    outputSchema: GenerateTenantConfigOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateTenantConfig(
  input: GenerateTenantConfigInput
): Promise<GenerateTenantConfigOutput> {
  return generateTenantConfigFlow(input);
}
