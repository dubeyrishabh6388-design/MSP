import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import {
  Wrench,
  Clock,
  MapPin,
  CheckCircle,
  FileText,
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  Send,
  Truck,
  Sparkles,
  Award,
  ShieldCheck,
  Star,
  Zap,
  TrendingUp,
  User,
  ArrowRight,
  Radio,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  Layers,
  Building2,
  Calendar,
} from 'lucide-react';
import { BookingStatus } from '@serviqa/shared';

export function ProviderDashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'leads' | 'bookings'>('leads');
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  // Quotation Modal state
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [notes, setNotes] = useState(
    'Includes complete diagnostic, original replacement components with 90-day warranty, and post-service testing.'
  );
  const [lineItems, setLineItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([
    { description: 'Expert Labor & Diagnostic Visit', quantity: 1, unitPrice: 49900 },
    { description: 'Genuine Consumables / Chemical Foam', quantity: 1, unitPrice: 35000 },
  ]);

  // Start OTP Modal state
  const [startOtpModalOpen, setStartOtpModalOpen] = useState(false);
  const [selectedBookingForOtp, setSelectedBookingForOtp] = useState<any>(null);
  const [startOtpInput, setStartOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');

  // Price revision modal state
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [revisionAmount, setRevisionAmount] = useState(65000);
  const [revisionReason, setRevisionReason] = useState(
    'Discovered oxidized contactor coil requiring replacement to prevent short-circuiting.'
  );

  // Completion modal state
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState(
    'Deep foam jet cleaning executed on both indoor coils and outdoor compressor fins. Operating temperature calibrated to 16°C.'
  );
  const [completionOtpInput, setCompletionOtpInput] = useState('');

  // Data fetching
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['provider-leads'],
    queryFn: () => ApiClient.get('/service-requests'),
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['provider-bookings'],
    queryFn: () => ApiClient.get('/bookings'),
  });

  const { data: earningsData } = useQuery({
    queryKey: ['provider-earnings-quick'],
    queryFn: () => ApiClient.get('/providers/my/earnings'),
  });

  // Quotation Submission Mutation
  const quoteMutation = useMutation({
    mutationFn: () =>
      ApiClient.post('/quotations', {
        requestId: selectedRequest.id,
        estimatedHours,
        notes,
        lineItems,
      }),
    onSuccess: () => {
      setQuoteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['provider-leads'] });
    },
  });

  // State Transition Mutation
  const statusMutation = useMutation({
    mutationFn: ({
      bookingId,
      status,
      note,
      startOtp,
      completionOtp,
    }: {
      bookingId: string;
      status: BookingStatus;
      note?: string;
      startOtp?: string;
      completionOtp?: string;
    }) => ApiClient.post(`/bookings/${bookingId}/status`, { status, note, startOtp, completionOtp }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
      setStartOtpModalOpen(false);
      setCompletionModalOpen(false);
      setStartOtpInput('');
      setCompletionOtpInput('');
      setOtpError('');
    },
    onError: (err: any) => {
      setOtpError(err?.response?.data?.message || 'Invalid OTP code. Please ask customer to re-check their app.');
    },
  });

  // Price Revision Mutation
  const revisionMutation = useMutation({
    mutationFn: () =>
      ApiClient.post(`/bookings/${selectedBooking.id}/price-revision`, {
        addedAmount: revisionAmount,
        reason: revisionReason,
      }),
    onSuccess: () => {
      setRevisionModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
  });

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, val: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const totalQuoteAmount = lineItems.reduce((acc, it) => acc + (it.quantity || 1) * (it.unitPrice || 0), 0);
  const platformFee10Pct = Math.round(totalQuoteAmount * 0.1);
  const providerTakeHome = totalQuoteAmount - platformFee10Pct;

  const activeBookings = bookings.filter((b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');

  const handleVerifyStartOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startOtpInput || startOtpInput.length < 4) {
      setOtpError('Please enter the 4-digit start code provided by customer');
      return;
    }
    statusMutation.mutate({
      bookingId: selectedBookingForOtp.id,
      status: BookingStatus.IN_PROGRESS,
      note: 'Verified customer start OTP on-site. Commenced diagnostics and work.',
      startOtp: startOtpInput,
    });
  };

  const handleVerifyCompletion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completionOtpInput || completionOtpInput.length < 4) {
      setOtpError('Please enter the 4-digit completion code provided by customer');
      return;
    }
    statusMutation.mutate({
      bookingId: selectedBooking.id,
      status: BookingStatus.COMPLETED,
      note: completionNotes,
      completionOtp: completionOtpInput,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Provider Hero / Verification Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-slate-700/60">
          <div className="space-y-3 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Partner Workspace</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold">
                Operating Radius: 25 km (Western Mumbai)
              </span>
              <button
                onClick={() => setIsAvailable(!isAvailable)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  isAvailable
                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{isAvailable ? 'On-Duty • Receiving Leads' : 'Off-Duty'}</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{user?.name || 'Master Technician'}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Review live local homeowner requests, build transparent margin-guaranteed quotations, verify on-site OTPs, and manage direct bank payouts.
            </p>
          </div>

          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-2 shrink-0 relative z-10">
            <Link
              to="/provider/services"
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] sm:text-xs font-bold rounded-xl sm:rounded-2xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Services</span>
            </Link>
            <Link
              to="/provider/rewards"
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-black rounded-xl sm:rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 flex items-center justify-center gap-1.5 text-center"
            >
              <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="truncate">Score: 94</span>
            </Link>
            <Link
              to="/provider/earnings"
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] sm:text-xs font-bold rounded-xl sm:rounded-2xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Ledger</span>
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Net Earnings
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              ₹{(((earningsData?.summary?.totalNetEarned || 8460000)) / 100).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
              Direct NEFT settled
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Active On-Site Jobs
            </span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {activeBookings.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              En-route or in progress
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Matching Local Leads
            </span>
            <span className="text-2xl font-black text-amber-500 mt-1 block">
              {leads.length}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Within 25 km service territory
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Excellence Tier
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span>4.9 / 5</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
              Platinum Master Partner
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('leads')}
            className={`py-3.5 px-6 text-xs font-black border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Incoming Customer Leads ({leads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3.5 px-6 text-xs font-black border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Active & Scheduled Bookings ({bookings.length})</span>
          </button>
        </div>

        {/* Leads Tab Content */}
        {activeTab === 'leads' && (
          <div className="space-y-4">
            {leadsLoading ? (
              <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
            ) : leads.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white">No New Leads Right Now</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You are all caught up! As soon as homeowners in Malad, Andheri, or Goregaon request services in your trade, they will appear here.
                </p>
              </div>
            ) : (
              leads.map((lead: any) => {
                const alreadyQuoted = lead.quotations && lead.quotations.length > 0;

                return (
                  <div
                    key={lead.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500/50 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {lead.category?.name || 'Home Service'}
                        </span>
                        <StatusBadge status={lead.status} />
                        <span className="text-[10px] text-slate-400 font-medium">
                          Posted {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-white">{lead.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                        {lead.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium pt-1">
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          {lead.address?.city} ({lead.address?.postalCode})
                        </span>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          Target: {new Date(lead.preferredDate).toLocaleDateString()} • {lead.timeSlot}
                        </span>
                      </div>

                      {lead.customFieldValues && Object.keys(lead.customFieldValues).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {Object.entries(lead.customFieldValues).map(([k, v]: [string, any]) => (
                            <span
                              key={k}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-lg font-bold"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0">
                      {alreadyQuoted ? (
                        <div className="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Quote Submitted</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRequest(lead);
                            setQuoteModalOpen(true);
                          }}
                          className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          <span>Submit Itemized Quotation</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Bookings Tab Content */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
            ) : bookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800 dark:text-white">No Confirmed Bookings Yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Submit transparent quotations on open homeowner leads. When homeowners accept and fund escrow, bookings appear here.
                </p>
              </div>
            ) : (
              bookings.map((b: any) => (
                <div
                  key={b.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          #{b.bookingNumber}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <h3 className="text-base font-black text-slate-900 dark:text-white">{b.request?.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        Customer: <strong className="text-slate-800 dark:text-white">{b.customer?.user?.name}</strong> • Phone: {b.customer?.user?.phone}
                      </p>
                    </div>

                    <div className="text-left sm:text-right bg-slate-50 dark:bg-slate-800/60 sm:bg-transparent p-3 sm:p-0 rounded-2xl">
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block">
                        Net Payout: ₹{(b.providerAmount / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        Gross: ₹{(b.agreedAmount / 100).toLocaleString('en-IN')} (Fee 10%: ₹{(b.platformFee / 100).toLocaleString('en-IN')})
                      </span>
                    </div>
                  </div>

                  {/* Service Address */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700/60 font-medium">
                    <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">{b.address?.title}</span>
                      <span>{b.address?.addressLine}, {b.address?.city}</span>
                      {b.address?.landmark && (
                        <span className="text-slate-400 block text-[11px]">Landmark: {b.address.landmark}</span>
                      )}
                    </div>
                  </div>

                  {/* 4-Stage On-Site Stepper Action Bar */}
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {/* Stage 1: Mark En Route */}
                    {b.status === BookingStatus.CONFIRMED && (
                      <button
                        onClick={() =>
                          statusMutation.mutate({
                            bookingId: b.id,
                            status: BookingStatus.PROVIDER_EN_ROUTE,
                            note: 'Technician dispatched for customer premises',
                          })
                        }
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Step 1: Mark En Route</span>
                      </button>
                    )}

                    {/* Stage 2: Doorstep Start OTP Verification */}
                    {b.status === BookingStatus.PROVIDER_EN_ROUTE && (
                      <button
                        onClick={() => {
                          setSelectedBookingForOtp(b);
                          setStartOtpModalOpen(true);
                          setOtpError('');
                        }}
                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Step 2: Enter Doorstep Start OTP</span>
                      </button>
                    )}

                    {/* Stage 3 & 4: In Progress (Extra Scope & Completion OTP) */}
                    {b.status === BookingStatus.IN_PROGRESS && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setCompletionModalOpen(true);
                            setOtpError('');
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Submit Completion & Verify Final OTP</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBooking(b);
                            setRevisionModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs rounded-2xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Extra Parts / Scope</span>
                        </button>
                      </>
                    )}

                    {b.status === BookingStatus.COMPLETION_SUBMITTED && (
                      <span className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-2 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Awaiting Customer Sign-off & Final OTP Confirmation</span>
                      </span>
                    )}

                    {b.status === BookingStatus.COMPLETED && (
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3.5 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Job Verified • Escrow Released to Monday Bank Batch</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal: Itemized Quotation Builder */}
      {selectedRequest && (
        <Modal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          title={`Build Itemized Quotation: ${selectedRequest.title}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <span className="font-extrabold text-slate-800 dark:text-white block mb-0.5">Customer Requirement:</span>
              <p className="text-slate-600 dark:text-slate-300 font-medium">{selectedRequest.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="font-black text-slate-900 dark:text-white">Itemized Cost Components</label>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[3]" /> Add Component
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Component description (e.g. Capacitor 45uF)"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white text-center font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-2 text-slate-400 font-medium">₹</span>
                      <input
                        type="number"
                        placeholder="Price"
                        step="50"
                        value={item.unitPrice ? item.unitPrice / 100 : ''}
                        onChange={(e) =>
                          handleLineItemChange(idx, 'unitPrice', Math.round((parseFloat(e.target.value) || 0) * 100))
                        }
                        className="w-full pl-6 pr-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="p-2 text-slate-400 hover:text-rose-500 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-black text-slate-900 dark:text-white block mb-1">Estimated Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-black text-slate-900 dark:text-white block mb-1">Customer Price</label>
                <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black text-slate-900 dark:text-white">
                  ₹{(totalQuoteAmount / 100).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Net Margin Breakdown */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 dark:text-slate-300">Total Customer Bill:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{(totalQuoteAmount / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-amber-700 dark:text-amber-400">Serviqa Platform Fee (10%):</span>
                <span className="font-bold text-amber-700 dark:text-amber-400">-₹{(platformFee10Pct / 100).toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <span className="font-black text-emerald-800 dark:text-emerald-300">Your Net Take-Home Pay:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ₹{(providerTakeHome / 100).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div>
              <label className="font-black text-slate-900 dark:text-white block mb-1">
                Technician Notes & Guarantee Terms
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setQuoteModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => quoteMutation.mutate()}
                disabled={totalQuoteAmount <= 0 || quoteMutation.isPending}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {quoteMutation.isPending ? 'Sending...' : 'Transmit Quote to Homeowner'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Doorstep Start OTP Verification */}
      {selectedBookingForOtp && (
        <Modal
          isOpen={startOtpModalOpen}
          onClose={() => setStartOtpModalOpen(false)}
          title="Verify Doorstep Start OTP"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleVerifyStartOtp} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 flex items-start gap-3">
              <KeyRound className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <span className="font-bold block">Doorstep Verification Protocol</span>
                <span className="text-[11px] leading-relaxed block mt-0.5">
                  Ask the customer at the door for the 4-digit start OTP shown on their Serviqa app to confirm on-site arrival.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                4-Digit Customer Start Code
              </label>
              <input
                type="text"
                maxLength={4}
                autoFocus
                placeholder="e.g. 4821"
                value={startOtpInput}
                onChange={(e) => setStartOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl tracking-widest font-mono font-bold px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStartOtpModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusMutation.isPending}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {statusMutation.isPending ? 'Verifying...' : 'Verify & Start Job'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Job Completion with Final OTP */}
      {selectedBooking && (
        <Modal
          isOpen={completionModalOpen}
          onClose={() => setCompletionModalOpen(false)}
          title="Submit Work Completion & Customer Sign-off"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleVerifyCompletion} className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <span className="font-bold block">Customer Satisfaction Sign-off</span>
              <p className="text-[11px] mt-0.5">
                Demonstrate the completed repair to the customer. When satisfied, enter the 4-digit completion OTP to release escrow funds directly to your payout ledger.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Completion Notes / Diagnostic Summary
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                4-Digit Customer Completion OTP
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. 9134"
                value={completionOtpInput}
                onChange={(e) => setCompletionOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-2xl tracking-widest font-mono font-bold px-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {otpError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletionModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={statusMutation.isPending}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {statusMutation.isPending ? 'Verifying...' : 'Verify OTP & Release Escrow'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Scope Revision / Extra Spare Parts */}
      {selectedBooking && (
        <Modal
          isOpen={revisionModalOpen}
          onClose={() => setRevisionModalOpen(false)}
          title="Add Spare Parts / Extra Scope"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              In-app scope change requests must be approved by the customer before payment is added to escrow.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Additional Component Cost (₹)
              </label>
              <input
                type="number"
                value={revisionAmount / 100}
                onChange={(e) => setRevisionAmount(Math.round((parseFloat(e.target.value) || 0) * 100))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Technical Justification
              </label>
              <textarea
                rows={3}
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevisionModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => revisionMutation.mutate()}
                disabled={revisionMutation.isPending}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                {revisionMutation.isPending ? 'Sending...' : 'Request Customer Approval'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
