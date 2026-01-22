
'use server';

import { generateRevenueInsights } from "@/ai/flows/generate-revenue-insights";
import { Invoice } from "./types";
import { mapToAISchema } from "./utils";

export async function getRevenueInsights(invoices: Invoice[]) {
  try {
    const salesData = mapToAISchema(invoices);
    
    if (!salesData.sales || salesData.sales.length === 0) {
      return {
        success: true,
        insights: {
          totalRevenue: 0,
          topProducts: [],
          bestMonth: 'N/A',
          revenueTrend: 'No sales data available to analyze trends.',
          predictions: 'Cannot make predictions without sales data.',
          actions: 'Record some paid invoices to start generating insights.'
        }
      };
    }

    const result = await generateRevenueInsights(salesData);
    return { success: true, insights: result };
  } catch (error) {
    console.error('Error generating revenue insights:', error);
    // Check for a specific AI-related error message if possible
    const errorMessage = (error as Error)?.message || 'An unknown error occurred while generating insights.';
    return { success: false, error: errorMessage };
  }
}
