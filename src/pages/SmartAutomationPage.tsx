import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Zap, 
  Sparkles, 
  Cpu, 
  Scale, 
  Clock, 
  CloudSun, 
  ShieldCheck, 
  ArrowRight, 
  Sliders, 
  TrendingDown, 
  Building2 
} from 'lucide-react';

export const SmartAutomationPage: React.FC = () => {
  const { navigate, showToast } = useApp();

  // Interactive Smart Engine Simulator for SIH Judges
  const [trucksAhead, setTrucksAhead] = useState<number>(7);
  const [activeBays, setActiveBays] = useState<number>(2);
  const [avgServiceMinutes, setAvgServiceMinutes] = useState<number>(5);
  const [weatherAlertActive, setWeatherAlertActive] = useState<boolean>(false);

  // Dynamic calculation
  const calculatedWaitMinutes = Math.max(
    2,
    Math.round((trucksAhead / activeBays) * avgServiceMinutes * (weatherAlertActive ? 1.25 : 1))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800 shadow-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-800/80 px-3 py-1 text-xs font-bold text-emerald-200 border border-emerald-700/60 mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>SMART INDIA HACKATHON 2026 • THEME: SMART AUTOMATION</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black font-heading">
          ProcureEase Smart Automation Architecture
        </h1>
        <p className="text-sm text-emerald-100/80 mt-2 max-w-3xl leading-relaxed">
          How ProcureEase uses automated load balancing, predictive queue duration models, and IoT electronic weighbridge integration to eliminate 24+ hour farmer queues.
        </p>
      </div>

      {/* 4 Pillars of Smart Automation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Predictive Wait Time Algorithm
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Dynamic waiting calculation based on actual moisture inspection time, weighbridge turnover rates, and truck arrival cadences.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-800 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Intelligent Centre Load Balancing
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            If Mylavaram APMC reaches 80% saturation, booking algorithms automatically recommend nearby Gollapudi Centre with lower congestion.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Zero-Tamper Weighbridge IoT
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Electronic scale readings lock automatically on weight stabilization and generate immutable SHA256 digital weighment slips.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-heading">
            Automated PFMS DBT Pipeline
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates manual file passing; approval of net receipt immediately generates treasury payment orders directly to Aadhaar-seeded accounts.
          </p>
        </div>
      </div>

      {/* Interactive Simulation Playground */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-700/60 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded">
              DYNAMIC QUEUE PREDICTION ENGINE
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-heading mt-1">
              Interactive Queue Duration Simulation Engine
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Real-time algorithmic recalculation
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls */}
          <div className="lg:col-span-7 space-y-5">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Vehicles In Queue Ahead:</span>
                <span className="font-mono text-emerald-800 text-sm">{trucksAhead} trucks</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={trucksAhead}
                onChange={(e) => setTrucksAhead(Number(e.target.value))}
                className="w-full accent-emerald-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Active Weighbridge Unloading Bays:</span>
                <span className="font-mono text-emerald-800 text-sm">{activeBays} parallel bays</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={activeBays}
                onChange={(e) => setActiveBays(Number(e.target.value))}
                className="w-full accent-emerald-800"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Average Weighing & Moisture Inspection Speed:</span>
                <span className="font-mono text-emerald-800 text-sm">{avgServiceMinutes} minutes / truck</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                value={avgServiceMinutes}
                onChange={(e) => setAvgServiceMinutes(Number(e.target.value))}
                className="w-full accent-emerald-800"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <CloudSun className="w-4 h-4 text-amber-600" />
                <span>Simulate Adverse Weather / Rain Alert</span>
              </div>
              <input
                type="checkbox"
                checked={weatherAlertActive}
                onChange={(e) => setWeatherAlertActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Engine Output Box */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 text-white text-center shadow-md border border-emerald-800 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-300 block">
              ALGORITHMIC ESTIMATED WAIT TIME
            </span>
            <div className="text-5xl font-mono font-black text-white">
              {calculatedWaitMinutes} Mins
            </div>
            <p className="text-xs text-emerald-200">
              Formula: (Vehicles / Bays) × Turnaround {weatherAlertActive ? '+ 25% Weather Buffer' : ''}
            </p>

            <div className="mt-4 pt-3 border-t border-emerald-800 text-xs text-emerald-300/90 text-left space-y-1">
              <p>✓ SMS alert scheduled at T-15 minutes</p>
              <p>✓ Digital bay gate-barrier pre-authorized</p>
              <p>✓ PFMS auto-clearing token ready</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
