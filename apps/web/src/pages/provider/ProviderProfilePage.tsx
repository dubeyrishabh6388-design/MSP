import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Wrench,
  Star,
  Award,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Save,
  Eye,
  X,
  Phone,
  Mail,
  Briefcase,
  Sparkles,
} from 'lucide-react';

export function ProviderProfilePage() {
  const { user } = useAuth();

  const [businessName, setBusinessName] = useState('CoolCare AC Solutions');
  const [leadTechName, setLeadTechName] = useState('Rajesh Kumar');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [email, setEmail] = useState('coolcare.mumbai@example.com');
  const [experienceYears, setExperienceYears] = useState(8);
  const [bio, setBio] = useState(
    'Specialized in residential & commercial inverter AC servicing, high-pressure foam jet wash, PCB diagnostics, and genuine compressor repairs with 90-day guarantee.'
  );
  const [workshopAddress, setWorkshopAddress] = useState('Shop 14, Galaxy Arcade, Link Road, Malad West, Mumbai - 400064');

  // Equipment owned checklist
  const [equipment, setEquipment] = useState([
    { id: 'eq-1', label: 'High Pressure Foam Jet Hydro Pump', checked: true },
    { id: 'eq-2', label: 'Digital Refrigerant Manifold & Vacuum Gauge', checked: true },
    { id: 'eq-3', label: 'Electronic Gas Leakage Halogen Detector', checked: true },
    { id: 'eq-4', label: 'Laser Infrared Coil Thermometer', checked: true },
    { id: 'eq-5', label: 'Insulated Drop Cloths & Spill Catchment Kit', checked: true },
  ]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleEquipment = (id: string) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, checked: !eq.checked } : eq))
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="w-full bg-[#fafbfc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 min-h-screen transition-colors pb-16">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Partner Credentials</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
              Business Profile & Public Reputation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Showcase your technical background, professional diagnostic equipment, and customer satisfaction ratings.
            </p>
          </div>

          <div className="w-full sm:w-auto grid grid-cols-2 sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">Business profile and equipment checklist saved successfully!</span>
          </div>
        )}

        {/* Identity & Reputation Showcase Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
              <Wrench className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {businessName}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lead Specialist: <strong className="text-slate-800 dark:text-slate-200">{leadTechName}</strong> • {experienceYears} Years in Trade
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs font-bold">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.95 Rating (1,420 Jobs)</span>
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-emerald-600 dark:text-emerald-400">99.2% Completion Rate</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 text-left md:text-right shrink-0 space-y-1">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block">
              Partner Standing
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 block">
              Top 5% Partner Tier
            </span>
            <span className="text-[10px] text-slate-400 block">Priority Lead Dispatch</span>
          </div>
        </div>

        {/* 2-Column Details: Form + Tools Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (7 Cols): Profile Edit Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Business & Workshop Details
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                This information appears on your itemized quotations and official tax invoices.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Business / Trade Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Master Technician Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={leadTechName}
                    onChange={(e) => setLeadTechName(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dispatch Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Trade Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Business Workshop / Hub Address
                </label>
                <input
                  type="text"
                  required
                  value={workshopAddress}
                  onChange={(e) => setWorkshopAddress(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Craftsmanship Specialty & Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Business Profile</span>
              </button>
            </form>
          </div>

          {/* Right Column (5 Cols): Professional Tooling Checklist */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Audited Tooling & Equipment
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Having certified professional equipment increases your lead matching score.
                </p>
              </div>

              <div className="space-y-3">
                {equipment.map((eq) => (
                  <label
                    key={eq.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-emerald-500/40 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 pr-3">
                      {eq.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={eq.checked}
                      onChange={() => handleToggleEquipment(eq.id)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Genuine Reviews Snapshot */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-black uppercase text-slate-400">
                  Recent Verified Reviews
                </span>
                <span className="text-xs font-extrabold text-amber-500">⭐ 4.95 Average</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-slate-500 text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Rahul Sharma (Saket)</span>
                    <span>10 Nov 2026</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">
                    "Rajesh arrived with high pressure foam equipment and clean mats. Fixed my cooling issue on the spot."
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-slate-500 text-[10px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Sneha Rao (Malad West)</span>
                    <span>04 Nov 2026</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 italic">
                    "Extremely polite, wore boot covers, showed before/after photos of the coils. Transparent pricing."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: PUBLIC CUSTOMER VIEW PREVIEW
      ───────────────────────────────────────────────────────────── */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                Public Customer View
              </span>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl">
                  {businessName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {businessName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>4.95 Rating • 1,420 Completed Jobs</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {bio}
              </p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500">
                <span>📍 {workshopAddress.split(',')[0]}</span>
                <span className="font-bold text-emerald-600">🛡️ 100% Police & Skill Audited</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
