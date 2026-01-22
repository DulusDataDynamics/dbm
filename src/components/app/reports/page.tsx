
'use client';
import { RevenueChart } from "@/components/app/revenue-chart";
import { InvoiceStatusChart } from "@/components/app/invoice-status-chart";
import { subscribeToInvoices, subscribeToClients } from "@/lib/firestore";
import { Invoice, Client } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueInsightsGenerator } from "@/components/app/revenue-insights-generator";
import { useAuth, useFirestore } from "@/firebase";

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const { user, isUserLoading } = useAuth();

  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubInvoices = subscribeToInvoices(db, user.uid, (invoicesData) => {
      setInvoices(invoicesData);
      setLoading(false);
    });

    const unsubClients = subscribeToClients(db, user.uid, setClients);

    return () => {
        unsubInvoices();
        unsubClients();
    };
  }, [db, user?.uid, isUserLoading]);

  const clientsMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

  const enrichedInvoices = useMemo(() => 
    invoices.map(invoice => ({
      ...invoice,
      client: clientsMap.get(invoice.clientId),
    })), [invoices, clientsMap]);

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
                    <RevenueChart invoices={enrichedInvoices} />
                </div>
                <div className="xl:col-span-2">
                    <InvoiceStatusChart invoices={enrichedInvoices} />
                </div>
            </div>
            <div>
                <RevenueInsightsGenerator invoices={enrichedInvoices} />
            </div>
        </div>
      )}
    </div>
  );
}
