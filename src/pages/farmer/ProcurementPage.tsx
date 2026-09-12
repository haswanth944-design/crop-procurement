import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  CheckCircle2, 
  Clock, 
  Circle, 
  Play, 
  Printer, 
  FileText, 
  Scale, 
  Droplets, 
  ShieldCheck, 
  Truck, 
  FileCheck2, 
  UserCheck, 
  Info,
  Calendar,
  Sparkles
} from 'lucide-react';

export const ProcurementPage: React.FC = () => {
  const { 
    procurementSteps, 
    advanceProcurementStep, 
    activeBooking, 
    profile, 
    showToast 
  } = useApp();

  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(() => {
    const activeIdx = procurementSteps.findIndex(s => s.status === 'in_progress');
    return activeIdx >= 0 ? activeIdx : 0;
  });

  const selectedStep = procurementSteps[selectedStepIndex] || procurementSteps[0];

  const handleAdvance = () => {
    advanceProcurementStep();
    // Update selected step to the next or in-progress
    setTimeout(() => {
      const activeIdx = procurementSteps.findIndex(s => s.status === 'in_progress');
      if (activeIdx >= 0) setSelectedStepIndex(activeIdx);
    }, 50);
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Procurement Lifecycle Tracker
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 border border-emerald-300">
              Stage {procurementSteps.filter(s => s.status === 'completed').length} of {procurementSteps.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            End-to-end transparency: gate check-in, moisture grading, tare deduction & receipt generation.
          </p>
        </div>

        {/* Demo Simulation Controller */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAdvance}
            className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition active:scale-95"
            title="Advance procurement inspection step"
          >
            <Play className="w-4 h-4 fill-current text-emerald-300" />
            <span>Advance Step (Demo)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 8-Step Timeline on Left, Deep Inspection & Weight Slip on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: 8 Step Vertical Timeline */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-base font-bold text-slate-900 font-heading pb-3 border-b border-slate-100">
            Official 8-Stage Procurement Workflow
          </h2>

          <div className="space-y-3">
            {procurementSteps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in_progress';
              const isPending = step.status === 'upcoming';

              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                    isSelected 
                      ? 'border-emerald-700 bg-emerald-50/70 ring-1 ring-emerald-700' 
                      : isInProgress
                        ? 'border-sky-300 bg-sky-50/50'
                        : isCompleted
                          ? 'border-slate-200 bg-slate-50/60'
                          : 'border-slate-100 bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {isCompleted ? (
                        <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </div>
                      ) : isInProgress ? (
                        <div className="h-6 w-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                          {idx + 1}
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{step.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                      {step.timestamp && (
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          Recorded: {step.timestamp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <StatusBadge status={step.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Inspection Card & Weight Slip Output */}
        <div className="lg:col-span-6 space-y-6">
          {/* Selected Stage Inspector & Detail View */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    STAGE {selectedStepIndex + 1} AUDIT DETAILS
                  </span>
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {selectedStep.title}
                  </h3>
                </div>
              </div>
              <StatusBadge status={selectedStep.status} />
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Assigned Officer / Inspector</span>
                <span className="text-sm font-bold text-slate-800 block mt-0.5">
                  {selectedStep.officerName || 'B. Venkat Rao (Moisture Quality Analyst)'}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Badge ID: AP-QAC-4091</span>
              </div>

              {/* Dynamic stage specific data */}
              {selectedStep.id === 'weighbridge_gross' || selectedStep.id === 'weighbridge_tare' || selectedStep.id === 'quality_inspection' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-800 block text-[10px] uppercase font-bold">
                      Digital Scale Telemetry
                    </span>
                    <span className="text-xl font-mono font-black text-emerald-950 mt-1 block">
                      {selectedStep.id === 'weighbridge_gross' ? '25.40 Q' : '0.40 Q (Tare)'}
                    </span>
                    <span className="text-[10px] text-emerald-700">Calibrated Electronic Scale #2</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-amber-800 block text-[10px] uppercase font-bold">
                      Moisture Sensor
                    </span>
                    <span className="text-xl font-mono font-black text-amber-950 mt-1 block">
                      13.8 %
                    </span>
                    <span className="text-[10px] text-amber-700 font-semibold">
                      Passed (Limit: &lt; 17.0%)
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] leading-relaxed">
                <Info className="w-3.5 h-3.5 text-slate-400 inline mr-1" />
                This stage is authenticated via cryptographic e-Procurement signatures to ensure zero tampering and automatic transmission to the Ministry of Consumer Affairs portal.
              </div>
            </div>
          </div>

          {/* Official Digital Weighment Slip (Printable) */}
          <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200" id="weighment-slip">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-heading">
                  OFFICIAL DIGITAL WEIGHMENT SLIP
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                SLIP #WS-2026-8941
              </span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Farmer: <strong className="text-slate-900">{profile.name}</strong></div>
                <div>Centre: <strong className="text-slate-900">Mylavaram APMC</strong></div>
                <div>Passbook No: <strong className="text-slate-900 font-mono">{profile.surveyPassbookNo}</strong></div>
                <div>Vehicle No: <strong className="text-slate-900 font-mono">AP 16 TX 4492</strong></div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span>Gross Weight (Loaded Truck):</span>
                  <span className="font-bold">25.40 Quintals</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tare Weight (Empty Truck):</span>
                  <span>- 0.40 Quintals</span>
                </div>
                <div className="pt-1.5 border-t border-slate-300 flex justify-between text-sm font-black text-emerald-900">
                  <span>NET PROCURED WEIGHT:</span>
                  <span>25.00 Quintals</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                  <span>Tested Moisture Content:</span>
                  <span className="font-semibold text-emerald-700">13.80% (Grade A Standard)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Sanctioned Payout</span>
                  <span className="text-base font-black text-emerald-900 font-mono">
                    ₹58,000.00
                  </span>
                </div>
                <button
                  onClick={handlePrintSlip}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
