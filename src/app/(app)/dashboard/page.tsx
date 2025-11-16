"use client";

import { useEffect, useState } from "react";
import { subscribeToClients } from "@/lib/firestore";
import { Client } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/app/stat-card";
import { Users, FileText, CheckCircle2, Boxes } from "lucide-react";

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToClients((list) => {
      setClients(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
       <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Clients" value={clients.length.toString()} icon={Users} />
          <StatCard title="Active Invoices" value="12" icon={FileText} description="+5 this month" />
          <StatCard title="Pending Tasks" value="8" icon={CheckCircle2} />
          <StatCard title="Inventory Items" value="42" icon={Boxes} />
        </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Clients</CardTitle>
          <CardDescription>A list of your most recently added clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {clients.slice(0, 5).map((c) => (
              <div
                key={c.id}
                className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm"
              >
                <p className="font-semibold">{c.name || "No Name"}</p>
                <p className="text-sm text-muted-foreground">{c.email}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
