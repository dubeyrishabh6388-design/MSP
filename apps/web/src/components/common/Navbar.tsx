import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Wrench,
  MapPin,
  User,
  LogOut,
  Briefcase,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  Layers,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  ShieldCheck,
  DollarSign,
  Award,
  Radio,
  Users,
  Building2,
  Calendar,
  CreditCard,
  HelpCircle,
} from 'lucide-react';
import { UserRole } from '@serviqa/shared';
import { LocationPicker } from './LocationPicker';

export function Navbar() {
  const { user, logout, switchDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;
  const isProvider = user?.role === UserRole.PROVIDER || location.pathname.startsWith('/provider');
  const isAdmin = user?.role === UserRole.ADMIN || location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="flex items-center justify-between h-16 sm:h-18 py-2">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to={isProvider ? '/provider' : isAdmin ? '/admin' : '/'}
              className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-brand-600/25 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-200">
                <Wrench className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                  Servi<span className="text-brand-600 dark:text-brand-500">qa</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase block -mt-1">
                  {isProvider ? 'Partner Desk' : isAdmin ? 'Admin Console' : 'Hyperlocal Marketplace'}
                </span>
              </div>
            </Link>

            {/* Live Location Detector & City Selector Pill (Desktop / Tablet - Only for Customers) */}
            {!isProvider && !isAdmin && (
              <div className="hidden sm:flex items-center max-w-[190px] xl:max-w-[240px]">
                <LocationPicker variant="navbar" className="w-full" />
              </div>
            )}
          </div>

          {/* Center Navigation Links - Logged-in Customer */}
          {user && user.role === UserRole.CUSTOMER && !isProvider && !isAdmin && (
            <nav className="hidden md:flex items-center gap-1 xl:gap-2 py-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname === '/'
                    ? 'text-brand-600 dark:text-brand-400 font-extrabold bg-brand-50 dark:bg-brand-950/60'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Services
              </Link>

              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />

              <Link
                to="/customer"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname === '/customer'
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Bookings</span>
              </Link>

              <Link
                to="/customer/addresses"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/customer/addresses')
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Addresses</span>
              </Link>

              <Link
                to="/customer/payments"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/customer/payments')
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Invoices</span>
              </Link>

              <Link
                to="/customer/help"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/customer/help')
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help</span>
              </Link>

              <Link
                to="/customer/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/customer/profile')
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
                <span>Profile</span>
              </Link>
            </nav>
          )}

          {/* Center Navigation Links - Guest / Not Logged In */}
          {(!user || user.role !== UserRole.CUSTOMER) && !isProvider && !isAdmin && (
            <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
              <Link
                to="/"
                className={`hover:text-brand-600 dark:hover:text-brand-400 transition-colors relative py-1 ${
                  isActive('/') ? 'text-brand-600 dark:text-brand-400 font-extrabold' : ''
                }`}
              >
                All Services
                {isActive('/') && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 dark:bg-brand-500 rounded-full"></span>
                )}
              </Link>

              <Link
                to="/services/ac-repair"
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors py-1"
              >
                AC Servicing
              </Link>

              <Link
                to="/services/packers-movers"
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors py-1"
              >
                Packers & Movers
              </Link>

              <Link
                to="/services/home-cleaning"
                className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors py-1"
              >
                Deep Cleaning
              </Link>
            </nav>
          )}

          {/* Unified Provider Top Navigation Tabs (Directly in main header) */}
          {isProvider && (
            <nav className="hidden md:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar py-1">
              <Link
                to="/provider"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname === '/provider'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Jobs & Leads</span>
              </Link>

              <Link
                to="/provider/verification"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/provider/verification')
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KYC & Verification</span>
              </Link>

              <Link
                to="/provider/services"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/provider/services')
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Services & Rates</span>
              </Link>

              <Link
                to="/provider/earnings"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/provider/earnings')
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Earnings & Bank</span>
              </Link>

              <Link
                to="/provider/rewards"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/provider/rewards')
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Rewards & Score</span>
              </Link>

              <Link
                to="/provider/profile"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/provider/profile')
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Business Profile</span>
              </Link>
            </nav>
          )}

          {/* Unified Admin Top Navigation Tabs (Directly in main header) */}
          {isAdmin && (
            <nav className="hidden md:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar py-1">
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname === '/admin'
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>Overview</span>
              </Link>

              <Link
                to="/admin/verifications"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/admin/verifications')
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifications</span>
              </Link>

              <Link
                to="/admin/disputes"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/admin/disputes')
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Disputes</span>
              </Link>

              <Link
                to="/admin/categories"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/admin/categories')
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Categories</span>
              </Link>

              <Link
                to="/admin/users"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/admin/users')
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Users</span>
              </Link>

              <Link
                to="/admin/settlements"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  location.pathname.startsWith('/admin/settlements')
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Settlements</span>
              </Link>
            </nav>
          )}

          {/* Right Area: Theme Toggle, Persona Switcher & User Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Toggle Button - Symbol Only */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-xs shrink-0"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Quick Demo Persona Switcher (All Devices) */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                title="Switch test personas to experience all roles"
              >
                <Layers className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span className="font-extrabold uppercase text-[10px] sm:text-[11px] text-slate-800 dark:text-slate-200">
                  {user ? user.role : 'Guest'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-1 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    One-Click Persona Switcher
                  </div>
                  <div className="p-1 space-y-1">
                    <button
                      onClick={async () => {
                        await switchDemoUser('CUSTOMER');
                        setRoleMenuOpen(false);
                        navigate('/customer');
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-brand-50/70 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">👤</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">Rahul Sharma</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">Customer Persona</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 px-2 py-0.5 rounded-full">
                        Customer
                      </span>
                    </button>

                    <button
                      onClick={async () => {
                        await switchDemoUser('PROVIDER');
                        setRoleMenuOpen(false);
                        navigate('/provider');
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-emerald-50/70 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">🛠️</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">CoolCare AC Solutions</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">Verified Pro Persona</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                        Provider
                      </span>
                    </button>

                    <button
                      onClick={async () => {
                        await switchDemoUser('ADMIN');
                        setRoleMenuOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-purple-50/70 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚡</span>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">System Administrator</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">Operations Console</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Portal Action Buttons */}
            {user ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Link
                  to={isProvider ? '/provider/profile' : isAdmin ? '/admin' : '/customer/profile'}
                  className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-brand-500/30 transition-all cursor-pointer"
                  title={`${user.name} - View Profile`}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-brand-500/40 shadow-xs"
                    />
                  ) : (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-700 rounded-full shadow-md shadow-brand-600/25 transition-all hover:shadow-brand-600/40"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Header: Live Location Access Bar (Only for Customers / Guests) */}
      {!isProvider && !isAdmin && (
        <div className="sm:hidden px-3.5 py-1.5 bg-slate-50/95 dark:bg-slate-900/95 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
          <LocationPicker variant="navbar" className="w-full" />
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 px-5 pt-3 pb-6 space-y-3">
          {!user && (
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 py-2 text-center text-xs font-extrabold text-white bg-brand-600 rounded-xl shadow-xs"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Customer Location Selector & Directory Links (Hidden for Provider & Admin) */}
          {!isProvider && !isAdmin && (
            <>
              <div className="pb-2">
                <LocationPicker variant="compact" />
              </div>

              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                All Services Directory
              </Link>
              <Link
                to="/services/ac-repair"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                AC Installation & Foam Servicing
              </Link>
              <Link
                to="/services/packers-movers"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                Packers & Movers
              </Link>
            </>
          )}

          {user && user.role === 'CUSTOMER' && (
            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Customer Services
              </span>
              <Link
                to="/customer"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-brand-600 dark:text-brand-400"
              >
                📅 My Bookings & Orders
              </Link>
              <Link
                to="/customer/addresses"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                📍 Saved Delivery Addresses
              </Link>
              <Link
                to="/customer/payments"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                💳 Escrow Ledger & Invoices
              </Link>
              <Link
                to="/customer/help"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                🛡️ 30-Day Warranty & Disputes
              </Link>
              <Link
                to="/customer/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                👤 Profile & Safety Settings
              </Link>
            </div>
          )}

          {user && user.role === 'PROVIDER' && (
            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Provider Operations Desk
              </span>
              <Link
                to="/provider"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
              >
                🛠️ Jobs & Local Leads
              </Link>
              <Link
                to="/provider/verification"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                🛡️ KYC Compliance & Aadhaar
              </Link>
              <Link
                to="/provider/services"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                📦 Services, Rates & Territory
              </Link>
              <Link
                to="/provider/earnings"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                💰 Earnings & Weekly NEFT Bank
              </Link>
              <Link
                to="/provider/rewards"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                🏆 5-Pillar Scorecard & Badges
              </Link>
              <Link
                to="/provider/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                🏢 Business Profile & Equipment
              </Link>
            </div>
          )}

          {user && user.role === 'ADMIN' && (
            <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Platform Operations Console
              </span>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400"
              >
                ⚡ Overview & Health
              </Link>
              <Link
                to="/admin/verifications"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                🛡️ Provider KYC Queue
              </Link>
              <Link
                to="/admin/disputes"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                ⚖️ Disputes & Mediation
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                🗂️ Categories & Schemas
              </Link>
              <Link
                to="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                👥 User Management & Safety
              </Link>
              <Link
                to="/admin/settlements"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                🏦 Weekly NEFT Settlements
              </Link>
            </div>
          )}
          <div className="pt-2 pb-1 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Theme</span>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
          {/* One-Touch Persona Switcher in Mobile Drawer */}
          <div className="pt-3 pb-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
              Switch Test Role ({user ? user.role : 'Guest'})
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={async () => {
                  await switchDemoUser('CUSTOMER');
                  setMobileMenuOpen(false);
                  navigate('/customer');
                }}
                className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-colors cursor-pointer ${
                  user?.role === 'CUSTOMER'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={async () => {
                  await switchDemoUser('PROVIDER');
                  setMobileMenuOpen(false);
                  navigate('/provider');
                }}
                className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-colors cursor-pointer ${
                  user?.role === 'PROVIDER'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Provider
              </button>
              <button
                type="button"
                onClick={async () => {
                  await switchDemoUser('ADMIN');
                  setMobileMenuOpen(false);
                  navigate('/admin');
                }}
                className={`py-2 px-1 rounded-xl text-center text-xs font-bold transition-colors cursor-pointer ${
                  user?.role === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          {user && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Signed in as
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {user.name} ({user.role})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
