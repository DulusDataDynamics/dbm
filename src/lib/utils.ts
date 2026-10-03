import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem, Invoice, Client } from "./types"
import type { GenerateRevenueInsightsInput } from "@/ai/flows/generate-revenue-insights"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates the total for standard invoice items using integer math (cents)
 * to avoid floating point precision issues.
 */
export function calculateInvoiceTotals(items: any[]) {
  const totalCents = items.reduce((acc, item) => {
    const qty = Number(item.quantity);
    const price = Number(item.price);

    if (!Number.isFinite(qty) || !Number.isFinite(price)) {
      return acc;
    }

    // Convert to cents to handle money math accurately
    const lineTotalCents = Math.round(qty * price * 100);
    return acc + lineTotalCents;
  }, 0);

  return {
    total: totalCents / 100,
  };
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
