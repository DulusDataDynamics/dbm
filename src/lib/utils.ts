
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem, Invoice, Client } from "./types"
import type { GenerateRevenueInsightsInput } from "@/ai/flows/generate-revenue-insights"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateInvoiceTotals(items: InvoiceItem[]) {
  const total = items.reduce((acc, item) => acc + (item.rate || 0), 0);
  return { subtotal: total, total };
}

export function mapToAISchema(invoices: Invoice[], clients: Client[]): GenerateRevenueInsightsInput {
  const clientsMap = new Map(clients.map(c => [c.id, c]));

  const sales = invoices.flatMap(invoice => {
    if (invoice.status !== 'Paid' || !invoice.items) {
      return [];
    }
    const client = clientsMap.get(invoice.clientId);
    return invoice.items.map((item: InvoiceItem) => ({
      id: invoice.id,
      product: `Trip: ${item.from} to ${item.to}`,
      amount: item.rate,
      quantity: 1, // Each trip is a single item
      date: item.date || invoice.createdAt || new Date().toISOString(),
    }));
  });

  return { sales };
}
