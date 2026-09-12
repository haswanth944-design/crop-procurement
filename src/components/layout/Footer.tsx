import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sprout, PhoneCall, ShieldCheck, ExternalLink, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useApp();

  return (
    <footer className="no-print bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand & Gov Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <Sprout className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="text-xl font-black text-white font-heading tracking-tight">
                Procure<span className="text-emerald-400">Ease</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Farmer Procurement & Scheduling platform under the Department of Consumer Affairs, Ministry of Consumer Affairs, Food & Public Distribution.
            </p>
            <div className="rounded-xl bg-slate-800/80 p-3 border border-slate-700">
              <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                Toll-Free Kisan Helpline: 1800-180-1551
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Available 6:00 AM to 10:00 PM in official regional languages.
              </p>
            </div>
          </div>

          {/* Col 2: Farmer Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Farmer Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/book-slot')} className="hover:text-emerald-400 transition">
                  Book Procurement Slot
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/queue')} className="hover:text-emerald-400 transition">
                  Live Queue Tracker & Wait Time
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/procurement')} className="hover:text-emerald-400 transition">
                  Track Weighbridge & Moisture Inspection
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/payments')} className="hover:text-emerald-400 transition">
                  PFMS Direct Benefit Transfer (DBT) Status
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/smart-automation')} className="hover:text-emerald-400 transition">
                  Smart Centre Load Recommendation
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/bookings')} className="hover:text-emerald-400 transition">
                  Appointment Rescheduling & History
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Portals & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Portals & Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigate('/login')} className="hover:text-emerald-400 transition">
                  Farmer Portal Login
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login?role=staff')} className="hover:text-emerald-400 transition">
                  Procurement Centre Operator Portal
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/login?role=admin')} className="hover:text-emerald-400 transition">
                  District & State Monitoring Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/help')} className="hover:text-emerald-400 transition">
                  Frequently Asked Questions (FAQ)
                </button>
              </li>
              <li>
                <a href="https://consumeraffairs.nic.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-emerald-400 transition">
                  Department of Consumer Affairs <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a href="https://dfpd.gov.in" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-emerald-400 transition">
                  Food & Public Distribution <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100 mb-4">
              Official Headquarters
            </h4>
            <div className="flex items-start gap-2 text-xs text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Krishi Bhawan, Dr. Rajendra Prasad Road, New Delhi - 110001</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>support@procureease.gov.in</span>
            </div>
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-[11px] text-slate-400">
              <p className="font-semibold text-slate-200">Department of Consumer Affairs</p>
              <p className="mt-0.5">National Procurement Digitization Initiative</p>
            </div>
          </div>
        </div>

        {/* Disclaimer & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <p>
              Official National Portal for Farmer Procurement & Transparent Queue Management.
            </p>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button onClick={() => navigate('/help')} className="hover:underline">Privacy Policy</button>
            <button onClick={() => navigate('/help')} className="hover:underline">Terms of Service</button>
            <button onClick={() => navigate('/help')} className="hover:underline">Security Audit</button>
            <span>© 2026 ProcureEase GOI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
