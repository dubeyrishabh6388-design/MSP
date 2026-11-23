import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../api/client';
import { useLocationContext } from '../../context/LocationContext';
import {
  Wrench,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  Check,
  Layers,
  ArrowLeft,
  ChevronRight,
  HeartHandshake,
  Shield,
  Zap,
} from 'lucide-react';

export function RequestServicePage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const urlSubCategoryId = searchParams.get('subCategoryId') || '';
  const urlSubCategoryName = searchParams.get('subCategoryName') || '';

  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(urlSubCategoryId);
  const [title, setTitle] = useState(urlSubCategoryName ? `${urlSubCategoryName} Booking` : '');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [timeSlot, setTimeSlot] = useState('Morning (09:00 - 12:00)');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  const { location: userLoc, isDetecting: isDetectingLoc, detectLiveLocation } = useLocationContext();
  const [addressLine, setAddressLine] = useState(
    userLoc.shortArea ? `${userLoc.shortArea}, Sector Area` : 'Flat 402, Greenview Heights, Saket'
  );
  const [city, setCity] = useState(userLoc.city || 'New Delhi');
  const [state, setState] = useState(userLoc.state || 'Delhi');
  const [postalCode, setPostalCode] = useState(userLoc.pincode || '110017');
  const [landmark] = useState('Near Main Landmark');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('serviqa_saved_addresses');
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Auto-sync address if user location was detected
  useEffect(() => {
    if (userLoc.city) {
      setCity(userLoc.city);
    }
    if (userLoc.state) {
      setState(userLoc.state);
    }
    if (userLoc.pincode) {
      setPostalCode(userLoc.pincode);
    }
    if (userLoc.shortArea && userLoc.isLive) {
      setAddressLine(`${userLoc.shortArea}, ${userLoc.city}`);
    }
  }, [userLoc]);

  const { data: category, isLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => ApiClient.get(`/categories/${slug}`),
  });

  const subCategories = category?.subCategories || [];

  // If subcategory was in URL but title wasn't set, sync them
  useEffect(() => {
    if (urlSubCategoryId && !selectedSubCategoryId) {
      setSelectedSubCategoryId(urlSubCategoryId);
    }
  }, [urlSubCategoryId]);

  const handleSubCategorySelect = (sub: any) => {
    if (selectedSubCategoryId === sub.id) {
      setSelectedSubCategoryId('');
      if (title === `${sub.name} Booking`) {
        setTitle('');
      }
    } else {
      setSelectedSubCategoryId(sub.id);
      setTitle(`${sub.name} Booking`);
    }
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setCustomFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        categoryId: category.id,
        subCategoryId: selectedSubCategoryId || undefined,
        title: title || `${category.name} Request`,
        description: description || `Request for ${title || category.name}`,
        preferredDate: new Date(preferredDate).toISOString(),
        timeSlot,
        customFieldValues: customFields,
        newAddress: {
          title: 'Home',
          addressLine,
          city,
          state,
          postalCode,
          landmark,
        },
      };

      const res = await ApiClient.post('/service-requests', payload);
      navigate(`/customer/requests/${res.serviceRequest.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit service request');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-16 text-center animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3 mx-auto"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  const selectedSub = subCategories.find((s: any) => s.id === selectedSubCategoryId);
  const estimatedPrice = selectedSub?.basePrice || category?.basePrice || 0;

  return (
    <div className="w-full min-h-screen bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8">
        {/* Top Breadcrumb & Back Link */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
            <Link to="/" className="hover:text-slate-700 dark:hover:text-slate-300">Home</Link>
            <span>/</span>
            <Link to={`/services/${slug}`} className="hover:text-slate-700 dark:hover:text-slate-300">
              {category?.name}
            </Link>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">Booking Form</span>
          </nav>

          <Link
            to={`/services/${slug}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {category?.name}</span>
          </Link>
        </div>

        {/* Hero Header Strip */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Verified Trade Booking Workflow</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
            Schedule {category?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl font-normal leading-relaxed">
            Fill in your trade specifications below. Verified background-checked specialists review your scope and submit itemized competitive quotations.
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            SPLIT 2-COLUMN LUXURY ARCHITECTURE: FORM + STICKY SUMMARY
        ───────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Clean Form Steps (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: Specialized Packages Selection */}
            {subCategories.length > 0 && (
              <section className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      1
                    </span>
                    <div>
                      <h2 className="text-sm font-black text-slate-950 dark:text-white tracking-tight">
                        Select Specialized Package
                      </h2>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Choose a tailored service package or customize requirements below.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hidden sm:inline-block">
                    {subCategories.length} Options
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {subCategories.map((sub: any) => {
                    const isSelected = selectedSubCategoryId === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => handleSubCategorySelect(sub)}
                        className={`relative p-4 rounded-2xl cursor-pointer transition-all flex items-start gap-3.5 border ${
                          isSelected
                            ? 'bg-brand-50/70 dark:bg-brand-950/60 border-brand-500 shadow-md ring-2 ring-brand-500/20'
                            : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
                        }`}
                      >
                        {sub.imageUrl ? (
                          <img
                            src={sub.imageUrl}
                            alt={sub.name}
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200/60 dark:border-slate-700/60"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                            <Wrench className="w-6 h-6" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0 pr-6">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {sub.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 font-normal">
                            {sub.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-black text-brand-600 dark:text-brand-400">
                              ₹{((sub.basePrice || category.basePrice) / 100).toLocaleString('en-IN')}
                            </span>
                            {sub.durationMin && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-0.5">
                                • <Clock className="w-2.5 h-2.5" />
                                {sub.durationMin >= 60 ? `${sub.durationMin / 60}h` : `${sub.durationMin}m`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Radio Check Indicator */}
                        <div
                          className={`absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-brand-600 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* STEP 2: Service Title & Problem Description */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {subCategories.length > 0 ? '2' : '1'}
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-950 dark:text-white tracking-tight">
                    Problem Description & Scope
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Help verified technicians prepare the right parts, equipment, and estimates.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Service Title / Summary <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={`e.g. ${category?.name} Booking`}
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-medium text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                    Detailed Scope of Work or Symptoms Observed
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Specify floor levels, noise/leakage symptoms, special furniture care, or any details to help technicians submit accurate itemized quotations..."
                    className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </section>

            {/* STEP 3: Dynamic Category-Specific Parameters */}
            {category?.fields && category.fields.length > 0 && (
              <section className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {subCategories.length > 0 ? '3' : '2'}
                  </span>
                  <div>
                    <h2 className="text-sm font-black text-slate-950 dark:text-white tracking-tight">
                      Trade Specific Parameters
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tailored options configured specifically for {category.name}.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-1">
                  {category.fields.map((field: any) => (
                    <div key={field.id} className="space-y-2">
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                        {field.label} {field.required && <span className="text-rose-500">*</span>}
                      </label>

                      {/* Pill style for compact select options */}
                      {field.type === 'select' && Array.isArray(field.options) && field.options.length <= 6 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {field.options.map((opt: string) => {
                            const isSelected = customFields[field.name] === opt;
                            return (
                              <button
                                type="button"
                                key={opt}
                                onClick={() => handleFieldChange(field.name, opt)}
                                className={`px-3.5 py-2.5 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                              >
                                <span className="truncate pr-1">{opt}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      ) : field.type === 'select' ? (
                        <select
                          required={field.required}
                          value={customFields[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium cursor-pointer"
                        >
                          <option value="" className="dark:bg-slate-900">Select an option...</option>
                          {Array.isArray(field.options) &&
                            field.options.map((opt: string) => (
                              <option key={opt} value={opt} className="dark:bg-slate-900">
                                {opt}
                              </option>
                            ))}
                        </select>
                      ) : null}

                      {/* Checkbox Toggle Card */}
                      {field.type === 'checkbox' && (
                        <label className="flex items-center justify-between p-3.5 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer hover:border-brand-400 dark:hover:border-brand-500 transition-colors">
                          <div className="pr-4">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                              {field.label}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                              Check to include in technician requirement scope
                            </span>
                          </div>
                          <input
                            type="checkbox"
                            checked={!!customFields[field.name]}
                            onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                            className="w-5 h-5 text-brand-600 rounded-md border-slate-300 dark:border-slate-600 focus:ring-brand-500 cursor-pointer shrink-0"
                          />
                        </label>
                      )}

                      {/* Text inputs */}
                      {field.type === 'text' && (
                        <input
                          type="text"
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={customFields[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                        />
                      )}

                      {field.type === 'number' && (
                        <input
                          type="number"
                          required={field.required}
                          placeholder={field.placeholder || 'e.g. 2'}
                          value={customFields[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                          className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                        />
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          rows={2}
                          required={field.required}
                          placeholder={field.placeholder || ''}
                          value={customFields[field.name] || ''}
                          onChange={(e) => handleFieldChange(field.name, e.target.value)}
                          className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* STEP 4: Schedule & Service Address */}
            <section className="bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="w-7 h-7 rounded-full bg-brand-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                  {subCategories.length > 0 ? (category?.fields?.length ? '4' : '3') : '2'}
                </span>
                <div>
                  <h2 className="text-sm font-black text-slate-950 dark:text-white tracking-tight">
                    Schedule Slot & Doorstep Location
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pick your preferred time slot and confirm the service delivery address.
                  </p>
                </div>
              </div>

              {/* Date & Time Slot Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    Preferred Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                    Time Slot <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium cursor-pointer"
                  >
                    <option value="Morning (09:00 - 12:00)" className="dark:bg-slate-900">Morning (09:00 - 12:00)</option>
                    <option value="Afternoon (12:00 - 16:00)" className="dark:bg-slate-900">Afternoon (12:00 - 16:00)</option>
                    <option value="Evening (16:00 - 20:00)" className="dark:bg-slate-900">Evening (16:00 - 20:00)</option>
                    <option value="Immediate / Urgent" className="dark:bg-slate-900">Immediate / Urgent</option>
                  </select>
                </div>
              </div>

              {/* Doorstep Address Form */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-850/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                    <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <span>Doorstep Address</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => detectLiveLocation()}
                    disabled={isDetectingLoc}
                    className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isDetectingLoc ? 'Detecting GPS...' : '📍 Auto-fill from GPS'}</span>
                  </button>
                </div>

                {/* Quick Select from Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 shrink-0">1-Tap Saved:</span>
                    {savedAddresses.map((addr: any) => (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => {
                          setAddressLine(`${addr.flatNumber}, ${addr.buildingName}, ${addr.streetAddress}`);
                          setCity(addr.city);
                          setState(addr.state);
                          setPostalCode(addr.pincode);
                        }}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 shrink-0 cursor-pointer flex items-center gap-1 transition-colors shadow-2xs"
                      >
                        <span>{addr.tag === 'HOME' ? '🏠' : addr.tag === 'WORK' ? '🏢' : '📍'}</span>
                        <span>{addr.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Street Address / Flat No. <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Postal PIN Code <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl focus:outline-none font-medium"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY & PROTECTION CARD (4 Cols) */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Booking Summary
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Escrow Protected
                </span>
              </div>

              {/* Service & Selected Package Preview */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {selectedSub?.imageUrl ? (
                    <img
                      src={selectedSub.imageUrl}
                      alt={selectedSub.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-extrabold text-brand-600 dark:text-brand-400 block truncate">
                      {category.name}
                    </span>
                    <h3 className="text-xs font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {selectedSub ? selectedSub.name : 'Custom Trade Specification'}
                    </h3>
                  </div>
                </div>

                {/* Slot & Location Quick Pills */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                    <span className="font-medium text-[11px] truncate">
                      {new Date(preferredDate).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })} • {timeSlot.split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="font-medium text-[11px] truncate">
                      {city} ({postalCode})
                    </span>
                  </div>
                </div>
              </div>

              {/* Itemized Price Breakdown */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Base Package Estimate</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{(estimatedPrice / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                {category.inspectionFee > 0 && !selectedSub && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Diagnostic Visit Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{(category.inspectionFee / 100).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Platform Protection & Escrow</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">
                    FREE / ₹0
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black uppercase text-slate-900 dark:text-white block">
                      Estimated Total
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      Pay only after satisfied completion
                    </span>
                  </div>
                  <span className="text-2xl font-black text-brand-600 dark:text-brand-400">
                    ₹{(estimatedPrice / 100).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-brand-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <span>Broadcasting Request...</span>
                ) : (
                  <>
                    <span>Submit & Compare Quotations</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>100% Police & Skill Audited Partners</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <HeartHandshake className="w-4 h-4 shrink-0 text-brand-600 dark:text-brand-400" />
                  <span>Zero Upfront Risk • Escrow Guarantee</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Native Sticky Action Bar (lg:hidden) */}
          <div className="lg:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-3 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Estimated Total</span>
              <span className="text-base font-black text-brand-600 dark:text-brand-400">
                ₹{(estimatedPrice / 100).toLocaleString('en-IN')}
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 max-w-[220px] py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
