import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FileText, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Building2 
} from 'lucide-react';

export const StaffReportsPage: React.FC = () => {
  const { showToast } = useApp();

  const handleDownloadReport = (title: string) => {
    showToast(`Exporting ${title} report as official CSV...`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              CENTRE AUDIT & RECONCILIATION
            </span>
            <span className="text-xs text-slate-500">• Daily Logs</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Procurement Centre Daily Reports
          </h1>
          <p className="text-xs text-slate-500">
            Official civil supplies daily weighment tally, farmer turnout metrics, and treasury submission records.
          </p>
        </div>

        <button
          onClick={() => handleDownloadReport('Daily Consolidated Batch')}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Download className="w-4 h-4" />
          <span>Download All Today Reports</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm font-heading">
            Daily Weighbridge Summary
          </h3>
          <p className="text-xs text-slate-500">
            Total of 1,840 Quintals weighed across 3 bays with average moisture of 13.6%.
          </p>
          <button
            onClick={() => handleDownloadReport('Weighbridge Summary')}
            className="text-xs font-bold text-amber-900 hover:underline pt-2 inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm font-heading">
            PFMS DBT Payment Clearance
          </h3>
          <p className="text-xs text-slate-500">
            54 digital acceptance receipts generated and forwarded to treasury for Aadhaar-linked payout.
          </p>
          <button
            onClick={() => handleDownloadReport('PFMS Clearance List')}
            className="text-xs font-bold text-emerald-800 hover:underline pt-2 inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm font-heading">
            Turnaround & Waiting Log
          </h3>
          <p className="text-xs text-slate-500">
            Average truck yard waiting duration reduced to 24 minutes compared to 18 hours in 2025.
          </p>
          <button
            onClick={() => handleDownloadReport('Turnaround Performance')}
            className="text-xs font-bold text-purple-800 hover:underline pt-2 inline-flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
