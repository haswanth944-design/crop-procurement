import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Download, 
  Building2, 
  ShieldCheck, 
  Printer, 
  HelpCircle,
  FileCheck2,
  AlertCircle
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { payments, profile, showToast } = useApp();

  const totalEarned = payments.reduce((sum, p) => sum + p.netAmount, 0);
  const pendingAmount = payments.filter(p => p.status !== 'credited').reduce((sum, p) => sum + p.netAmount, 0);
  const completedAmount = payments.filter(p => p.status === 'credited').reduce((sum, p) => sum + p.netAmount, 0);

  const activePayment = payments.find(p => p.status !== 'credited') || payments[0];

  const handleDownloadStatement = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Direct Benefit Transfer (DBT) Payments
            </h1>
            <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 border border-emerald-300">
              PFMS Integrated
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Zero middlemen. Funds transferred straight from the Ministry to your Aadhaar-seeded bank account.
          </p>
        </div>

        <button
          onClick={handleDownloadStatement}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Statement</span>
        </button>
      </div>

      {/* 3 Summary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Season Procurement
            </span>
            <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono mt-3 font-heading">
            ₹{totalEarned.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Across 2 procurement cycles</p>
        </div>

        <div className="rounded-3xl bg-amber-50/70 p-5 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Processing in PFMS Pipeline
            </span>
            <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-amber-950 font-mono mt-3 font-heading">
            ₹{pendingAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-amber-800 font-medium mt-1">Expected in bank within 24-48 hours</p>
        </div>

        <div className="rounded-3xl bg-emerald-50/70 p-5 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Successfully Credited
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-950 font-mono mt-3 font-heading">
            ₹{completedAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-800 font-medium mt-1">Verified with bank UTR reference</p>
        </div>
      </div>

      {/* Active Processing Payment Card with Timeline */}
      {activePayment && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                CURRENT ACTIVE DISBURSEMENT
              </span>
              <h2 className="text-lg font-bold text-slate-900 font-heading mt-1">
                Sanction #{activePayment.id} • {activePayment.crop} ({activePayment.quantityQuintals} Q)
              </h2>
            </div>
            <StatusBadge status={activePayment.status} />
          </div>

          {/* 4-Stage Payment Flow Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              PFMS Treasury Clearance Flow
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                { stage: 'Approved', desc: 'Civil Supplies Officer Approved', done: true, time: '12 Sep, 11:30 AM' },
                { stage: 'Sent to Bank', desc: 'Batch transmitted via PFMS gateway', done: true, time: '12 Sep, 02:15 PM' },
                { stage: 'PFMS Processing', desc: 'RBI Clearing & Validation', done: activePayment.status === 'processing' || activePayment.status === 'credited', time: '12 Sep, 04:00 PM' },
                { stage: 'Credited to Farmer', desc: 'Direct credit to SBI Account', done: activePayment.status === 'credited', time: activePayment.status === 'credited' ? 'Credited' : 'Est: Tomorrow 10 AM' },
              ].map((step, idx) => (
                <div key={step.stage} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 relative">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{step.stage}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">{step.desc}</p>
                  <span className="text-[10px] font-mono text-slate-400 block mt-2">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown & Masked Bank Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Left: Financial Ledger Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block mb-2">Itemized MSP Payout Calculation</span>
              <div className="flex justify-between text-slate-600">
                <span>Gross Weight:</span>
                <span className="font-mono">25.00 Q</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>MSP Mandated Rate:</span>
                <span className="font-mono">₹{activePayment.ratePerQuintal} / Q</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Moisture / Dust Deductions:</span>
                <span className="font-mono text-emerald-700 font-bold">₹0.00 (Zero deduction)</span>
              </div>
              <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-black text-emerald-950">
                <span>Net Credited Amount:</span>
                <span className="font-mono text-base">₹{activePayment.netAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Right: Bank Account & Audit Reference */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block mb-2">Aadhaar-Linked Bank Destination</span>
              <div className="flex justify-between text-slate-600">
                <span>Beneficiary:</span>
                <span className="font-bold text-slate-900">{profile.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Bank:</span>
                <span className="font-bold text-slate-900">{activePayment.bankName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Account Number:</span>
                <span className="font-mono font-bold text-slate-900">{activePayment.accountNumberMasked}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PFMS Reference ID:</span>
                <span className="font-mono font-bold text-slate-900">{activePayment.pfmsReferenceId}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-base font-bold text-slate-900 font-heading mb-4">
          Procurement Payment History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Payment ID</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Crop</th>
                <th className="pb-3">Quantity</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">PFMS Status</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 font-mono font-semibold text-slate-800">{p.id}</td>
                  <td className="py-3.5 text-slate-600">{p.date}</td>
                  <td className="py-3.5 font-bold text-slate-900">{p.crop}</td>
                  <td className="py-3.5 font-mono text-slate-600">{p.quantityQuintals} Q</td>
                  <td className="py-3.5 font-mono font-bold text-emerald-900 text-sm">
                    ₹{p.netAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => showToast(`Downloaded payment voucher for ${p.id}`)}
                      className="inline-flex items-center gap-1 text-slate-600 hover:text-emerald-800 font-semibold text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Voucher</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
