import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-tenant-data.ts';
import '@/ai/flows/generate-tenant-name.ts';
import '@/ai/flows/generate-sample-data.ts';