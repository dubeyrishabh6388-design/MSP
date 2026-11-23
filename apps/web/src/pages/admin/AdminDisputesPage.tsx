import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  DollarSign,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Filter,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Briefcase,
  HelpCircle,
} from 'lucide-react';
import { ComplaintStatus } from '@serviqa/shared';

export function AdminDisputesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [resolutionType, setResolutionType] = useState<'FULL_REFUND' | 'PARTIAL_REFUND' | 'RELEASE_PROVIDER'>('FULL_REFUND');
  const [refundAmount, setRefundAmount] = useState(0);
  const [resolution, setResolution] = useState(
    'Dispute investigated. Customer complaint verified due to incomplete cooling post-service. Issuing full refund to customer escrow.'
  );

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['admin-complaints'],
    queryFn: () => ApiClient.get('/complaints'),
  });

  const resolveMutation = useMutation({
    mutationFn: () => {
      let finalRefund = undefined;
      if (resolutionType === 'FULL_REFUND') {
        finalRefund = selectedComplaint.booking?.agreedAmount || 189900;
      } else if (resolutionType === 'PARTIAL_REFUND') {
        finalRefund = refundAmount > 0 ? refundAmount : Math.round((selectedComplaint.booking?.agreedAmount || 189900) / 2);
      }
      return ApiClient.put(`/complaints/${selectedComplaint.id}/resolve`, {
        resolution,
        refundAmount: finalRefund,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
      setResolveModalOpen(false);
      setSelectedComplaint(null);
      setResolution('');
      setRefundAmount(0);
    },
  });

  const handleOpenResolveModal = (c: any) => {
    setSelectedComplaint(c);
    const bookingVal = c.booking?.agreedAmount || 189900;
    setRefundAmount(bookingVal);
    setResolutionType('FULL_REFUND');
    setResolution(
      'Administrative dispute review completed. Customer complaint verified based on service warranty terms. Escrow refunded.'
    );
    setResolveModalOpen(true);
  };

  const handleResolutionTypeChange = (type: 'FULL_REFUND' | 'PARTIAL_REFUND' | 'RELEASE_PROVIDER') => {
    setResolutionType(type);
    const bookingVal = selectedComplaint?.booking?.agreedAmount || 189900;
    if (type === 'FULL_REFUND') {
      setRefundAmount(bookingVal);
      setResolution('Customer grievance verified under 30-Day Service Guarantee. Full 100% refund disbursed from platform escrow.');
    } else if (type === 'PARTIAL_REFUND') {
      setRefundAmount(Math.round(bookingVal / 2));
      setResolution('Mutual settlement agreement: 50% partial refund disbursed to customer, remaining balance released to provider for labor diagnostics.');
    } else {
      setRefundAmount(0);
      setResolution('Technician on-site diagnostic photos and completion checklist verified. Dispute dismissed; escrow released to provider.');
    }
  };

  const filteredComplaints = complaints.filter((c: any) => {
    if (statusFilter === 'ALL') return true;
    return c.status === statusFilter;
  });

  const openCount = complaints.filter((c: any) => c.status === ComplaintStatus.OPEN).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin" className="hover:text-purple-500 transition-colors">Platform Command</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Disputes & Complaints Mediation</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Dispute & Warranty Claims Mediation
              {openCount > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800 animate-pulse">
                  {openCount} Case Under Mediation
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  Zero Open Disputes
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Arbitrate grievances between homeowners and service partners, inspect frozen escrow balances, and disburse refunds under the 30-Day Guarantee.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Mediation Status:
            </span>
            {(['ALL', 'OPEN', 'RESOLVED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All Disputes' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Total {complaints.length} claims registered
          </span>
        </div>

        {/* Disputes List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Open Disputes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Platform customer satisfaction is operating with 100% mutual resolution.
              </p>
            </div>
          ) : (
            filteredComplaints.map((c: any) => (
              <div
                key={c.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {c.subject}
                      </span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>Booking <strong className="text-slate-700 dark:text-slate-300 font-mono">#{c.booking?.bookingNumber}</strong></span>
                      <span>•</span>
                      <span>Customer: <strong className="text-slate-700 dark:text-slate-300">{c.booking?.customer?.user?.name}</strong></span>
                      <span>•</span>
                      <span>Provider: <strong className="text-slate-700 dark:text-slate-300">{c.booking?.provider?.user?.name}</strong></span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-slate-400 block">Frozen Escrow</span>
                    <span className="text-lg font-black text-purple-600 dark:text-purple-400 block">
                      ₹{((c.booking?.agreedAmount || 189900) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    Customer Grievance Statement:
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {c.description}
                  </p>
                </div>

                {c.resolution && (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Administrative Mediation Verdict:
                    </span>
                    <p className="text-emerald-700 dark:text-emerald-400 leading-relaxed font-medium">
                      {c.resolution}
                    </p>
                  </div>
                )}

                {c.status === ComplaintStatus.OPEN && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleOpenResolveModal(c)}
                      className="w-full sm:w-auto px-5 py-3 sm:py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Arbitrate & Disburse Resolution</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Resolution Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title={`Arbitrate Dispute: Booking #${selectedComplaint.booking?.bookingNumber}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300">
              <span className="font-bold block">Escrow Mediation Judgment</span>
              <p className="text-[11px] mt-1 leading-relaxed">
                Total protected escrow: ₹{((selectedComplaint.booking?.agreedAmount || 189900) / 100).toLocaleString('en-IN')}. Choose the verdict to disburse funds.
              </p>
            </div>

            <div className="space-y-2">
              <label className="font-black text-slate-900 dark:text-white block">Mediation Outcome</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleResolutionTypeChange('FULL_REFUND')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    resolutionType === 'FULL_REFUND'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-black">100% Full Refund</div>
                  <div className="text-[10px] mt-0.5">Return to Customer</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleResolutionTypeChange('PARTIAL_REFUND')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    resolutionType === 'PARTIAL_REFUND'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-black">Partial Split</div>
                  <div className="text-[10px] mt-0.5">50% Customer / Pro</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleResolutionTypeChange('RELEASE_PROVIDER')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    resolutionType === 'RELEASE_PROVIDER'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-black">Release Escrow</div>
                  <div className="text-[10px] mt-0.5">Pay to Provider</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Formal Resolution Verdict & Terms (Visible to Both Parties)
              </label>
              <textarea
                rows={3}
                required
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResolveModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resolveMutation.mutate()}
                disabled={resolveMutation.isPending}
                className="px-5 py-2 text-white font-bold text-xs rounded-xl bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
              >
                {resolveMutation.isPending ? 'Processing...' : 'Disburse & Close Case'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
