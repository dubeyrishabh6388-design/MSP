import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Layers,
  Clock,
  AirVent,
  Truck,
  Droplet,
  Zap,
  Cpu,
  Paintbrush,
  ShieldCheck,
  Hammer,
  Waves,
  Smile,
  Monitor,
  Wrench,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  AirVent: <AirVent className="w-4 h-4 text-brand-600 dark:text-brand-400" />,
  Truck: <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
  Sparkles: <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  Droplet: <Droplet className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
  Zap: <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />,
  Cpu: <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
  Paintbrush: <Paintbrush className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
  Hammer: <Hammer className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
  Waves: <Waves className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
  Smile: <Smile className="w-4 h-4 text-pink-600 dark:text-pink-400" />,
  Monitor: <Monitor className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
};

interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  type: 'subcategory' | 'category';
  description?: string;
  imageUrl?: string;
  basePrice?: number;
  durationMin?: number;
  icon?: string;
}

interface ServiceSearchAutocompleteProps {
  categories: any[];
  placeholder?: string;
  onSearchSubmit?: (query: string) => void;
  className?: string;
}

const TRENDING_SUGGESTIONS = [
  { label: 'Split AC Foam Wash', slug: 'ac-repair', subSlug: 'split-ac-foam-servicing' },
  { label: '1 BHK Complete House Shifting', slug: 'packers-movers', subSlug: '1-bhk-shifting' },
  { label: 'Bathroom Deep Cleaning', slug: 'home-cleaning', subSlug: 'deep-bathroom-cleaning' },
  { label: 'Switchboard & Socket Installation', slug: 'electricians', subSlug: 'switchboard-socket-install' },
  { label: 'RO Complete Filter Service', slug: 'ro-water-purifier', subSlug: 'ro-filter-service' },
  { label: 'Washing Machine Repair', slug: 'appliance-repair', subSlug: 'washing-machine-repair' },
];

