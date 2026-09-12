import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Users, 
  Search, 
  Play, 
  Pause, 
  CheckCircle2, 
  Clock, 
  Filter, 
  ArrowRight,
  Scale
} from 'lucide-react';

export const StaffQueuePage: React.FC = () => {
  const { queueList, servingToken, simulateNextToken, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'serving' | 'waiting' | 'completed'>('all');

  const filtered = queueList.filter(item => {
    const matchesSearch = item.token.toLowerCase().includes(search.toLowerCase()) || 
                          item.farmerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCall = (token: string) => {
    simulateNextToken();
    showToast(`Token ${token} called to Counter 2.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              LIVE QUEUE MANAGEMENT
            </span>
            <span className="text-xs text-slate-500">• Counter 2 (Weighbridge Bay)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Live Queue & Counter Calling
          </h1>
          <p className="text-xs text-slate-500">
            Real-time tokens in queue, call next truck to weighbridge, and monitor waiting times.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={simulateNextToken}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Call Next Token ({servingToken})</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['all', 'serving', 'waiting', 'completed'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  statusFilter === tab 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search token or farmer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Token</th>
                <th className="py-3 px-4">Farmer</th>
                <th className="py-3 px-4">Commodity</th>
                <th className="py-3 px-4">Quantity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Wait Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => (
                <tr key={item.token} className={item.status === 'serving' ? 'bg-amber-50/50' : 'hover:bg-slate-50'}>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {item.token}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {item.farmerName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {item.crop}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {item.quantityQuintals} Quintals
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    {item.estimatedWaitMinutes} min
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {item.status === 'waiting' && (
                      <button
                        onClick={() => handleCall(item.token)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition shadow-xs"
                      >
                        Call to Bay
                      </button>
                    )}
                    {item.status === 'serving' && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        At Counter
                      </span>
                    )}
                    {item.status === 'completed' && (
                      <span className="text-[11px] text-slate-400">
                        Discharged ✓
                      </span>
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
