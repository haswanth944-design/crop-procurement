import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Scale,
  Plus
} from 'lucide-react';

export const AdminCentresPage: React.FC = () => {
  const { centres, showToast } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              INFRASTRUCTURE DIRECTORY
            </span>
            <span className="text-xs text-slate-500">• APMC & Primary Agricultural Cooperative Societies</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            District Procurement Centres
          </h1>
          <p className="text-xs text-slate-500">
            Capacity management, active weighbridge bay status, and load distribution.
          </p>
        </div>

        <button
          onClick={() => showToast('Opening New Procurement Centre Provisioning Wizard...')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>Provision New Centre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centres.map(c => (
          <div key={c.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 hover:border-purple-300 transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm font-heading">{c.name}</h3>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {c.mandal}, {c.district}
                  </span>
                </div>
              </div>

              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                c.status === 'Open' ? 'bg-emerald-100 text-emerald-800' :
                c.status === 'Crowded' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }`}>
                {c.status}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Daily Capacity:</span>
                <span className="font-bold text-slate-800">{c.dailyCapacity} slots</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Today's Bookings:</span>
                <span className="font-mono font-bold text-purple-900">{c.todayBookings} ({Math.round((c.todayBookings / c.dailyCapacity) * 100)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Weighbridges:</span>
                <span className="font-bold text-emerald-800">{c.countersActive} Bays</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Avg Waiting Time:</span>
                <span className="font-mono font-bold text-slate-800">{c.avgWaitMinutes} mins</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {c.contactNumber}
              </span>
              <button
                onClick={() => showToast(`Calibrating electronic scales for ${c.name}...`)}
                className="text-purple-800 hover:text-purple-950 font-bold hover:underline"
              >
                Telemetry Sync
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
