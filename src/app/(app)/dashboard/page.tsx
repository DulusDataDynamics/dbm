"use client";

import { useEffect, useState } from "react";
import { subscribeToClients } from "@/lib/firestore";

export default function DashboardPage() {
  const [clients, setClients] = useState<any[]>([]);
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
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Clients</h1>

      <div className="flex flex-col gap-4">
        {clients.map((c) => (
          <div
            key={c.id}
            className="p-4 border rounded-lg bg-card text-card-foreground shadow"
          >
            <p className="font-semibold">{c.name || "No Name"}</p>
            <p className="text-sm text-muted-foreground">ID: {c.id}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
