import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Wrench,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Award,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Check,
  Tag,
  DollarSign,
} from 'lucide-react';

export function QuotationComparePage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', requestId],
    queryFn: () => ApiClient.get(`/service-requests/${requestId}`),
  });

  const acceptMutation = useMutation({
    mutationFn: (quotationId: string) => ApiClient.post(`/quotations/${quotationId}/accept`),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] });
      navigate(`/bookings/${booking.id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to accept quotation');
      setAcceptingId(null);
    },
  });

  const handleAccept = (quotationId: string) => {
    setAcceptingId(quotationId);
    setError(null);
    acceptMutation.mutate(quotationId);
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 text-center animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3 mx-auto mb-4"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Request Not Found</h2>
        <Link to="/customer" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
          Go to My Dashboard
        </Link>
      </div>
    );
  }

  const quotations = request.quotations || [];
  const minPrice = quotations.length > 0 ? Math.min(...quotations.map((q: any) => q.totalAmount)) : null;

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <Link to="/customer" className="hover:text-slate-700">My Requests</Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">Compare Quotations</span>
      </nav>

      {/* Request Header Summary */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Request #{request.id.slice(0, 8)}
              </span>
              <StatusBadge status={request.status} />
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                {request.category?.name}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{request.title}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">{request.description}</p>
          </div>

          {request.booking && (
            <Link
              to={`/bookings/${request.booking.id}`}
              className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md transition-colors shrink-0"
            >
              <span>Track Confirmed Booking</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Dynamic Category Parameters Chip Grid */}
        {request.customFieldValues && Object.keys(request.customFieldValues).length > 0 && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Service Parameters Broadcasted:
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(request.customFieldValues).map(([k, v]: [string, any]) => (
                <div key={k} className="px-3 py-1.5 bg-white rounded-xl border border-slate-200/80 text-xs">
                  <span className="text-slate-400 capitalize text-[10px] block font-semibold">{k.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="font-extrabold text-slate-800">{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Quotations List / Comparison */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Provider Quotations ({quotations.length})
            </h2>
            <p className="text-xs text-slate-400">
              Compare transparent bids, itemized materials, labor, and provider reputation.
            </p>
          </div>
        </div>

        {quotations.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <Clock className="w-10 h-10 text-brand-600 mx-auto mb-3 animate-spin" />
            <h3 className="text-base font-black text-slate-900 mb-1">
              Broadcasting to Verified Providers...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Certified trade specialists in your area are reviewing your specifications and compiling itemized quotes. They typically respond within a few minutes.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotations.map((quote: any) => {
              const isAccepted = quote.status === 'ACCEPTED';
              const isRejected = quote.status === 'REJECTED';
              const isLowestPrice = quote.totalAmount === minPrice;

              return (
                <div
                  key={quote.id}
                  className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between ${
                    isAccepted
                      ? 'border-emerald-500 ring-4 ring-emerald-500/10 shadow-lg'
                      : isRejected
                      ? 'border-slate-100 opacity-60'
                      : 'border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-400'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Badges Bar */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isLowestPrice && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold uppercase">
                            Best Value
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {quote.provider.experienceYears || 5} Years Exp
                        </span>
                      </div>
                      <StatusBadge status={quote.status} />
                    </div>

                    {/* Provider Info Header */}
                    <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-slate-900">
                            {quote.provider.businessName || quote.provider.user?.name}
                          </h3>
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {quote.provider.averageRating || 5.0} ({quote.provider.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-brand-600 block">
                          ₹{(quote.totalAmount / 100).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">Total All-inclusive</span>
                      </div>
                    </div>

                    {/* Itemized Line Items */}
                    {quote.lineItems && quote.lineItems.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Itemized Cost Components:
                        </span>
                        <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 border border-slate-100 text-xs font-medium">
                          {quote.lineItems.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center text-slate-700">
                              <span className="truncate pr-2">
                                {item.description} {item.quantity > 1 && `(x${item.quantity})`}
                              </span>
                              <span className="font-extrabold text-slate-900 shrink-0">
                                ₹{(item.total / 100).toLocaleString('en-IN')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes & Guarantees */}
                    {quote.notes && (
                      <div className="p-3 bg-brand-50/50 rounded-2xl border border-brand-100/60 text-xs">
                        <span className="font-bold text-brand-900 block mb-0.5">Technician Scope & Warranty:</span>
                        <p className="text-slate-600 leading-relaxed">{quote.notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Est. Duration: {quote.estimatedHours || 2} Hours
                      </span>
                      <span>Valid until: {new Date(quote.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Accept / Status CTA */}
                  <div className="pt-6 border-t border-slate-100 mt-6">
                    {isAccepted ? (
                      <div className="py-3 px-4 bg-emerald-50 text-emerald-800 rounded-2xl text-center text-xs font-black flex items-center justify-center gap-2 border border-emerald-200">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Accepted Quotation • Booking Confirmed</span>
                      </div>
                    ) : isRejected ? (
                      <div className="py-3 px-4 bg-slate-100 text-slate-400 rounded-2xl text-center text-xs font-bold">
                        Declined
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAccept(quote.id)}
                        disabled={acceptingId !== null}
                        className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-2xl shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {acceptingId === quote.id ? (
                          <span>Confirming Booking...</span>
                        ) : (
                          <>
                            <span>Select & Confirm Booking</span>
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
