
'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  PlusCircle,
  FileText,
  Copy,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  FileWarning,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { subscribeToClients, subscribeToInvoices, deleteInvoice, updateInvoiceStatus, saveInvoice } from '@/lib/firestore';
import { Client, Invoice, InvoiceStatus } from '@/lib/types';
import { useEffect, useState, useMemo, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceForm } from '@/components/app/invoice-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth, useFirestore } from '@/firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ViewInvoiceDialog } from '@/components/app/view-invoice-dialog';

type AppInvoice = Invoice & {
    client?: Client;
};

export default function InvoicesPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubClients = subscribeToClients(db, user.uid, setClients);
    const unsubInvoices = subscribeToInvoices(db, user.uid, (invoicesData) => {
        setInvoices(invoicesData);
        setLoading(false);
    });

    return () => {
        unsubClients();
        unsubInvoices();
    };
  }, [db, user?.uid, isUserLoading]);

  const clientsMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);
  
  const enrichedInvoices: AppInvoice[] = useMemo(() => 
    invoices.map(invoice => ({
      ...invoice,
      client: clientsMap.get(invoice.clientId),
    })), [invoices, clientsMap]);
  
  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  }

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
  };

  const handleDuplicateInvoice = async (invoice: Invoice) => {
    if (!db || !user?.uid) return;
    const { id, status, ...newInvoiceData } = invoice;
    const duplicatedInvoice = {
        ...newInvoiceData,
        status: 'Draft' as InvoiceStatus,
    };
    await saveInvoice(db, user.uid, null, duplicatedInvoice);
    toast({ title: "Invoice Duplicated", description: "A new draft has been created."});
  };

  const handleStatusChange = (invoiceId: string, status: InvoiceStatus) => {
    if (!db || !user?.uid) return;
    startTransition(async () => {
      await updateInvoiceStatus(db, user.uid, invoiceId, status);
      toast({ title: "Status Updated", description: `Invoice marked as ${status}.`});
    });
  };

  const confirmDelete = async () => {
    if (invoiceToDelete && db && user?.uid) {
      await deleteInvoice(db, user.uid, invoiceToDelete.id);
      setInvoiceToDelete(null);
      toast({ title: "Invoice Deleted"});
    }
  };
  
  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Unpaid': return 'secondary';
        case 'Draft': return 'outline';
        case 'Overdue': return 'destructive';
        default: return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Create and manage all your client invoices.</CardDescription>
                </div>
                <Button size="sm" onClick={handleAddInvoice}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Invoice
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
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
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrichedInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className={invoice.status === 'Draft' ? 'text-muted-foreground' : ''}>
                    <TableCell className="font-medium">{invoice.client?.name || '...'}</TableCell>
                    <TableCell className="hidden sm:table-cell"><Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">R{invoice.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost" disabled={isPending}>
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}><FileText className="mr-2"/>View Invoice</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditInvoice(invoice)} disabled={invoice.status !== 'Draft'}><FileText className="mr-2"/>Edit / Add Items</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}><Copy className="mr-2"/>Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Unpaid')} disabled={invoice.status === 'Unpaid'}><Send className="mr-2"/>Mark as Unpaid</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Paid')} disabled={invoice.status === 'Paid'}><CheckCircle className="mr-2"/>Mark as Paid</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Overdue')} disabled={invoice.status === 'Overdue'}><FileWarning className="mr-2"/>Mark as Overdue</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice)} className="text-red-500" disabled={invoice.status !== 'Draft'}><Trash2 className="mr-2"/>Delete Draft</DropdownMenuItem>
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
      
      <ViewInvoiceDialog
        db={db}
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        invoice={selectedInvoice}
        client={selectedInvoice ? clientsMap.get(selectedInvoice.clientId) : null}
      />

      <AlertDialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. This will permanently delete the invoice.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
