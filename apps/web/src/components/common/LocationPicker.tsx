import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Crosshair,
  ChevronDown,
  Search,
  Check,
  AlertCircle,
  Loader2,
  X,
  Navigation,
  Compass,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useLocationContext, POPULAR_HYPERLOCAL_AREAS } from '../../context/LocationContext';

interface LocationPickerProps {
  variant?: 'navbar' | 'hero' | 'compact';
  className?: string;
}

const METRO_TABS = [
  { id: 'all', label: 'All Cities' },
  { id: 'Mumbai', label: 'Mumbai & MMR' },
  { id: 'New Delhi', label: 'Delhi NCR' },
  { id: 'Bengaluru', label: 'Bengaluru' },
  { id: 'Pune', label: 'Pune' },
  { id: 'Hyderabad', label: 'Hyderabad' },
];

export function LocationPicker({ variant = 'navbar', className = '' }: LocationPickerProps) {
  const { location, isDetecting, error, detectLiveLocation, setManualLocation, clearError } =
    useLocationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeMetroTab, setActiveMetroTab] = useState('all');
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDetectClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await detectLiveLocation();
  };

  const handleSelectArea = (item: (typeof POPULAR_HYPERLOCAL_AREAS)[0]) => {
    setManualLocation({
      formatted: `${item.area}, ${item.city} (${item.pincode})`,
      shortArea: item.area,
      city: item.city,
      area: item.area,
      state: item.state,
      pincode: item.pincode,
      fullAddress: `${item.area}, ${item.city}, ${item.state} - ${item.pincode}`,
      latitude: item.lat,
      longitude: item.lng,
      isLive: false,
      timestamp: Date.now(),
    });
    setIsOpen(false);
    setSearchFilter('');
  };

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (location.fullAddress) {
      navigator.clipboard.writeText(location.fullAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredAreas = POPULAR_HYPERLOCAL_AREAS.filter((c) => {
    const matchesSearch =
      c.area.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.pincode.includes(searchFilter) ||
      c.label.toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;
    if (activeMetroTab === 'all') return true;
    if (activeMetroTab === 'New Delhi') {
      return ['New Delhi', 'Noida', 'Gurugram', 'Ghaziabad'].includes(c.city);
    }
    if (activeMetroTab === 'Mumbai') {
      return ['Mumbai', 'Navi Mumbai', 'Thane'].includes(c.city);
    }
    return c.city.toLowerCase() === activeMetroTab.toLowerCase();
  });

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* ─────────────────────────────────────────────────────────────
          NAVBAR VARIANT PILL (High Precision: Sub-locality + City)
      ───────────────────────────────────────────────────────────── */}
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select or Detect Complete Location"
          className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200/90 dark:border-slate-800 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-2xs hover:shadow-xs group cursor-pointer sm:max-w-[340px] md:max-w-[380px]"
        >
          {/* Circular Pin Icon with Live GPS Glow */}
          <div className="relative w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/70 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-600" />
            ) : (
              <MapPin className="w-3.5 h-3.5 stroke-[2.5]" />
            )}
            {location.isLive && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {/* Hyper-Local Location Text: Sub-Locality + City */}
          <div className="text-left flex-1 min-w-0 pr-0.5">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="font-black text-xs text-slate-950 dark:text-white truncate">
                {isDetecting ? 'Locating GPS...' : location.shortArea || location.city}
              </span>
              {location.isLive && (
                <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 shrink-0">
                  Live
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight font-medium">
              {isDetecting
                ? 'High-accuracy GPS fix...'
                : `${location.city}${location.pincode ? ` • ${location.pincode}` : ''}`}
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
            }`}
          />
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          HERO SEARCH INPUT VARIANT (Clean, Minimal, Non-wrapping)
      ───────────────────────────────────────────────────────────── */}
      {variant === 'hero' && (
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl transition-colors min-h-[52px] cursor-pointer group"
        >
          <div className="relative text-amber-500 shrink-0">
            {isDetecting ? (
              <Loader2 className="w-5 h-5 animate-spin text-brand-600" />
            ) : (
              <MapPin className="w-5 h-5" />
            )}
            {location.isLive && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Location
              </span>
              {location.isLive && (
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live GPS
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
              {isDetecting
                ? 'Locating GPS...'
                : location.shortArea
                ? `${location.shortArea}${location.city && !location.shortArea.includes(location.city) ? `, ${location.city}` : ''}`
                : location.city || 'Select Location'}
            </div>
          </div>

          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform duration-200 shrink-0" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          COMPACT VARIANT (For Mobile Drawer)
      ───────────────────────────────────────────────────────────── */}
      {variant === 'compact' && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block">
                Live Service Address
              </span>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                {location.shortArea || location.city}, {location.city}
              </span>
              {location.pincode && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Pincode: {location.pincode}
                </span>
              )}
            </div>
          </div>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 shrink-0">Change</span>
        </button>
      )}

      {/* ─────────────────────────────────────────────────────────────
          COMPLETE HYPER-LOCAL LOCATION MODAL / POPOVER
      ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-auto top-20 sm:top-full mt-1.5 w-auto sm:w-[440px] max-w-[calc(100vw-1.5rem)] sm:max-w-[440px] bg-white dark:bg-slate-950 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Hyperlocal Service Location</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Quotes, travel radius, and technician availability adapt to your exact locality.
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* 🌟 ACTION 1: ONE-CLICK DETECT EXACT LIVE GPS LOCATION 🌟 */}
          <div className="my-3">
            <button
              type="button"
              onClick={handleDetectClick}
              disabled={isDetecting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-orange-500 to-amber-600 hover:from-brand-700 hover:to-amber-700 text-white font-extrabold text-xs flex items-center justify-between shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-75"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  {isDetecting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Crosshair className="w-4 h-4 text-white stroke-[2.5]" />
                  )}
                </div>
                <div className="text-left">
                  <span className="block leading-tight font-black text-sm">
                    {isDetecting ? 'Detecting Precise GPS Location...' : 'Detect Exact Live Location (GPS)'}
                  </span>
                  <span className="block text-[10px] text-orange-100 font-medium">
                    Street, Area/Neighborhood, City & Pincode
                  </span>
                </div>
              </div>

              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-white/25 text-white shrink-0 tracking-wider">
                High Precision
              </span>
            </button>
          </div>

          {/* Error Message if Denied */}
          {error && (
            <div className="mb-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1 leading-snug">
                <span className="font-bold">{error}</span>
                <span className="block text-[11px] text-rose-500 dark:text-rose-400 mt-0.5">
                  Please enable location permissions in browser or select your neighborhood below.
                </span>
              </div>
            </div>
          )}

          {/* 📍 COMPLETE CURRENT LOCATION DETAILS CARD 📍 */}
          <div className="p-3.5 mb-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    location.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                  }`}
                />
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">
                  {location.isLive ? 'Live GPS Address Confirmed' : 'Active Location'}
                </span>
              </div>

              {location.isLive && (
                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full">
                  GPS Active
                </span>
              )}
            </div>

            {/* Complete Breakdown Details */}
            <div className="bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Locality:</span>
                <span className="font-black text-slate-900 dark:text-white text-right">
                  {location.shortArea || 'Selected Area'}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">City / Region:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">
                  {location.city} {location.state ? `(${location.state})` : ''}
                </span>
              </div>
              {location.pincode && (
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium text-[11px]">Postal Pincode:</span>
                  <span className="font-extrabold text-brand-600 dark:text-brand-400 text-right">
                    {location.pincode}
                  </span>
                </div>
              )}
              {location.fullAddress && (
                <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium truncate">
                    {location.fullAddress}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    title="Copy Address"
                    className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Copied
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5">
                        <Copy className="w-3 h-3" /> Copy
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Input for Exact Locality / Pincode */}
          <div className="relative mb-2.5">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search area, neighborhood, city, or pincode..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Metro Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 mb-2.5">
            {METRO_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveMetroTab(tab.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 transition-colors cursor-pointer ${
                  activeMetroTab === tab.id
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Hyper-Local Neighborhoods List */}
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider block mb-1.5 px-1">
              Select Specific Neighborhood / Area
            </span>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredAreas.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No matching neighborhood found.
                  <button
                    onClick={() => {
                      setManualLocation({
                        formatted: searchFilter,
                        shortArea: searchFilter,
                        city: searchFilter,
                        fullAddress: searchFilter,
                        isLive: false,
                        timestamp: Date.now(),
                      });
                      setIsOpen(false);
                    }}
                    className="block mx-auto mt-1 text-brand-600 dark:text-brand-400 font-bold hover:underline"
                  >
                    Set "{searchFilter}" as custom location
                  </button>
                </div>
              ) : (
                filteredAreas.map((item) => {
                  const isSelected =
                    location.shortArea?.toLowerCase() === item.area.toLowerCase() ||
                    location.formatted?.toLowerCase().includes(item.area.toLowerCase());

                  return (
                    <button
                      key={`${item.city}-${item.area}`}
                      type="button"
                      onClick={() => handleSelectArea(item)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold border border-brand-200 dark:border-brand-900/60'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate">
                            {item.area}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono shrink-0">
                            {item.pincode}
                          </span>
                        </div>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {item.city}, {item.state}
                        </span>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
