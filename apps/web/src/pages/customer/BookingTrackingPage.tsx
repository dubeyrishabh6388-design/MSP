import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Wrench,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Star,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Shield,
  FileText,
  CreditCard,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { BookingStatus, UserRole } from '@serviqa/shared';

const STATUS_STEPS = [
  { status: BookingStatus.CONFIRMED, label: 'Confirmed', desc: 'Technician assigned' },
  { status: BookingStatus.PROVIDER_EN_ROUTE, label: 'En Route', desc: 'Heading to address' },
  { status: BookingStatus.IN_PROGRESS, label: 'In Progress', desc: 'On-site execution' },
  { status: BookingStatus.COMPLETION_SUBMITTED, label: 'Completion Filed', desc: 'Ready for customer sign-off' },
  { status: BookingStatus.COMPLETED, label: 'Completed', desc: 'Verified & closed' },
];

export function BookingTrackingPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Modals state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Dispute Form
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => ApiClient.get(`/bookings/${bookingId}`),
    refetchInterval: 5000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ status, note }: { status: BookingStatus; note?: string }) =>
      ApiClient.post(`/bookings/${bookingId}/status`, { status, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });

  const approveRevisionMutation = useMutation({
    mutationFn: (revisionId: string) =>
      ApiClient.post(`/bookings/${bookingId}/approve-price-revision`, { revisionId }),
    onSuccess: () => {
      setRevisionModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: () =>
      ApiClient.post('/reviews', {
        bookingId,
        rating,
        comment,
      }),
    onSuccess: () => {
      setReviewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });

  const disputeMutation = useMutation({
    mutationFn: () =>
      ApiClient.post('/complaints', {
        bookingId,
        subject: disputeSubject,
        description: disputeDescription,
      }),
    onSuccess: () => {
      setDisputeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
    },
  });

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 text-center animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3 mx-auto mb-4"></div>
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Booking Not Found</h2>
        <Link to="/customer" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  const stepStatusList = STATUS_STEPS.map((s) => s.status);
  const currentStepIndex = stepStatusList.indexOf(booking.status as BookingStatus);
  const pendingRevisions = (booking.priceRevisions || []).filter((r: any) => !r.isApproved);

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-6">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
          <Link to="/customer" className="hover:text-slate-700 dark:hover:text-slate-300">My Dashboard</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Booking #{booking.bookingNumber}</span>
        </nav>

        {/* Main Status Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Booking Reference
                </span>
                <StatusBadge status={booking.status} />
                <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                  {booking.request.category?.name}
                </span>
                {booking.request.subCategory && (
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                    {booking.request.subCategory.name}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{booking.request.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Scheduled on {new Date(booking.scheduledDate).toLocaleDateString()}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-slate-50 dark:bg-slate-850 sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Agreed Order Value
              </span>
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400 block">
                ₹{(booking.agreedAmount / 100).toLocaleString('en-IN')}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Escrow Protected (Pay on Sign-off)</span>
              </span>
            </div>
          </div>

          {/* Visual Stepper Tracker */}
          <div className="relative">
            <div className="hidden sm:block absolute top-4 left-6 right-6 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0"></div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 relative z-10">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.status} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950/80 shadow-md scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
                    </div>

                    <span
                      className={`text-xs font-extrabold mt-2 ${
                        isCurrent
                          ? 'text-brand-600 dark:text-brand-400'
                          : isPassed
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* NATIVE APP OTP SECURITY CARD (Customer View) */}
        {user?.role === UserRole.CUSTOMER &&
          booking.status !== BookingStatus.COMPLETED &&
          booking.status !== BookingStatus.CANCELLED && (
            <div className="bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-brand-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block backdrop-blur-sm">
                  Doorstep OTP Verification
                </span>
                <h3 className="text-base font-black">
                  {booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PROVIDER_EN_ROUTE
                    ? 'Share Start Code Upon Technician Arrival'
                    : 'Share Completion Code After Inspecting Work'}
                </h3>
                <p className="text-xs text-orange-100 max-w-md">
                  Technician cannot start work or collect payment without your on-site verification code.
                </p>
              </div>

              <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20 text-center shrink-0 shadow-sm">
                <span className="text-[10px] uppercase font-extrabold text-slate-400 dark:text-slate-500 block tracking-wider">
                  {booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PROVIDER_EN_ROUTE
                    ? 'START OTP'
                    : 'COMPLETION OTP'}
                </span>
                <span className="text-3xl font-mono font-black tracking-widest text-brand-600 dark:text-brand-400 block">
                  {booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PROVIDER_EN_ROUTE
                    ? (booking.startOtp || '5829')
                    : (booking.completionOtp || '9174')}
                </span>
              </div>
            </div>
          )}

        {/* PRICE REVISION CALLOUT (Customer Approval Required) */}
        {pendingRevisions.length > 0 && user?.role === UserRole.CUSTOMER && (
          <div className="bg-amber-50 dark:bg-amber-950/40 rounded-3xl p-6 sm:p-7 border border-amber-300 dark:border-amber-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
                  Action Required: Technical Approval
                </span>
                <h3 className="text-base font-black text-amber-950 dark:text-amber-100 mt-0.5">
                  Technician Requested Additional Parts / Scope Authorization
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-200 mt-1 font-medium">
                  Scope: "{pendingRevisions[0].reason}" • Added Fee:{' '}
                  <span className="font-extrabold text-amber-950 dark:text-white">
                    ₹{(pendingRevisions[0].addedAmount / 100).toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setRevisionModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black rounded-2xl shadow-md transition-all hover:scale-105 shrink-0 cursor-pointer"
            >
              Review & Authorize
            </button>
          </div>
        )}

        {/* COMPLETION CONFIRMATION CALLOUT */}
        {booking.status === BookingStatus.COMPLETION_SUBMITTED && user?.role === UserRole.CUSTOMER && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 sm:p-8 border border-emerald-300 dark:border-emerald-800 shadow-md text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
              <FileCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-emerald-950 dark:text-emerald-100">
              Work Marked Finished by Service Partner
            </h2>
            <p className="text-xs text-emerald-800 dark:text-emerald-200 max-w-md mx-auto mt-1 mb-6 font-medium">
              Technician notes: "{booking.completionNotes || 'All agreed diagnostic and repair tasks executed.'}".
              Please inspect the completed service before confirming sign-off.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() =>
                  statusMutation.mutate({
                    status: BookingStatus.COMPLETED,
                    note: 'Customer inspected and signed off on completed service',
                  })
                }
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer"
              >
                Verify & Confirm Satisfactory Sign-off
              </button>
              <button
                onClick={() => setDisputeModalOpen(true)}
                className="w-full sm:w-auto px-5 py-3.5 bg-white dark:bg-slate-900 hover:bg-rose-50 text-rose-700 dark:text-rose-400 font-bold text-xs rounded-2xl border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                Report Issue / Dispute
              </button>
            </div>
          </div>
        )}

        {/* COMPLETED: Verified Review CTA */}
        {booking.status === BookingStatus.COMPLETED && !booking.review && user?.role === UserRole.CUSTOMER && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-brand-200 dark:border-brand-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-brand-400 text-brand-400" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">How was your service experience?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Share authentic feedback for {booking.provider.businessName}. Your review directly influences rewards and partner tiers.
                </p>
              </div>
            </div>
            <button
              onClick={() => setReviewModalOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-2xl shadow-md transition-colors shrink-0 cursor-pointer"
            >
              Leave Verified Review
            </button>
          </div>
        )}

        {/* Provider & Address Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assigned Technician Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Assigned Trade Specialist
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Verified Expert
                </span>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {booking.provider.businessName || booking.provider.user.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {booking.provider.bio || 'Certified specialist with proven field experience.'}
                  </p>

                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {booking.provider.averageRating || 5.0} ({booking.provider.totalReviews || 0} reviews)
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">{booking.provider.experienceYears || 5} yrs in trade</span>
                  </div>
                </div>

                {booking.provider.user.phone && (
                  <a
                    href={`tel:${booking.provider.user.phone}`}
                    className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-600 hover:text-white flex items-center justify-center transition-colors shadow-sm shrink-0"
                    title="Direct Phone Contact"
                  >
                    <Phone className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Location & Appointment Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-4">
                Service Appointment & Location
              </span>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block">{booking.address.title}</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {booking.address.addressLine}, {booking.address.city} - {booking.address.postalCode}
                    </span>
                    {booking.address.landmark && (
                      <span className="text-slate-400 block text-[11px] mt-0.5">
                        Landmark: {booking.address.landmark}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                  <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                  <span>Date: {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auditable Event History */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Shield className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span>Auditable Status Transition Timeline</span>
          </h3>

          <div className="space-y-4">
            {(booking.statusEvents || []).map((ev: any) => (
              <div key={ev.id} className="flex items-start gap-3.5 text-xs pb-4 border-b border-slate-100 dark:border-slate-800 last:border-none">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-600 mt-1.5 shrink-0 ring-4 ring-brand-100 dark:ring-brand-950/60"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {ev.fromStatus} → {ev.toStatus}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5 font-medium">{ev.note}</p>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">
                    Logged by: {ev.actorRole}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal: Authorize Price Revision */}
        {pendingRevisions.length > 0 && (
          <Modal
            isOpen={revisionModalOpen}
            onClose={() => setRevisionModalOpen(false)}
            title="Review Additional Work Authorization"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                The technician discovered on-site requirement for parts or additional labor. The charge will only be added to your invoice after your explicit authorization.
              </p>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
                <span className="font-extrabold text-amber-950 dark:text-amber-100 block">Reason Specified by Technician:</span>
                <p className="text-amber-900 dark:text-amber-200 font-medium">{pendingRevisions[0].reason}</p>
                <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/80 flex justify-between items-center text-sm font-black text-amber-950 dark:text-white">
                  <span>Extra Amount:</span>
                  <span>₹{(pendingRevisions[0].addedAmount / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-200 flex justify-between font-bold text-xs">
                <span>Updated Total Invoice:</span>
                <span className="text-brand-600 dark:text-brand-400 font-black">
                  ₹{((booking.agreedAmount + pendingRevisions[0].addedAmount) / 100).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => approveRevisionMutation.mutate(pendingRevisions[0].id)}
                  className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Authorize & Add to Invoice
                </button>
                <button
                  onClick={() => setRevisionModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Review */}
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title="Verified Booking Review"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-2">Overall Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Your Detailed Feedback</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Was the work clean, on-time, and transparent? Mention specific highlights..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-850 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => reviewMutation.mutate()}
              disabled={comment.length < 5}
              className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-2xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Publish Verified Review
            </button>
          </div>
        </Modal>

        {/* Modal: Dispute */}
        <Modal
          isOpen={disputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          title="Open Support Dispute"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Our customer dispute team will hold payment release and inspect your timeline with the technician.
            </p>

            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Issue Subject *</label>
              <input
                type="text"
                value={disputeSubject}
                onChange={(e) => setDisputeSubject(e.target.value)}
                placeholder="e.g. Incomplete cleaning, damage during transport"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-800 dark:text-slate-200 mb-1">Detailed Explanation *</label>
              <textarea
                rows={4}
                value={disputeDescription}
                onChange={(e) => setDisputeDescription(e.target.value)}
                placeholder="Provide exact details..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none font-medium text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={() => disputeMutation.mutate()}
              disabled={disputeDescription.length < 10}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              Submit Grievance to Support
            </button>
          </div>
        </Modal>

      </div>
    </div>
  );
}
