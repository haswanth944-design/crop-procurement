import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Scale, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Sparkles,
  ArrowRight,
  ShieldCheck 
} from 'lucide-react';

export const StaffProcurementPage: React.FC = () => {
  const { procurementDetails, advanceProcurementStep, showToast } = useApp();

  const [grossWeight, setGrossWeight] = useState(25.40);
  const [moisture, setMoisture] = useState(13.8);
  const [foreignMatter, setForeignMatter] = useState(0.6);

  const handleCommitWeighment = (e: React.FormEvent) => {
    e.preventDefault();
    advanceProcurementStep();
    showToast('Weighment telemetry and moisture certification successfully recorded in ledger.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              ELECTRONIC WEIGHBRIDGE & QC LAB
            </span>
            <span className="text-xs text-slate-500">• Lot Inspection Protocol</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Procurement Inspection & Telemetry
          </h1>
          <p className="text-xs text-slate-500">
            Commit electronic scale gross/tare weights, record digital moisture readings, and approve lots.
          </p>
        </div>

        <button
          onClick={() => showToast('Generating official digital weighment receipt...')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Weighment Slip</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Lot Inspection Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Active Unloading Bay Inspection
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">
              Token: {procurementDetails.token}
            </span>
          </div>

          <form onSubmit={handleCommitWeighment} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Farmer Name
                </label>
                <input
                  type="text"
                  disabled
                  value={procurementDetails.farmerName}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Commodity
                </label>
                <input
                  type="text"
                  disabled
                  value={procurementDetails.crop}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>IoT Weighbridge Auto-Lock Telemetry</span>
              </span>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Gross Weight (Q)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Tare Truck (Q)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    disabled
                    value={procurementDetails.tareWeight}
                    className="w-full px-3 py-2 rounded-xl bg-slate-200 border border-slate-300 text-sm font-mono font-bold text-slate-700 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Net Commodity (Q)
                  </label>
                  <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-sm font-mono font-black text-emerald-800">
                    {(grossWeight - procurementDetails.tareWeight).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Moisture Content (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <span className={`absolute right-3 top-2 text-[11px] font-bold ${
                    moisture <= procurementDetails.maxAllowedMoisture ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {moisture <= procurementDetails.maxAllowedMoisture ? 'Passed (≤17%)' : 'Exceeds limit'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Foreign Matter (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={foreignMatter}
                  onChange={(e) => setForeignMatter(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Commit Weighbridge Data & Issue Acceptance</span>
            </button>
          </form>
        </div>

        {/* Live Step Progress */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-heading pb-2 border-b border-slate-100">
            Mandatory Verification Pipeline
          </h3>
          <div className="space-y-3">
            {procurementDetails.steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  step.status === 'completed' 
                    ? 'bg-emerald-600 text-white' 
                    : step.status === 'in_progress' 
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-200' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.status === 'completed' ? '✓' : idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
