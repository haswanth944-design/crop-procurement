import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Calendar, 
  Search, 
  CheckCircle2, 
  Clock, 
  Phone, 
  QrCode,
  Truck,
  ArrowRight
} from 'lucide-react';

export const StaffBookingsPage: React.FC = () => {
  const { bookings, showToast } = useApp();
  const [search, setSearch] = useState('');

  const filtered = bookings.filter(b => 
    b.farmerName.toLowerCase().includes(search.toLowerCase()) ||
    b.token.toLowerCase().includes(search.toLowerCase()) ||
    b.crop.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = (token: string, name: string) => {
    showToast(`Checked in farmer ${name} (Token ${token}) at Gate 1.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              CENTRE REGISTRY
            </span>
            <span className="text-xs text-slate-500">• Today's Schedule</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Procurement Centre Bookings
          </h1>
          <p className="text-xs text-slate-500">
            Verify scheduled appointments, scan gate entry QR tokens, and mark physical arrival.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search bookings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(b => (
          <div key={b.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-amber-400 transition">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 block">{b.id}</span>
                <h3 className="font-bold text-slate-900 text-base font-heading">{b.farmerName}</h3>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  +91 {b.farmerMobile}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-black bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-200 block">
                  {b.token}
                </span>
                <div className="mt-1.5">
                  <StatusBadge status={b.status} />
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Commodity:</span>
                <strong className="text-slate-800">{b.crop}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Declared Quantity:</span>
                <strong className="text-slate-800 font-mono">{b.quantityQuintals} Quintals</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Scheduled Slot:</span>
                <span className="text-slate-800 font-medium">{b.date} • {b.timeSlot}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleCheckIn(b.token, b.farmerName)}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Gate Arrival</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