export function ServiceSearchAutocomplete({
  categories = [],
  placeholder = 'e.g. AC Repair, Packers & Movers...',
  onSearchSubmit,
  className = '',
}: ServiceSearchAutocompleteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Flatten categories and subcategories into a single searchable index
  const allServices: ServiceItem[] = useMemo(() => {
    const list: ServiceItem[] = [];

    categories.forEach((cat) => {
      // Add Category
      list.push({
        id: `cat-${cat.id}`,
        name: cat.name,
        slug: cat.slug,
        categorySlug: cat.slug,
        categoryName: cat.name,
        type: 'category',
        description: cat.description,
        imageUrl: cat.imageUrl,
        basePrice: cat.basePrice,
        icon: cat.icon,
      });

      // Add Subcategories
      (cat.subCategories || []).forEach((sub: any) => {
        list.push({
          id: `sub-${sub.id}`,
          name: sub.name,
          slug: sub.slug,
          categorySlug: cat.slug,
          categoryName: cat.name,
          type: 'subcategory',
          description: sub.description,
          imageUrl: sub.imageUrl || cat.imageUrl,
          basePrice: sub.basePrice || cat.basePrice,
          durationMin: sub.durationMin,
          icon: cat.icon,
        });
      });
    });

    return list;
  }, [categories]);

  // Compute live filtered suggestions based on user query
  const suggestions = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const matches: ServiceItem[] = [];
    const seenNames = new Set<string>();

    // 1. Direct name prefix matches (highest priority)
    for (const item of allServices) {
      if (item.name.toLowerCase().startsWith(trimmed) && !seenNames.has(item.name)) {
        matches.push(item);
        seenNames.add(item.name);
      }
    }

    // 2. Name contains matches
    for (const item of allServices) {
      if (item.name.toLowerCase().includes(trimmed) && !seenNames.has(item.name)) {
        matches.push(item);
        seenNames.add(item.name);
      }
    }

    // 3. Category name or description matches
    for (const item of allServices) {
      if (
        (item.categoryName.toLowerCase().includes(trimmed) ||
          item.description?.toLowerCase().includes(trimmed)) &&
        !seenNames.has(item.name)
      ) {
        matches.push(item);
        seenNames.add(item.name);
      }
    }

    return matches.slice(0, 8); // Top 8 suggestions
  }, [allServices, query]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = (item: ServiceItem) => {
    setQuery(item.name);
    setIsOpen(false);

    if (item.type === 'subcategory') {
      const subId = item.id.replace('sub-', '');
      navigate(
        `/services/${item.categorySlug}/request?subCategoryId=${subId}&subCategoryName=${encodeURIComponent(
          item.name
        )}`
      );
    } else {
      navigate(`/services/${item.categorySlug}`);
    }
  };

  // Keyboard navigation for type-ahead suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && e.key === 'ArrowDown') {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else if (onSearchSubmit) {
        onSearchSubmit(query);
      } else if (categories.length > 0) {
        navigate(`/services/${categories[0].slug}`);
      }
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Function to highlight matched substring in suggestion title
  const renderHighlightedName = (name: string, highlight: string) => {
    if (!highlight.trim()) return name;
    const lowerName = name.toLowerCase();
    const lowerHighlight = highlight.trim().toLowerCase();
    const index = lowerName.indexOf(lowerHighlight);

    if (index === -1) return name;

    const before = name.slice(0, index);
    const match = name.slice(index, index + highlight.length);
    const after = name.slice(index + highlight.length);

    return (
      <>
        {before}
        <span className="text-brand-600 dark:text-brand-400 font-black underline decoration-brand-500/40">
          {match}
        </span>
        {after}
      </>
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Input Field Container */}
      <div className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[52px] focus-within:ring-2 focus-within:ring-brand-500/20">
        <Search className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <label
            htmlFor="service-search-input"
            className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
          >
            Service
          </label>
          <input
            ref={inputRef}
            id="service-search-input"
            type="text"
            autoComplete="off"
            placeholder={placeholder || 'Search AC, shifting, cleaning, plumbing...'}
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-xs sm:text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Clear input button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          LIVE SUGGESTIONS AUTOCOMPLETE POPUP / DROPDOWN
      ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[420px] overflow-y-auto custom-scrollbar">
          {/* CASE 1: USER IS TYPING — SHOW MATCHED SUGGESTIONS */}
          {query.trim() !== '' && suggestions.length > 0 && (
            <div>
              <div className="px-4 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Matching Services ({suggestions.length})</span>
                <span className="text-[9px] font-normal text-slate-400">Press ↑↓ to navigate</span>
              </div>

              <div className="space-y-0.5">
                {suggestions.map((item, idx) => {
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      onClick={() => handleSelectSuggestion(item)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isHighlighted
                          ? 'bg-brand-50 dark:bg-brand-950/70 border-l-4 border-brand-600 dark:border-brand-500'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-900 border-l-4 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Thumbnail / Icon */}
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200/60 dark:border-slate-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            {ICON_MAP[item.icon || ''] || <Wrench className="w-4 h-4 text-brand-600" />}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {renderHighlightedName(item.name, query)}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                            <span className="font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-tight">
                              {item.categoryName}
                            </span>
                            {item.durationMin && (
                              <span className="flex items-center gap-0.5">
                                • <Clock className="w-2.5 h-2.5 text-slate-400" />
                                {item.durationMin >= 60 ? `${item.durationMin / 60}h` : `${item.durationMin}m`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price / Type Badge */}
                      <div className="text-right shrink-0">
                        {item.basePrice ? (
                          <span className="text-xs font-black text-slate-900 dark:text-white block">
                            ₹{(item.basePrice / 100).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-brand-600 block">
                            Custom Quote
                          </span>
                        )}
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">
                          {item.type === 'subcategory' ? 'Package' : 'Category'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CASE 2: USER IS TYPING BUT NO DIRECT MATCH */}
          {query.trim() !== '' && suggestions.length === 0 && (
            <div className="py-6 px-4 text-center">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                No direct service found for "{query}"
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Try searching for "AC", "Movers", "Cleaning", "Plumber", or "Electrician".
              </p>
            </div>
          )}

          {/* CASE 3: INPUT IS EMPTY OR FOCUSED — SHOW POPULAR & TRENDING SHORTCUTS */}
          {query.trim() === '' && (
            <div className="px-4 py-1 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                  <span>Popular Service Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {TRENDING_SUGGESTIONS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setQuery(item.label);
                        navigate(`/services/${item.slug}`);
                        setIsOpen(false);
                      }}
                      className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-brand-50 dark:bg-slate-900 dark:hover:bg-brand-950/60 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>{item.label}</span>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Category Quick Picks */}
              {categories.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    <Layers className="w-3.5 h-3.5 text-brand-500" />
                    <span>Top Categories</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {categories.slice(0, 6).map((cat: any) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setQuery(cat.name);
                          navigate(`/services/${cat.slug}`);
                          setIsOpen(false);
                        }}
                        className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800/90 border border-slate-200/60 dark:border-slate-800 text-left transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <div className="w-6 h-6 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                          {ICON_MAP[cat.icon] || <Wrench className="w-3 h-3 text-brand-600" />}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
