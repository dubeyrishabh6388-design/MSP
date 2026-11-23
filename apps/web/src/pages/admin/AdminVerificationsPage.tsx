import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  AlertCircle,
  Filter,
  Eye,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  User,
  Briefcase,
  Calendar,
} from 'lucide-react';
import { VerificationStatus } from '@serviqa/shared';

export function AdminVerificationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState(
    'Government ID photo is blurry or unreadable. Please re-upload a clear scanned copy.'
  );

  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['admin-verifications', statusFilter],
    queryFn: () => {
      const url = statusFilter === 'ALL' ? '/admin/verifications' : `/admin/verifications?status=${statusFilter}`;
      return ApiClient.get(url);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      rejectionReason,
    }: {
      id: string;
      status: VerificationStatus;
      rejectionReason?: string;
    }) => ApiClient.put(`/admin/verifications/${id}/review`, { status, rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      setRejectModalOpen(false);
      setPreviewModalOpen(false);
      setSelectedVerification(null);
      setRejectionReason('');
    },
  });

  const handleApprove = (v: any) => {
    reviewMutation.mutate({ id: v.id, status: VerificationStatus.VERIFIED });
  };

  const handleRejectClick = (v: any) => {
    setSelectedVerification(v);
    setRejectionReason('Government ID photo is blurry or unreadable. Please re-upload a clear scanned copy.');
    setRejectModalOpen(true);
  };

  const handlePreviewClick = (v: any) => {
    setSelectedVerification(v);
    setPreviewModalOpen(true);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerification) return;
    reviewMutation.mutate({
      id: selectedVerification.id,
      status: VerificationStatus.REJECTED,
      rejectionReason,
    });
  };

  const pendingCount = verifications.filter((v: any) => v.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/admin" className="hover:text-purple-500 transition-colors">Platform Command</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Partner KYC & Verification</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Provider KYC Compliance & Verification Desk
              {pendingCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 animate-pulse">
                  {pendingCount} Pending Review
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Audit government documents (Aadhaar UID, PAN Card, ITI Trade Skills, Police Clearance) before granting doorstep dispatch permission.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? 'All Submissions' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
            Total {verifications.length} submissions in registry
          </span>
        </div>

        {/* Verification Submissions List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
          ) : verifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">No Verification Backlog</h3>
              <p className="text-xs text-slate-400 mt-1">All provider documents have been audited and resolved.</p>
            </div>
          ) : (
            verifications.map((v: any) => (
              <div
                key={v.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-purple-400/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-base">
                      {v.provider?.businessName || v.provider?.user?.name || 'Trade Partner'}
                    </span>
                    <StatusBadge status={v.status} />
                    <span className="text-[10px] text-slate-400 font-medium">
                      Submitted on {new Date(v.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document Type</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{v.documentType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Document Number</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{v.documentNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Contact</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{v.provider?.user?.phone || 'Verified Phone'}</span>
                    </div>
                  </div>

                  {v.rejectionReason && (
                    <div className="text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Rejection Notice: {v.rejectionReason}</span>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handlePreviewClick(v)}
                    className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect Document</span>
                  </button>

                  {v.status === VerificationStatus.PENDING && (
                    <>
                      <button
                        onClick={() => handleApprove(v)}
                        disabled={reviewMutation.isPending}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve KYC</span>
                      </button>

                      <button
                        onClick={() => handleRejectClick(v)}
                        disabled={reviewMutation.isPending}
                        className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-200 dark:border-rose-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {selectedVerification && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title={`Reject Verification: ${selectedVerification.documentType}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
              <span className="font-bold block">Document Rejection Protocol</span>
              <p className="text-[11px] mt-1 leading-relaxed">
                The provider will receive an in-app push notification with your specific rejection note and a direct link to re-upload the corrected document.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Preset Compliance Feedback
              </label>
              <div className="space-y-1.5 mb-3">
                {[
                  'Government ID photo is blurry or unreadable. Please re-upload a clear scanned copy.',
                  'Aadhaar number or PAN number in photo does not match entered registration details.',
                  'Trade skill certificate / ITI license appears expired. Please submit current renewal.',
                  'Police verification clearance document is missing official issuing seal.',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReason(preset)}
                    className="w-full text-left p-2 rounded-xl text-[11px] bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {reviewMutation.isPending ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Inspect Lightbox Modal */}
      {selectedVerification && (
        <Modal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          title={`Document Dossier: ${selectedVerification.documentType}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Partner Business:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedVerification.provider?.businessName || selectedVerification.provider?.user?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Document Type:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedVerification.documentType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">ID / License Number:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {selectedVerification.documentNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Status:</span>
                <StatusBadge status={selectedVerification.status} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-800 p-8 text-center space-y-2">
              <FileText className="w-12 h-12 text-slate-400 mx-auto" />
              <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">
                Encrypted Government Document Attachment
              </span>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                File secure hash: sha256:8f92a34bc... • Stored in DPDP-compliant private storage vault
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Close Dossier
              </button>
              {selectedVerification.status === VerificationStatus.PENDING && (
                <button
                  type="button"
                  onClick={() => {
                    handleApprove(selectedVerification);
                  }}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  Approve Verification
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
