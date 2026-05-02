'use client';
import { Client, BusinessProfile, InvoiceSettings, Invoice } from '@/lib/types';
import { Building } from 'lucide-react';

interface InvoicePDFViewProps {
  client: Client;
  invoice: Invoice;
  profile: BusinessProfile;
  settings: InvoiceSettings;
}

export function InvoicePDFView({ client, invoice, profile, settings }: InvoicePDFViewProps) {
  const brandColor = settings?.brandColor || '#2B579A';
  const isTransport = invoice.type === 'transport';

  return (
    <div className="bg-white p-10 text-black w-full max-w-[800px] mx-auto shadow-none">
      <div className="flex justify-between items-start border-b-2 pb-6 mb-8" style={{ borderColor: brandColor }}>
        <div>
          {settings?.companyLogoUrl ? (
            <img src={settings.companyLogoUrl} alt="Logo" className="h-16 w-auto mb-4 object-contain" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 mb-4">
              <Building className="h-8 w-8 text-gray-400" />
            </div>
          )}
          <h2 className="text-2xl font-bold uppercase">{profile.companyName || 'Your Business'}</h2>
          <p className="text-sm text-gray-600 leading-tight max-w-[300px]">{profile.businessAddress}</p>
          <p className="text-sm text-gray-600">Email: {profile.businessEmail}</p>
          <p className="text-sm text-gray-600">Phone: {profile.businessPhone}</p>
        </div>

        <div className="text-right">
          <h1 className="text-5xl font-black mb-4 tracking-tighter" style={{ color: brandColor }}>INVOICE</h1>
          <p className="text-sm font-bold"># {settings?.invoicePrefix || ''}{invoice.id.substring(0, 6).toUpperCase()}</p>
          <p className="text-sm">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
          <p className="text-sm">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bill To:</h3>
        <p className="text-lg font-bold">{client.name}</p>
        <p className="text-sm text-gray-600">{client.email}</p>
        {client.phone && <p className="text-sm text-gray-600">{client.phone}</p>}
      </div>

      <table className="w-full text-left border-collapse mb-8">
        <thead>
          <tr className="text-white" style={{ backgroundColor: brandColor }}>
            {isTransport ? (
              <>
                <th className="p-3 text-sm font-bold">Date</th>
                <th className="p-3 text-sm font-bold">From</th>
                <th className="p-3 text-sm font-bold">To</th>
                <th className="p-3 text-sm font-bold">Container</th>
                <th className="p-3 text-right text-sm font-bold">Rate</th>
              </>
            ) : (
              <>
                <th className="p-3 text-sm font-bold">Description</th>
                <th className="p-3 text-center text-sm font-bold">Qty</th>
                <th className="p-3 text-right text-sm font-bold">Price</th>
                <th className="p-3 text-right text-sm font-bold">Total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {isTransport ? (
            invoice.trips?.map((trip, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="p-3 text-sm">{trip.date}</td>
                <td className="p-3 text-sm">{trip.from}</td>
                <td className="p-3 text-sm">{trip.to}</td>
                <td className="p-3 text-sm font-mono">{trip.container}</td>
                <td className="p-3 text-right text-sm font-semibold">R {Number(trip.rate).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            invoice.items?.map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="p-3 text-sm font-medium">{item.description}</td>
                <td className="p-3 text-center text-sm">{item.quantity}</td>
                <td className="p-3 text-right text-sm">R {Number(item.price).toFixed(2)}</td>
                <td className="p-3 text-right text-sm font-semibold">R {(item.quantity * item.price).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="footer-section">
        <div className="flex justify-end mb-12">
          <div className="w-full max-w-[300px]">
            <div className="flex justify-between py-2 text-sm border-b border-gray-100">
              <span className="text-gray-600 font-bold uppercase">Subtotal</span>
              <span className="font-bold">R {Number(invoice.subtotal).toFixed(2)}</span>
            </div>
            {!isTransport && (
              <div className="flex justify-between py-2 text-sm border-b border-gray-100">
                <span className="text-gray-600 font-bold uppercase">Tax ({profile.defaultTaxRate || 15}%)</span>
                <span className="font-bold">R {Number(invoice.tax).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-4 text-xl border-b-2" style={{ borderColor: brandColor }}>
              <span className="font-black uppercase tracking-tighter">Total</span>
              <span className="font-black" style={{ color: brandColor }}>R {Number(invoice.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <div className="grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Banking Details</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-700">
                <p><strong>Bank:</strong> {profile.bankName || 'N/A'}</p>
                <p><strong>Acc:</strong> {profile.accountNumber || 'N/A'}</p>
                <p><strong>Branch:</strong> {profile.branchCode || 'N/A'}</p>
                <p><strong>Ref:</strong> {settings?.invoicePrefix || ''}{invoice.id.substring(0, 6).toUpperCase()}</p>
              </div>
            </div>
            <div className="text-right flex flex-col justify-end">
              <p className="text-lg font-bold italic" style={{ color: brandColor }}>Thank you!</p>
              {settings?.showWatermark && (
                <p className="text-[10px] text-gray-300 mt-2 uppercase">Generated by Dulus Business Manager</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
