
'use client';

import { useEffect, useState, useMemo, useTransition } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { Client, Invoice, InvoiceStatus } from '@/lib/types';
import {
  subscribeToClients,
  subscribeToInvoices,
  deleteInvoice,
  updateInvoiceStatus,
  duplicateInvoice
} from '@/lib/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Copy, Trash, Eye, CheckCircle, Clock, AlertCircle, CircleDot, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ViewInvoiceDialog } from '@/components/app/view-invoice-dialog';
import { InvoiceForm } from '@/components/app/invoice-form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function InvoicesPage() {
  const { user, isUserLoading } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isPending, startTransition] = useTransition();

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

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    if (invoice.status !== 'Draft') {
      toast({
        variant: 'destructive',
        title: 'Cannot Edit Sent Invoice',
        description: 'Once an invoice is marked as Unpaid or Paid, it cannot be edited. You can duplicate it instead.',
      });
      return;
    }
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  };
  
  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (invoice: Invoice) => {
    if (invoice.status !== 'Draft') {
      toast({
        variant: 'destructive',
        title: 'Cannot Delete Sent Invoice',
        description: 'Only draft invoices can be deleted.',
      });
      return;
    }
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (invoiceToDelete && db && user?.uid) {
      await deleteInvoice(db, user.uid, invoiceToDelete.id);
      toast({ title: 'Invoice deleted successfully.' });
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleDuplicateInvoice = (invoiceId: string) => {
    if (!db || !user?.uid) return;
    startTransition(async () => {
      await duplicateInvoice(db, user.uid, invoiceId);
      toast({ title: 'Invoice duplicated successfully.' });
    });
  }
  
  const handleStatusChange = (invoiceId: string, status: InvoiceStatus) => {
    if (!db || !user?.uid) return;
    startTransition(async () => {
      await updateInvoiceStatus(db, user.uid, invoiceId, status);
      toast({ title: `Invoice status updated to ${status}.` });
    });
  };
  
  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid': return <Badge variant="default"><CheckCircle className="mr-1 h-3 w-3" />Paid</Badge>;
      case 'Unpaid': return <Badge variant="secondary"><AlertCircle className="mr-1 h-3 w-3" />Unpaid</Badge>;
      case 'Overdue': return <Badge variant="destructive"><Clock className="mr-1 h-3 w-3" />Overdue</Badge>;
      case 'Draft':
      default:
        return <Badge variant="outline"><CircleDot className="mr-1 h-3 w-3" />Draft</Badge>;
    }
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
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>Create and manage your client invoices.</CardDescription>
            </div>
             <Button size="sm" onClick={handleAddInvoice} disabled={loading || !db || !user}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
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
                    <TableHead>Client</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="hidden md:table-cell">Due</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{clientsMap.get(inv.clientId) || 'Unknown Client'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden md:table-cell">{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">R {inv.total.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={isPending}><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleViewInvoice(inv)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleEditInvoice(inv)} disabled={inv.status !== 'Draft'}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDuplicateInvoice(inv.id)}><Copy className="mr-2 h-4 w-4" /> Duplicate</DropdownMenuItem>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(inv.id, 'Draft')}>Draft</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(inv.id, 'Unpaid')}>Unpaid</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(inv.id, 'Paid')}>Paid</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(inv.id, 'Overdue')}>Overdue</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => handleDeleteClick(inv)} className="text-red-500" disabled={inv.status !== 'Draft'}>
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
      
      {db && user?.uid && (
        <InvoiceForm 
            db={db}
            userId={user.uid}
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            invoice={selectedInvoice}
        />
      )}

      {db && (
        <ViewInvoiceDialog 
            isOpen={isViewOpen}
            onClose={() => setIsViewOpen(false)}
            invoice={viewingInvoice}
            client={selectedClientForView}
            db={db}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this draft invoice.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
