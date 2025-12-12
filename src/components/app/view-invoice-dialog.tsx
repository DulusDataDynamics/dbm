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
import { Invoice } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import { InvoicePDFView } from './invoice-pdf-view';

interface ViewInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
}

export function ViewInvoiceDialog({ isOpen, onClose, invoice }: ViewInvoiceDialogProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = async () => {
    if (!invoice) return;
    setIsDownloading(true);

    const element = document.getElementById(`invoice-pdf-view-${invoice.id}`);
    if (!element) {
        setIsDownloading(false);
        return;
    }

    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`Invoice-${invoice.id.substring(0, 8)}.pdf`);
    setIsDownloading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            A preview of invoice {invoice?.id.substring(0, 8)}. You can download it as a PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {invoice ? (
            <InvoicePDFView invoice={invoice} />
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button type="button" onClick={downloadPdf} disabled={isDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download as PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
