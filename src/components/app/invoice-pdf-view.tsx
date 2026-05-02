'use client';
import { Client, BusinessProfile, InvoiceSettings, Invoice } from '@/lib/types';
import { Building } from 'lucide-react';

interface InvoicePDFViewProps {
  client: Client;
  invoice: Invoice;
  profile: BusinessProfile;
  settings: InvoiceSettings;
  onReady?: () => void;
}

export function InvoicePDFView({ client, invoice, profile, settings, onReady }: InvoicePDFViewProps) {
  const brandColor = settings?.brandColor || '#2B579A';
  const isTransport = invoice.type === 'transport';
  const rowsPerPage = 12;

  // Manual pagination logic
  const itemsToPaginate = isTransport ? (invoice.trips || []) : (invoice.items || []);
  const pages = [];
  for (let i = 0; i < Math.max(1, itemsToPaginate.length); i += rowsPerPage) {
    pages.push(itemsToPaginate.slice(i, i + rowsPerPage));
  }

  return (
    <div className="bg-gray-100 p-8 space-y-8 no-shadow" onLoad={() => onReady?.()}>
      {pages.map((chunk, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;

        return (
          <div key={pageIndex} className="print-page bg-white p-8 text-black shadow-lg mx-auto">
            {/* WRAPPER FOR TOP CONTENT (needed for justify-between) */}
            <div>
              <div className="flex justify-between items-start border-b-2 pb-4 mb-6" style={{ borderColor: brandColor }}>
                <div>
                  {settings?.companyLogoUrl ? (
                    <img src={settings.companyLogoUrl} alt="Logo" className="h-12 w-auto mb-4 object-contain" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100 mb-4">
                      <Building className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <h2 className="text-lg font-bold uppercase">{profile.companyName || 'Your Business'}</h2>
                  <p className="text-[10px] text-gray-600 leading-tight max-w-[250px]">{profile.businessAddress}</p>
                  <p className="text-[10px] text-gray-600">Email: {profile.businessEmail}</p>
                  <p className="text-[10px] text-gray-600">Phone: {profile.businessPhone}</p>
                </div>

                <div className="text-right">
                  <h1 className="text-3xl font-black mb-2 tracking-tighter" style={{ color: brandColor }}>INVOICE</h1>
                  <p className="text-xs font-bold"># {settings?.invoicePrefix || ''}{invoice.id.substring(0, 6).toUpperCase()}</p>
                  <p className="text-xs">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Page {pageIndex + 1} of {pages.length}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Bill To:</h3>
                <p className="text-base font-bold">{client.name}</p>
                <p className="text-xs text-gray-600">{client.email}</p>
                {client.phone && <p className="text-xs text-gray-600">{client.phone}</p>}
              </div>

              <table className="w-full text-left border-collapse mb-8">
                <thead>
                  <tr className="text-white" style={{ backgroundColor: brandColor }}>
                    {isTransport ? (
                      <>
                        <th className="p-2 text-xs font-bold">Date</th>
                        <th className="p-2 text-xs font-bold">From</th>
                        <th className="p-2 text-xs font-bold">To</th>
                        <th className="p-2 text-xs font-bold">Container</th>
                        <th className="p-2 text-right text-xs font-bold">Rate</th>
                      </>
                    ) : (
                      <>
                        <th className="p-2 text-xs font-bold">Description</th>
                        <th className="p-2 text-center text-xs font-bold">Qty</th>
                        <th className="p-2 text-right text-xs font-bold">Price</th>
                        <th className="p-2 text-right text-xs font-bold">Total</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {isTransport ? (
                    (chunk as any[]).map((trip, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="p-2 text-[10px]">{trip.date}</td>
                        <td className="p-2 text-[10px]">{trip.from}</td>
                        <td className="p-2 text-[10px]">{trip.to}</td>
                        <td className="p-2 text-[10px] font-mono">{trip.container}</td>
                        <td className="p-2 text-right text-[10px] font-semibold">R {Number(trip.rate).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    (chunk as any[]).map((item, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="p-2 text-[10px] font-medium">{item.description}</td>
                        <td className="p-2 text-center text-[10px]">{item.quantity}</td>
                        <td className="p-2 text-right text-[10px]">R {Number(item.price).toFixed(2)}</td>
                        <td className="p-2 text-right text-[10px] font-semibold">R {(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER SECTION pinned at bottom */}
            {isLastPage ? (
              <div className="footer-section">
                <div className="flex justify-end mb-6">
                  <div className="w-full max-w-[200px]">
                    <div className="flex justify-between py-1 text-[10px] border-b border-gray-50">
                      <span className="text-gray-500 font-bold uppercase">Subtotal</span>
                      <span className="font-bold text-gray-900">R {Number(invoice.subtotal).toFixed(2)}</span>
                    </div>
                    {!isTransport && (
                      <div className="flex justify-between py-1 text-[10px] border-b border-gray-50">
                        <span className="text-gray-500 font-bold uppercase">Tax ({profile.defaultTaxRate || 15}%)</span>
                        <span className="font-bold text-gray-900">R {Number(invoice.tax).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 text-base border-t border-gray-200 mt-2">
                      <span className="font-black uppercase tracking-tighter text-gray-900">Total</span>
                      <span className="font-black text-gray-900" style={{ color: brandColor }}>R {Number(invoice.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-[9px]">
                      <h4 className="font-bold text-gray-400 uppercase tracking-widest mb-2">Banking Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-gray-600">
                         <p><strong>Bank:</strong> {profile.bankName || 'N/A'}</p>
                         <p><strong>Account:</strong> {profile.accountNumber || 'N/A'}</p>
                         <p><strong>Branch:</strong> {profile.branchCode || 'N/A'}</p>
                         <p><strong>Ref:</strong> {settings?.invoicePrefix || ''}{invoice.id.substring(0, 6).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-end">
                      <p className="text-sm font-bold italic" style={{ color: brandColor }}>Thank you!</p>
                      {settings?.showWatermark && (
                        <p className="text-[8px] text-gray-300 mt-2">Generated by Dulus Business Manager</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
               <div className="mt-auto py-2 border-t border-dashed flex justify-center">
                 <p className="text-[9px] text-gray-400 uppercase italic tracking-widest">Continued on page {pageIndex + 2}...</p>
               </div>
            )}
          </div>
        );
      })}
    </div>
  );
}