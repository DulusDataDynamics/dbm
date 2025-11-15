'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // To make this a real example, we'll fetch the first client.
        const clientsRef = collection(db, "clients");
        const q = query(clientsRef, limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const firstDoc = querySnapshot.docs[0];
          setData({ id: firstDoc.id, ...firstDoc.data() });
        } else {
          console.log("No document found in 'clients' collection.");
          setData(null);
        }
      } catch (err: any) {
        console.error("Firestore error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center flex-col gap-4 bg-background">
        <Logo />
        <div className="text-center">
            <p className="text-lg font-medium text-foreground">
                Getting things ready
                <span className="animate-pulse">.</span>
                <span className="animate-pulse" style={{ animationDelay: '200ms' }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: '400ms' }}>.</span>
            </p>
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    );
  }
  
  if (error) {
     return (
      <div className="flex min-h-screen items-center justify-center">
        <div>
            <p className="font-bold text-red-500">Error fetching data:</p>
            <pre>{error}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Landing Page - Firestore Test</h1>
      <p>Here is the first client document fetched from your database:</p>
      <pre className="mt-4 p-4 bg-muted rounded-md overflow-x-auto">
        {data ? JSON.stringify(data, null, 2) : "No data found."}
      </pre>
    </div>
  );
}
