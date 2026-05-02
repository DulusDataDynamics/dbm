'use client';
import { Client, BusinessProfile, InvoiceSettings, Invoice } from '@/lib/types';
import { Building } from 'lucide-react';
import { useLayoutEffect, useRef, useMemo } from 'react';

interface InvoicePDFViewProps {
  client: Client;
  invoice: Invoice;
  profile: BusinessProfile;
  settings: InvoiceSettings;
  onReady?: () => void;
}

export function InvoicePDFView({ client, invoice, profile, settings, onReady }: InvoicePDFViewProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const el = rootRef.current;

    const waitForStableLayout = async () => {
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

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

      if (document.fonts) {
        await document.fonts.ready;
      }

      let lastHeight = el.offsetHeight;
      await new Promise(resolve => setTimeout(resolve, 50));
      let newHeight = el.offsetHeight;

      if (lastHeight !== newHeight) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      onReady?.();
    };

    waitForStableLayout();
  }, [invoice, profile, settings, onReady]);

  const brandColor = settings?.brandColor || '#2B579A';
  const isTransport = invoice?.type === 'transport';

  // Game Changer: Manual Pagination Logic
  const pages = useMemo(() => {
    if (!invoice) return [];
    const rows = isTransport ? (invoice.trips || []) : (invoice.items || []);
    const rowsPerPage = 15;
    const chunked = [];
    for (let i = 0; i < rows.length; i += rowsPerPage) {
      chunked.push(rows.slice(i, i + rowsPerPage));
    }
    if (chunked.length === 0) chunked.push([]);
    return chunked;
  }, [invoice, isTransport]);

  if (!invoice || !profile || !settings) {
    return <div className="p-8">Loading invoice data...</div>;
  }

  return (
    <div ref={rootRef} id={`invoice-pdf-view-${invoice.id}`} className="bg-gray-100 p-4">
      {pages.map((pageRows, pageIndex) => (
        <div 
          key={pageIndex} 
          className="print-page bg-white mb-8 mx-auto shadow-lg" 
          style={{ width: '210mm', minHeight: '297mm' }}
        >
          {/* HEADER SECTION - Repeat on every page */}
          <div className="no-break mb-8">
            <div className="flex justify-between items-start border-b-2 pb-4" style={{ borderColor: brandColor }}>
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
              </div>

              <div className="invoice-info text-right text-xs">
                <h1 className="text-4xl font-bold mb-2" style={{ color: brandColor }}>INVOICE</h1>
                <p><strong>Invoice #:</strong> {`${settings?.invoicePrefix || ''}${invoice.id.substring(0, 6).toUpperCase()}`}</p>
                <p><strong>Date Issued:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                {pages.length > 1 && <p className="text-[10px] text-gray-400 mt-1">Page {pageIndex + 1} of {pages.length}</p>}
              </div>
            </div>

            {/* BILL TO */}
            <div className="mt-8">
              <h3 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">BILL TO</h3>
              <p className="font-bold text-base">{client.name}</p>
              <p>{client.email}</p>
              {client.phone && <p>{client.phone}</p>}
            </div>
          </div>

          {/* ITEMS TABLE */}
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
                    <th className="p-2.5 text-right font-bold uppercase">Price</th>
                    <th className="p-2.5 text-right font-bold uppercase">Total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {isTransport ? (
                (pageRows as any[]).map((trip, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2.5">{trip.date}</td>
                    <td className="p-2.5">{trip.from}</td>
                    <td className="p-2.5">{trip.to}</td>
                    <td className="p-2.5 font-mono text-xs">{trip.container}</td>
                    <td className="p-2.5 text-right font-semibold">R {Number(trip.rate).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                (pageRows as any[]).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2.5 font-medium">{item.description}</td>
                    <td className="p-2.5 text-center">{item.quantity}</td>
                    <td className="p-2.5 text-right">R {Number(item.price).toFixed(2)}</td>
                    <td className="p-2.5 text-right font-semibold">R {(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* TOTALS & FOOTER - Only on last page */}
          {pageIndex === pages.length - 1 && (
            <div className="footer-section">
              <div className="flex justify-end mb-8 totals-section">
                <div className="w-full max-w-[250px]">
                  <div className="flex justify-between border-b border-gray-100 py-2">
                    <span className="text-gray-500 font-bold uppercase">Subtotal</span>
                    <span>R {invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {!isTransport && (
                    <div className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-gray-500 font-bold uppercase">Tax ({profile?.defaultTaxRate || 15}%)</span>
                      <span>R {invoice.tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 py-3 font-bold text-lg" style={{ borderColor: brandColor }}>
                    <span className="uppercase tracking-tighter">Total</span>
                    <span style={{ color: brandColor }}>R {invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 border-t pt-8 no-break">
                <div className="flex justify-between gap-8 text-[10px]">
                  <div className="text-gray-600 max-w-[60%]">
                    <h3 className="text-xs font-bold text-gray-800 mb-1 uppercase tracking-widest">Payment Information</h3>
                    <p className="italic mb-3 text-gray-500">{settings?.paymentTerms || 'Please make payment by the due date.'}</p>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                      <p><strong>Bank:</strong> {profile?.bankName || 'N/A'}</p>
                      <p><strong>Account:</strong> {profile?.accountNumber || 'N/A'}</p>
                      <p><strong>Branch:</strong> {profile?.branchCode || 'N/A'}</p>
                      <p><strong>Ref:</strong> {`${settings?.invoicePrefix || ''}${invoice.id.substring(0, 6).toUpperCase()}`}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col justify-end">
                    <p className="font-bold text-lg italic" style={{ color: brandColor }}>Thank you!</p>
                    {settings?.showWatermark && (
                      <p className="text-[8px] text-gray-300 mt-4 uppercase tracking-tighter">Generated by Dulus Business Manager</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}