
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
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState, useRef } from 'react';
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
  const pdfPreviewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const downloadPdf = async () => {
    if (!invoice || !pdfPreviewRef.current) {
      toast({ variant: 'destructive', title: 'Error', description: 'Invoice content is not ready.' });
      return;
    };

    setIsDownloading(true);
    toast({ title: 'Downloading PDF...', description: 'Please wait.' });

    const element = pdfPreviewRef.current;
    
    try {
        const canvas = await html2canvas(element.querySelector(`#invoice-pdf-view-${invoice.id}`)!, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        }

        pdf.save(`Invoice-${invoice.id.substring(0, 6).toUpperCase()}.pdf`);
    } catch (error) {
        console.error("PDF download error:", error);
        toast({ variant: 'destructive', title: 'Download Failed', description: 'Could not generate the PDF.' });
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Invoice Preview</DialogTitle>
          <DialogDescription>
            A preview of the invoice for {client?.name}. You can download it as a PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 bg-muted/30">
          <ScrollArea className="h-[65vh]">
            {client && invoice && profile && settings ? (
              <div className="flex justify-center" ref={pdfPreviewRef}>
                <InvoicePDFView client={client} invoice={invoice} profile={profile} settings={settings} />
              </div>
            ) : (
              <div className="p-8">
                <Skeleton className="h-[500px] w-full" />
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={downloadPdf} disabled={isDownloading || !client || !profile || !settings}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download as PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
