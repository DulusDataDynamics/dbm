'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search, Truck, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import TransportInvoiceForm from '@/components/app/transport-invoice-form';
import { Badge } from '@/components/ui/badge';
import { useAuth, useFirestore } from '@/firebase';
import { subscribeToInvoices, subscribeToClients, getBusinessProfile, getInvoiceSettings } from '@/lib/firestore';
import { Invoice, Client, BusinessProfile, InvoiceSettings } from '@/lib/types';
import { ViewInvoiceDialog } from '@/components/app/view-invoice-dialog';

export default function TransportInvoicesPage() {
  const { user, isUserLoading } = useAuth();
  const db = useFirestore();
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile | null>(null);
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings | null>(null);
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubClients = subscribeToClients(db, user.uid, setClients);
    const unsubInvoices = subscribeToInvoices(db, user.uid, (data) => {
      setInvoices(data.filter(inv => inv.type === 'transport'));
      setLoading(false);
    });

    getBusinessProfile(db, user.uid).then(setBusinessProfile);
    getInvoiceSettings(db, user.uid).then(setInvoiceSettings);

    return () => {
      unsubClients();
      unsubInvoices();
    };
  }, [db, user?.uid, isUserLoading]);

  const clientsMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);

  const filteredInvoices = useMemo(() => {
    if (!searchQuery) return invoices;
    const query = searchQuery.toLowerCase();
    return invoices.filter(inv => {
      const clientName = (clientsMap.get(inv.clientId) || '').toLowerCase();
      return clientName.includes(query) || inv.id.toLowerCase().includes(query);
    });
  }, [invoices, searchQuery, clientsMap]);

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsViewOpen(true);
  };

  const selectedClientForView = useMemo(() => {
    if (!viewingInvoice) return null;
    return clients.find(c => c.id === viewingInvoice.clientId) || null;
  }, [viewingInvoice, clients]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transport Invoices</CardTitle>
              <CardDescription>Logistics-specific billing with trip details.</CardDescription>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by client..."
                  className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={() => setIsFormOpen(true)} disabled={loading}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Transport Invoice
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-22rem)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">{inv.id.substring(0, 7).toUpperCase()}</TableCell>
                        <TableCell className="font-medium">{clientsMap.get(inv.clientId) || 'Unknown Client'}</TableCell>
                        <TableCell>
                          <Badge variant={inv.status === 'Paid' ? 'default' : 'secondary'}>{inv.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">R {inv.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleViewInvoice(inv)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No transport invoices found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <TransportInvoiceForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      {viewingInvoice && (
        <ViewInvoiceDialog 
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          invoice={viewingInvoice}
          client={selectedClientForView}
          profile={businessProfile}
          settings={invoiceSettings}
        />
      )}
    </>
  );
}
