import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Award, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 md:pb-12 border-t border-slate-900 w-full">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-10 mb-12">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md">
                <Wrench className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Servi<span className="text-brand-500">qa</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              India's transparent multi-service marketplace connecting verified local trade professionals with homeowners and businesses.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Background & Skill Verified</span>
            </div>
          </div>

          {/* Core Categories */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">Popular Services</h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li><Link to="/services/ac-repair" className="hover:text-white transition-colors">AC Installation & Deep Foam Servicing</Link></li>
              <li><Link to="/services/packers-movers" className="hover:text-white transition-colors">Packers & Movers Relocation</Link></li>
              <li><Link to="/services/home-cleaning" className="hover:text-white transition-colors">Deep Home & Kitchen Cleaning</Link></li>
              <li><Link to="/services/electricians" className="hover:text-white transition-colors">Electricians & Distribution Diagnostics</Link></li>
              <li><Link to="/services/plumbing" className="hover:text-white transition-colors">Plumbing & Sanitary Fitting</Link></li>
            </ul>
          </div>

          {/* For Service Providers */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">Service Providers</h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li><Link to="/register" className="hover:text-white transition-colors">Register as a Verified Partner</Link></li>
              <li><Link to="/provider/rewards" className="hover:text-white transition-colors">Monthly Excellence Rewards Program</Link></li>
              <li><Link to="/provider" className="hover:text-white transition-colors">Technician Workspace & Leads</Link></li>
              <li><Link to="/provider/earnings" className="hover:text-white transition-colors">Payout & Settlement Ledger</Link></li>
            </ul>
          </div>

          {/* Customer Protection & Trust */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">Trust & Policies</h4>
            <ul className="space-y-2.5 text-xs font-medium text-slate-400">
              <li className="flex items-center gap-1.5 text-slate-300">
                <HeartHandshake className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span>Customer Escrow Protection</span>
              </li>
              <li><span className="hover:text-white cursor-pointer">Transparent Pricing Promise</span></li>
              <li><span className="hover:text-white cursor-pointer">Cancellation & Dispute Policy</span></li>
              <li><span className="hover:text-white cursor-pointer">Provider Privacy Consent Protocol</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-4">
          <p>© {new Date().getFullYear()} Serviqa Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Certified Local Excellence</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
