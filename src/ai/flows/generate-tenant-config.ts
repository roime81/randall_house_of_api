'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a full StyleVault configuration based on a business description.
 *
 * It exports:
 * - `generateTenantConfig`: An async function that takes a StyleVault business description and returns a full configuration.
 * - `GenerateTenantConfigInput`: The TypeScript type for the input.
 * - `GenerateTenantConfigOutput`: The TypeScript type for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas based on src/lib/types.ts
const ApiRouteSchema = z.object({
  path: z.string().describe('The API path, e.g., /users.'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).describe('The HTTP method.'),
  targetServer: z.string().describe('The ID of the McpServer that handles this route.'),
});

const McpServerSchema = z.object({
    id: z.string().describe("A unique server ID, e.g., 'mcps-1'."),
    name: z.string().describe('A descriptive name for the server, e.g., "Primary API Server".'),
    status: z.enum(['running', 'stopped', 'deploying', 'error']).describe('The current status of the server.'),
    createdAt: z.string().datetime().describe('The ISO 8601 timestamp of when the server was created.'),
    region: z.string().describe('The cloud region where the server is located, e.g., "us-central1".'),
});

const EventStreamSchema = z.object({
    id: z.string().describe("A unique event stream ID, e.g., 'ev-1'."),
    topic: z.string().describe('The name of the event topic, e.g., "user-signups".'),
    status: z.enum(['active', 'inactive']).describe('The status of the stream.'),
});

const UpstreamApiSchema = z.object({
    id: z.string().describe("A unique upstream API ID, e.g., 'upa-1'."),
    name: z.string().describe('The name of the external API, e.g., "Stripe Payments".'),
    baseUrl: z.string().url().describe('The base URL of the external API.'),
    authenticated: z.boolean().describe('Whether the API requires authentication.'),
});


const GenerateTenantConfigInputSchema = z.object({
  tenantBusinessDescription: z
    .string()
    .describe('A description of the StyleVault\u0027s business.'),
});
export type GenerateTenantConfigInput = z.infer<
  typeof GenerateTenantConfigInputSchema
>;

const GenerateTenantConfigOutputSchema = z.object({
    mcpServers: z.array(McpServerSchema).describe('A list of 1 to 3 realistic MCP servers for the business.'),
    apiGatewayRoutes: z.array(ApiRouteSchema).describe("A list of 2 to 4 realistic API routes for the business. The targetServer ID must exist in the 'mcpServers' list."),
    eventStreams: z.array(EventStreamSchema).describe('A list of 1 to 2 realistic event streams for the business.'),
    upstreamApis: z.array(UpstreamApiSchema).describe('A list of 0 to 2 realistic upstream APIs the business might integrate with.'),
});
export type GenerateTenantConfigOutput = z.infer<
  typeof GenerateTenantConfigOutputSchema
>;

const prompt = ai.definePrompt({
  name: 'generateTenantConfigPrompt',
  input: { schema: GenerateTenantConfigInputSchema },
  output: { schema: GenerateTenantConfigOutputSchema },
  prompt: `You are an expert system architect. Based on the following business description, design a realistic initial cloud infrastructure configuration for a new StyleVault.

  Business Description: {{{tenantBusinessDescription}}}

  Generate a list of MCP servers, API Gateway routes that point to those servers, relevant event streams, and any potential upstream API integrations. Ensure the generated configuration is logical and appropriate for the described business. For example, an e-commerce business might have routes for /products and /orders, and an event stream for "order-placed" events. Ensure the 'targetServer' in each API route corresponds to a server 'id' in the generated servers list.
  
  Generate between 1 and 3 servers.
  Generate between 2 and 4 API routes.
  Generate between 1 and 2 event streams.
  Generate between 0 and 2 upstream APIs.
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
