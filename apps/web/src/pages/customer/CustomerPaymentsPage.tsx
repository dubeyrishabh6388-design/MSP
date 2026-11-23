import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '../../api/client';
import {
  ShieldCheck,
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Receipt,
  Sparkles,
  Lock,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface MockTransaction {
  id: string;
  bookingId: string;
  serviceTitle: string;
  providerName: string;
  date: string;
  amount: number;
  status: 'IN_ESCROW' | 'RELEASED' | 'REFUNDED';
  method: string;
  taxInvoiceNo: string;
  baseAmount: number;
  partsAmount: number;
  gstAmount: number;
  address: string;
}

export function CustomerPaymentsPage() {
  const [filter, setFilter] = useState<'ALL' | 'IN_ESCROW' | 'RELEASED' | 'REFUNDED'>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<MockTransaction | null>(null);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => ApiClient.get('/bookings'),
  });

  const transactions: MockTransaction[] = (bookings || []).map((b: any) => {
    const isCompleted = b.status === 'COMPLETED';
    const isRefunded = b.status === 'REFUNDED';
    const status: 'IN_ESCROW' | 'RELEASED' | 'REFUNDED' = isCompleted
      ? 'RELEASED'
      : isRefunded
      ? 'REFUNDED'
      : 'IN_ESCROW';

    const baseAmount = Math.round(b.agreedAmount / 1.18);
    const gstAmount = b.agreedAmount - baseAmount;
    const formattedDate = b.createdAt
      ? new Date(b.createdAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Recent';

    const addrStr = b.address
      ? `${b.address.addressLine}, ${b.address.city} - ${b.address.postalCode}`
      : 'Registered Address';

    return {
      id: b.payment?.id || `tx-${b.id}`,
      bookingId: b.bookingNumber || `SRV-${b.id.substring(0, 8)}`,
      serviceTitle: b.request?.title || b.request?.category?.name || 'Home Service Execution',
      providerName: b.provider?.businessName || b.provider?.user?.name || 'Verified Partner',
      date: formattedDate,
      amount: b.agreedAmount,
      baseAmount,
      partsAmount: 0,
      gstAmount,
      status,
      method: b.payment?.paymentGateway ? `${b.payment.paymentGateway.replace('_', ' ')}` : 'Secured Escrow Gateway',
      taxInvoiceNo: `INV-${b.bookingNumber?.replace('SRV-', '') || b.id.substring(0, 6)}`,
      address: addrStr,
    };
  });

  // Calculate live metrics
  const totalInEscrow = transactions
    .filter((t) => t.status === 'IN_ESCROW')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalReleased = transactions
    .filter((t) => t.status === 'RELEASED')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider mb-1">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Financial Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Escrow Payments & Tax Invoices
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track payments held securely in platform escrow, settlements released to technicians, and download official GST invoices.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Escrow Protected Banking</span>
          </div>
        </div>

        {/* 3-Layer Security Guarantee Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-black uppercase tracking-wider border border-brand-500/30">
              <Lock className="w-3 h-3 text-brand-400" />
              <span>How Serviqa Escrow Protects You</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Zero Upfront Risk: Payment Released Only After Satisfied Completion
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              When you book, your payment is placed safely in platform escrow. The technician cannot access the funds until on-site work is completed to your satisfaction and verified with your secret 4-digit completion OTP.
            </p>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
              Currently in Escrow
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-500">
                ₹{(totalInEscrow / 100).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
                Protected
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
              Funds locked safely pending job completion
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
              Released to Providers
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{(totalReleased / 100).toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                Settled
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
              Released following verified completion OTPs
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
              Refunds & Reversals
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ₹0.00
              </span>
              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Clean Record
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block pt-1">
              No dispute deductions or penalty charges
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {(['ALL', 'IN_ESCROW', 'RELEASED', 'REFUNDED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === tab
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {tab === 'ALL' && 'All Transactions'}
              {tab === 'IN_ESCROW' && 'Held in Escrow'}
              {tab === 'RELEASED' && 'Settled to Pro'}
              {tab === 'REFUNDED' && 'Refunds'}
            </button>
          ))}
        </div>

        {/* Transactions Table / Cards */}
        <div className="space-y-3">
          {filteredTransactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-xs font-black text-slate-400 dark:text-slate-500">
                    Booking #{tx.bookingId}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {tx.date}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  {tx.status === 'IN_ESCROW' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      In Escrow
                    </span>
                  )}
                  {tx.status === 'RELEASED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid & Settled
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {tx.serviceTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    Provider: <span className="font-bold text-slate-700 dark:text-slate-300">{tx.providerName}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  <span>Paid via {tx.method}</span>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Total Invoiced
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    ₹{(tx.amount / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInvoice(tx)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  <span>View Tax Invoice</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          PRINTABLE GST TAX INVOICE MODAL
      ───────────────────────────────────────────────────────────── */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase text-brand-600 dark:text-brand-400 tracking-wider">
                Official GST Tax Receipt
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div className="p-6 bg-slate-50/70 dark:bg-slate-850/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-6 text-xs text-slate-700 dark:text-slate-300">
              {/* Brand Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Serviqa Technologies Pvt Ltd
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    GSTIN: 27AABCS9912Q1Z9 • CIN: U72900MH2026PTC109482
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Bandra Kurla Complex, Mumbai, Maharashtra - 400051
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-slate-900 dark:text-white block">
                    {selectedInvoice.taxInvoiceNo}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Date: {selectedInvoice.date.split(',')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Status: {selectedInvoice.status === 'RELEASED' ? 'Paid & Settled' : 'Held in Escrow'}
                  </span>
                </div>
              </div>

              {/* Customer & Provider Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    Billed To Customer
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">Rahul Sharma</p>
                  <p className="text-[11px] text-slate-500">{selectedInvoice.address}</p>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block mb-1">
                    Assigned Verified Provider
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">{selectedInvoice.providerName}</p>
                  <p className="text-[11px] text-slate-500">Service Reference: #{selectedInvoice.bookingId}</p>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-extrabold text-slate-500">
                    <tr>
                      <th className="p-3">Service Description</th>
                      <th className="p-3 text-right">Taxable Value</th>
                      <th className="p-3 text-right">GST (18%)</th>
                      <th className="p-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {selectedInvoice.serviceTitle}
                      </td>
                      <td className="p-3 text-right">
                        ₹{(selectedInvoice.baseAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right">
                        ₹{(selectedInvoice.gstAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right font-bold text-slate-900 dark:text-white">
                        ₹{(selectedInvoice.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 text-[11px] text-slate-500">
                        Platform Escrow Protection & Trust Guarantee
                      </td>
                      <td className="p-3 text-right">₹0.00</td>
                      <td className="p-3 text-right">₹0.00</td>
                      <td className="p-3 text-right font-bold text-emerald-600">FREE</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <tr>
                      <td colSpan={3} className="p-3 text-right text-xs font-black text-slate-900 dark:text-white">
                        Total Amount Paid:
                      </td>
                      <td className="p-3 text-right text-sm font-black text-brand-600 dark:text-brand-400">
                        ₹{(selectedInvoice.amount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Escrow Guarantee Statement */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 flex items-center justify-between">
                <span>Payment Mode: {selectedInvoice.method}</span>
                <span>This is a computer-generated tax invoice verified by Serviqa Escrow Ledger.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
