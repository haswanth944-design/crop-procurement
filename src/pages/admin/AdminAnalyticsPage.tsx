import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Download, 
  Calendar 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AdminAnalyticsPage: React.FC = () => {
  const { showToast } = useApp();

  const dailyVolumeData = [
    { date: '06 Sep', volume: 1840, target: 2000 },
    { date: '07 Sep', volume: 2150, target: 2000 },
    { date: '08 Sep', volume: 2420, target: 2000 },
    { date: '09 Sep', volume: 1980, target: 2000 },
    { date: '10 Sep', volume: 2650, target: 2000 },
    { date: '11 Sep', volume: 3100, target: 2200 },
    { date: '12 Sep', volume: 3420, target: 2200 },
  ];

  const centreCapacityData = [
    { name: 'Mylavaram', booked: 72, capacity: 100, wait: 35 },
    { name: 'Gollapudi', booked: 45, capacity: 100, wait: 22 },
    { name: 'Nandigama', booked: 88, capacity: 100, wait: 48 },
    { name: 'Tiruvuru', booked: 60, capacity: 100, wait: 28 },
    { name: 'Jaggayyapeta', booked: 95, capacity: 100, wait: 60 },
  ];

  const cropShareData = [
    { name: 'Paddy (Grade A)', value: 58, color: '#059669' },
    { name: 'Wheat', value: 22, color: '#d97706' },
    { name: 'Maize', value: 12, color: '#2563eb' },
    { name: 'Cotton', value: 8, color: '#7c3aed' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              CIVIL SUPPLIES INTELLIGENCE
            </span>
            <span className="text-xs text-slate-500">• Macro Procurement Trends</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            District Procurement Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Grain intake volumes, target fulfillment, crop distribution, and waiting time benchmarks.
          </p>
        </div>

        <button
          onClick={() => showToast('Exporting analytics graphics and CSV...')}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Volume vs Target */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-heading">
              Daily Procurement Intake (Quintals)
            </h3>
            <span className="text-xs text-slate-400">Target vs Actual</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolumeData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="volume" fill="#059669" radius={[6, 6, 0, 0]} name="Actual Q" />
                <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Target Q" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Distribution */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 font-heading">
            Procured Commodity Share (%)
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cropShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {cropShareData.map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-slate-600 truncate">{c.name}: <strong>{c.value}%</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
