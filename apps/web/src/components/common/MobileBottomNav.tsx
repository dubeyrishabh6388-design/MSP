import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Grid,
  Calendar,
  User,
  Wrench,
  ShieldCheck,
  Layers,
  DollarSign,
  Award,
  Sparkles,
  ShieldAlert,
  Users,
  CreditCard,
  Building2,
  HelpCircle,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@serviqa/shared';

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();

  const isProvider = user?.role === UserRole.PROVIDER;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isCustomer = user?.role === UserRole.CUSTOMER;

  const isActive = (path: string) => {
    if (path === '/' || path === '/provider' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // 1. PROVIDER MOBILE APP TABS (Partner Desk)
  if (isProvider) {
    const providerTabs = [
      {
        label: 'Jobs',
        path: '/provider',
        icon: <Wrench className="w-5 h-5" />,
        active: isActive('/provider'),
      },
      {
        label: 'KYC',
        path: '/provider/verification',
        icon: <ShieldCheck className="w-5 h-5" />,
        active: isActive('/provider/verification'),
      },
      {
        label: 'Services',
        path: '/provider/services',
        icon: <Layers className="w-5 h-5" />,
        active: isActive('/provider/services'),
      },
      {
        label: 'Earnings',
        path: '/provider/earnings',
        icon: <DollarSign className="w-5 h-5" />,
        active: isActive('/provider/earnings'),
      },
      {
        label: 'Profile',
        path: '/provider/profile',
        icon: user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover border border-emerald-500"
          />
        ) : (
          <User className="w-5 h-5" />
        ),
        active: isActive('/provider/profile'),
      },
    ];

    return (
      <nav
        aria-label="Provider Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors duration-200"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {providerTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[56px] min-h-[46px] select-none ${
                tab.active
                  ? 'text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50/90 dark:bg-emerald-950/70 shadow-xs scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  // 2. ADMIN MOBILE APP TABS (Operations Console)
  if (isAdmin) {
    const adminTabs = [
      {
        label: 'Overview',
        path: '/admin',
        icon: <Sparkles className="w-5 h-5" />,
        active: isActive('/admin'),
      },
      {
        label: 'KYC Queue',
        path: '/admin/verifications',
        icon: <ShieldCheck className="w-5 h-5" />,
        active: isActive('/admin/verifications'),
      },
      {
        label: 'Disputes',
        path: '/admin/disputes',
        icon: <ShieldAlert className="w-5 h-5" />,
        active: isActive('/admin/disputes'),
      },
      {
        label: 'Users',
        path: '/admin/users',
        icon: <Users className="w-5 h-5" />,
        active: isActive('/admin/users'),
      },
      {
        label: 'Payouts',
        path: '/admin/settlements',
        icon: <Building2 className="w-5 h-5" />,
        active: isActive('/admin/settlements'),
      },
    ];

    return (
      <nav
        aria-label="Admin Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors duration-200"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {adminTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[56px] min-h-[46px] select-none ${
                tab.active
                  ? 'text-purple-600 dark:text-purple-400 font-extrabold bg-purple-50/90 dark:bg-purple-950/70 shadow-xs scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  // 3. CUSTOMER LOGGED IN TABS
  if (isCustomer) {
    const customerTabs = [
      {
        label: 'Home',
        path: '/',
        icon: <Home className="w-5 h-5" />,
        active: isActive('/'),
      },
      {
        label: 'Services',
        path: '/services/ac-repair',
        icon: <Grid className="w-5 h-5" />,
        active: isActive('/services'),
      },
      {
        label: 'Bookings',
        path: '/customer',
        icon: <Calendar className="w-5 h-5" />,
        active: isActive('/customer') && !isActive('/customer/payments') && !isActive('/customer/profile'),
      },
      {
        label: 'Invoices',
        path: '/customer/payments',
        icon: <CreditCard className="w-5 h-5" />,
        active: isActive('/customer/payments'),
      },
      {
        label: 'Profile',
        path: '/customer/profile',
        icon: user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-5 h-5 rounded-full object-cover border border-brand-500"
          />
        ) : (
          <User className="w-5 h-5" />
        ),
        active: isActive('/customer/profile'),
      },
    ];

    return (
      <nav
        aria-label="Customer Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors duration-200"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {customerTabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all duration-150 min-w-[56px] min-h-[46px] select-none ${
                tab.active
                  ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50/90 dark:bg-brand-950/70 shadow-xs scale-105'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    );
  }

  // 4. GUEST / ANONYMOUS TABS
  const guestTabs = [
    {
      label: 'Home',
      path: '/',
      icon: <Home className="w-5 h-5" />,
      active: isActive('/'),
    },
    {
      label: 'Services',
      path: '/services/ac-repair',
      icon: <Grid className="w-5 h-5" />,
      active: isActive('/services'),
    },
    {
      label: 'Help',
      path: '/customer/help',
      icon: <HelpCircle className="w-5 h-5" />,
      active: isActive('/customer/help'),
    },
    {
      label: 'Sign In',
      path: '/login',
      icon: <LogIn className="w-5 h-5" />,
      active: isActive('/login') || isActive('/register'),
    },
  ];

  return (
    <nav
      aria-label="Guest Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.6)] px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-colors duration-200"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {guestTabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-150 min-w-[60px] min-h-[46px] select-none ${
              tab.active
                ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50/90 dark:bg-brand-950/70 shadow-xs scale-105'
                : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
