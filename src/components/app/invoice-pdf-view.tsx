'use client';
import { Client, BusinessProfile, InvoiceSettings, Invoice } from '@/lib/types';
import { Building } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';

interface InvoicePDFViewProps {
  client: Client;
  invoice: Invoice;
  profile: BusinessProfile;
  settings: InvoiceSettings;
  onReady?: () => void;   // ✅ render signal
}

export function InvoicePDFView({ client, invoice, profile, settings, onReady }: InvoicePDFViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const el = rootRef.current;

    const waitForStableLayout = async () => {
      // wait for paints
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      // wait for images
      const images = el.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(res => {
            img.onload = res;
            img.onerror = res;
          });
        })
      );

      // wait for fonts
      if (document.fonts) {
        await document.fonts.ready;
      }

      // wait for layout stability
      let lastHeight = el.offsetHeight;
      await new Promise(resolve => setTimeout(resolve, 50));
      let newHeight = el.offsetHeight;

      if (lastHeight !== newHeight) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      onReady?.(); // ✅ PDF-safe signal
    };

    waitForStableLayout();
  }, [invoice, profile, settings, onReady]);

  if (!invoice || !profile || !settings) {
    return <div className="p-8">Loading invoice data...</div>;
  }

  const brandColor = settings?.brandColor || '#2B579A';
  const taxRate = profile?.defaultTaxRate !== undefined ? profile.defaultTaxRate / 100 : 0.15;
  const isTransport = invoice.type === 'transport';

  return (
    <div
      ref={rootRef}
      id={`invoice-pdf-view-${invoice.id}`}
      className="p-8 bg-white text-gray-800 font-sans text-sm shadow-lg print-container"
      style={{ width: '210mm', minHeight: '297mm', position: 'relative' }}
    >
      {/* HEADER */}
      <header className="flex justify-between items-start mb-8 border-b-2 pb-4" style={{ borderColor: brandColor }}>
        <div className="company-info text-xs">
          {settings?.companyLogoUrl ? (
            <img src={settings.companyLogoUrl} alt="Company Logo" className="w-24 h-auto mb-2 object-contain" />
          ) : (
            <div className="w-20 h-20 mb-2 bg-gray-100 flex items-center justify-center rounded">
              <Building className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <h2 className="text-xl font-bold text-gray-900">{profile?.companyName || 'Your Company'}</h2>
          <p>{profile?.businessAddress}</p>
          <p>Email: {profile?.businessEmail}</p>
          <p>Phone: {profile?.businessPhone}</p>
          {profile?.website && <p>Website: {profile.website}</p>}
        </div>

        <div className="invoice-info text-right text-xs">
          <h1 className="text-4xl font-bold mb-2" style={{ color: brandColor }}>INVOICE</h1>
          <p><strong>Invoice #:</strong> {`${settings?.invoicePrefix || ''}${invoice.id.substring(0,6).toUpperCase()}`}</p>
          <p><strong>Date Issued:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </header>

      {/* BILL TO */}
      <div className="my-8 no-break">
        <h3 className="text-sm font-bold text-gray-500 mb-1">BILL TO</h3>
        <p className="font-bold">{client.name}</p>
        <p>{client.email}</p>
        {client.phone && <p>{client.phone}</p>}
      </div>

      {/* ITEMS / TRIPS TABLE */}
      <table className="w-full border-collapse mb-8 text-sm">
        <thead>
          <tr style={{ backgroundColor: brandColor }} className="text-white">
            {isTransport ? (
              <>
                <th className="p-2.5 text-left font-bold uppercase">Date</th>
                <th className="p-2.5 text-left font-bold uppercase">From</th>
                <th className="p-2.5 text-left font-bold uppercase">To</th>
                <th className="p-2.5 text-left font-bold uppercase">Container</th>
                <th className="p-2.5 text-right font-bold uppercase">Rate</th>
              </>
            ) : (
              <>
                <th className="p-2.5 text-left font-bold uppercase">Description</th>
                <th className="p-2.5 text-center font-bold uppercase">Qty</th>
                <th className="p-2.5 text-right font-bold uppercase">Unit Price</th>
                <th className="p-2.5 text-right font-bold uppercase">Total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {isTransport ? (
            invoice.trips?.map((trip, index) => (
              <tr key={index} className="border-b">
                <td className="p-2.5">{trip.date}</td>
                <td className="p-2.5">{trip.from}</td>
                <td className="p-2.5">{trip.to}</td>
                <td className="p-2.5">{trip.container}</td>
                <td className="p-2.5 text-right">R {Number(trip.rate).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            invoice.items?.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2.5">{item.description}</td>
                <td className="p-2.5 text-center">{item.quantity}</td>
                <td className="p-2.5 text-right">R {Number(item.price).toFixed(2)}</td>
                <td className="p-2.5 text-right">R {(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* TOTALS & FOOTER */}
      <div className="footer-section">
        <div className="flex justify-end mb-8 totals-section">
          <div className="w-1/2">
            <table className="w-full text-sm">
              <tbody>
                {!isTransport && (
                  <>
                    <tr className="border-b border-gray-100">
                      <td className="p-2 text-right text-gray-500 font-bold uppercase">Subtotal:</td>
                      <td className="p-2 text-right">R {invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-2 text-right text-gray-500 font-bold uppercase">Tax ({taxRate * 100}%):</td>
                      <td className="p-2 text-right">R {invoice.tax.toFixed(2)}</td>
                    </tr>
                  </>
                )}
                <tr className="border-t-2 font-bold text-lg" style={{ borderColor: brandColor }}>
                  <td className="p-2 text-right uppercase">Total:</td>
                  <td className="p-2 text-right" style={{ color: brandColor }}>R {invoice.total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 border-t pt-4 no-break">
          <div className="flex justify-between gap-8 text-xs">
            <div className="text-gray-600">
              <h3 className="text-sm font-bold text-gray-800 mb-1">Payment Information</h3>
              <p className="italic mb-2">{settings?.paymentTerms || 'Please make payment by the due date.'}</p>

              <p><strong>Bank:</strong> {profile?.bankName || 'N/A'}</p>
              <p><strong>Account Holder:</strong> {profile?.accountHolder || 'N/A'}</p>
              <p><strong>Account Number:</strong> {profile?.accountNumber || 'N/A'}</p>
              <p><strong>Branch Code:</strong> {profile?.branchCode || 'N/A'}</p>
              <p><strong>Reference:</strong> {`${settings?.invoicePrefix || ''}${invoice.id.substring(0,6).toUpperCase()}`}</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-lg" style={{ color: brandColor }}>Thank you!</p>
              {settings?.showWatermark && (
                <p className="text-[10px] text-gray-300 mt-4">Generated by Dulus Business Manager</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}