
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { InvoiceItem, Invoice, Client } from "./types"
import type { GenerateRevenueInsightsInput } from "@/ai/flows/generate-revenue-insights"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateInvoiceTotals(items: InvoiceItem[], taxRate: number = 0.15) {
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  return { subtotal, tax, total };
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
      product: item.description,
      amount: item.price * item.quantity,
      quantity: item.quantity,
      date: invoice.createdAt || new Date().toISOString(),
    }));
  });

  return { sales };
}
