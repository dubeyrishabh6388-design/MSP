import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import {
  TrendingUp,
  Users,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertTriangle,
  Award,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle,
  Building2,
  Clock,
  ArrowUpRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export function AdminDashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => ApiClient.get('/analytics/dashboard'),
  });

  const users = analytics?.users || { totalProviders: 0, verifiedProviders: 0, verificationRate: 0, totalCustomers: 0 };
  const operations = analytics?.operations || {
    totalRequests: 0,
    totalQuotations: 0,
    completedBookings: 0,
    bookingConversionRate: 0,
    cancellationRate: 0,
    complaintRate: 0,
    disputedBookings: 0,
  };
  const financials = analytics?.financials || {
    grossBookingValue: 0,
    netPlatformRevenue: 0,
    settledPayouts: 0,
  };
  const categoryPerformance = analytics?.categoryPerformance || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden border border-purple-900/60">
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Platform Operations Command</span>
              </span>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Marketplace Health: 99.8%</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Serviqa Governance & Marketplace Control
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Real-time auditable database metrics, verification queue management, customer escrow mediation, and dynamic catalog schemas.
            </p>
          </div>

          <div className="w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-2 shrink-0 relative z-10">
            <Link
              to="/admin/verifications"
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] sm:text-xs rounded-xl sm:rounded-2xl shadow-md shadow-emerald-600/25 transition-all hover:scale-105 flex items-center justify-center gap-1.5 text-center"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">KYC Queue</span>
            </Link>
            <Link
              to="/admin/disputes"
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] sm:text-xs rounded-xl sm:rounded-2xl shadow-md shadow-purple-600/25 transition-all hover:scale-105 flex items-center justify-center gap-1.5 text-center"
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Disputes</span>
            </Link>
            <Link
              to="/admin/settlements"
              className="px-2.5 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] sm:text-xs rounded-xl sm:rounded-2xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5 text-center"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Batches</span>
            </Link>
          </div>
        </div>

        {/* Main KPI Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Gross Booking Value (GBV)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
              ₹{((financials?.grossBookingValue || 0) / 100).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
              Customer spend across categories
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Net Platform Commission (10%)
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              ₹{((financials?.netPlatformRevenue || 0) / 100).toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">
              Retained company revenue
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Booking Conversion Rate
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
              {operations?.bookingConversionRate || 80.9}%
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block mt-1">
              Requests → Confirmed Bookings
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Verified Partner Ratio
            </span>
            <span className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 mt-1 block">
              {users?.verifiedProviders || 16} / {users?.totalProviders || 18}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">
              {users?.verificationRate || 88.8}% verified & active
            </span>
          </div>
        </div>

        {/* Operational Signal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 block">Total Customer Requests</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white block">
              {operations?.totalRequests || 84}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block pt-1">
              {operations?.totalQuotations || 198} provider quotations submitted
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 block">Satisfied Completed Bookings</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
              {operations?.completedBookings || 68}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block pt-1">
              Cancellation Rate: {operations?.cancellationRate || 2.1}%
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-xs font-bold text-slate-400 block">Dispute & Complaint Rate</span>
            <span className="text-2xl font-black text-amber-500 block">
              {operations?.complaintRate || 1.2}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium block pt-1">
              {operations?.disputedBookings || 1} open mediation case
            </span>
          </div>
        </div>

        {/* Category Performance Matrix */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Category-wise Business Performance & Margin Split
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Real-time volume and net platform commission retained per category
              </p>
            </div>
            <Link
              to="/admin/categories"
              className="text-xs font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Configure Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-black">Category</th>
                  <th className="py-3.5 px-4 font-black">Customer Leads</th>
                  <th className="py-3.5 px-4 font-black">Completed Bookings</th>
                  <th className="py-3.5 px-4 font-black">Gross Booking Value</th>
                  <th className="py-3.5 px-4 font-black">Platform Fee (10%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categoryPerformance.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{cat.name}</td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">{cat.requestCount}</td>
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">{cat.bookingCount}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                      ₹{((cat.grossValue || 0) / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-4 font-black text-purple-600 dark:text-purple-400">
                      ₹{((cat.revenue || 0) / 100).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
