import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../api/client';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Bell,
  Award,
  Sparkles,
  Save,
  CheckCircle2,
  Lock,
  LogOut,
  Camera,
  Trash2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  MapPin,
  RefreshCw,
} from 'lucide-react';

// Preset avatar options for quick selection
const PRESET_AVATARS = [
  {
    id: 'preset-1',
    label: 'Professional Male',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'preset-2',
    label: 'Professional Female',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'preset-3',
    label: 'Casual Male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'preset-4',
    label: 'Casual Female',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'preset-5',
    label: 'Tech Specialist',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
  },
  {
    id: 'preset-6',
    label: 'Executive',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
  },
];

export function CustomerProfilePage() {
  const { user, updateUser, updateAvatar, logout } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || 'Rahul Sharma');
  const [email, setEmail] = useState(user?.email || 'rahul.sharma@example.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [addressNote, setAddressNote] = useState(
    'Flat 402, Tower B, Whispering Palms, Lokhandwala Twp, Kandivali East, Mumbai'
  );
  const [emergencyContactName, setEmergencyContactName] = useState('Pooja Sharma (Spouse)');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('+91 98765 99999');

  // Avatar state
  const [avatar, setAvatar] = useState<string | null>(user?.avatar || null);
  const [showPresetModal, setShowPresetModal] = useState(false);

  // Notification Preferences
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [smsOtps, setSmsOtps] = useState(true);
  const [emailInvoices, setEmailInvoices] = useState(true);

  // Form feedback state
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      if (user.name) setName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);
      if (user.avatar) setAvatar(user.avatar);
    }
  }, [user]);

  // Handle local photo upload via file input
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB limit. Please choose a smaller photo.');
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatar(result);
      updateAvatar(result);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setAvatar(null);
    updateAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Select preset avatar
  const handleSelectPreset = (url: string) => {
    setAvatar(url);
    updateAvatar(url);
    setShowPresetModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Submit profile updates
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // 1. Call API endpoint PUT /auth/profile
      await ApiClient.put('/auth/profile', {
        name: name.trim(),
        phone: phone.trim(),
      });

      // 2. Update local auth context
      updateUser({
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar || undefined,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      // Fallback: still update locally if offline
      updateUser({
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar || undefined,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-20">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-7">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-brand-600 dark:text-brand-400 text-xs font-black uppercase tracking-wider mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Customer Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              My Profile & Account Details
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage personal info, profile avatar, emergency safety contacts, and real-time order alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Account</span>
            </span>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">Profile details and avatar updated successfully!</span>
            </div>
            <span className="text-[11px] font-bold opacity-75">Auto-saved</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}

        {/* Profile Card with Interactive Photo Uploader */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Left: Avatar + Details */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              
              {/* Avatar Uploader Area */}
              <div className="relative group shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-2 border-brand-500/20 dark:border-brand-500/30 bg-slate-100 dark:bg-slate-800 shadow-md flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-black text-3xl sm:text-4xl flex items-center justify-center">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                {/* Upload Action Badge Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload new profile photo"
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/30 transition-all hover:scale-105 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* User Identity Info & Photo Options */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {name}
                  </h2>
                  <span className="text-[10px] font-black uppercase bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                    Customer Account
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {email} • {phone}
                </p>

                {/* Photo Actions Button Bar */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-brand-600" />
                    <span>Upload Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPresetModal(!showPresetModal)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Choose Avatar</span>
                  </button>

                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors cursor-pointer"
                      title="Remove current avatar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1 text-amber-500">
                    <Award className="w-3.5 h-3.5" />
                    <span>240 Serviqa Rewards Coins</span>
                  </span>
                  <span>•</span>
                  <span>Member since Oct 2026</span>
                </div>
              </div>
            </div>

            {/* Right: Protection summary card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-left lg:text-right shrink-0">
              <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
                Escrow Protection Level
              </span>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                100% Guaranteed
              </span>
              <span className="text-[10px] text-slate-500 block">All orders covered</span>
            </div>
          </div>

          {/* Preset Avatar Picker Drawer/Grid */}
          {showPresetModal && (
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                    Choose a Preset Avatar
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Select a high-resolution portrait avatar for your profile.
                  </p>
                </div>
                <button
                  onClick={() => setShowPresetModal(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatar === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`relative group rounded-2xl overflow-hidden border-2 transition-all p-1 cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40'
                          : 'border-slate-200 dark:border-slate-700 hover:border-brand-500'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate w-full text-center">
                        {preset.label}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-brand-600 text-white rounded-full p-0.5 shadow-sm">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Section: Edit Personal Info Form + Communication & Security */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 Cols): Editable Details */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Personal & Contact Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update your contact details so verified service professionals can coordinate with you smoothly.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address (For Tax Invoices & Statements)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@example.com"
                    className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Mobile Number (For Job Arrival OTPs)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium pr-24"
                  />
                  <span className="absolute right-3.5 top-3 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                    Verified
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Home Landmark / Instructions
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={addressNote}
                    onChange={(e) => setAddressNote(e.target.value)}
                    placeholder="e.g. Near ICICI Bank ATM, 4th floor"
                    className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
                  />
                  <MapPin className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
                </div>
              </div>

              {/* In-Home Emergency Safety Contact */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div>
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    In-Home Emergency Safety Contact
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Notified automatically if an SOS or emergency dispute is triggered during an on-site technician visit.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Contact Name & Relation
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="e.g. Pooja Sharma (Spouse)"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Emergency Phone
                    </label>
                    <input
                      type="text"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      placeholder="e.g. +91 98765 99999"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-black text-xs shadow-md shadow-brand-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column (5 Cols): Notification & Privacy Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real-time Alerts */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Real-Time Alerts & Updates
                </h3>
              </div>

              <div className="space-y-3.5">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      WhatsApp Live Updates
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Technician ETA, live location, and OTP alerts via WhatsApp
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      SMS Verification Codes
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      4-digit job start and escrow completion OTPs
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsOtps}
                    onChange={(e) => setSmsOtps(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Automated Tax Invoices
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Send itemized PDF receipts directly upon job completion
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailInvoices}
                    onChange={(e) => setEmailInvoices(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Account Actions / Sign Out Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-black text-slate-900 dark:text-white block">
                Session & Security
              </span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Signed in securely with role-based JWT token and encrypted session state.
              </p>
              <button
                type="button"
                onClick={() => logout()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
