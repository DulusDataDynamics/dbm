
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
    if (!invoice || !profile || !settings) {
        return <div className="p-8">Loading invoice data...</div>;
    }
    
    const brandColor = settings?.brandColor || '#2B579A';

  return (
    <div id={`invoice-pdf-view-${invoice.id}`} className="p-8 bg-white text-gray-800 font-sans text-sm shadow-lg" style={{width: '210mm', minHeight: '297mm', position: 'relative'}}>
        {/* Header */}
        <header className="flex justify-between items-start mb-8 border-b-2 pb-4" style={{borderColor: brandColor}}>
            <div className="company-info text-xs">
                {settings?.companyLogoUrl ? (
                    <img src={settings.companyLogoUrl} alt="Company Logo" className="w-24 h-auto mb-2 object-contain" />
                ) : (
                    <div className="w-20 h-20 mb-2 bg-gray-100 flex items-center justify-center rounded">
                        <Building className="w-10 h-10 text-gray-400" />
                    </div>
                )}
                <h2 className="text-xl font-bold text-gray-900">{profile?.companyName || "Your Company"}</h2>
                <p>{profile?.businessAddress}</p>
                <p>Email: {profile?.businessEmail}</p>
                <p>Phone: {profile?.businessPhone}</p>
                {profile?.website && <p>Website: {profile.website}</p>}
                {profile?.taxNumber && <p>TAX/VAT No: {profile.taxNumber}</p>}
            </div>
            <div className="invoice-info text-right text-xs">
                <h1 className="text-4xl font-bold mb-2" style={{color: brandColor}}>INVOICE</h1>
                <p><strong>Invoice #:</strong> {`${settings?.invoicePrefix || ''}${invoice.id.substring(0,6).toUpperCase()}`}</p>
                <p><strong>Date Issued:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
        </header>

        {/* Bill To */}
        <div className="bill-to my-8">
            <h3 className="text-sm font-bold text-gray-500 mb-1">BILL TO</h3>
            <p className="font-bold">{client.name}</p>
            <p>{client.email}</p>
            {client.phone && <p>{client.phone}</p>}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-8 text-sm">
            <thead>
                <tr style={{backgroundColor: brandColor}} className="text-white">
                    <th className="p-2.5 text-left font-bold">Description</th>
                    <th className="p-2.5 text-center font-bold">Qty</th>
                    <th className="p-2.5 text-right font-bold">Unit Price</th>
                    <th className="p-2.5 text-right font-bold">Total</th>
                </tr>
            </thead>
            <tbody>
                {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                        <td className="p-2.5">{item.description}</td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-right">R {item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right">R {(item.quantity * item.price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
             <div className="w-1/2">
                <table className="w-full text-sm">
                    <tbody>
                        <tr>
                            <td className="p-2 text-right font-bold">Subtotal:</td>
                            <td className="p-2 text-right">R {invoice.subtotal.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                         <tr>
                            <td className="p-2 text-right font-bold">Tax ({profile.defaultTaxRate || 0}%):</td>
                            <td className="p-2 text-right">R {invoice.tax.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="border-t-2 font-bold text-lg" style={{borderColor: brandColor}}>
                            <td className="p-2 text-right">Total:</td>
                            <td className="p-2 text-right">R {invoice.total.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* Fixed Footer */}
        <div className="absolute bottom-8 left-8 right-8 text-xs">
            <div className="flex justify-between gap-8 border-t pt-4">
                 {/* Payment Instructions & Banking */}
                <div className="text-gray-600">
                    <h3 className="text-sm font-bold text-gray-800 mb-1">Payment Information</h3>
                    <p className="italic mb-2">{settings?.paymentTerms || 'Please make payment by the due date.'}</p>

                    <p><strong>Bank:</strong> {profile?.bankName || 'N/A'}</p>
                    <p><strong>Account Holder:</strong> {profile?.accountHolder || 'N/A'}</p>
                    <p><strong>Account Number:</strong> {profile?.accountNumber || 'N/A'}</p>
                    <p><strong>Branch Code:</strong> {profile?.branchCode || 'N/A'}</p>
                    <p><strong>Reference:</strong> {`${settings?.invoicePrefix || ''}${invoice.id.substring(0,6).toUpperCase()}`}</p>
                </div>
                 {/* Thank you note */}
                <div className="text-right">
                    <p className="font-bold text-lg" style={{color: brandColor}}>Thank you!</p>
                </div>
            </div>
            {settings?.showWatermark && (
                <p className="text-center text-gray-400 text-xs mt-4">
                    Generated by Dulus Business Manager © {new Date().getFullYear()} Dulus Data Dynamics
                </p>
            )}
        </div>
    </div>
  );
}
