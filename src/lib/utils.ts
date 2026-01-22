
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem, Client } from "./types"
import type { GenerateRevenueInsightsInput } from "@/ai/flows/generate-revenue-insights"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateInvoiceTotals(items: Omit<InvoiceItem, 'total'>[]) {
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * 0.15; // Hardcoded tax
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

// This function will need to be adapted once we have a proper data source
export function mapToAISchema(clients: Client[]): GenerateRevenueInsightsInput {
  const sales = clients.flatMap(client => {
    if (!client.invoice || client.invoice.status !== 'Paid' || !client.invoice.items) {
      return [];
    }
    return client.invoice.items.map((item: any) => ({
      id: client.id, // Using client ID as a proxy for a sale ID
      product: item.description,
      amount: item.quantity * item.price,
      quantity: item.quantity,
      date: new Date().toISOString(), // Placeholder date
    }));
  });

  return { sales };
}
