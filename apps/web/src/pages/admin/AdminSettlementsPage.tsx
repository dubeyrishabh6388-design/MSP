import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import { Modal } from '../../components/common/Modal';
import {
  DollarSign,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Send,
  Calendar,
  Filter,
  Download,
  CreditCard,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

export function AdminSettlementsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'PROCESSED'>('ALL');
  const [selectedSettlement, setSelectedSettlement] = useState<any>(null);
  const [processModalOpen, setProcessModalOpen] = useState(false);

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ['admin-settlements'],
    queryFn: () => ApiClient.get('/admin/settlements'),
  });

  const processMutation = useMutation({
    mutationFn: (settlementId: string) => ApiClient.post(`/admin/settlements/${settlementId}/process`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settlements'] });
      setProcessModalOpen(false);
      setSelectedSettlement(null);
    },
  });

  const handleProcessClick = (s: any) => {
    setSelectedSettlement(s);
    setProcessModalOpen(true);
  };

  const handleConfirmDisbursement = () => {
    if (!selectedSettlement) return;
    processMutation.mutate(selectedSettlement.id);
  };

  const displaySettlements = settlements || [];

  const filteredSettlements = displaySettlements.filter((s: any) => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  const totalProcessed = displaySettlements
    .filter((s: any) => s.status === 'PROCESSED')
    .reduce((acc: number, s: any) => acc + s.amount, 0);

  const pendingAmount = displaySettlements
    .filter((s: any) => s.status === 'PENDING')
    .reduce((acc: number, s: any) => acc + s.amount, 0);

  const platformRetainedFee = Math.round((totalProcessed + pendingAmount) * 0.1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin" className="hover:text-purple-500 transition-colors">Platform Command</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Bank Settlements & NEFT</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Bank Settlements & NEFT Batches
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Weekly Monday Schedule
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Process automated weekly disbursements from customer escrow into verified partner bank accounts.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-purple-600 shadow-sm transition-all self-start sm:self-auto"
          >
            <Download className="w-4 h-4 text-purple-500" />
            <span>Export Bank Disbursement File</span>
          </button>
        </div>

        {/* 4 Financial Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Total Settled Volume
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              ₹{(totalProcessed / 100).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
              Deposited via NEFT/IMPS
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-amber-200 dark:border-amber-900/60 shadow-sm bg-gradient-to-br from-amber-500/5 to-transparent">
            <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
              Pending Monday Batch
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
              ₹{(pendingAmount / 100).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold block mt-0.5">
              Awaiting batch dispatch
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Retained Platform Fee (10%)
            </span>
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              ₹{(platformRetainedFee / 100).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Net company revenue
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Settlement Turnaround
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              T+2 Days
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
              Escrow release to bank
            </span>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Batch Status:
            </span>
            {(['ALL', 'PENDING', 'PROCESSED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All Batches' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Showing {filteredSettlements.length} settlement records
          </span>
        </div>

        {/* Settlements Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-xs text-slate-400 animate-pulse">Loading settlements...</div>
          ) : (
            <>
              {/* Mobile Card View (md:hidden) */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSettlements.map((s: any) => (
                  <div key={s.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {s.referenceId || 'NEFT-SRV-BATCH'}
                      </span>
                      {s.status === 'PROCESSED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Transferred
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3 h-3" />
                          Queued
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-slate-900 dark:text-white text-sm block">
                        {s.provider?.businessName || s.provider?.user?.name || 'Verified Partner'}
                      </span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {s.provider?.user?.email} • {s.provider?.user?.phone}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Disbursement</span>
                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(s.amount / 100).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {s.status === 'PENDING' ? (
                      <button
                        type="button"
                        onClick={() => handleProcessClick(s)}
                        className="w-full py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Process & Issue UTR</span>
                      </button>
                    ) : (
                      <div className="text-center py-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        ✓ Payout Confirmed (RBI NEFT)
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View (hidden md:block) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-6 font-black">Disbursement Batch</th>
                      <th className="py-4 px-6 font-black">Partner & Business</th>
                      <th className="py-4 px-6 font-black">Disbursement Amount</th>
                      <th className="py-4 px-6 font-black">Batch Status</th>
                      <th className="py-4 px-6 font-black">Date</th>
                      <th className="py-4 px-6 font-black text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSettlements.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white block text-xs">
                              {s.referenceId || 'NEFT-SRV-BATCH'}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              ID: {s.id}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 dark:text-white text-sm block">
                              {s.provider?.businessName || s.provider?.user?.name || 'Verified Partner'}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {s.provider?.user?.email} • {s.provider?.user?.phone}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                            ₹{(s.amount / 100).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            Net Provider Credit (100% Escrow Released)
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          {s.status === 'PROCESSED' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Transferred (RBI NEFT)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                              <Clock className="w-3.5 h-3.5" />
                              Queued for Monday
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-slate-400 font-medium">
                          {new Date(s.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="py-4 px-6 text-right">
                          {s.status === 'PENDING' ? (
                            <button
                              onClick={() => handleProcessClick(s)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Process & Issue UTR</span>
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓ Payout Confirmed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Process Payout Modal */}
      {selectedSettlement && (
        <Modal
          isOpen={processModalOpen}
          onClose={() => setProcessModalOpen(false)}
          title="Confirm Bank NEFT Disbursement"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">Direct Bank Transfer Instruction</span>
              <p className="text-[11px] mt-1 leading-relaxed">
                Confirming will generate an RBI UTR batch reference number, clear customer escrow funds, and issue immediate NEFT credit to {selectedSettlement.provider?.businessName || 'partner'}.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Beneficiary:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedSettlement.provider?.user?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Net Payout:</span>
                <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                  ₹{(selectedSettlement.amount / 100).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Transfer Mode:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  RBI NEFT / IMPS (0% Txn Fee)
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProcessModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisbursement}
                disabled={processMutation.isPending}
                className="px-5 py-2 text-white font-bold text-xs rounded-xl bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                {processMutation.isPending ? 'Generating UTR...' : 'Confirm & Disburse Funds'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
