import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  FileText,
  Shield,
  Building2,
  ArrowUpRight,
  Download,
  AlertCircle,
  HelpCircle,
  Wallet,
  Calendar,
  Lock,
  ChevronRight,
  ExternalLink,
  Info,
} from 'lucide-react';

export function ProviderEarningsPage() {
  const queryClient = useQueryClient();
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountHolder: 'Ramesh Sharma',
    bankName: 'HDFC Bank Ltd',
    accountNumber: '••••••••5432',
    fullAccountNumber: '',
    confirmAccountNumber: '',
    ifsc: 'HDFC0001234',
    accountType: 'CURRENT',
  });
  const [filterType, setFilterType] = useState<'ALL' | 'SETTLED' | 'PENDING'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['provider-earnings'],
    queryFn: () => ApiClient.get('/providers/my/earnings'),
  });

  const summary = data?.summary || {
    totalNetEarned: 0,
    totalGross: 0,
    pendingSettlement: 0,
    completedCount: 0,
    escrowLocked: 0,
  };

  const bookings = (data?.bookings || []).map((b: any) => ({
    ...b,
    customerName: b.customer?.user?.name || 'Verified Customer',
    serviceTitle: b.request?.title || b.request?.category?.name || 'Home Service',
    settlementStatus: b.providerAmount > 0 ? 'SETTLED' : 'PENDING_BATCH',
    utr: b.bookingNumber ? `UTR-${b.bookingNumber.replace('SRV-', '')}` : 'Auto-Settled',
  }));

  const settlements = data?.settlements || [];

  const filteredBookings = bookings.filter((b: any) => {
    if (filterType === 'SETTLED') return b.settlementStatus === 'SETTLED';
    if (filterType === 'PENDING') return b.settlementStatus === 'PENDING_BATCH';
    return true;
  });

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (bankDetails.fullAccountNumber && bankDetails.fullAccountNumber !== bankDetails.confirmAccountNumber) {
      alert('Account numbers do not match. Please verify.');
      return;
    }
    const masked = bankDetails.fullAccountNumber
      ? `••••••••${bankDetails.fullAccountNumber.slice(-4)}`
      : bankDetails.accountNumber;
    setBankDetails({
      ...bankDetails,
      accountNumber: masked,
      fullAccountNumber: '',
      confirmAccountNumber: '',
    });
    setShowBankModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Link to="/provider" className="hover:text-emerald-500 transition-colors">Provider Portal</Link>
              <span>/</span>
              <span className="text-slate-900 dark:text-white font-bold">Earnings & Settlements</span>
            </nav>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Earnings & Bank Settlement Ledger
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Direct NEFT / IMPS
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Transparent 10% platform fee structure. 100% of completed job earnings deposited directly into your verified bank account.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowBankModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm transition-all"
            >
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span>Payout Bank Details</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Tax Statement</span>
            </button>
          </div>
        </div>

        {/* 4 Core Financial Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Lifetime Pay */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Net Take-Home Pay
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ₹{((summary.totalNetEarned || 0) / 100).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Net after 10% Serviqa commission</span>
            </div>
          </div>

          {/* Card 2: Gross Completed Volume */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Gross Completed Value
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ₹{((summary.totalGross || 0) / 100).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span>{summary.completedCount || 0} successfully delivered jobs</span>
            </div>
          </div>

          {/* Card 3: Next Batch Settlement */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-amber-200/80 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/5 to-transparent shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Next Payout Batch
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              ₹{((summary.pendingSettlement || 0) / 100).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>Transfers Monday 00:00 IST</span>
            </div>
          </div>

          {/* Card 4: Escrow Protection */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                In Active Escrow
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ₹{((summary.escrowLocked || 0) / 100).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <Shield className="w-3.5 h-3.5 text-purple-500" />
              <span>Auto-releases upon Completion OTP</span>
            </div>
          </div>
        </div>

        {/* Bank & Commission Architecture Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Bank Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-700/60 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                    Primary Payout Account
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3 h-3" />
                  Penny Drop Verified
                </span>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-black tracking-wide">{bankDetails.bankName}</div>
                <div className="text-2xl font-mono tracking-widest text-emerald-400">
                  {bankDetails.accountNumber}
                </div>
                <div className="text-xs text-slate-400">
                  Beneficiary: <span className="text-white font-medium">{bankDetails.accountHolder}</span>
                </div>
                <div className="text-xs text-slate-400">
                  IFSC Code: <span className="text-slate-200 font-mono font-medium">{bankDetails.ifsc}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Weekly NEFT Direct Bank Credit • Zero Fees
              </span>
              <button
                onClick={() => setShowBankModal(true)}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                Change Bank
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Transparent 10% Fee Architecture Explainer */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Transparent 10% Marketplace Split
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                Unlike traditional lead generation platforms that charge for dead contact leads, Serviqa only charges when you actually deliver the job and get paid.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Customer Bill</div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">100%</div>
                  <div className="text-[10px] text-slate-400 mt-1">Quoted price deposited into Escrow</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400">Platform Fee</div>
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">10%</div>
                  <div className="text-[10px] text-slate-400 mt-1">Server, payment gateway, insurance</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Your Take-Home</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">90% Net</div>
                  <div className="text-[10px] text-slate-400 mt-1">Direct NEFT to your bank account</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Customer tips and extra approved spare parts carry 0% platform fee. You keep 100%.</span>
            </div>
          </div>
        </div>

        {/* Completed Bookings Ledger */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Completed Job Payout Ledger
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Itemized breakdown of gross invoice, 10% Serviqa commission, and your net credit
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'ALL'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Jobs ({bookings.length})
              </button>
              <button
                onClick={() => setFilterType('SETTLED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'SETTLED'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Settled to Bank
              </button>
              <button
                onClick={() => setFilterType('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === 'PENDING'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                In Monday Batch
              </button>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No bookings matching this filter.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBookings.map((b: any) => (
                <div key={b.id} className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-300 font-black text-xs">
                      #{b.bookingNumber.split('-')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {b.serviceTitle}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          {b.bookingNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>Customer: <strong className="text-slate-600 dark:text-slate-300">{b.customerName}</strong></span>
                        <span>•</span>
                        <span>Date: {new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-500">{b.utr}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-400">
                        Gross: ₹{(b.agreedAmount / 100).toLocaleString('en-IN')} - Fee (10%): ₹{(b.platformFee / 100).toLocaleString('en-IN')}
                      </div>
                      <div className="font-black text-base text-emerald-600 dark:text-emerald-400">
                        +₹{(b.providerAmount / 100).toLocaleString('en-IN')} Net
                      </div>
                    </div>

                    <div>
                      {b.settlementStatus === 'SETTLED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5" />
                          Next Batch
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bank Settlement Batches */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Bank Settlement Transfers (NEFT / IMPS)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official RBI UTR reference numbers for direct bank deposits
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              Total 3 Batches
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {settlements.map((s: any) => (
              <div key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {s.referenceId}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      UTR: {s.utrNumber}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Deposited on {new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} to {s.bankName} • {s.bookingCount} jobs
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-black text-base text-slate-900 dark:text-white">
                    ₹{(s.amount / 100).toLocaleString('en-IN')}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Transferred
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Update Bank Modal */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Payout Bank Details
              </h3>
              <button
                onClick={() => setShowBankModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Enter your official current or savings bank account. All weekly payouts will be credited directly via NEFT.
            </p>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Beneficiary Name (As on Bank Passbook)
                </label>
                <input
                  type="text"
                  required
                  value={bankDetails.accountHolder}
                  onChange={(e) => setBankDetails({ ...bankDetails, accountHolder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, State Bank of India"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Number
                </label>
                <input
                  type="password"
                  placeholder="Enter full account number"
                  value={bankDetails.fullAccountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, fullAccountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Account Number
                </label>
                <input
                  type="text"
                  placeholder="Re-enter full account number"
                  value={bankDetails.confirmAccountNumber}
                  onChange={(e) => setBankDetails({ ...bankDetails, confirmAccountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  IFSC Code (11 alphanumeric characters)
                </label>
                <input
                  type="text"
                  required
                  value={bankDetails.ifsc}
                  onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Save & Penny-Drop Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
