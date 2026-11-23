import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '../../api/client';
import {
  HelpCircle,
  ShieldAlert,
  ShieldCheck,
  Phone,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Send,
  Loader2,
  ArrowRight,
  LifeBuoy,
} from 'lucide-react';

const FAQS = [
  {
    q: 'How does the 30-Day Service Warranty work?',
    a: 'Every completed service booked through Serviqa includes our 30-Day Peace of Mind Warranty. If the same issue returns or you are unsatisfied with the workmanship, submit a claim here to receive a free expert revisit or a full platform refund.',
  },
  {
    q: 'When is my money released to the technician?',
    a: 'Your funds remain locked safely in platform escrow throughout the job. The provider receives payout only AFTER you verify the completed work and provide your 4-digit completion OTP.',
  },
  {
    q: 'What if a technician asks for offline direct cash on-site?',
    a: 'Never pay cash offline. Offline payments forfeit your escrow protection and 30-day rework warranty. If any extra parts are needed, the technician must submit the change in the app for your digital approval.',
  },
  {
    q: 'What is the cancellation and refund policy?',
    a: 'You can cancel free of charge anytime up to 2 hours before the scheduled slot. If cancelled after the provider is en route, a small compensation travel fee (₹149) is deducted, and the rest is instantly credited back to your original payment method.',
  },
];

export function CustomerHelpPage() {
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [issueCategory, setIssueCategory] = useState('QUALITY');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => ApiClient.get('/bookings'),
  });

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) {
      setErrorMessage('Please select the relevant booking.');
      return;
    }
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await ApiClient.post('/complaints', {
        bookingId: selectedBookingId,
        subject: `[${issueCategory}] ${subject}`,
        description,
      });

      setSuccessMessage(
        'Your claim has been registered successfully. Our operations audit team has frozen escrow payout for this job and will contact you within 2 hours.'
      );
      setSubject('');
      setDescription('');
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          'Failed to submit dispute. An active claim may already be open for this booking.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider mb-1">
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>Customer Care & Resolution</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Help, 30-Day Warranty & Dispute Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              File a warranty revisit claim, report unauthorized on-site charges, or contact our dedicated mediation team.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
            <a
              href="tel:18002097788"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-md transition-all hover:scale-105"
            >
              <Phone className="w-4 h-4" />
              <span>1800-209-7788</span>
            </a>
          </div>
        </div>

        {/* 30-Day Service Guarantee Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Serviqa 30-Day Workmanship Guarantee</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              100% Satisfaction or Free Expert Re-Visit
            </h3>
            <p className="text-xs text-orange-100 leading-relaxed font-medium">
              If an AC foam service leaks, shifting causes damage, or a repair fails within 30 days of completion, file a claim below. We will send a senior master technician for a zero-cost rework or process a platform refund.
            </p>
          </div>

          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-left shrink-0">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-orange-200 block">
              Typical Resolution Time
            </span>
            <span className="text-2xl font-black text-white block mt-0.5">&lt; 4 Hours</span>
            <span className="text-[10px] text-orange-100 block">Senior operations desk</span>
          </div>
        </div>

        {/* 2-Column Split: Claim Form + Help FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 Cols): File a Claim / Dispute Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  File a Warranty Claim or Job Dispute
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Submitting this claim automatically places an escrow freeze on the booking and alerts management.
              </p>
            </div>

            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-semibold">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-semibold">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              {/* Select Booking */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select Associated Booking <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium cursor-pointer"
                >
                  <option value="">Choose an active or completed booking...</option>
                  {bookings.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      #{b.id.slice(0, 8)} • {b.request?.title || 'Custom Service'} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category of Concern */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Type of Concern <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'WARRANTY', label: '30-Day Revisit Claim' },
                    { id: 'QUALITY', label: 'Work Quality Issue' },
                    { id: 'PRICING', label: 'Extra Charge Dispute' },
                    { id: 'DAMAGE', label: 'Property Care Concern' },
                    { id: 'PUNCTUALITY', label: 'Technician No-Show' },
                    { id: 'OTHER', label: 'Other Issue' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setIssueCategory(cat.id)}
                      className={`p-2.5 rounded-xl text-left text-xs font-bold border transition-all cursor-pointer ${
                        issueCategory === cat.id
                          ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Claim Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. AC cooling stopped 3 days after deep cleaning"
                  className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>

              {/* Detailed Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Explanation & Evidence <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe symptoms, what the technician stated, and your preferred resolution (Free Re-visit / Refund)..."
                  className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-brand-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Freezing Escrow & Registering Claim...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Claim to Operations Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column (5 Cols): Frequently Asked Questions Accordion */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <HelpCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Common Help Topics & FAQ
                </h3>
              </div>

              <div className="space-y-3">
                {FAQS.map((faq, index) => {
                  const isOpen = openFaqIndex === index;
                  return (
                    <div
                      key={index}
                      className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                        className="w-full p-4 text-left font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-850/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-brand-600 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal border-t border-slate-100 dark:border-slate-800">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Support Card */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 space-y-3">
              <span className="text-[10px] uppercase font-extrabold text-amber-400 tracking-wider">
                Direct Emergency Contact
              </span>
              <h4 className="text-sm font-black text-white">Need Immediate On-Site Assistance?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                If an on-site technician behaves unprofessionally or refuses to follow safety protocols, dial our toll-free safety line immediately.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <a
                  href="tel:18002097788"
                  className="px-4 py-2 rounded-xl bg-white text-slate-950 font-black text-xs inline-flex items-center gap-2 hover:bg-slate-100"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call 1800-209-7788</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
