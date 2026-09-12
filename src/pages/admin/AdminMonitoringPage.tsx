import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  TrendingUp, 
  Truck, 
  CloudSun,
  ShieldCheck,
  RefreshCw 
} from 'lucide-react';

export const AdminMonitoringPage: React.FC = () => {
  const { showToast } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      showToast('Live telemetry sensors synced with State Data Centre.');
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              LIVE SURVEILLANCE & TELEMETRY
            </span>
            <span className="text-xs text-slate-500">• Automated Anomaly Detection</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Real-Time Queue & Yard Bottlenecks
          </h1>
          <p className="text-xs text-slate-500">
            Algorithmic queue monitoring, IoT weighbridge scale tampering detection, and rain alerts.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Sync Live Sensors</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average District Wait Time</span>
          <p className="text-3xl font-black font-mono text-slate-900 font-heading">28 Mins</p>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Within 45-minute national ceiling
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bottleneck Centers</span>
          <p className="text-3xl font-black font-mono text-emerald-800 font-heading">0 Centers</p>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Dynamic load balancing active
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">IoT Weighbridges Online</span>
          <p className="text-3xl font-black font-mono text-purple-900 font-heading">16 / 16</p>
          <span className="text-xs text-purple-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Zero calibration deviations
          </span>
        </div>
      </div>

      {/* Live Incidents Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 font-heading">
          Automated Algorithmic Interventions (Today)
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Dynamic Load Balancing Reroute</h4>
                <p className="text-slate-600 mt-0.5">
                  Mylavaram APMC reached 75% capacity at 11:30 AM. Next 15 booking requests were automatically offered priority express tokens at Gollapudi APMC (7 km away).
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Resolved automatically • 11:32 AM</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              Automated
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CloudSun className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">IMD Weather Warning Advisory Dispatched</h4>
                <p className="text-slate-600 mt-0.5">
                  Heavy rain prediction in Nandigama cluster. SMS alerts dispatched to 42 farmers advising tarpaulin vehicle coverage and flexible slot rescheduling without penalty.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Dispatched via C-DoT SMS Gateway • 09:15 AM</span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Weather Guard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
