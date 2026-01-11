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
import { MoreHorizontal, PlusCircle, MessageSquare, BellRing, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { deleteInvoice, subscribeToInvoices } from '@/lib/firestore';
import { Invoice } from '@/lib/types';
import { useEffect, useState } from 'react';
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
import { getFirebase, waitForFirebaseReady } from '@/lib/firebaseClient';
import type { Firestore } from 'firebase/firestore';
import { useAuth } from '@/hooks/use-auth';

export default function InvoicesPage() {
  const [db, setDb] = useState<Firestore | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
  const { toast } = useToast();
  const { auth } = useAuth();

  useEffect(() => {
    if (!auth) return;
    async function load() {
      await waitForFirebaseReady(auth);
      const fb = getFirebase();
      if(fb) setDb(fb.db);
    }
    load();
  }, [auth]);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = subscribeToInvoices(db, (invoicesData) => {
      setInvoices(invoicesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleAddInvoice = () => {
    setSelectedInvoice(null);
    setIsFormOpen(true);
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsFormOpen(true);
  }

  const handleDeleteInvoice = (invoice: Invoice) => {
    setInvoiceToDelete(invoice);
    setIsDeleteDialogOpen(true);
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
        message = `Hello ${invoice.client.name},\n\nYour invoice (#${invoice.id.substring(0,8)}) is ready.\nAmount: R${invoice.amount.toLocaleString()}\n\nYou can view it here:\n${invoiceUrl}\n\nThank you!`;
    } else { // remind
        message = `🔔 PAYMENT REMINDER\n\nHello ${invoice.client.name},\nThis is a friendly reminder that your invoice (#${invoice.id.substring(0,8)}) for R${invoice.amount.toLocaleString()} is due.\n\nPlease make payment soon to avoid any late penalties.\n\nThank you.`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const confirmDelete = async () => {
    if (invoiceToDelete && db) {
      await deleteInvoice(db, invoiceToDelete.id);
      setIsDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedInvoice(null);
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
                <Button size="sm" onClick={handleAddInvoice} disabled={!db}>
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
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>
                        <span className="sr-only">Actions</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="hidden sm:table-cell font-medium">{invoice.id.substring(0,8)}</TableCell>
                        <TableCell>{invoice.client?.name || '...'}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              invoice.status === 'Paid' ? 'default' : 
                              invoice.status === 'Overdue' ? 'destructive' : 'secondary'
                            }
                            className={
                              invoice.status === 'Paid' ? 'bg-green-500/20 text-green-700 border-green-500/20 hover:bg-green-500/30' : ''
                            }
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">R{invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>Edit</DropdownMenuItem>
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
                              <DropdownMenuItem onClick={() => handleDeleteInvoice(invoice)} className="text-red-500">Delete</DropdownMenuItem>
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
      {db && (
        <InvoiceForm 
          db={db}
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
              This action cannot be undone. This will permanently delete the invoice
              <strong className="text-foreground"> {invoiceToDelete?.id.substring(0,8)}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/80">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {db && (
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
