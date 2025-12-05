'use server';

import { generateTenantName, GenerateTenantNameInput, GenerateTenantNameOutput } from '@/ai/flows/generate-tenant-name';
import { generateSampleData, GenerateSampleDataInput, GenerateSampleDataOutput } from '@/ai/flows/generate-sample-data';
import { summarizeTenantData, SummarizeTenantDataInput, SummarizeTenantDataOutput } from '@/ai/flows/summarize-tenant-data';
import { generateTenantConfig, GenerateTenantConfigInput, GenerateTenantConfigOutput } from '@/ai/flows/generate-tenant-config';


export async function runGenerateTenantName(input: GenerateTenantNameInput): Promise<GenerateTenantNameOutput> {
    try {
        return await generateTenantName(input);
    } catch (error) {
        console.error("Error in runGenerateTenantName:", error);
        throw new Error("Failed to generate tenant name.");
    }
}

export async function runGenerateSampleData(input: GenerateSampleDataInput): Promise<GenerateSampleDataOutput> {
    try {
        return await generateSampleData(input);
    } catch (error) {
        console.error("Error in runGenerateSampleData:", error);
        throw new Error("Failed to generate sample data.");
    }
}

export async function runSummarizeTenantData(input: SummarizeTenantDataInput): Promise<SummarizeTenantDataOutput> {
    try {
        return await summarizeTenantData(input);
    } catch (error) {
        console.error("Error in runSummarizeTenantData:", error);
        throw new Error("Failed to summarize tenant data.");
    }
}

export async function runGenerateTenantConfig(input: GenerateTenantConfigInput): Promise<GenerateTenantConfigOutput> {
    try {
        return await generateTenantConfig(input);
    } catch (error) {
        console.error("Error in runGenerateTenantConfig:", error);
        throw new Error("Failed to generate tenant configuration.");
    }
}
