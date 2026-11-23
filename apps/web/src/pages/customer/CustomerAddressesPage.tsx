import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiClient } from '../../api/client';
import { useLocationContext } from '../../context/LocationContext';
import {
  MapPin,
  Home,
  Briefcase,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Crosshair,
  Loader2,
  X,
  Navigation,
  Sparkles,
} from 'lucide-react';

export interface SavedAddress {
  id: string;
  tag: 'HOME' | 'WORK' | 'OTHER';
  label: string;
  flatNumber: string;
  buildingName: string;
  streetAddress: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export function CustomerAddressesPage() {
  const queryClient = useQueryClient();
  const { location, isDetecting, detectLiveLocation } = useLocationContext();

  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['my-addresses'],
    queryFn: () => ApiClient.get('/addresses'),
  });

  const addresses: SavedAddress[] = (addressesData?.data || addressesData || []).map((a: any) => ({
    id: a.id,
    tag: (a.title?.toUpperCase() === 'WORK' ? 'WORK' : a.title?.toUpperCase() === 'OTHER' ? 'OTHER' : 'HOME') as
      | 'HOME'
      | 'WORK'
      | 'OTHER',
    label: a.title || 'Address',
    flatNumber: '',
    buildingName: '',
    streetAddress: a.addressLine,
    landmark: a.landmark || '',
    city: a.city,
    state: a.state,
    pincode: a.postalCode,
    isDefault: a.isDefault,
    latitude: a.latitude,
    longitude: a.longitude,
  }));

  const createMutation = useMutation({
    mutationFn: (data: any) => ApiClient.post('/addresses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-addresses'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => ApiClient.put(`/addresses/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-addresses'] }),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => ApiClient.put(`/addresses/${id}/default`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-addresses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ApiClient.delete(`/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-addresses'] }),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [tag, setTag] = useState<'HOME' | 'WORK' | 'OTHER'>('HOME');
  const [label, setLabel] = useState('Home');
  const [flatNumber, setFlatNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('400064');
  const [isDefault, setIsDefault] = useState(false);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setTag('HOME');
    setLabel('My Home');
    setFlatNumber('');
    setBuildingName('');
    setStreetAddress(location.area ? `${location.shortArea || location.area}` : '');
    setLandmark('');
    setCity(location.city || 'Mumbai');
    setState(location.state || 'Maharashtra');
    setPincode(location.pincode || '400064');
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (addr: SavedAddress) => {
    setEditingId(addr.id);
    setTag(addr.tag);
    setLabel(addr.label);
    setFlatNumber(addr.flatNumber);
    setBuildingName(addr.buildingName);
    setStreetAddress(addr.streetAddress);
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setIsModalOpen(true);
  };

  const handleAutoFillGPS = async () => {
    await detectLiveLocation();
    if (location.shortArea || location.city) {
      setStreetAddress(location.shortArea || location.area || '');
      setCity(location.city || city);
      setState(location.state || state);
      setPincode(location.pincode || pincode);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const combinedAddressLine = [flatNumber, buildingName, streetAddress].filter(Boolean).join(', ') || streetAddress;

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: {
          title: tag,
          addressLine: combinedAddressLine,
          landmark,
          city,
          state,
          postalCode: pincode,
          isDefault,
        },
      });
    } else {
      createMutation.mutate({
        title: tag,
        addressLine: combinedAddressLine,
        landmark,
        city,
        state,
        postalCode: pincode,
        isDefault,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }

    setIsModalOpen(false);
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const getTagIcon = (tag: SavedAddress['tag']) => {
    switch (tag) {
      case 'HOME':
        return <Home className="w-4 h-4 text-brand-600 dark:text-brand-400" />;
      case 'WORK':
        return <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default:
        return <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Address Book</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Saved Delivery & Service Addresses
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage homes, workplaces, and rental properties for 1-click doorstep service scheduling.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-600/25 transition-all hover:scale-105 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border transition-all duration-200 flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-brand-500 shadow-md ring-2 ring-brand-500/15'
                  : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Header Tag and Default Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getTagIcon(addr.tag)}
                    </div>
                    <div>
                      <span className="text-sm font-black text-slate-900 dark:text-white block leading-tight">
                        {addr.label}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {addr.tag}
                      </span>
                    </div>
                  </div>

                  {addr.isDefault ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3" />
                      Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] font-bold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
                    >
                      Make Default
                    </button>
                  )}
                </div>

                {/* Address Details */}
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium pt-1">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {addr.flatNumber}, {addr.buildingName}
                  </p>
                  <p>{addr.streetAddress}</p>
                  {addr.landmark && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Landmark: <span className="font-semibold">{addr.landmark}</span>
                    </p>
                  )}
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {addr.latitude ? '📍 GPS Verified' : 'Standard Address'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(addr)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit Address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {addresses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {addresses.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-brand-600 flex items-center justify-center mx-auto">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              No Addresses Saved Yet
            </h3>
            <p className="text-xs text-slate-500">
              Save your home or office address to book certified trades in seconds.
            </p>
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Add First Address
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: ADD / EDIT ADDRESS WITH GPS AUTO-FILL
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingId ? 'Edit Address' : 'Add New Service Address'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Used by technicians for on-time navigation and tool preparation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Auto-Fill Quick Action */}
            <button
              type="button"
              onClick={handleAutoFillGPS}
              disabled={isDetecting}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-amber-600 text-white font-extrabold text-xs flex items-center justify-between shadow-md shadow-brand-600/20 hover:scale-[1.01] transition-transform cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {isDetecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Crosshair className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Auto-Fill With Live GPS Location</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-black">
                Fast Fill
              </span>
            </button>

            {/* Address Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tag Selector */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                  Address Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HOME', 'WORK', 'OTHER'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTag(t);
                        if (!label || label === 'Home' || label === 'Work' || label === 'Other') {
                          setLabel(t === 'HOME' ? 'Home' : t === 'WORK' ? 'Work' : 'Other');
                        }
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        tag === t
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t === 'HOME' && <Home className="w-3.5 h-3.5" />}
                      {t === 'WORK' && <Briefcase className="w-3.5 h-3.5" />}
                      {t === 'OTHER' && <MapPin className="w-3.5 h-3.5" />}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Address Label / Name
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. My Apartment, Mom's Place, Warehouse"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>

              {/* Flat No & Building Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    House / Flat / Floor No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={flatNumber}
                    onChange={(e) => setFlatNumber(e.target.value)}
                    placeholder="e.g. Flat 302, 3rd Floor"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Apartment / Building Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="e.g. Sunshine Residency"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                </div>
              </div>

              {/* Street / Area Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address & Locality <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Linking Road, Bandra West"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nearby Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Metro Station Gate 2"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                />
              </div>

              {/* City, State, PIN */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="400064"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Make Default Checkbox */}
              <label className="flex items-center gap-2.5 pt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded-md border-slate-300 dark:border-slate-600 focus:ring-brand-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Set this as my primary default address for all bookings
                </span>
              </label>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {editingId ? 'Save Changes' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
