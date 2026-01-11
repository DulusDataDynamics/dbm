'use server';

import { Invoice, InventoryItem } from './types';

export async function getRevenueInsights(
  invoices: Invoice[] = [],
  inventory: InventoryItem[] = []
) {
  // Simple placeholder logic (safe for now)
  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.total ?? 0),
    0
  );

  return {
    totalRevenue,
    invoiceCount: invoices.length,
    inventoryCount: inventory.length,
    message: 'Revenue insights generated successfully',
  };
}
