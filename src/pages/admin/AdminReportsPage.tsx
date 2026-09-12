import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  CreditCard, 
  CheckCircle2, 
  Scale, 
  Calendar 
} from 'lucide-react';

export const AdminReportsPage: React.FC = () => {
  const { showToast } = useApp();

  const handleExport = (name: string) => {
    showToast(`Exporting official statutory report: ${name}...`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              STATUTORY COMPLIANCE & AUDIT
            </span>
            <span className="text-xs text-slate-500">• Ministry of Consumer Affairs</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Official Civil Supplies Reports & DBT Audit
          </h1>
          <p className="text-xs text-slate-500">
            Export monthly statutory MSP reconciliation, PFMS direct benefit ledger, and APMC throughput logs.
          </p>
        </div>

        <button
          onClick={() => handleExport('All Reports Consolidated Archive')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>Download Consolidated ZIP</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-heading">
            PFMS DBT Treasury Ledger
          </h3>
          <p className="text-xs text-slate-500">
            Direct bank transfer disbursements mapped to farmer Aadhaar numbers and bank UTR clearance tokens.
          </p>
          <button
            onClick={() => handleExport('PFMS DBT Treasury Ledger')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PFMS CSV</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-heading">
            Weighbridge Telemetry Audit
          </h3>
          <p className="text-xs text-slate-500">
            Tamper-proof digital weight logs, tare deduction verifications, and moisture laboratory certs.
          </p>
          <button
            onClick={() => handleExport('Weighbridge Telemetry Audit')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Scale Audit</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-base font-heading">
            District Buffer Stock Status
          </h3>
          <p className="text-xs text-slate-500">
            FCI godown dispatch manifests, grain bag counts, and transport truck movement records.
          </p>
          <button
            onClick={() => handleExport('Buffer Stock & Godown Dispatch')}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Godown Manifest</span>
          </button>
        </div>
      </div>
    </div>
  );
};
