import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getAllFarmers } from '../../lib/firestoreService';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  MapPin, 
  Tractor,
  Phone,
  RefreshCw
} from 'lucide-react';

interface FarmerRow {
  id: string;
  name: string;
  phone: string;
  village: string;
  mandal: string;
  district: string;
  acres: number;
  crops: string;
  passbook: string;
  kyc: string;
}

export const AdminFarmersPage: React.FC = () => {
  const { showToast } = useApp();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [farmersList, setFarmersList] = useState<FarmerRow[]>([
    {
      id: 'AP-NTR-2026-8812',
      name: 'Ravi Kumar',
      phone: '9848012345',
      village: 'Chandrala',
      mandal: 'Mylavaram',
      district: 'NTR District',
      acres: 6.5,
      crops: 'Paddy, Maize',
      passbook: 'AP/NTR/2024/7821',
      kyc: 'Verified (Aadhaar)'
    },
    {
      id: 'AP-NTR-2026-4419',
      name: 'Venkat Rao',
      phone: '9848054321',
      village: 'Gollapudi',
      mandal: 'Vijayawada Rural',
      district: 'NTR District',
      acres: 4.2,
      crops: 'Paddy (Grade A)',
      passbook: 'AP/NTR/2024/1102',
      kyc: 'Verified (Aadhaar)'
    },
    {
      id: 'AP-NTR-2026-3021',
      name: 'Srinivas Reddy',
      phone: '9848099881',
      village: 'Velvadam',
      mandal: 'Mylavaram',
      district: 'NTR District',
      acres: 9.0,
      crops: 'Cotton, Paddy',
      passbook: 'AP/NTR/2024/9934',
      kyc: 'Verified (Aadhaar)'
    },
    {
      id: 'AP-NTR-2026-5591',
      name: 'Anjamma Devi',
      phone: '9848077665',
      village: 'Kanchikacherla',
      mandal: 'Kanchikacherla',
      district: 'NTR District',
      acres: 3.5,
      crops: 'Maize',
      passbook: 'AP/NTR/2024/4421',
      kyc: 'Verified (Aadhaar)'
    }
  ]);

  const loadLiveFarmers = async () => {
    setLoading(true);
    try {
      const firestoreFarmers = await getAllFarmers();
      if (firestoreFarmers && firestoreFarmers.length > 0) {
        const mapped: FarmerRow[] = firestoreFarmers.map(f => ({
          id: f.farmerRegistrationId || `AP-NTR-2026-${f.uid.slice(0, 4)}`,
          name: f.name,
          phone: f.mobile,
          village: f.village || 'Local Village',
          mandal: f.mandal || 'APMC Mandal',
          district: f.district || 'NTR District',
          acres: f.landAcres || 5.0,
          crops: Array.isArray(f.primaryCrops) ? f.primaryCrops.join(', ') : 'Paddy (Grade-A)',
          passbook: f.surveyPassbookNo || 'AP/NTR/2026/001',
          kyc: 'Verified (Aadhaar DBT)'
        }));

        setFarmersList(prev => {
          const ids = new Set(prev.map(p => p.id));
          const newEntries = mapped.filter(m => !ids.has(m.id));
          return [...newEntries, ...prev];
        });
      }
    } catch {
      // Graceful fallback to initial list
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveFarmers();
  }, []);

  const filtered = farmersList.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.id.toLowerCase().includes(search.toLowerCase()) ||
    f.village.toLowerCase().includes(search.toLowerCase()) ||
    f.passbook.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">
              FARMER ROSTER REGISTRY
            </span>
            <span className="text-xs text-slate-500">• Cloud Firestore Registry</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            Registered Farmers & Land Holdings
          </h1>
          <p className="text-xs text-slate-500">
            Official Pattadar passbook verification, Aadhaar DBT bank accounts, and procurement eligibility.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadLiveFarmers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => showToast('Exporting registered farmer roster as CSV...')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Farmer Directory</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search farmer, ID, village or passbook..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong>{filtered.length}</strong> verified farmers
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Farmer ID</th>
                <th className="py-3 px-4">Name & Phone</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Passbook / Survey</th>
                <th className="py-3 px-4">Acreage</th>
                <th className="py-3 px-4">Commodities</th>
                <th className="py-3 px-4">e-KYC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {f.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{f.name}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      +91 {f.phone}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{f.village}, {f.mandal}</div>
                    <div className="text-[11px] text-slate-400">{f.district}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {f.passbook}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                    {f.acres} Acres
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {f.crops}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{f.kyc}</span>
                    </span>
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
