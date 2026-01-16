'use server';

/**
 * @fileOverview A flow for generating detailed revenue and sales insights.
 *
 * - generateRevenueInsights - A function that generates insights based on sales data.
 * - GenerateRevenueInsightsInput - The input type for the generateRevenueInsights function.
 * - GenerateRevenueInsightsOutput - The return type for the generateRevenueinsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRevenueInsightsInputSchema = z.object({
  sales: z.array(
    z.object({
      id: z.string(),
      product: z.string(),
      amount: z.number(),
      quantity: z.number(),
      date: z.string(),
    })
  ).describe('Array of sales data from paid invoices.'),
});
export type GenerateRevenueInsightsInput = z.infer<typeof GenerateRevenueInsightsInputSchema>;

const GenerateRevenueInsightsOutputSchema = z.object({
  totalRevenue: z.number().describe('The total revenue calculated from all sales.'),
  topProducts: z.array(z.string()).describe('A list of the best-selling product names.'),
  bestMonth: z.string().describe('The month with the highest sales revenue.'),
  revenueTrend: z.string().describe('A brief analysis of the revenue trend (e.g., "upward", "stable", "downward").'),
  predictions: z.string().describe('A short-term prediction for sales or revenue based on the data.'),
  actions: z.string().describe('A concrete, actionable suggestion for the business owner to improve sales or operations.'),
});
export type GenerateRevenueInsightsOutput = z.infer<typeof GenerateRevenueInsightsOutputSchema>;


export async function generateRevenueInsights(input: GenerateRevenueInsightsInput): Promise<GenerateRevenueInsightsOutput> {
  return generateRevenueInsightsFlow(input);
}

const generateRevenueInsightsPrompt = ai.definePrompt({
  name: 'generateRevenueInsightsPrompt',
  input: {schema: GenerateRevenueInsightsInputSchema},
  output: {schema: GenerateRevenueInsightsOutputSchema},
  prompt: `You are an AI financial analyst for a business management system called Dulus Business Manager (DBM).
Analyze the following sales data and produce clear, actionable insights.

DATA:
{{#each sales}}
- Sale ID: {{id}}, Product: "{{product}}", Amount: {{amount}}, Quantity: {{quantity}}, Date: {{date}}
{{/each}}

Respond with JSON ONLY in the structure defined by the output schema.
The response should be concise and professional.
- For 'bestMonth', return the month and year (e.g., "July 2024").
- For 'revenueTrend', analyze the revenue over the months.
- For 'predictions', provide a realistic forecast for the next period.
- For 'actions', suggest a specific, practical step the user can take.
`,
});

const generateRevenueInsightsFlow = ai.defineFlow(
  {
    name: 'generateRevenueInsightsFlow',
    inputSchema: GenerateRevenueInsightsInputSchema,
    outputSchema: GenerateRevenueInsightsOutputSchema,
  },
  async input => {
    if (!input.sales || input.sales.length === 0) {
      // Return a default empty state if there's no data to analyze
      return {
        totalRevenue: 0,
        topProducts: [],
        bestMonth: "N/A",
        revenueTrend: "No trend data available.",
        predictions: "Insufficient data to make predictions.",
        actions: "Record more sales to generate insights."
      };
    }
    
    const {output} = await generateRevenueInsightsPrompt(input);

    if (!output) {
      throw new Error("AI failed to generate a valid response. The output was empty.");
    }
    return output;
  }
);
