
'use client';
import { RevenueChart } from "@/components/app/revenue-chart";
import { InvoiceStatusChart } from "@/components/app/invoice-status-chart";
import { subscribeToClients } from "@/lib/firestore";
import { Client } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueInsightsGenerator } from "@/components/app/revenue-insights-generator";
import { useAuth, useFirestore } from "@/firebase";

export default function ReportsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const db = useFirestore();
  const { user, isUserLoading } = useAuth();

  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubClients = subscribeToClients(db, user.uid, (clientsData) => {
      setClients(clientsData);
      setLoading(false);
    });

    return () => {
        unsubClients();
    };
  }, [db, user?.uid, isUserLoading]);


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
                    <RevenueChart clients={clients} />
                </div>
                <div className="xl:col-span-2">
                    <InvoiceStatusChart clients={clients} />
                </div>
            </div>
            <div>
                <RevenueInsightsGenerator clients={clients} />
            </div>
        </div>
      )}
    </div>
  );
}
