'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import TransportInvoiceForm from '@/components/app/transport-invoice-form';
import { Badge } from '@/components/ui/badge';

export default function TransportInvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        const transportInvoices = (data.invoices || [])
          .filter((inv: any) => inv.type === 'transport')
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInvoices(transportInvoices);
      } else {
        console.error('Failed to fetch invoices');
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchInvoices(); // Refetch invoices after form is closed
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transport Invoices</CardTitle>
              <CardDescription>Create and manage your transport and logistics invoices.</CardDescription>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="w-full rounded-lg bg-background pl-8 sm:w-[200px] lg:w-[300px]"
                />
              </div>
              <Button size="sm" onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Invoice
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
                  {invoices.length > 0 ? (
                    invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-xs">{inv.id.substring(0, 7)}</TableCell>
                        <TableCell className="font-medium">{inv.clientName || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{inv.status || 'Draft'}</Badge>
                        </TableCell>
                        <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">R {Number(inv.total).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <MoreHorizontal className="h-4 w-4" />
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

      <TransportInvoiceForm isOpen={isFormOpen} onClose={handleFormClose} />
    </>
  );
}
