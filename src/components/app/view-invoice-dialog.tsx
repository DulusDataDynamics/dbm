
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
import { Client } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useState } from 'react';
import { InvoicePDFView } from './invoice-pdf-view';
import { useFirestore, useAuth } from '@/firebase';

interface ViewInvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  db: any;
}

export function ViewInvoiceDialog({ isOpen, onClose, client, db }: ViewInvoiceDialogProps) {
  const { user } = useAuth();
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadPdf = async () => {
    if (!client) return;
    setIsDownloading(true);

    const element = document.getElementById(`invoice-pdf-view-${client.id}`);
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

    pdf.save(`Invoice-${client.name.replace(/\s/g, '_')}.pdf`);
    setIsDownloading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription>
            A preview of the invoice for {client?.name}. You can download it as a PDF.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {client && db && user ? (
            <InvoicePDFView db={db} client={client} />
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
          <Button type="button" onClick={downloadPdf} disabled={isDownloading || !client || !db || !user}>
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Downloading...' : 'Download as PDF'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
