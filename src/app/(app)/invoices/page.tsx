'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { Client, Invoice, InvoiceItem } from '@/lib/types';
import {
  subscribeToClients,
  subscribeToInvoices,
  addItemToClientInvoice,
  deleteInvoice,
} from '@/lib/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { MoreVertical, MessageSquare, Mail, Printer, Download, Trash, Eye, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ViewInvoiceDialog } from '@/components/app/view-invoice-dialog';

const initialItemState = { name: '', price: 0, qty: 1 };

export default function InvoicesPage() {
  const { user, isUserLoading } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [item, setItem] = useState(initialItemState);
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubClients = subscribeToClients(db, user.uid, setClients);
    const unsubInvoices = subscribeToInvoices(db, user.uid, (invoiceData) => {
      setInvoices(invoiceData);
      setLoading(false);
    });

    return () => {
      unsubClients();
      unsubInvoices();
    };
  }, [db, user?.uid, isUserLoading]);

  const clientsMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);

  const handleAddItem = async () => {
    if (!selectedClient || !item.name || item.price <= 0 || item.qty <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Item',
        description: 'Please select a client and fill in all item details.',
      });
      return;
    }
    if (!db || !user?.uid) return;

    try {
      await addItemToClientInvoice(db, user.uid, selectedClient, {
        description: item.name,
        price: item.price,
        quantity: item.qty,
      });
      toast({
        title: 'Item Added',
        description: `Successfully added ${item.name} to the client's invoice.`,
      });
      setItem(initialItemState);
      setSelectedClient('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add item to invoice.',
      });
    }
  };

  const downloadInvoicePdf = (invoice: Invoice) => {
    const clientName = clientsMap.get(invoice.clientId) || 'Unknown Client';
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Invoice for ${clientName}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Invoice ID: ${invoice.id}`, 14, 32);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, 42);

    (doc as any).autoTable({
      startY: 50,
      head: [['Description', 'Quantity', 'Price', 'Total']],
      body: invoice.items.map(i => [
        i.description,
        i.quantity,
        `R ${i.price.toFixed(2)}`,
        `R ${(i.price * i.quantity).toFixed(2)}`,
      ]),
      foot: [
        [{ content: 'Total', colSpan: 3, styles: { halign: 'right' } }, `R ${invoice.total.toFixed(2)}`]
      ]
    });
    
    doc.save(`invoice-${invoice.id.substring(0, 8)}.pdf`);
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsViewOpen(true);
  };
  
  const selectedClientForView = useMemo(() => {
    if (!viewingInvoice) return null;
    const client = clients.find(c => c.id === viewingInvoice.clientId);
    return client || null;
  }, [viewingInvoice, clients]);


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Create & Manage Invoices</CardTitle>
          <CardDescription>Add billable items to client invoices. New items are automatically merged into a client's existing invoice.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 items-end p-4 mb-4 border rounded-lg">
            <div className="grid w-full gap-2 md:grid-cols-4">
              <div className="space-y-1.5 md:col-span-2">
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger><SelectValue placeholder="Select Client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name || c.id}</option>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Input placeholder="Service / Item Name" value={item.name} onChange={e => setItem({ ...item, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Input type="number" placeholder="Price (R)" value={item.price || ''} onChange={e => setItem({ ...item, price: Number(e.target.value) })} />
              </div>
            </div>
            <Button onClick={handleAddItem} className="w-full md:w-auto mt-2 md:mt-0">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>
        
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <ScrollArea className="h-[calc(100vh-30rem)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Total Items</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{clientsMap.get(inv.clientId) || 'Unknown Client'}</TableCell>
                      <TableCell>{inv.items.length}</TableCell>
                      <TableCell>R {inv.total.toFixed(2)}</TableCell>
                      <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleViewInvoice(inv)}>
                              <Eye className="mr-2 h-4 w-4" /> View / Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => downloadInvoicePdf(inv)}>
                              <Download className="mr-2 h-4 w-4" /> Download PDF
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => {
                                const client = clients.find(c => c.id === inv.clientId);
                                if (client?.phone) {
                                  window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}`, '_blank');
                                } else {
                                  toast({ variant: 'destructive', title: 'No phone number for this client.'});
                                }
                            }}>
                              <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
                            </DropdownMenuItem>
                             <DropdownMenuItem onSelect={() => {
                                const client = clients.find(c => c.id === inv.clientId);
                                if (client?.email) {
                                  window.location.href = `mailto:${client.email}`;
                                } else {
                                  toast({ variant: 'destructive', title: 'No email for this client.'});
                                }
                             }}>
                              <Mail className="mr-2 h-4 w-4" /> Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => db && user && deleteInvoice(db, user.uid, inv.id)} className="text-red-500">
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      
      {db && (
        <ViewInvoiceDialog 
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            invoice={viewingInvoice}
            client={selectedClientForView}
            db={db}
        />
      )}
    </>
  );
}
