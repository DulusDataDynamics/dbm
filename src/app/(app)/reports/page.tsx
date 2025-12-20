
'use client';
import { RevenueChart } from "@/components/app/revenue-chart";
import { InvoiceStatusChart } from "@/components/app/invoice-status-chart";
import { subscribeToInvoices, subscribeToInventory } from "@/lib/firestore";
import { Invoice, InventoryItem } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueInsightsGenerator } from "@/components/app/revenue-insights-generator";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/firebase/firebase";

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const unsubInvoices = subscribeToInvoices(db, (invoicesData) => {
      setInvoices(invoicesData);
      setLoading(false);
    });

    const unsubInventory = subscribeToInventory(db, (inventoryData) => {
        setInventory(inventoryData);
    });

    return () => {
        unsubInvoices();
        unsubInventory();
    };
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Reports & Insights</h1>
      {loading ? (
         <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3">
                  <Skeleton className="h-96" />
                </div>
                <div className="lg:col-span-2">
                  <Skeleton className="h-96" />
                </div>
            </div>
            <Skeleton className="h-48" />
        </div>
      ) : (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
                <div className="xl:col-span-3">
                    <RevenueChart invoices={invoices} />
                </div>
                <div className="xl:col-span-2">
                    <InvoiceStatusChart invoices={invoices} />
                </div>
            </div>
            <div>
                <RevenueInsightsGenerator invoices={invoices} inventory={inventory} />
            </div>
        </div>
      )}
    </div>
  );
}
