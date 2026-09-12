import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Building2, 
  Users, 
  Scale, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  QrCode, 
  Truck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const CentreDashboardPage: React.FC = () => {
  const { 
    servingToken, 
    queueList, 
    simulateNextToken, 
    advanceProcurementStep, 
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCounter, setActiveCounter] = useState('Counter 2');

  const filteredQueue = queueList.filter(item => 
    item.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCallToken = (token: string) => {
    simulateNextToken();
    showToast(`Token ${token} called to ${activeCounter}. PA system chime activated.`);
  };

  const handleRecordWeight = () => {
    advanceProcurementStep();
    showToast('Gross weighbridge telemetry (25.40 Q) committed to ledger.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header with Centre Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                Mylavaram Procurement Centre
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                OPERATIONAL
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Center Code: AP-NTR-MYL-04 • Capacity: 100 slots/day • 3 Active Weighbridges
            </p>
          </div>
        </div>

        {/* Counter Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Logged in at:</span>
          <select
            value={activeCounter}
            onChange={(e) => setActiveCounter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 outline-none"
          >
            <option>Counter 1 (Paddy Grade-A)</option>
            <option>Counter 2 (Weighbridge Bay)</option>
            <option>Counter 3 (Moisture Lab)</option>
          </select>
        </div>
      </div>

      {/* Operator Primary Control Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Call Next Token Hero */}
        <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 text-white p-6 sm:p-7 shadow-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
              <span className="text-emerald-400 font-bold uppercase tracking-wider">
                CURRENT SERVING TOKEN
              </span>
              <span className="font-mono text-slate-400">{activeCounter}</span>
            </div>

            <div className="my-6 text-center">
              <span className="text-6xl sm:text-7xl font-mono font-black text-white tracking-tight">
                {servingToken}
              </span>
              <p className="text-xs text-emerald-300 mt-2">
                Farmer: Ravi Kumar • 25 Q Paddy
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => handleCallToken(servingToken)}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black rounded-2xl text-sm shadow-lg shadow-emerald-950/40 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Call Next Token to Bay</span>
            </button>

            <button
              onClick={handleRecordWeight}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition"
            >
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Capture Weighbridge Weight</span>
            </button>
          </div>
        </div>

        {/* Right: Centre Capacity & Bay Telemetry */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                DAILY SLOTS BOOKED
              </span>
              <p className="text-3xl font-black font-mono text-slate-900 mt-1 font-heading">
                72 / 100
              </p>
            </div>
            <div className="mt-4">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full w-[72%]" />
              </div>
              <span className="text-[10px] text-slate-500 block mt-1.5 font-medium">
                72% Capacity Utilized (Optimal)
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                WAITING IN TRUCK YARD
              </span>
              <p className="text-3xl font-black font-mono text-amber-600 mt-1 font-heading">
                18 Farmers
              </p>
            </div>
            <p className="text-[10px] text-slate-500 mt-4">
              Average bay throughput: <strong>5.2 mins</strong> per unload
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                TODAY'S PROCUREMENT
              </span>
              <p className="text-3xl font-black font-mono text-emerald-800 mt-1 font-heading">
                1,840 Q
              </p>
            </div>
            <span className="text-[10px] text-emerald-700 font-semibold mt-4">
              All batches passed moisture test ✓
            </span>
          </div>
        </div>
      </div>

      {/* Operator Live Queue Management Table */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Procurement Centre Live Token Roster
            </h2>
            <p className="text-xs text-slate-500">
              Direct operator actions: mark gate entry, test moisture, or complete weighbridge inspection.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search token or farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Token</th>
                <th className="pb-3">Farmer Name</th>
                <th className="pb-3">Crop & Quantity</th>
                <th className="pb-3">Time Slot</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Operator Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQueue.map((item) => (
                <tr key={item.token} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-bold text-slate-900 text-sm">
                    {item.token}
                  </td>
                  <td className="py-3 font-semibold text-slate-800">
                    {item.farmerName}
                  </td>
                  <td className="py-3 text-slate-600">
                    {item.crop} • {item.quantityQuintals} Q
                  </td>
                  <td className="py-3 font-mono text-slate-500">
                    {item.timeSlot || '10:30 AM'}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 text-right space-x-2">
                    {item.status === 'waiting' && (
                      <button
                        onClick={() => handleCallToken(item.token)}
                        className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition"
                      >
                        Call to Bay
                      </button>
                    )}
                    {item.status === 'serving' && (
                      <button
                        onClick={() => {
                          simulateNextToken();
                          showToast(`Token ${item.token} marked completed.`);
                        }}
                        className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-bold transition"
                      >
                        Complete Weighing
                      </button>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-emerald-700 font-bold text-xs">Done ✓</span>
                    )}
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
