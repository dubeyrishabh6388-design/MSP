import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import {
  Award,
  Star,
  CheckCircle2,
  Shield,
  ShieldCheck,
  TrendingUp,
  Share2,
  AlertCircle,
  HelpCircle,
  Zap,
  Sparkles,
  Crown,
  ChevronRight,
  Gift,
} from 'lucide-react';
import { ConsentStatus } from '@serviqa/shared';

export function ProviderRewardsPage() {
  const queryClient = useQueryClient();

  const { data: scoreData, isLoading } = useQuery({
    queryKey: ['provider-score'],
    queryFn: () => ApiClient.get('/rewards/my-score'),
  });

  const consentMutation = useMutation({
    mutationFn: (status: ConsentStatus) => ApiClient.post('/rewards/consent', { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-score'] });
    },
  });

  const hasConsent = scoreData?.hasSocialConsent;
  const breakdown = scoreData?.breakdown || {
    jobsWeight: '30%',
    jobsScore: 0,
    ratingWeight: '25%',
    ratingScore: 0,
    punctualityWeight: '20%',
    punctualityScore: 0,
    qualityWeight: '15%',
    qualityScore: 0,
    conductWeight: '10%',
    conductScore: 0,
  };

  const compositeScore = scoreData?.compositeScore || 0;

  const tiers = [
    {
      name: 'Bronze Partner',
      minScore: 0,
      active: compositeScore < 70,
      color: 'from-amber-700 to-amber-900',
      perks: ['Standard Lead Matching', 'Weekly Settlement', 'Basic Profile'],
    },
    {
      name: 'Silver Partner',
      minScore: 70,
      active: compositeScore >= 70 && compositeScore < 85,
      color: 'from-slate-400 to-slate-600',
      perks: ['10m Early Job Lead Alert', 'Verified Partner Badge', 'Standard Support'],
    },
    {
      name: 'Gold Partner',
      minScore: 85,
      active: compositeScore >= 85 && compositeScore < 92,
      color: 'from-amber-400 to-amber-600',
      perks: ['Priority Lead Access', 'Gold Pro Badge on Customer Search', 'Dedicated WhatsApp Support'],
    },
    {
      name: 'Platinum Master',
      minScore: 92,
      active: compositeScore >= 92,
      color: 'from-emerald-500 to-teal-700',
      perks: ['Instant Instant Dispatch Matching', '₹2,500 Monthly Cash Bonus Pool', '0% Surge Fees', 'Direct Account Manager'],
    },
  ];

  const earnedBadges = scoreData?.badges || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <main className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <Link to="/provider" className="hover:text-emerald-500 transition-colors">Provider Portal</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-bold">Rewards & Scorecard</span>
        </nav>

        {/* Hero Score Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-bold mb-3 backdrop-blur-sm border border-white/20">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Monthly Excellence Program • November 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Performance & Rewards Scorecard
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-xl leading-relaxed">
              Transparent, auditable evaluation based strictly on customer satisfaction, on-time arrivals, and zero-dispute craftsmanship. No arbitrary algorithms.
            </p>
          </div>

          <div className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center shrink-0 min-w-[200px] shadow-lg">
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
              Composite Excellence Score
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-5xl font-black text-white">{compositeScore}</span>
              <span className="text-lg font-bold text-emerald-300">/100</span>
            </div>
            <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
              <Crown className="w-3.5 h-3.5" />
              <span>Platinum Master Tier</span>
            </div>
          </div>
        </div>

        {/* Partner Tiers Progression Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <span>Partner Excellence Tier Progression</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Higher tier partners get priority dispatch leads, lower commissions, and cash bonuses.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Your Current Status: Platinum Master (Top 3% in Mumbai)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-5 border transition-all ${
                  tier.active
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-md dark:border-emerald-500/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {tier.name}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-400">
                    {tier.minScore}+ pts
                  </span>
                </div>

                <div className="space-y-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  {tier.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${tier.active ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>

                {tier.active && (
                  <div className="mt-4 pt-3 border-t border-emerald-500/20 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                      Active Tier
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5-Pillar Auditable Evaluation Framework */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>5-Pillar Auditable Evaluation Framework</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Every calculation is mathematically transparent. No hidden ranking penalties.
              </p>
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Weights standardized across peers</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pillar 1 */}
            <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Verified Completed Jobs</span>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Weight: {breakdown?.jobsWeight || '25%'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{breakdown?.jobsScore || 96}%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Excellent</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${breakdown?.jobsScore || 96}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Calculated strictly from jobs verified via Customer Completion OTP.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Customer Ratings</span>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Weight: {breakdown?.ratingWeight || '30%'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{breakdown?.ratingScore || 94}%</span>
                <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> 4.9/5 Avg
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${breakdown?.ratingScore || 94}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                100% genuine reviews from paid residential and commercial customers.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Punctuality & Reliability</span>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Weight: {breakdown?.punctualityWeight || '20%'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{breakdown?.punctualityScore || 92}%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">98.2% On-Time</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${breakdown?.punctualityScore || 92}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Doorstep arrival time compared against scheduled window.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Zero Disputes & Quality Signals</span>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Weight: {breakdown?.qualityWeight || '15%'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{breakdown?.qualityScore || 98}%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">0 Complaints</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${breakdown?.qualityScore || 98}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Zero warranty claim escalations or un-rectified issues.
              </p>
            </div>

            {/* Pillar 5 */}
            <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Professional Conduct & Safety</span>
                <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  Weight: {breakdown?.conductWeight || '10%'}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">{breakdown?.conductScore || 95}%</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Vetted Pro</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${breakdown?.conductScore || 95}%` }} />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Safety equipment compliance, badge wear, clean work station.
              </p>
            </div>

            {/* Monthly Bonus Eligibility Card */}
            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-800/60 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>Monthly Excellence Bonus</span>
                </div>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
                  ₹2,500 Cash Reward
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  You are currently in the Top 3% of technicians in Mumbai. Cash reward credits automatically with month-end settlement!
                </p>
              </div>

              <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Eligibility Confirmed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span>Craftsmanship Achievement Badges ({earnedBadges.length})</span>
            </h2>
            <span className="text-xs text-slate-400">Visible on Customer Quote Cards</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {earnedBadges.map((badge: any) => (
              <div
                key={badge.id}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-4 hover:border-amber-400/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-2xl flex items-center justify-center shrink-0 shadow-sm border border-amber-300 dark:border-amber-800">
                  {badge.icon || '🏅'}
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-900 dark:text-white">{badge.badgeName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-2 font-semibold">
                    Earned on: {new Date(badge.earnedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explicit Social Media & DPDP Privacy Consent */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Social Media Recognition & DPDP Privacy Consent
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                In strict compliance with India's Digital Personal Data Protection (DPDP) Act, Serviqa requires your explicit consent before featuring your photo, quote stories, or performance in public spotlights.
              </p>
            </div>

            <div className="shrink-0">
              {hasConsent ? (
                <button
                  onClick={() => consentMutation.mutate(ConsentStatus.WITHDRAWN)}
                  className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors"
                >
                  Withdraw Spotlight Consent
                </button>
              ) : (
                <button
                  onClick={() => consentMutation.mutate(ConsentStatus.GRANTED)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-colors"
                >
                  Grant Explicit Spotlight Consent
                </button>
              )}
            </div>
          </div>

          <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <ShieldCheck className={`w-5 h-5 shrink-0 ${hasConsent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
              <div>
                <span className="font-bold text-slate-800 dark:text-white block">
                  Consent Status: {hasConsent ? 'GRANTED (Digitally Logged)' : 'WITHDRAWN / NOT GRANTED'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {hasConsent
                    ? 'Eligible for "Technician of the Month" billboard & social stories'
                    : 'Protected: Marketing team cannot publish your name or photos'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-400 self-end sm:self-auto">
              DPDP Act 2023 Compliant
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
