'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Client, Invoice, BusinessProfile, InvoiceSettings } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Download, Printer } from 'lucide-react';
import { useState } from 'react';
import { InvoicePDFView } from './invoice-pdf-view';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface ViewInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  client: Client | null;
  profile: BusinessProfile | null;
  settings: InvoiceSettings | null;
}

export function ViewInvoiceDialog({ isOpen, onClose, invoice, client, profile, settings }: ViewInvoiceDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfReady, setPdfReady] = useState(false);
  const { toast } = useToast();

  const downloadPdf = async () => {
    if (!invoice || !client || !profile) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invoice data is not fully loaded.' });
      return;
    }

    setIsDownloading(true);
    try {
      // Dynamic import to avoid SSR issues with html2pdf.js
      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById("invoice-preview");

      if (!element) {
        throw new Error("Preview element not found");
      }

      const opt = {
        margin: 0,
        filename: `Invoice-${invoice.id.substring(0, 6).toUpperCase()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true,
          logging: false 
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(element).set(opt).save();
      
      toast({ title: 'Success', description: 'Invoice downloaded as PDF.' });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not generate PDF.' });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!invoice) return;
    window.open(`/invoices/${invoice.id}/print`, '_blank');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPdfReady(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            A preview of the invoice for {client?.name}. You can download it as a PDF or print it.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 bg-muted/30">
          <ScrollArea className="h-[65vh]">
            {client && invoice && profile && settings ? (
              <div className="flex justify-center">
                <div id="invoice-preview">
                  <InvoicePDFView
                    client={client}
                    invoice={invoice}
                    profile={profile}
                    settings={settings}
                    onReady={() => setPdfReady(true)}
                  />
                </div>
              </div>
            ) : (
              <div className="p-8">
                <Skeleton className="h-[500px] w-full" />
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrint}
            disabled={!invoice || !pdfReady}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
          <Button
            type="button"
            onClick={downloadPdf}
            disabled={isDownloading || !pdfReady}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Generating PDF...' : 'Quick Download'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
