import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClient } from '../../api/client';
import { LocationPicker } from '../../components/common/LocationPicker';
import { ServiceSearchAutocomplete } from '../../components/customer/ServiceSearchAutocomplete';
import {
  AirVent,
  Truck,
  Sparkles,
  Droplet,
  Zap,
  Cpu,
  Paintbrush,
  ShieldCheck,
  Hammer,
  Waves,
  Smile,
  Monitor,
  Search,
  CheckCircle,
  Star,
  Clock,
  Shield,
  ArrowRight,
  TrendingUp,
  Wrench,
  MapPin,
  Calendar,
  Award,
  ChevronRight,
  Check,
  DollarSign,
  HeartHandshake,
  Layers,
  CheckCircle2,
  ThumbsUp,
  Headphones,
  BadgeCheck,
  PhoneCall,
  Flame,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  AirVent: <AirVent className="w-5 h-5" />,
  Truck: <Truck className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Droplet: <Droplet className="w-5 h-5" />,
  Zap: <Zap className="w-5 h-5" />,
  Cpu: <Cpu className="w-5 h-5" />,
  Paintbrush: <Paintbrush className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  Hammer: <Hammer className="w-5 h-5" />,
  Waves: <Waves className="w-5 h-5" />,
  Smile: <Smile className="w-5 h-5" />,
  Monitor: <Monitor className="w-5 h-5" />,
};

const CATEGORY_TABS = [
  { id: 'all', label: 'All Categories' },
  { id: 'repairs', label: 'AC & Appliances', match: ['ac-repair', 'appliance-repair', 'ro-water-purifier', 'computer-it-support'] },
  { id: 'relocation', label: 'Packers & Movers', match: ['packers-movers'] },
  { id: 'cleaning', label: 'Cleaning & Pest', match: ['home-cleaning', 'pest-control'] },
  { id: 'electric-plumb', label: 'Electric & Plumbing', match: ['electricians', 'plumbing', 'carpentry', 'painting'] },
];

const POPULAR_QUICK_SEARCHES = [
  { label: 'AC Foam Jet Wash', slug: 'ac-repair' },
  { label: '1 BHK Relocation', slug: 'packers-movers' },
  { label: 'Deep Home Cleaning', slug: 'home-cleaning' },
  { label: 'Electrician on Call', slug: 'electricians' },
  { label: 'Plumbing Repairs', slug: 'plumbing' },
  { label: 'RO Filter Service', slug: 'ro-water-purifier' },
];

