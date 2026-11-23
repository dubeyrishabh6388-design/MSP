import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Wrench,
  ShieldCheck,
  Layers,
  DollarSign,
  Award,
  User,
  Radio,
} from 'lucide-react';

interface ProviderPortalNavProps {
  className?: string;
  isAvailable?: boolean;
  onToggleAvailability?: () => void;
}

export function ProviderPortalNav({
  className = '',
  isAvailable = true,
  onToggleAvailability,
}: ProviderPortalNavProps) {
  const location = useLocation();

  const navItems = [
    {
      id: 'jobs',
      label: 'Jobs & Leads',
      path: '/provider',
      icon: <Wrench className="w-4 h-4" />,
      exact: true,
    },
    {
      id: 'verification',
      label: 'KYC & Verification',
      path: '/provider/verification',
      icon: <ShieldCheck className="w-4 h-4" />,
      exact: false,
    },
    {
      id: 'services',
      label: 'Services & Rates',
      path: '/provider/services',
      icon: <Layers className="w-4 h-4" />,
      exact: false,
    },
    {
      id: 'earnings',
      label: 'Earnings & Bank',
      path: '/provider/earnings',
      icon: <DollarSign className="w-4 h-4" />,
      exact: false,
    },
    {
      id: 'rewards',
      label: 'Rewards & Score',
      path: '/provider/rewards',
      icon: <Award className="w-4 h-4" />,
      exact: false,
    },
    {
      id: 'profile',
      label: 'Business Profile',
      path: '/provider/profile',
      icon: <User className="w-4 h-4" />,
      exact: false,
    },
  ];

  const isItemActive = (path: string, exact: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`w-full overflow-x-auto no-scrollbar border-b border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-16 sm:top-18 z-30 transition-colors ${className}`}>
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex items-center justify-between gap-4 py-2">
          {/* Navigation Items */}
          <div className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const active = isItemActive(item.path, item.exact);
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Duty Status Switch if handler provided */}
          {onToggleAvailability && (
            <button
              type="button"
              onClick={onToggleAvailability}
              className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer border shrink-0 ${
                isAvailable
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{isAvailable ? 'On Duty (Online)' : 'Off Duty (Offline)'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
