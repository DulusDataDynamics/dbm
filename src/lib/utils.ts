import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Invoice, InvoiceItem } from "./types"
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

export function mapToAISchema(invoices: Invoice[]): GenerateRevenueInsightsInput {
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');

  if (paidInvoices.length === 0) {
    return { sales: [] };
  }
  
  const sales = paidInvoices.flatMap(invoice => 
    invoice.items.map(item => ({
      id: invoice.id,
      product: item.description,
      amount: item.total,
      quantity: item.quantity,
      date: invoice.createdAt,
    }))
  );

  return { sales };
}
