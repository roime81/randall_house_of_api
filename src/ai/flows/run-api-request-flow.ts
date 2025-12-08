'use server';
/**
 * @fileOverview A flow for acting as a proxy to make API requests.
 * This is used to bypass CORS issues when calling tenant APIs from the browser.
 *
 * It exports:
 * - `runApiRequest`: An async function that takes a URL, method, and body, and returns the response.
 * - `RunApiRequestInput`: The TypeScript type for the input.
 * - `RunApiRequestOutput`: The TypeScript type for the output.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RunApiRequestInputSchema = z.object({
  url: z.string().url().describe('The full URL to send the request to.'),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).describe('The HTTP method.'),
  body: z.string().optional().describe('The JSON string request body.'),
});
export type RunApiRequestInput = z.infer<typeof RunApiRequestInputSchema>;

const RunApiRequestOutputSchema = z.object({
  status: z.number().describe('The HTTP status code of the response.'),
  body: z.any().describe('The response body, parsed as JSON if possible.'),
});
export type RunApiRequestOutput = z.infer<typeof RunApiRequestOutputSchema>;

export async function runApiRequest(
  input: RunApiRequestInput
): Promise<RunApiRequestOutput> {
  return runApiRequestFlow(input);
}

const runApiRequestFlow = ai.defineFlow(
  {
    name: 'runApiRequestFlow',
    inputSchema: RunApiRequestInputSchema,
    outputSchema: RunApiRequestOutputSchema,
  },
  async ({ url, method, body }) => {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // In a real-world scenario, you might add auth headers here
        },
        body: body,
      });

      const responseBody = await response.json().catch(() => response.text());

      return {
        status: response.status,
        body: responseBody,
      };
    } catch (error: any) {
      console.error('API Request Flow Error:', error);
      return {
        status: 500,
        body: {
          error: 'Failed to execute API request.',
          message: error.message,
        },
      };
    }
  }
);
