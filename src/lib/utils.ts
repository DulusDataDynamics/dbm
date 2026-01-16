import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Invoice, InventoryItem } from "./types"
import type { GenerateRevenueInsightsInput } from "@/ai/flows/generate-revenue-insights"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mapToAISchema(invoices: Invoice[], inventory: InventoryItem[]): GenerateRevenueInsightsInput {
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');

  if (paidInvoices.length === 0) {
    return { sales: [] };
  }

  // Since invoices don't have line items, we'll create a simplified representation.
  // We will try to associate an invoice with an inventory item if there's a close price match,
  // otherwise, we'll use a generic description.
  const sales = paidInvoices.map(invoice => {
    // Attempt to find a matching product from inventory. This is a very rough approximation.
    const bestMatch = inventory.find(item => Math.abs(item.price - invoice.amount) < 5); // Allow for small variations

    return {
      id: invoice.id,
      product: bestMatch ? bestMatch.name : (invoice.client?.name ? `Service for ${invoice.client.name}` : 'General Sale'),
      amount: invoice.amount,
      quantity: 1, // Assume quantity is 1 since we don't have line items
      date: invoice.dueDate, // using dueDate as sale date
    };
  });

  return { sales };
}
