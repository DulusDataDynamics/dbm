'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import { Invoice, Client, BusinessProfile, InvoiceSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getBusinessProfile, getInvoiceSettings, subscribeToInvoices, subscribeToClients } from '@/lib/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth, useFirestore } from '@/firebase';

type AppInvoice = Invoice & {
    client?: Client;
};

export default function DownloadInvoices() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  async function fetchAllData(): Promise<{ invoices: AppInvoice[], clients: Client[] }> {
    if (!db || !user?.uid) return { invoices: [], clients: [] };
    
    const invoicesPromise = new Promise<AppInvoice[]>((resolve) => {
      const unsubscribe = subscribeToInvoices(db, user!.uid, (data) => {
        unsubscribe();
        resolve(data);
      });
    });

    const clientsPromise = new Promise<Client[]>((resolve) => {
        const unsubscribe = subscribeToClients(db, user!.uid, (data) => {
          unsubscribe();
          resolve(data);
        });
    });

    const [invoices, clients] = await Promise.all([invoicesPromise, clientsPromise]);
    return { invoices, clients };
  }


  function formatDate(dateString?: string) {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  async function handleDownload() {
    if (!user || !db) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in and connected to download invoices.",
      });
      return;
    }

    setLoading(true);

    try {
      const { invoices, clients } = await fetchAllData();
      
      if (!invoices || invoices.length === 0) {
        toast({
            title: "No Invoices Found",
            description: "There are no invoices to download.",
        });
        setLoading(false);
        return;
      }

      const clientsMap = new Map(clients.map(c => [c.id, c]));
      const enrichedInvoices = invoices.map(inv => ({ ...inv, client: clientsMap.get(inv.clientId) }));
      
      const profile = await getBusinessProfile(db, user.uid);
      const settings = await getInvoiceSettings(db, user.uid);

      if (!profile) {
         toast({
            variant: "destructive",
            title: "Profile Not Found",
            description: "Please complete your business profile in settings before exporting.",
        });
        setLoading(false);
        return;
      }

      generatePDF(enrichedInvoices, profile, settings);

    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Failed to Generate PDF",
        description: err?.message || 'An unknown error occurred.',
      });
    } finally {
      loading && setLoading(false);
    }
  }

  function generatePDF(invoices: AppInvoice[], profile: BusinessProfile, settings: InvoiceSettings | null) {
    const doc = new jsPDF({
      unit: 'pt',
      format: 'a4',
    });

    const companyName = profile.companyName || 'Your Business';
    const companyEmail = profile.businessEmail || '';
    const generatedDate = new Date().toLocaleString();
    const brandColor = settings?.brandColor || '#2B579A';

    doc.setFontSize(18);
    doc.text(companyName, 40, 50);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedDate}`, 40, 68);
    doc.text(`Contact: ${companyEmail}`, 40, 84);
    doc.setFontSize(14);
    doc.text('All Invoices Summary', 40, 120);

    const summaryTableColumns = ['Invoice ID', 'Client', 'Total', 'Due Date', 'Status'];
    const summaryTableRows = invoices.map((inv) => [
        inv.id.substring(0, 8).toUpperCase(),
        inv.client?.name || 'N/A',
        `R ${inv.total.toFixed(2)}`,
        formatDate(inv.dueDate),
        inv.status || '-',
    ]);
    
    // @ts-ignore
    doc.autoTable({
      startY: 140,
      head: [summaryTableColumns],
      body: summaryTableRows,
      styles: { fontSize: 10 },
      headStyles: { fillColor: brandColor },
      theme: 'grid',
      margin: { left: 40, right: 40 },
    });
    
    invoices.forEach((inv) => {
      doc.addPage();
      
      doc.setFontSize(18);
      doc.setTextColor(brandColor);
      doc.text(profile.companyName || "Your Company", 40, 40);
      doc.setTextColor('#000000');

      doc.setFontSize(10);
      doc.text(profile.businessAddress || '', 40, 55);
      doc.text(`Email: ${profile.businessEmail || ''}`, 40, 65);
      doc.text(`Phone: ${profile.businessPhone || ''}`, 40, 75);
      if (profile.website) doc.text(`Website: ${profile.website}`, 40, 85);
      if (profile.taxNumber) doc.text(`Tax/VAT No: ${profile.taxNumber}`, 40, 95);

      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text("INVOICE", doc.internal.pageSize.width - 40, 40, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Invoice #: ${settings?.invoicePrefix || ''}${inv.id.substring(0,6).toUpperCase()}`, doc.internal.pageSize.width - 40, 55, { align: 'right' });
      doc.text(`Date: ${formatDate(inv.createdAt)}`, doc.internal.pageSize.width - 40, 65, { align: 'right' });
      doc.text(`Due Date: ${formatDate(inv.dueDate)}`, doc.internal.pageSize.width - 40, 75, { align: 'right' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO', 40, 130);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(inv.client?.name || 'N/A', 40, 145);
      if (inv.client?.email) doc.text(inv.client.email, 40, 155);

      const itemsTableColumns = ['Description', 'Quantity', 'Price', 'Total'];
      const itemsTableRows = inv.items.map(item => [
          item.description,
          item.quantity,
          `R ${item.price.toFixed(2)}`,
          `R ${(item.quantity * item.price).toFixed(2)}`
      ]);

      // @ts-ignore
      doc.autoTable({
          startY: 180,
          head: [itemsTableColumns],
          body: itemsTableRows,
          theme: 'striped',
          headStyles: { fillColor: brandColor },
          didDrawPage: (data: any) => {
            // @ts-ignore
            let finalY = doc.lastAutoTable.finalY;
            
            const totalsX = doc.internal.pageSize.width - 40;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total: R ${inv.total.toFixed(2)}`, totalsX, finalY + 40, { align: 'right' });
            doc.setFont('helvetica', 'normal');

            const pageHeight = doc.internal.pageSize.height;
            const bottomY = pageHeight - 140;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text("BANKING DETAILS", 40, bottomY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(`Bank: ${profile.bankName || ''}`, 40, bottomY + 12);
            doc.text(`Account Holder: ${profile.accountHolder || ''}`, 40, bottomY + 22);
            doc.text(`Account Number: ${profile.accountNumber || ''}`, 40, bottomY + 32);
            doc.text(`Branch Code: ${profile.branchCode || ''}`, 40, bottomY + 42);

            const footerY = pageHeight - 40;
            doc.setFontSize(9);
            doc.text(settings?.footerMessage || 'Thank you for your business!', doc.internal.pageSize.width / 2, footerY, { align: 'center' });
            
            if (settings?.showWatermark) {
                doc.setFontSize(8);
                doc.setTextColor('#aaaaaa');
                doc.text("Generated by Dulus Business Manager © 2025 Dulus Data Dynamics", doc.internal.pageSize.width / 2, footerY + 15, { align: 'center' });
                doc.setTextColor('#000000');
            }
          }
      });
    });

    const fileName = `DBM_Invoices_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }

  return (
    <Button onClick={handleDownload} disabled={loading || !db} variant="outline" size="sm">
        <Download className="mr-2 h-4 w-4" />
        {loading ? 'Preparing PDF...' : 'Download All'}
    </Button>
  );
}
