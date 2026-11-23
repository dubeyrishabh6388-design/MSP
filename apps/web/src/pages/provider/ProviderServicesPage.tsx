import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../../api/client';
import {
  Layers,
  MapPin,
  Clock,
  DollarSign,
  Save,
  CheckCircle2,
  Sliders,
  Sparkles,
  AirVent,
  Truck,
  Droplet,
  Zap,
  Hammer,
  ShieldCheck,
  Check,
  Plus,
} from 'lucide-react';

interface ServiceItem {
  id: string;
  category: string;
  name: string;
  baseMarketRate: number;
  customRate: number;
  durationMin: number;
  isActive: boolean;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function ProviderServicesPage() {
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => ApiClient.get('/categories'),
  });

  const { data: profile } = useQuery({
    queryKey: ['provider-profile'],
    queryFn: () => ApiClient.get('/providers/my/profile'),
  });

  const [radiusKm, setRadiusKm] = useState(15);
  const [hubArea, setHubArea] = useState('Malad West, Mumbai');
  const [offerings, setOfferings] = useState<ServiceItem[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ]);
  const [morningSlot, setMorningSlot] = useState(true);
  const [afternoonSlot, setAfternoonSlot] = useState(true);
  const [eveningSlot, setEveningSlot] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (categories.length > 0) {
      const enrolledCategoryIds = new Set((profile?.services || []).map((s: any) => s.categoryId));
      const dynamicOfferings: ServiceItem[] = categories.map((cat: any) => ({
        id: cat.id,
        category: cat.name,
        name: cat.description ? `${cat.name} (${cat.description.substring(0, 40)}...)` : cat.name,
        baseMarketRate: cat.basePrice || 49900,
        customRate: cat.basePrice || 49900,
        durationMin: 90,
        isActive: enrolledCategoryIds.size > 0 ? enrolledCategoryIds.has(cat.id) : true,
      }));
      setOfferings(dynamicOfferings);
    }
  }, [categories, profile]);

  useEffect(() => {
    if (profile?.serviceRadiusKm) {
      setRadiusKm(profile.serviceRadiusKm);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: (body: any) => ApiClient.put('/providers/profile', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-profile'] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const handleToggleService = (id: string) => {
    setOfferings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const handleRateChange = (id: string, newRate: number) => {
    setOfferings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, customRate: newRate } : item))
    );
  };

  const handleToggleDay = (day: string) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCatIds = offerings.filter((o) => o.isActive).map((o) => o.id);
    updateProfileMutation.mutate({
      serviceRadiusKm: radiusKm,
      categoryIds: activeCatIds,
    });
  };

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Catalog & Territory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Trade Services, Pricing & Coverage Radius
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Define the exact services you specialize in, customize your labor rates, and configure your travel radius.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveChanges}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-105 cursor-pointer self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Save Rate Card</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Service catalog, custom rates, and travel radius saved successfully!</span>
          </div>
        )}

        {/* Operational Radius & Dispatch Territory Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Dispatch Coverage Radius
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customer job broadcasts are restricted to within this radial distance from your base workshop.
              </p>
            </div>

            <div className="flex items-baseline gap-2 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                {radiusKm} km
              </span>
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                Radius
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span>Minimum (5 km)</span>
                <span>Current: {radiusKm} km from {hubArea}</span>
                <span>Maximum (30 km)</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Covered Areas Pill Stream */}
            <div>
              <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block mb-2">
                Active Covered Localities & Neighborhoods
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                {['Malad West', 'Malad East', 'Kandivali West', 'Borivali West', 'Goregaon West', 'Andheri West', 'Oshiwara', 'Lokhandwala'].map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{area}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Services & Custom Labor Rates */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Active Trade Offerings & Custom Rate Card
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle packages you can fulfill with genuine parts and adjust your custom base labor pricing.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              {offerings.filter((o) => o.isActive).length} Active Services
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {offerings.map((item) => (
              <div
                key={item.id}
                className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-opacity ${
                  item.isActive ? 'opacity-100' : 'opacity-60 bg-slate-50/50 dark:bg-slate-850/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-600 dark:text-emerald-400">
                      {item.category}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Est: {item.durationMin} mins
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Standard Market Base: ₹{(item.baseMarketRate / 100).toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="flex items-center gap-4 self-start sm:self-auto">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                      Your Custom Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={item.customRate / 100}
                        onChange={(e) => handleRateChange(item.id, Number(e.target.value) * 100)}
                        className="w-32 pl-7 pr-3 py-1.5 text-xs font-black bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleService(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      item.isActive
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                    }`}
                  >
                    {item.isActive ? 'Active' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Working Hours & Availability Schedule */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Working Days & Daily Slots Availability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Only receive scheduled booking slots when you and your team are on duty.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Operational Days of Week
              </span>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = workingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleToggleDay(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Available Booking Shifts
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Morning Shift
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">09:00 AM - 01:00 PM</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={morningSlot}
                    onChange={(e) => setMorningSlot(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Afternoon Shift
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">01:00 PM - 05:00 PM</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={afternoonSlot}
                    onChange={(e) => setAfternoonSlot(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Evening Shift
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">05:00 PM - 09:00 PM</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={eveningSlot}
                    onChange={(e) => setEveningSlot(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
