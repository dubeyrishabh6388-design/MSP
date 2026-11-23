import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../../api/client';
import {
  ShieldCheck,
  ShieldAlert,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  FileCheck,
  ExternalLink,
  Award,
  Lock,
  Plus,
  Loader2,
  HelpCircle,
} from 'lucide-react';

interface VerificationDoc {
  id: string;
  documentType: string;
  documentNumber: string;
  fileUrl: string;
  status: 'PENDING' | 'IN_REVIEW' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: string;
}

export function ProviderVerificationPage() {
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [documentType, setDocumentType] = useState('Skill Certificate / Trade License');
  const [documentNumber, setDocumentNumber] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: verificationsData, isLoading } = useQuery({
    queryKey: ['provider-verifications'],
    queryFn: () => ApiClient.get('/providers/my/verifications'),
  });

  const docs: VerificationDoc[] = verificationsData?.data || verificationsData || [];

  const uploadMutation = useMutation({
    mutationFn: () =>
      ApiClient.post('/providers/verifications', {
        documentType,
        documentNumber,
        fileUrl: fileUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      }),
    onSuccess: () => {
      setSubmitSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['provider-verifications'] });
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setSubmitSuccess(false);
        setDocumentNumber('');
        setFileUrl('');
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to submit document. Please check details.');
    },
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    uploadMutation.mutate();
  };

  const isFullyVerified = docs.length >= 4 && docs.every((d) => d.status === 'VERIFIED');

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Trust, Safety & KYC Desk</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Partner Verification & Compliance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload your government identity, trade certificates, and police clearance to unlock 100% verified customer leads.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer self-start sm:self-auto"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>Upload New Document</span>
          </button>
        </div>

        {/* Verification Status Hero Card */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30 backdrop-blur-sm">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compliance Status</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black">
                {isFullyVerified ? 'Verified Platform Master Partner' : 'Verification Under Progress'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider">
                Active Tier
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Your background, skill certifications, and identity have been audited by Serviqa Trust Operations. You are eligible for high-value dispatch leads and direct bank escrow settlements.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-left md:text-right shrink-0 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
              Audited Documents
            </span>
            <span className="text-3xl font-black text-white block">
              {docs.filter((d) => d.status === 'VERIFIED').length} / {docs.length}
            </span>
            <span className="text-[10px] text-slate-300 block">100% Platform Verified</span>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Submitted Verification Documents
            </h3>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
              {docs.length} compliance files
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      {doc.documentNumber}
                    </span>
                    {doc.status === 'VERIFIED' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                    {doc.status === 'IN_REVIEW' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[10px] font-black uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Under Review
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                    {doc.documentType}
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Verified on: <strong className="text-slate-700 dark:text-slate-300">{doc.verifiedAt || 'Recently'}</strong>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium">
                    Legal Encryption Protected
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer"
                  >
                    <span>View Certificate</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Partner Privileges Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Privileges of Verified Serviqa Partners
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                100% Leads Access
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Receive instant broadcasts for high-value shifting and foam cleaning jobs within your 15km radius.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Fast Bank Settlements
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Escrow funds release automatically to your registered bank account with zero delay upon completion OTP.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Verified Shield Badge
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Golden certified badge displayed on your quotations boosts customer acceptance rate by over 300%.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                On-Site Insurance
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                Zero-cost accidental and tool protection coverage during active on-site service appointments.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: UPLOAD / SUBMIT COMPLIANCE DOCUMENT
      ───────────────────────────────────────────────────────────── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Upload Verification Document
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Our operations team reviews submissions within 24 business hours.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">Document submitted for audit review successfully!</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Category
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                >
                  <option value="Aadhaar Card (Government Identity)">Aadhaar Card (Front + Back)</option>
                  <option value="PAN Card (Tax & Payout Ledger)">PAN Card (Tax Registration)</option>
                  <option value="Skill Certificate / Trade License">Skill Certificate / ITI Trade Diploma</option>
                  <option value="Police Background Verification Certificate">Police Verification Certificate</option>
                  <option value="Commercial Transport Vehicle Permit">Commercial Vehicle Transit Permit (Packers)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Registration / Serial Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="e.g. ABCDE1234F or XXXX-XXXX-1234"
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Document Scan / Photo URL (or File Attachment)
                </label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="Paste URL or cloud link to scanned certificate..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>All uploaded documents are encrypted under ISO/IEC 27001 data compliance.</span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit for Audit</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
