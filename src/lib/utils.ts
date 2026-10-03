import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem, Invoice, Client } from "./types"
import type { GenerateRevenueInsightsInput } from "@/ai/flows/generate-revenue-insights"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the total for standard invoice items.
 * Ensures quantity and price are treated as numbers and rounds to 2 decimal places
 * using a robust rounding method to prevent floating point precision errors.
 */
export function calculateInvoiceTotals(items: any[]) {
  const total = items.reduce((acc, item) => {
    // Parse values as floats, handling potential string inputs from forms
    const qty = parseFloat(String(item.quantity || 0).replace(',', '.'));
    const prc = parseFloat(String(item.price || 0).replace(',', '.'));
    
    if (isNaN(qty) || isNaN(prc)) return acc;
    return acc + (qty * prc);
  }, 0);
  
  // Use epsilon rounding to ensure 1.005 rounds correctly to 1.01 instead of 1.00
  const roundedTotal = Math.round((total + Number.EPSILON) * 100) / 100;
  return { total: roundedTotal };
}

export function mapToAISchema(invoices: Invoice[], clients: Client[]): GenerateRevenueInsightsInput {
  const clientsMap = new Map(clients.map(c => [c.id, c]));

  const sales = invoices.flatMap(invoice => {
    if (invoice.status !== 'Paid' || !invoice.items) {
      return [];
    }
    const client = clientsMap.get(invoice.clientId);
    return invoice.items.map((item: InvoiceItem) => {
      const qty = parseFloat(String(item.quantity || 0));
      const prc = parseFloat(String(item.price || 0));
      return {
        id: invoice.id,
        product: item.description,
        amount: Math.round(((qty * prc) + Number.EPSILON) * 100) / 100,
        quantity: qty,
        date: invoice.createdAt || new Date().toISOString(),
      };
    });
  });

  return { sales };
}
