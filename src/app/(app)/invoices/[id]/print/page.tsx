'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Client, Invoice, BusinessProfile, InvoiceSettings } from '@/lib/types';
import { getBusinessProfile, getInvoiceSettings } from '@/lib/firestore';
import { Building, Loader2 } from 'lucide-react';

export default function PrintInvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const db = useFirestore();

  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid || !db || !id) return;

      try {
        const invoiceRef = doc(db, 'users', user.uid, 'invoices', id);
        const invoiceSnap = await getDoc(invoiceRef);

        if (invoiceSnap.exists()) {
          const invData = { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;
          setInvoice(invData);

          const clientRef = doc(db, 'users', user.uid, 'clients', invData.clientId);
          const clientSnap = await getDoc(clientRef);
          if (clientSnap.exists()) {
            setClient({ id: clientSnap.id, ...clientSnap.data() } as Client);
          }

          const prof = await getBusinessProfile(db, user.uid);
          setProfile(prof);

          const sett = await getInvoiceSettings(db, user.uid);
          setSettings(sett);
        }
      } catch (error) {
        console.error('Error fetching print data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, user?.uid, db]);

  useEffect(() => {
    if (!loading && invoice && client && profile) {
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, invoice, client, profile]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Preparing print layout...</span>
      </div>
    );
  }

  if (!invoice || !client || !profile || !settings) {
    return <div className="p-10 text-center">Invoice not found.</div>;
  }

  const brandColor = settings.brandColor || '#2B579A';
  const isTransport = invoice.type === 'transport';
  
  // 🔥 MANUAL PAGINATION (Chunking)
  const rowsPerPage = 12;
  const itemsToPaginate = isTransport ? (invoice.trips || []) : (invoice.items || []);
  const pages = [];
  
  if (itemsToPaginate.length === 0) {
    pages.push([]); // Ensure at least one page renders
  } else {
    for (let i = 0; i < itemsToPaginate.length; i += rowsPerPage) {
      pages.push(itemsToPaginate.slice(i, i + rowsPerPage));
    }
  }

  return (
    <div className="bg-white min-h-screen text-black">
      {pages.map((chunk, pageIndex) => {
        const isLastPage = pageIndex === pages.length - 1;
        
        return (
          <div key={pageIndex} className="print-page p-10 mx-auto max-w-4xl">
            {/* TOP SECTION: Header + Table */}
            <div>
              <div className="flex justify-between items-start border-b-2 pb-6 mb-8" style={{ borderColor: brandColor }}>
                <div>
                  {settings.companyLogoUrl ? (
                    <img src={settings.companyLogoUrl} alt="Logo" className="h-16 w-auto mb-4" />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-100 mb-4">
                      <Building className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <h1 className="text-2xl font-bold uppercase">{profile.companyName || 'Your Business'}</h1>
                  <p className="text-sm text-gray-600">{profile.businessAddress}</p>
                  <p className="text-sm text-gray-600">Email: {profile.businessEmail}</p>
                  <p className="text-sm text-gray-600">Phone: {profile.businessPhone}</p>
                </div>

                <div className="text-right">
                  <h2 className="text-5xl font-black mb-4 tracking-tighter" style={{ color: brandColor }}>INVOICE</h2>
                  <p className="text-sm font-bold"># {settings.invoicePrefix || ''}{invoice.id.substring(0, 6).toUpperCase()}</p>
                  <p className="text-sm">Date: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm">Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500 mt-1">Page {pageIndex + 1} of {pages.length}</p>
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
                    (chunk as any[]).map((trip, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="p-3 text-sm">{trip.date}</td>
                        <td className="p-3 text-sm">{trip.from}</td>
                        <td className="p-3 text-sm">{trip.to}</td>
                        <td className="p-3 text-sm font-mono">{trip.container}</td>
                        <td className="p-3 text-right text-sm font-semibold">R {Number(trip.rate).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    (chunk as any[]).map((item, i) => (
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
            </div>

            {/* BOTTOM SECTION: Totals + Banking */}
            {isLastPage ? (
              <div className="footer-section mt-auto">
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
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="font-bold text-gray-900">Bank: <span className="font-normal text-gray-600">{profile.bankName || 'N/A'}</span></p>
                          <p className="font-bold text-gray-900">Account: <span className="font-normal text-gray-600">{profile.accountNumber || 'N/A'}</span></p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Branch: <span className="font-normal text-gray-600">{profile.branchCode || 'N/A'}</span></p>
                          <p className="font-bold text-gray-900">Ref: <span className="font-normal text-gray-600">{settings.invoicePrefix || ''}{invoice.id.substring(0, 6).toUpperCase()}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-end">
                      <p className="text-lg font-bold italic" style={{ color: brandColor }}>Thank you for your business!</p>
                      {settings.showWatermark && (
                        <p className="text-[10px] text-gray-300 mt-4 uppercase">Generated by Dulus Business Manager</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-auto h-20 flex items-center justify-center border-t border-dashed">
                <p className="text-xs text-gray-400 uppercase tracking-widest italic">Continued on next page...</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
