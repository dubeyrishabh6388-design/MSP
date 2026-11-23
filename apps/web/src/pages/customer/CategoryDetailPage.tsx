import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ApiClient } from '../../api/client';
import {
  Wrench,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  DollarSign,
  ArrowRight,
  Info,
  Check,
  Star,
  Sparkles,
  ArrowLeft,
  Tag,
  Zap,
  Calendar,
  Layers,
} from 'lucide-react';

export function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: category, isLoading, error } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => ApiClient.get(`/categories/${slug}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen py-16 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 space-y-8 animate-pulse">
        <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-black text-slate-900 mb-2">Category Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">The requested service category could not be loaded.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white font-bold text-xs rounded-xl hover:bg-brand-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Services</span>
        </Link>
      </div>
    );
  }

  const getWorkflowBadge = () => {
    switch (category.workflowType) {
      case 'FIXED_PRICE':
        return { label: 'Instant Standard Booking', desc: 'Direct scheduling with upfront standardized pricing' };
      case 'INSPECTION_FIRST':
        return { label: 'Diagnostic Visit + Estimate', desc: 'Expert inspection fee followed by in-app parts/repair sign-off' };
      case 'CUSTOM_QUOTATION':
        return { label: 'Competitive Quotation Bidding', desc: 'Describe scope to receive competitive itemized bids from verified providers' };
      default:
        return { label: 'Scheduled Service', desc: 'Flexible scheduling with guaranteed partner SLA' };
    }
  };

  const workflow = getWorkflowBadge();
  const subCategories = category.subCategories || [];

  return (
    <div className="w-full bg-white dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. FULL-BLEED CINEMATIC CATEGORY HERO BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-slate-950 text-white pt-10 pb-20">
        {/* Background photo blend */}
        {category.imageUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-full h-full object-cover opacity-25 filter blur-[1px] scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
          </div>
        )}

        <div className="relative z-10 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
            <Link to="/" className="hover:text-white transition flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Full Catalog</span>
            </Link>
            <span>/</span>
            <span className="text-white font-bold">{category.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title & Overview */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>{workflow.label}</span>
              </div>

              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
                {category.name}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl font-normal leading-relaxed">
                {category.description}
              </p>

              {/* Key Trust Signals */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium pt-3">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Police & Skill Audited Pros</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400 shrink-0" />
                  <span>4.9 / 5 Rating from verified jobs</span>
                </div>
                <span className="text-slate-600">•</span>
                <div className="flex items-center gap-1.5 text-blue-300">
                  <Zap className="w-4 h-4 shrink-0" />
                  <span>Doorstep Service in 60 Mins</span>
                </div>
              </div>
            </div>

            {/* Right Column: Instant Action Callout */}
            <div className="lg:col-span-4">
              <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-4">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Starting from
                  </span>
                  <span className="text-3xl font-black text-white">
                    ₹{(category.basePrice / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                {category.inspectionFee > 0 && (
                  <p className="text-xs text-slate-300 border-t border-white/10 pt-3">
                    <span className="font-bold text-amber-300">Diagnostic Visit:</span> ₹
                    {(category.inspectionFee / 100).toLocaleString('en-IN')} (deducted if service is availed)
                  </p>
                )}

                <p className="text-xs text-slate-300">
                  Select a specialized package below or submit custom specifications for quotations.
                </p>

                <Link
                  to={`/services/${category.slug}/request`}
                  className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-500 text-white font-black text-xs rounded-xl shadow-lg shadow-brand-600/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>Book / Request Quotation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. SUBCATEGORIES SECTION (SPECIALIZED SERVICE PACKAGES)
      ───────────────────────────────────────────────────────────── */}
      {subCategories.length > 0 && (
        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider mb-2">
                <Layers className="w-3.5 h-3.5" />
                <span>Specialized Service Packages</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
                Choose a Specific {category.name} Service
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Transparent packages with itemized pricing, duration estimates, and specialized technician toolkits.
              </p>
            </div>

            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 border border-transparent dark:border-slate-800 px-3.5 py-1.5 rounded-full self-start md:self-auto">
              {subCategories.length} services available
            </span>
          </div>

          {/* Subcategories Responsive Grid (Adaptive 1-2 on mobile, up to 6 on desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-6">
            {subCategories.map((sub: any) => {
              const priceFormatted = sub.basePrice
                ? `₹${(sub.basePrice / 100).toLocaleString('en-IN')}`
                : `From ₹${(category.basePrice / 100).toLocaleString('en-IN')}`;

              return (
                <div
                  key={sub.id}
                  className="group flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500"
                >
                  {/* Subcategory Photo Header */}
                  <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        sub.imageUrl ||
                        category.imageUrl ||
                        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Duration Badge */}
                    {sub.durationMin && (
                      <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold">
                        <Clock className="w-3 h-3 text-brand-400" />
                        <span>{sub.durationMin >= 60 ? `${sub.durationMin / 60} hrs` : `${sub.durationMin} mins`}</span>
                      </div>
                    )}

                    {/* Price Tag */}
                    <div className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3">
                      <span className="text-white text-sm sm:text-base font-black drop-shadow">
                        {priceFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Subcategory Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                        {sub.name}
                      </h3>
                      {sub.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal line-clamp-2">
                          {sub.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-2.5 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verified Pro</span>
                      </div>

                      <Link
                        to={`/services/${category.slug}/request?subCategoryId=${sub.id}&subCategoryName=${encodeURIComponent(
                          sub.name
                        )}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-600 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        <span>Select & Book</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. HOW IT WORKS (FLUID PROCESS FLOW)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 border-t border-slate-100 dark:border-slate-800">
        <div className="text-left mb-8 sm:mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Transparent Execution
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white">
            How {category.name} Works on Serviqa
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          <div className="p-6 bg-slate-50/80 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 flex items-center justify-center font-black text-sm">
              01
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Choose Service & Slot</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Select your specific package or describe symptoms. Pick a slot that suits your schedule.
            </p>
          </div>

          <div className="p-6 bg-slate-50/80 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 flex items-center justify-center font-black text-sm">
              02
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Verified Pro Assigned</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              A background-verified specialist accepts the request or submits an itemized proposal.
            </p>
          </div>

          <div className="p-6 bg-slate-50/80 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 flex items-center justify-center font-black text-sm">
              03
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">In-App Parts Sign-off</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              If additional spare parts or repairs are required, technician requests in-app customer approval first.
            </p>
          </div>

          <div className="p-6 bg-slate-50/80 dark:bg-slate-900 rounded-2xl border border-transparent dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 flex items-center justify-center font-black text-sm">
              04
            </div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Satisfied Finish & Pay</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Inspect work completion before funds are settled. Revisit warranty and 100% genuine reviews.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. CATEGORY PARAMETERS PREVIEW
      ───────────────────────────────────────────────────────────── */}
      {category.fields && category.fields.length > 0 && (
        <section className="w-full py-10 sm:py-12 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <Info className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
              <h3 className="text-base sm:text-lg font-black">
                Custom Specifications Captured for {category.name}
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              When booking, our form dynamically requests these trade-specific parameters:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              {category.fields.map((f: any) => (
                <div key={f.id} className="p-3 sm:p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block truncate">{f.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    Type: {f.type} {f.required && '• (Required)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. FULL-BLEED BOTTOM CTA
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 text-white py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Ready to schedule?
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Get {category.name} Handled by Trusted Experts
            </h3>
            <p className="text-xs sm:text-sm text-brand-100 max-w-xl font-normal leading-relaxed">
              Enjoy complete peace of mind with upfront pricing, verified background screening, and customer satisfaction escrow.
            </p>
          </div>

          <Link
            to={`/services/${category.slug}/request`}
            className="w-full sm:w-auto text-center px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl shadow-xl transition-all hover:scale-105 shrink-0 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Requirement Form</span>
            <ArrowRight className="w-4 h-4 text-brand-600" />
          </Link>
        </div>
      </section>
    </div>
  );
}
