import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Wrench,
  Clock,
  Calendar,
  CheckCircle,
  FileText,
  ChevronRight,
  Plus,
  Package,
  Sparkles,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Receipt,
  RotateCcw,
} from 'lucide-react';

export function CustomerDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'requests'>('bookings');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => ApiClient.get('/bookings'),
  });

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['my-requests'],
    queryFn: () => ApiClient.get('/service-requests'),
  });

  const activeBookings = bookings.filter(
    (b: any) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED' && b.status !== 'REFUNDED'
  );

  const completedBookings = bookings.filter((b: any) => b.status === 'COMPLETED');

  const filteredBookings = bookings.filter((b: any) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return b.status !== 'COMPLETED' && b.status !== 'CANCELLED';
    if (statusFilter === 'COMPLETED') return b.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-600/20 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider mb-2 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Customer Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {user?.name || 'Rahul Sharma'}!
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl font-medium leading-relaxed">
              Track live technicians on-site, review itemized quotations from local pros, or manage saved addresses.
            </p>
          </div>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-orange-50 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all hover:scale-105 shrink-0 cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 stroke-[3] text-brand-600" />
            <span>Book New Service</span>
          </Link>
        </div>

        {/* Quick KPI Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Active Jobs
            </span>
            <span className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400 block">
              {activeBookings.length}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              Real-time live tracking
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Open Requests
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
              {requests.length}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
              Collecting pro quotations
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Completed Jobs
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
              {completedBookings.length}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              30-day warranty covered
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Escrow Protection
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-500 block">
              100%
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
              Zero upfront release risk
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('bookings')}
              className={`py-3 px-5 text-xs font-black border-b-2 transition-colors cursor-pointer ${
                activeTab === 'bookings'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Confirmed Bookings ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-3 px-5 text-xs font-black border-b-2 transition-colors cursor-pointer ${
                activeTab === 'requests'
                  ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              Active Quotation Requests ({requests.length})
            </button>
          </div>

          {activeTab === 'bookings' && (
            <div className="flex items-center gap-1.5 pb-2 sm:pb-0">
              {['ALL', 'ACTIVE', 'COMPLETED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                    statusFilter === filter
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bookings View */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
                <Package className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                  No Bookings Matching Filter
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                  Submit a service request or browse top categories to get quotes.
                </p>
                <Link
                  to="/"
                  className="px-5 py-2.5 bg-brand-600 text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  Explore Services
                </Link>
              </div>
            ) : (
              filteredBookings.map((b: any) => (
                <div
                  key={b.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        #{b.bookingNumber}
                      </span>
                      <StatusBadge status={b.status} />
                      <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                        {b.request?.category?.name || 'Home Service'}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {b.request?.title || 'Confirmed Booking'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <span>
                        Provider:{' '}
                        <strong className="text-slate-800 dark:text-slate-200">
                          {b.provider?.businessName || 'Verified Technician'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {b.address?.city || 'Mumbai'}
                      </span>
                      <span>•</span>
                      <span>Scheduled: {new Date(b.scheduledDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <span className="text-lg sm:text-xl font-black text-brand-600 dark:text-brand-400 block">
                        ₹{(b.agreedAmount / 100).toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        Escrow Protected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/bookings/${b.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        <span>Track Live Job</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Requests View */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requestsLoading ? (
              <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
            ) : requests.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
                <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
                  No Open Service Requests
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Submit your service specifications to receive itemized quotations from local pros.
                </p>
              </div>
            ) : (
              requests.map((req: any) => (
                <div
                  key={req.id}
                  className="group bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-brand-400 dark:hover:border-brand-500 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={req.status} />
                      <span className="text-xs font-black text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                        {req.quotations?.length || 0} Quotes Received
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {req.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{req.description}</p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <Link
                      to={`/customer/requests/${req.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors"
                    >
                      <span>Compare Quotations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
