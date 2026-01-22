
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
import { MoreHorizontal, PlusCircle, MessageSquare, BellRing, Download, Copy, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { deleteInvoice, subscribeToInvoices, subscribeToClients, updateInvoiceStatus, duplicateInvoice } from '@/lib/firestore';
import { Invoice, Client, InvoiceStatus } from '@/lib/types';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { InvoiceForm } from '@/components/app/invoice-form';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ViewInvoiceDialog } from '@/components/app/view-invoice-dialog';
import { useToast } from '@/hooks/use-toast';
import DownloadInvoices from '@/components/app/download-invoices';
import { useAuth, useFirestore } from '@/firebase';

export default function InvoicesPage() {
  const db = useFirestore();
  const { user, isUserLoading } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isUserLoading || !db || !user?.uid) {
      setLoading(true);
      return;
    }

    const unsubInvoices = subscribeToInvoices(db, user.uid, (invoicesData) => {
      setInvoices(invoicesData);
      setLoading(false);
    });

    const unsubClients = subscribeToClients(db, user.uid, setClients);

    return () => {
      unsubInvoices();
      unsubClients();
    };
  }, [db, user?.uid, isUserLoading]);

  const clientsMap = useMemo(() => new Map(clients.map(c => [c.id, c])), [clients]);

  const enrichedInvoices = useMemo(() => 
    invoices.map(invoice => ({
      ...invoice,
      client: clientsMap.get(invoice.clientId),
    })), [invoices, clientsMap]);

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    if (invoice.status !== 'Draft') {
        toast({ variant: 'destructive', title: 'Cannot edit a sent invoice.' });
        return;
    }
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  }

  const handleDeleteInvoice = (invoice: Invoice) => {
    if (invoice.status !== 'Draft') {
        toast({ variant: 'destructive', title: 'Cannot delete a sent invoice.' });
        return;
    }
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
  }
  
  const handleDuplicateInvoice = (invoice: Invoice) => {
    if(!db || !user?.uid) return;
    startTransition(async () => {
        await duplicateInvoice(db, user.uid, invoice);
        toast({ title: 'Invoice duplicated as a new draft.' });
    });
  }

  const handleStatusChange = (invoiceId: string, status: InvoiceStatus) => {
    if (!db || !user?.uid) return;
     startTransition(async () => {
        await updateInvoiceStatus(db, user.uid, invoiceId, status);
        toast({ title: 'Invoice status updated.' });
    });
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setInvoiceToView(invoice);
    setIsViewDialogOpen(true);
  }

  const handleWhatsAppAction = (invoice: Invoice, action: 'send' | 'remind') => {
    if (!invoice.client?.phone) {
       toast({
        variant: 'destructive',
        title: 'No Phone Number',
        description: `Client ${invoice.client.name} does not have a phone number saved.`,
      });
      return;
    }
    const phoneNumber = invoice.client.phone.replace(/\D/g, ''); // Remove non-numeric characters
    let message = '';
    
    if(action === 'send') {
        const invoiceUrl = `${window.location.origin}/invoices/${invoice.id}`;
        message = `Hello ${invoice.client.name},\n\nYour invoice (#${invoice.id.substring(0,8)}) is ready.\nAmount: R${invoice.total.toLocaleString()}\n\nYou can view it here:\n${invoiceUrl}\n\nThank you!`;
    } else { // remind
        message = `🔔 PAYMENT REMINDER\n\nHello ${invoice.client.name},\nThis is a friendly reminder that your invoice (#${invoice.id.substring(0,8)}) for R${invoice.total.toLocaleString()} is due.\n\nPlease make payment soon to avoid any late penalties.\n\nThank you.`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const confirmDelete = async () => {
    if (invoiceToDelete && db && user?.uid) {
      await deleteInvoice(db, user.uid, invoiceToDelete.id);
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedInvoice(null);
  };
  
  const getStatusBadgeVariant = (status: InvoiceStatus) => {
    switch (status) {
        case 'Paid': return 'default';
        case 'Unpaid': return 'secondary';
        case 'Overdue': return 'destructive';
        case 'Draft': return 'outline';
        default: return 'outline';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-muted-foreground">Manage your invoices and track payments.</p>
            </div>
            <div className="flex items-center gap-2">
                <DownloadInvoices />
                <Button size="sm" onClick={handleAddInvoice} disabled={loading || !db || !user}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Invoice
                </Button>
            </div>
          </div>
        
          <Card>
            <CardHeader>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>A list of all your invoices.</CardDescription>
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
                      <TableHead className="hidden sm:table-cell">Invoice ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrichedInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className={invoice.status === 'Draft' ? 'bg-muted/50' : ''}>
                        <TableCell className="hidden sm:table-cell font-mono text-xs">{invoice.id.substring(0,8).toUpperCase()}</TableCell>
                        <TableCell className="font-medium">{invoice.client?.name || '...'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="hidden md:table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right font-semibold">R{invoice.total.toLocaleString()}</TableCell>
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
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>View</DropdownMenuItem>
                              {invoice.status === 'Draft' && <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}><Pencil className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>}
                              <DropdownMenuItem onClick={() => handleDuplicateInvoice(invoice)}><Copy className="mr-2 h-4 w-4"/>Duplicate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {invoice.status === 'Draft' && <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Unpaid')}>Mark as Unpaid</DropdownMenuItem>}
                                    {(invoice.status === 'Unpaid' || invoice.status === 'Overdue') && <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'Paid')}>Mark as Paid</DropdownMenuItem>}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                               <DropdownMenuItem onClick={() => handleWhatsAppAction(invoice, 'send')}>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Send via WhatsApp
                              </DropdownMenuItem>
                              {(invoice.status === 'Unpaid' || invoice.status === 'Overdue') && (
                                <DropdownMenuItem onClick={() => handleWhatsAppAction(invoice, 'remind')}>
                                  <BellRing className="mr-2 h-4 w-4" />
                                  Send Payment Reminder
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {invoice.status === 'Draft' && <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice)} className="text-red-500"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>}
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
      </div>
      {db && user?.uid && (
        <InvoiceForm 
          db={db}
          userId={user.uid}
          isOpen={isFormOpen}
          onClose={handleFormClose}
          invoice={selectedInvoice}
        />
      )}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete invoice
              <strong className="text-foreground"> #{invoiceToDelete?.id.substring(0,8).toUpperCase()}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {db && user && invoiceToView && (
       <ViewInvoiceDialog
        db={db}
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        invoice={invoiceToView}
      />
      )}
    </>
  );
}
