'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the first document from the 'clients' collection
        const q = query(collection(db, 'clients'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setData({ id: docSnap.id, ...docSnap.data() });
        } else {
          const msg = "No documents found in 'clients' collection. You may need to seed the database.";
          console.log(msg);
          setError(msg);
        }
      } catch (err) {
        console.error('Firestore read error:', err);
        if (err instanceof Error && err.message.includes('offline')) {
             setError("Firestore is offline. Please check your network connection and Firestore rules.");
        } else {
             setError('An error occurred while fetching data from Firestore.');
        }
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
                Loading data from Firestore...
            </p>
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
        </div>
      </div>
    )
  };
  
  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Firestore Connection Test</h1>
      {error ? (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive-foreground border border-destructive">
            <p className="font-bold">An Error Occurred</p>
            <p>{error}</p>
        </div>
      ) : (
        <div className="p-4 rounded-md bg-muted/50 border">
          <p className="text-sm text-muted-foreground mb-2">Successfully fetched the first client:</p>
          <pre className="text-sm bg-background p-3 rounded-md overflow-x-auto">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
