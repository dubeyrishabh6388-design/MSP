import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  CreditCard,
  HelpCircle,
  User,
  ShieldCheck,
} from 'lucide-react';

interface CustomerPortalNavProps {
  className?: string;
}

export function CustomerPortalNav({ className = '' }: CustomerPortalNavProps) {
  const location = useLocation();

  const navItems = [
    {
      id: 'bookings',
      label: 'Bookings & Orders',
      path: '/customer',
      icon: <Calendar className="w-4 h-4" />,
      exact: true,
    },
    {
      id: 'addresses',
      label: 'Saved Addresses',
      path: '/customer/addresses',
      icon: <MapPin className="w-4 h-4" />,
      exact: false,
    },
    {
      id: 'payments',
      label: 'Escrow & Invoices',
      path: '/customer/payments',
      icon: <CreditCard className="w-4 h-4" />,
      exact: false,
    },
    {
      id: 'help',
      label: 'Help & Warranty',
      path: '/customer/help',
      icon: <HelpCircle className="w-4 h-4" />,
      exact: false,
    },
    {
      id: 'profile',
      label: 'Profile & Safety',
      path: '/customer/profile',
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
        <div className="flex items-center gap-1 sm:gap-2 py-2">
          {navItems.map((item) => {
            const active = isItemActive(item.path, item.exact);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  active
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
