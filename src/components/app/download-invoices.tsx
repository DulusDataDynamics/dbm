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
      return new Date(dateString).toLocaleDateString();
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
      setLoading(false);
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

    doc.setFontSize(18);
    doc.text(companyName, 40, 50);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedDate}`, 40, 68);
    doc.text(`Contact: ${companyEmail}`, 40, 84);

    doc.setFontSize(14);
    doc.text('All Invoices Summary', 40, 120);

    const tableColumns = [
      { header: 'Invoice ID', dataKey: 'id' },
      { header: 'Client', dataKey: 'client' },
      { header: 'Amount', dataKey: 'amount' },
      { header: 'Due Date', dataKey: 'dueDate' },
      { header: 'Status', dataKey: 'status' },
    ];

    const tableRows = invoices.map((inv) => ({
      id: inv.id.substring(0, 8),
      client: inv.client?.name || 'N/A',
      amount: `R ${(inv.amount || 0).toFixed(2)}`,
      dueDate: formatDate(inv.dueDate),
      status: inv.status || '-',
    }));
    
    // @ts-ignore
    doc.autoTable({
      startY: 140,
      head: [tableColumns.map((c) => c.header)],
      body: tableRows.map((r) => [
        r.id,
        r.client,
        r.amount,
        r.dueDate,
        r.status,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: settings?.brandColor || '#2B579A' },
      theme: 'grid',
      margin: { left: 40, right: 40 },
    });
    
    invoices.forEach((inv) => {
      doc.addPage();
      
      doc.setFontSize(18);
      doc.setTextColor(settings?.brandColor || '#000000');
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
      doc.text("INVOICE", doc.internal.pageSize.getWidth() - 40, 40, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Invoice #: ${settings?.invoicePrefix || ''}${inv.id.substring(0,6).toUpperCase()}`, doc.internal.pageSize.getWidth() - 40, 55, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() - 40, 65, { align: 'right' });
      doc.text(`Due Date: ${formatDate(inv.dueDate)}`, doc.internal.pageSize.getWidth() - 40, 75, { align: 'right' });

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO', 40, 130);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(inv.client?.name || 'N/A', 40, 145);
      if (inv.client?.email) doc.text(inv.client.email, 40, 155);

      // @ts-ignore
      doc.autoTable({
          startY: 180,
          head: [['Description', 'Amount']],
          body: [['Service/Product Rendered', `R ${inv.amount.toFixed(2)}`]],
          theme: 'striped',
          headStyles: { fillColor: settings?.brandColor || '#2B579A' },
      });
      
      // @ts-ignore
      let finalY = doc.lastAutoTable.finalY;

      doc.setFontSize(14);
      doc.text(
        `Total: R ${inv.amount.toFixed(2)}`,
        doc.internal.pageSize.getWidth() - 40,
        finalY + 40,
        { align: 'right' }
      );
      
      const bottomY = doc.internal.pageSize.getHeight() - 140;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text("BANKING DETAILS", 40, bottomY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Bank: ${profile.bankName || ''}`, 40, bottomY + 12);
      doc.text(`Account Holder: ${profile.accountHolder || ''}`, 40, bottomY + 22);
      doc.text(`Account Number: ${profile.accountNumber || ''}`, 40, bottomY + 32);
      doc.text(`Branch Code: ${profile.branchCode || ''}`, 40, bottomY + 42);

      const footerY = doc.internal.pageSize.getHeight() - 40;
      doc.setFontSize(9);
      doc.text(settings?.footerMessage || 'Thank you for your business!', doc.internal.pageSize.getWidth() / 2, footerY, { align: 'center' });
      
      if (settings?.showWatermark) {
          doc.setFontSize(8);
          doc.setTextColor('#aaaaaa');
          doc.text("Generated by Dulus Business Manager © 2025 Dulus Data Dynamics", doc.internal.pageSize.getWidth() / 2, footerY + 15, { align: 'center' });
          doc.setTextColor('#000000');
      }

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