export function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ApiClient.get('/categories'),
  });

  // Filter categories
  const filteredCategories = categories.filter((cat: any) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;

    const tabConfig = CATEGORY_TABS.find((t) => t.id === activeTab);
    return tabConfig ? tabConfig.match?.includes(cat.slug) : true;
  });

  // Extract all subcategories from all categories for the trending showcase
  const allSubCategories = categories.flatMap((cat: any) =>
    (cat.subCategories || []).map((sub: any) => ({
      ...sub,
      categorySlug: cat.slug,
      categoryName: cat.name,
    }))
  );

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. WIDE HERO SECTION: SPLIT MODERN LUXURY LAYOUT
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-orange-50/80 via-white to-[#fafbfc] dark:from-slate-950 dark:via-[#0c1220] dark:to-[#090d16] pt-6 sm:pt-10 pb-16 sm:pb-20 border-b border-slate-100 dark:border-slate-800/80 transition-colors duration-200">
        {/* Soft background ambient gradient lights (Desktop & Tablet) */}
        <div className="hidden sm:block absolute top-0 right-1/4 w-[600px] h-[400px] bg-gradient-to-br from-orange-200/40 dark:from-orange-500/10 via-amber-200/30 dark:via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />
        <div className="hidden sm:block absolute top-20 left-10 w-96 h-96 bg-brand-200/20 dark:bg-brand-500/10 blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left 7 Columns: Messaging & Search */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7">
              {/* Trust Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white dark:bg-slate-900/90 border border-brand-200 dark:border-brand-900/60 shadow-xs text-brand-700 dark:text-brand-300 text-[11px] sm:text-xs font-bold hover:shadow-sm transition-all max-w-full">
                <span className="flex h-2.5 w-2.5 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600"></span>
                </span>
                <span className="truncate sm:whitespace-normal">100% Background-Audited Specialists • Pay Only After Service</span>
              </div>

              {/* High-Impact Headline */}
              <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl xl:text-[68px] font-black text-slate-950 dark:text-white tracking-tight leading-[1.12] sm:leading-[1.06]">
                Expert Home Services,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-orange-500 to-amber-500">
                  Delivered In Minutes.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
                From deep AC foam jet servicing and trusted home shifting to electrical repairs and plumbing. Compare transparent, itemized quotes from verified local specialists with customer escrow protection.
              </p>

              {/* Integrated Wide Search Bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-slate-900/6 dark:shadow-black/50 border border-slate-200/80 dark:border-slate-800 transition-all focus-within:ring-4 focus-within:ring-brand-500/15">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                  {/* Service input with Instant Live Suggestions Dropdown */}
                  <div className="md:col-span-5 relative">
                    <ServiceSearchAutocomplete
                      categories={categories}
                      onSearchSubmit={(q) => {
                        setSearchQuery(q);
                        if (filteredCategories.length > 0) {
                          navigate(`/services/${filteredCategories[0].slug}`);
                        }
                      }}
                    />
                  </div>

                  {/* Live Location / City selector */}
                  <div className="md:col-span-4">
                    <LocationPicker variant="hero" />
                  </div>

                  {/* CTA button */}
                  <div className="md:col-span-3">
                    <button
                      onClick={() => {
                        if (filteredCategories.length > 0) {
                          navigate(`/services/${filteredCategories[0].slug}`);
                        }
                      }}
                      className="w-full min-h-[52px] py-3.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Find Services</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular quick searches (scrollable on mobile) */}
              <div className="flex items-center gap-2 text-xs overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
                <span className="text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1 shrink-0">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  Trending:
                </span>
                {POPULAR_QUICK_SEARCHES.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/services/${item.slug}`}
                    className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 hover:bg-orange-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200/80 dark:border-slate-800 font-medium transition shadow-2xs hover:border-brand-300 shrink-0 whitespace-nowrap"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Metric Guarantees Strip */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-left border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/60 sm:bg-transparent">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">100% Vetted</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight block">Skill Audited</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/60 sm:bg-transparent">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">4.9 / 5 Rating</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight block">Verified Reviews</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/60 sm:bg-transparent">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shrink-0">
                    <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">No Hidden Fees</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight block">Itemized Quotes</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 sm:gap-3 p-2 rounded-xl bg-slate-50/60 dark:bg-slate-900/60 sm:bg-transparent">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold shrink-0">
                    <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">Escrow Protected</span>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-tight block">Pay on Satisfied</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Vibrant Visual Showcase with Floating Cards */}
            <div className="lg:col-span-5 relative mt-4 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 bg-slate-900 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] max-h-[560px] w-full">
                <img
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
                  alt="Verified Professional Technician"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                {/* Floating Badge 1: Top Verified Provider Pill (Hidden on xs mobile to prevent clutter) */}
                <div className="hidden sm:flex absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-3 shadow-xl items-center gap-3 border border-slate-100 dark:border-slate-800 max-w-xs">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shrink-0">
                    <BadgeCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block">Rajesh Kumar</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">
                      Senior HVAC Specialist • 1,420 Jobs
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">⭐ 4.95 Verified Rating</span>
                  </div>
                </div>

                {/* Floating Badge 2: Bottom Right Escrow Guarantee */}
                <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 bg-slate-950/90 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-white/15 dark:border-slate-700/80 text-white max-w-[210px] xs:max-w-[250px] sm:max-w-xs">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-amber-400 text-[11px] sm:text-xs font-black mb-0.5 sm:mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span>Customer Escrow Protection</span>
                  </div>
                  <p className="text-[9px] sm:text-[11px] text-slate-300 leading-snug">
                    Funds remain safe in platform escrow. Release payment only after you sign off on completed work.
                  </p>
                </div>

                {/* Bottom Left Quick Category Tag */}
                <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5">
                  <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-brand-600/90 backdrop-blur-md text-white font-extrabold text-[10px] sm:text-xs shadow-md">
                    ⚡ 60-Min Doorstep
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MOST BOOKED SUBCATEGORIES STRIP (INSTANT DISCOVERY)
      ───────────────────────────────────────────────────────────── */}
      {allSubCategories.length > 0 && (
        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Popular Services</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Most Booked Services Near You
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Directly select high-demand packages with standardized prices and verified specialists.
              </p>
            </div>

            <Link
              to="/services/ac-repair"
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Subcategories Fluid 2-Column Mobile Grid & Multi-Column Desktop Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6">
            {allSubCategories.slice(0, 12).map((sub: any) => (
              <div
                key={sub.id}
                className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-100 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative h-28 xs:h-36 sm:h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={sub.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80'}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                  {/* Duration Badge */}
                  {sub.durationMin && (
                    <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[9px] sm:text-[11px] font-bold">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-brand-400" />
                      <span>{sub.durationMin >= 60 ? `${sub.durationMin / 60} hrs` : `${sub.durationMin} mins`}</span>
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5">
                    <span className="text-white text-xs xs:text-sm sm:text-base font-black drop-shadow">
                      ₹{((sub.basePrice || 49900) / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Subcategory Details */}
                <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-brand-600 dark:text-brand-400 block mb-0.5 truncate">
                      {sub.categoryName}
                    </span>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug line-clamp-1">
                      {sub.name}
                    </h3>
                    <p className="hidden sm:block text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-normal leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                      <span className="hidden xs:inline">Verified Pro</span>
                      <span className="xs:hidden">Verified</span>
                    </div>

                    <Link
                      to={`/services/${sub.categorySlug}/request?subCategoryId=${sub.id}&subCategoryName=${encodeURIComponent(
                        sub.name
                      )}`}
                      className="inline-flex items-center gap-0.5 sm:gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-brand-50 dark:bg-brand-950/50 hover:bg-brand-600 dark:hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white font-extrabold text-[10px] sm:text-xs rounded-lg sm:rounded-xl transition-colors cursor-pointer"
                    >
                      <span>Book</span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. FULL CATEGORY DIRECTORY: BRIGHT, CLEAN, VIBRANT TILES
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-12 sm:py-16 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Full Category Directory</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Explore Services by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Each category features trade-specific booking workflows, verified local pros, and itemized quotations.
            </p>
          </div>

          {/* Filter Pills (Smooth scroll on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto -mx-1 px-1">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid (2 Columns on Mobile, 3 on Tablet, Up to 8 on Ultra-Wide) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-5 animate-pulse">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="py-20 text-center">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Categories Found</h3>
            <p className="text-xs text-slate-400 mt-1">Try searching for "AC", "Movers", or switch the category filter tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-5">
            {filteredCategories.map((cat: any) => {
              const subCount = cat.subCategories?.length || 0;
              const workflowTypeLabel =
                cat.workflowType === 'FIXED_PRICE'
                  ? 'Standard'
                  : cat.workflowType === 'INSPECTION_FIRST'
                  ? 'Inspection'
                  : 'Multi-Bids';

              return (
                <Link
                  key={cat.id}
                  to={`/services/${cat.slug}`}
                  className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 border border-slate-200/80 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 flex flex-col justify-between"
                >
                  {/* Clean Bright Category Photo Header */}
                  <div className="relative h-32 sm:h-40 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={
                        cat.imageUrl ||
                        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
                      }
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Icon Badge Top Left */}
                    <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-xs">
                      {ICON_MAP[cat.icon] || <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>

                    {/* Workflow Badge Top Right */}
                    <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 text-[8px] sm:text-[9px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md text-slate-100">
                      {workflowTypeLabel}
                    </span>

                    {/* Subcategory Count Tag */}
                    {subCount > 0 && (
                      <div className="absolute bottom-1.5 left-2 sm:bottom-2 sm:left-2.5">
                        <span className="text-[9px] sm:text-[10px] font-black text-white drop-shadow-md">
                          {subCount} Sub-Services
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-1.5 sm:space-y-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug line-clamp-1 sm:line-clamp-2">
                        {cat.name}
                      </h3>
                      <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-2 sm:pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[8px] sm:text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-wider">
                          From
                        </span>
                        <span className="text-xs sm:text-sm font-black text-brand-600 dark:text-brand-400">
                          ₹{(cat.basePrice / 100).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-0.5 text-[11px] sm:text-xs font-black text-slate-400 dark:text-slate-500 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all">
                        <span>View</span>
                        <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. ADAPTIVE WORKFLOW INTELLIGENCE: WIDE CONTRAST CANVAS
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#0b0f19] dark:bg-[#060911] text-white py-16 sm:py-24 my-6 sm:my-8 border-t border-b border-slate-800/80">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="w-full max-w-4xl mb-10 sm:mb-14">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-2">
              Adaptive Category Intelligence
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Different Services Need Different Workflows
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 sm:mt-3 leading-relaxed">
              We never force a complex moving job into a generic form. Serviqa dynamically adapts questions, quotation structures, and parts authorization for every trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Feature 1: AC Repair */}
            <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-10 rounded-2xl border border-white/10 hover:border-brand-500/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                    <AirVent className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">AC Servicing & Repair Flow</h3>
                    <span className="text-xs text-brand-300 font-semibold block">Inspection First + Spare Parts Approval</span>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-3.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Choose exact AC type (Split, Window, Inverter) and tonnage</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Fixed inspection visit charge (₹299) before on-site repairs</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Technicians cannot add extra parts without your in-app sign-off</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/services/ac-repair"
                className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300"
              >
                <span>Explore AC Repair Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2: Packers and Movers */}
            <div className="bg-white/5 backdrop-blur-xl p-6 sm:p-10 rounded-2xl border border-white/10 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-white">Packers & Movers Relocation Flow</h3>
                    <span className="text-xs text-amber-300 font-semibold block">Itemized Multi-Vendor Bidding & Inventory</span>
                  </div>
                </div>

                <ul className="space-y-3 sm:space-y-3.5 text-xs sm:text-sm text-slate-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Specify detailed room inventory, floor levels & elevator status</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified moving companies submit itemized competitive bids</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dedicated transport, 5-layer bubble packing & transit insurance</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/services/packers-movers"
                className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300"
              >
                <span>Explore Shifting Packages</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. GENUINE AUDITED REVIEWS: AIRY & TRUSTWORTHY
      ───────────────────────────────────────────────────────────── */}
      <section id="trust-safety" className="w-full py-16 sm:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full max-w-2xl mb-8 sm:mb-12">
          <span className="text-xs font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 block mb-1">
            Genuine Feedback Only
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 dark:text-white">
            Real Reviews From Paid Bookings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Anonymous testimonials and fabricated reviews are strictly blocked by our audit system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Verified Booking #SRV-2026-1001
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic font-normal">
                "Rajesh from CoolCare arrived right on time with high pressure pump equipment. My bedroom AC cools like new now! He showed me the foam jet wash before and after. Total invoice matched the quote exactly."
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block">Rahul Sharma</span>
                <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">Saket, New Delhi • AC Foam Jet Servicing</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">₹1,499.00 paid</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 shadow-xs hover:shadow-md transition-shadow border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Verified Move Partner
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic font-normal">
                "Speedy Relocations packed our 2 BHK apartment with extreme care. The OLED TV and fragile crockery were padded with multi-layer bubble wrap. No scratches, transparent toll inclusions."
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 mt-6">
              <div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white block">Priya Patel</span>
                <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">Indiranagar, Bengaluru • Relocation</span>
              </div>
              <span className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">₹11,500.00 agreed</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. FULL-WIDTH PARTNER BANNER
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 text-white py-16 sm:py-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Partner With Serviqa
            </span>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Are you a Skilled Professional or Service Business?
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl font-normal leading-relaxed">
              Receive verified customer leads in your radius, submit custom price quotations, build your reputation, and earn monthly performance bonuses.
            </p>
          </div>
          <Link
            to="/register"
            className="w-full sm:w-auto text-center px-8 py-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs rounded-xl shadow-xl transition-all hover:scale-105 shrink-0"
          >
            Register as a Verified Partner
          </Link>
        </div>
      </section>
    </div>
  );
}
