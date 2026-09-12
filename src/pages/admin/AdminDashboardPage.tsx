import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth, ADMIN_EMAIL } from '../../context/AuthContext';
import { mockCentres } from '../../data/mockData';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  ShieldCheck,
  UserCheck,
  UserX,
  Database,
  Search,
  RefreshCw
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
import { 
  getAllStaffMembers, 
  acceptStaffMember, 
  removeStaffMember, 
  getFirebaseTableStats,
  saveStaffProfile,
  getAllUsers,
  getAllAdmins,
  saveUserProfile,
  saveAdminProfile,
  acceptAdminMember,
  rejectAdminMember
} from '../../lib/firestoreService';
import { StaffProfile, UserProfile, AdminProfile } from '../../types';

export const AdminDashboardPage: React.FC = () => {
  const { showToast } = useApp();
  const { currentUser } = useAuth();

  const [selectedDistrict, setSelectedDistrict] = useState('NTR District');

  // Active Core Table Tab: 'users' | 'staff' | 'admins'
  const [activeTableTab, setActiveTableTab] = useState<'users' | 'staff' | 'admins'>('users');

  // Users Table State
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'farmer' | 'staff' | 'admin'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Staff Table State
  const [staffList, setStaffList] = useState<StaffProfile[]>([]);
  const [staffFilter, setStaffFilter] = useState<'all' | 'pending_approval' | 'approved' | 'removed'>('all');
  const [staffSearch, setStaffSearch] = useState('');
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Admins Table State
  const [adminsList, setAdminsList] = useState<AdminProfile[]>([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [loadingAdmins, setLoadingAdmins] = useState(true);

  // Firebase Separate Tables Stats
  const [tableStats, setTableStats] = useState({
    admins: 2,
    users: 5,
    staff: 2,
    farmers: 3
  });

  const adminEmail = currentUser?.email || ADMIN_EMAIL;

  // Initial Seed Demo Data
  const initialUsersDemo: UserProfile[] = [
    {
      uid: 'usr-farmer-001',
      name: 'Ravi Kumar Varma',
      email: 'ravikumar.v@apmc.farmer.in',
      phone: '9848012345',
      role: 'farmer',
      farmerId: 'AP/NTR/2026/0942',
      village: 'Chandrala',
      mandal: 'Mylavaram',
      district: 'NTR District',
      state: 'Andhra Pradesh',
      mainCrop: 'Paddy (Grade-A)',
      landDetails: '6.5 Acres',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      uid: 'usr-farmer-002',
      name: 'M. Venkataramaiah',
      email: 'm.venkat@apmc.farmer.in',
      phone: '9848098765',
      role: 'farmer',
      farmerId: 'AP/NTR/2026/1108',
      village: 'Kuntamukkala',
      mandal: 'Gollapudi',
      district: 'NTR District',
      state: 'Andhra Pradesh',
      mainCrop: 'Cotton (Medium Staple)',
      landDetails: '4.2 Acres',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      uid: 'usr-farmer-003',
      name: 'Ch. Srinivas Rao',
      email: 'ch.srinivas@apmc.farmer.in',
      phone: '9848123890',
      role: 'farmer',
      farmerId: 'AP/NTR/2026/2045',
      village: 'Peddapuram',
      mandal: 'Nandigama',
      district: 'NTR District',
      state: 'Andhra Pradesh',
      mainCrop: 'Maize (Yellow Corn)',
      landDetails: '8.0 Acres',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
    },
    {
      uid: 'staff-mylavaram-default',
      name: 'Mylavaram APMC Staff Officer',
      email: 'staff@procureease.gov.in',
      phone: '9848099881',
      role: 'staff',
      centreId: 'CTR-01',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      uid: 'admin-apex-default',
      name: 'Tirumala Venkatesh (Apex Administrator)',
      email: 'tirumalavenkatesh0502@gmail.com',
      phone: '9848011223',
      role: 'admin',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
    }
  ];

  const initialStaffDemo: StaffProfile[] = [
    {
      id: 'staff-mylavaram-default',
      uid: 'staff-mylavaram-default',
      name: 'Mylavaram APMC Staff Officer',
      email: 'staff@procureease.gov.in',
      phone: '9848099881',
      employeeCode: 'STF-APMC-9021',
      centreId: 'CTR-01',
      centreName: 'Mylavaram APMC Centre',
      designation: 'Weighbridge & Inspection Officer',
      role: 'staff',
      status: 'approved',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      approvedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      approvedBy: ADMIN_EMAIL
    },
    {
      id: 'staff-nandigama-pending',
      uid: 'staff-nandigama-pending',
      name: 'K. Satyanarayana',
      email: 'satyanarayana.k@apmc.gov.in',
      phone: '9848123456',
      employeeCode: 'STF-APMC-9055',
      centreId: 'CTR-03',
      centreName: 'Nandigama APMC Centre',
      designation: 'Moisture QC Analyst',
      role: 'staff',
      status: 'pending_approval',
      createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    }
  ];

  const initialAdminsDemo: AdminProfile[] = [
    {
      id: 'admin-apex-tv',
      uid: 'admin-apex-tv',
      name: 'Tirumala Venkatesh (Apex Administrator)',
      email: 'tirumalavenkatesh0502@gmail.com',
      phone: '9848011223',
      role: 'admin',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      lastLoginAt: new Date().toISOString()
    },
    {
      id: 'admin-apex-lbrce',
      uid: 'admin-apex-lbrce',
      name: 'Apex Administrator (LBRCE Supervisor)',
      email: '24761a05cd@lbrce.ac.in',
      phone: '9848011224',
      role: 'admin',
      createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
      lastLoginAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  // Fetch Users, Staff, Admins, and Table Stats from Firebase
  const loadStaffAndStats = async () => {
    if (!currentUser) {
      setUsersList(initialUsersDemo);
      setStaffList(initialStaffDemo);
      setAdminsList(initialAdminsDemo);
      setLoadingStaff(false);
      setLoadingUsers(false);
      setLoadingAdmins(false);
      return;
    }

    setLoadingStaff(true);
    setLoadingUsers(true);
    setLoadingAdmins(true);
    try {
      const [usersData, staffData, adminsData, stats] = await Promise.all([
        getAllUsers(),
        getAllStaffMembers(),
        getAllAdmins(),
        getFirebaseTableStats()
      ]);

      // Handle Users table data
      if (usersData.length === 0) {
        setUsersList(initialUsersDemo);
        if (currentUser) {
          for (const u of initialUsersDemo) {
            saveUserProfile(u).catch(() => {});
          }
        }
      } else {
        setUsersList(usersData);
      }

      // Handle Staff table data
      if (staffData.length === 0) {
        setStaffList(initialStaffDemo);
        if (currentUser) {
          for (const s of initialStaffDemo) {
            saveStaffProfile(s).catch(() => {});
          }
        }
      } else {
        setStaffList(staffData);
      }

      // Handle Admins table data
      if (adminsData.length === 0) {
        setAdminsList(initialAdminsDemo);
        if (currentUser) {
          for (const a of initialAdminsDemo) {
            saveAdminProfile(a).catch(() => {});
          }
        }
      } else {
        setAdminsList(adminsData);
      }

      setTableStats({
        admins: Math.max(adminsData.length || initialAdminsDemo.length, stats.admins),
        users: Math.max(usersData.length || initialUsersDemo.length, stats.users),
        staff: Math.max(staffData.length || initialStaffDemo.length, stats.staff),
        farmers: Math.max(usersData.filter(u => u.role === 'farmer').length || 3, stats.farmers)
      });
    } catch (err) {
      console.warn('Error loading tables and stats:', err);
    } finally {
      setLoadingStaff(false);
      setLoadingUsers(false);
      setLoadingAdmins(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadStaffAndStats();
    } else {
      setUsersList(initialUsersDemo);
      setStaffList(initialStaffDemo);
      setAdminsList(initialAdminsDemo);
      setLoadingStaff(false);
      setLoadingUsers(false);
      setLoadingAdmins(false);
    }
  }, [currentUser]);

  // Admin accepts staff member
  const handleAcceptStaff = async (staff: StaffProfile) => {
    setActionLoadingId(staff.id);
    const res = await acceptStaffMember(staff.id, adminEmail);
    setActionLoadingId(null);

    if (res.success) {
      showToast(`Staff member "${staff.name}" accepted and approved.`);
      setStaffList(prev => prev.map(s => s.id === staff.id ? { 
        ...s, 
        status: 'approved', 
        approvedAt: new Date().toISOString(),
        approvedBy: adminEmail 
      } : s));
    } else {
      showToast(`Failed to accept staff: ${res.error}`);
    }
  };

  // Admin removes staff member
  const handleRemoveStaff = async (staff: StaffProfile) => {
    setActionLoadingId(staff.id);
    const res = await removeStaffMember(staff.id, 'Access revoked by Administrator');
    setActionLoadingId(null);

    if (res.success) {
      showToast(`Staff member "${staff.name}" removed from active staff.`);
      setStaffList(prev => prev.map(s => s.id === staff.id ? { 
        ...s, 
        status: 'removed',
        rejectionReason: 'Access revoked by Administrator'
      } : s));
    } else {
      showToast(`Failed to remove staff: ${res.error}`);
    }
  };

  // Apex Admin accepts pending admin signup
  const handleAcceptAdmin = async (admin: AdminProfile) => {
    setActionLoadingId(admin.uid);
    const res = await acceptAdminMember(admin.uid, adminEmail);
    setActionLoadingId(null);

    if (res.success) {
      showToast(`Administrator privileges approved for "${admin.name}".`);
      setAdminsList(prev => prev.map(a => a.uid === admin.uid ? {
        ...a,
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: adminEmail
      } : a));
    } else {
      showToast(`Failed to approve admin: ${res.error}`);
    }
  };

  // Apex Admin rejects pending admin signup
  const handleRejectAdmin = async (admin: AdminProfile) => {
    setActionLoadingId(admin.uid);
    const res = await rejectAdminMember(admin.uid, 'Access denied by Apex Administrator');
    setActionLoadingId(null);

    if (res.success) {
      showToast(`Administrator application rejected for "${admin.name}".`);
      setAdminsList(prev => prev.map(a => a.uid === admin.uid ? {
        ...a,
        status: 'rejected',
        rejectionReason: 'Access denied by Apex Administrator'
      } : a));
    } else {
      showToast(`Failed to reject admin: ${res.error}`);
    }
  };

  // Chart Mock Data
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

  const handleExportData = () => {
    showToast('Exporting e-Procurement CSV report for NTR District...');
  };

  const filteredStaff = staffList.filter(s => {
    if (staffFilter !== 'all' && s.status !== staffFilter) return false;
    if (staffSearch.trim()) {
      const q = staffSearch.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.employeeCode.toLowerCase().includes(q) ||
        s.centreName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUsers = usersList.filter(u => {
    if (userRoleFilter !== 'all' && (u.role || 'farmer') !== userRoleFilter) return false;
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.farmerId && u.farmerId.toLowerCase().includes(q)) ||
        (u.village && u.village.toLowerCase().includes(q)) ||
        (u.mandal && u.mandal.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredAdmins = adminsList.filter(a => {
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.phone.includes(q)
      );
    }
    return true;
  });

  const pendingStaffCount = staffList.filter(s => s.status === 'pending_approval').length;
  const pendingAdminCount = adminsList.filter(a => a.status === 'pending_approval').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-200">
              STATE APEX MONITORING
            </span>
            <span className="text-xs text-slate-500">• Ministry of Consumer Affairs</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading mt-1">
            District Civil Supplies &amp; Procurement Command
          </h1>
          <p className="text-xs text-slate-500">
            Real-time throughput, bottleneck detection, staff authentication, and direct bank settlement surveillance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 outline-none"
          >
            <option>NTR District (Vijayawada)</option>
            <option>Krishna District (Machilipatnam)</option>
            <option>Guntur District</option>
          </select>

          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* FIREBASE ARCHITECTURE & SEPARATE TABLES OVERVIEW */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Firebase Dedicated Collections Architecture
                <span className="text-[10px] uppercase font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/40">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Independent Firestore tables for Apex Admins, Citizens/Farmers, Centre Staff, and 2FA OTP tokens
              </p>
            </div>
          </div>
          <button
            onClick={loadStaffAndStats}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl transition border border-slate-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Firebase State</span>
          </button>
        </div>

        {/* 4 Separate Tables Display */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-5">
          
          {/* Table 1: Admins */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                /admins/
              </span>
              <ShieldCheck className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xl font-black font-mono mt-2 text-white">
              Apex Administrators
            </p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              District and apex supervisory officers with staff approval rights.
            </p>
          </div>

          {/* Table 2: Users (Farmers) */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                /users/ &amp; /farmers/
              </span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-black font-mono mt-2 text-white">
              Farmers &amp; Citizens
            </p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Registered producers requiring email OTP verification on initial signup.
            </p>
          </div>

          {/* Table 3: Staff */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                /staff/
              </span>
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-black font-mono mt-2 text-white">
              Centre Staff ({staffList.length})
            </p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              APMC officers requiring mandatory 2FA OTP per login and admin acceptance.
            </p>
          </div>

          {/* Table 4: OTPs */}
          <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                /otps/
              </span>
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-black font-mono mt-2 text-white">
              2FA One-Time Keys
            </p>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              10-minute expiring cryptographic tokens for signup and staff logins.
            </p>
          </div>

        </div>
      </div>

      {/* CORE DATABASE TABLES: USERS, STAFF, ADMINS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
        {/* Table Selector Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-800" />
              <h2 className="text-lg font-bold text-slate-900">
                Firebase Database Tables &amp; Directory
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Live Firestore
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-role directory across <code className="text-emerald-700 font-mono">/users/</code>, <code className="text-amber-700 font-mono">/staff/</code>, and <code className="text-purple-700 font-mono">/admins/</code> collections.
            </p>
          </div>

          {/* Table Switcher & Refresh */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-2xl bg-slate-100 p-1 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTableTab('users')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTableTab === 'users'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>Users Table</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                  {usersList.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTableTab('staff')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTableTab === 'staff'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-amber-700" />
                <span>Staff Table</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono">
                  {staffList.length}
                </span>
                {pendingStaffCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 font-bold">
                    {pendingStaffCount} new
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTableTab('admins')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTableTab === 'admins'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                <span>Admins Table</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-800 font-mono">
                  {adminsList.length}
                </span>
                {pendingAdminCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 font-bold">
                    {pendingAdminCount} new
                  </span>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={loadStaffAndStats}
              title="Refresh collections from Firebase"
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition shadow-xs cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: USERS TABLE (/users/ & /farmers/) */}
        {/* ------------------------------------------------------------------ */}
        {activeTableTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filter Role:</span>
                <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-medium">
                  {(['all', 'farmer', 'staff', 'admin'] as const).map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setUserRoleFilter(role)}
                      className={`px-2.5 py-1 rounded-lg text-xs capitalize transition cursor-pointer ${
                        userRoleFilter === role
                          ? 'bg-white font-bold text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {role === 'all' ? 'All Roles' : role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user name, email, phone, village..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingUsers ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Loading user records from Firestore users collection...
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No users found matching filter criteria. When users sign up via OTP verification, they will appear here.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">User &amp; UID</th>
                      <th className="py-3 px-3">Contact Details</th>
                      <th className="py-3 px-3">Role &amp; Category</th>
                      <th className="py-3 px-3">Location (Village/Mandal)</th>
                      <th className="py-3 px-3">Farmer ID / Crop</th>
                      <th className="py-3 px-3">Registered Date</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                            <span>{user.name || 'Citizen / Farmer'}</span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            UID: {user.uid.slice(0, 16)}...
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-800">{user.email}</div>
                          <div className="text-[11px] font-mono text-slate-500">{user.phone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold capitalize ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : user.role === 'staff'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {user.role || 'farmer'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800 font-medium">
                            {user.village ? `${user.village}, ${user.mandal || ''}` : 'Mylavaram'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {user.district || 'NTR District'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono text-slate-800 font-bold">
                            {user.farmerId || 'AP/NTR/2026/8812'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {user.mainCrop || 'Paddy (Grade-A)'} {user.landDetails ? `• ${user.landDetails}` : ''}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'Active'}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Verified &amp; Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: STAFF TABLE (/staff/) */}
        {/* ------------------------------------------------------------------ */}
        {activeTableTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filter Status:</span>
                <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-medium">
                  {(['all', 'pending_approval', 'approved', 'removed'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStaffFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-xs capitalize transition cursor-pointer ${
                        staffFilter === st
                          ? 'bg-white font-bold text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {st === 'all' ? `All (${staffList.length})` : st === 'pending_approval' ? `Pending (${pendingStaffCount})` : st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={staffSearch}
                  onChange={(e) => setStaffSearch(e.target.value)}
                  placeholder="Search staff, code, centre, email..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingStaff ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Loading staff records from Firebase staff collection...
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No staff records found matching filter criteria. Staff members sign up and await administrator review.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Officer Name</th>
                      <th className="py-3 px-3">Employee Code</th>
                      <th className="py-3 px-3">Official Email &amp; Phone</th>
                      <th className="py-3 px-3">Assigned Centre &amp; Role</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Administrator Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStaff.map((staff) => {
                      const isPending = staff.status === 'pending_approval';
                      const isApproved = staff.status === 'approved';
                      const isRemoved = staff.status === 'removed';
                      const isActionLoading = actionLoadingId === staff.id;

                      return (
                        <tr key={staff.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{staff.name}</div>
                            <div className="text-[11px] text-slate-500">{staff.designation || 'APMC Officer'}</div>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-800">
                            {staff.employeeCode}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">{staff.email}</div>
                            <div className="text-[11px] font-mono text-slate-500">{staff.phone}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-800">{staff.centreName}</div>
                            <div className="text-[11px] font-mono text-slate-400">ID: {staff.centreId}</div>
                          </td>
                          <td className="py-3 px-3">
                            {isPending && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                                <Clock className="w-3 h-3" />
                                Pending Authentication
                              </span>
                            )}
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Approved Staff
                              </span>
                            )}
                            {isRemoved && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-full border border-red-200">
                                <UserX className="w-3 h-3" />
                                Removed / Revoked
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleAcceptStaff(staff)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Accept as Staff</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleRemoveStaff(staff)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleRemoveStaff(staff)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition border border-red-200 disabled:opacity-50 cursor-pointer"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Remove Access</span>
                                </button>
                              )}

                              {isRemoved && (
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleAcceptStaff(staff)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition border border-slate-200 disabled:opacity-50 cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Re-instate Staff</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: ADMINS TABLE (/admins/) */}
        {/* ------------------------------------------------------------------ */}
        {activeTableTab === 'admins' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-medium">
                Authorized Apex Administrators with supervisory privileges across Andhra Pradesh APMCs.
              </div>

              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Search admin name, email, phone..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-700 bg-slate-50"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {loadingAdmins ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Loading administrator records from Firebase admins collection...
                </div>
              ) : filteredAdmins.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  No administrators found matching filter criteria.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3">Administrator Name</th>
                      <th className="py-3 px-3">Official Admin Email</th>
                      <th className="py-3 px-3">Phone Number</th>
                      <th className="py-3 px-3">Administrative Scope</th>
                      <th className="py-3 px-3">Created Date</th>
                      <th className="py-3 px-3">Last Login</th>
                      <th className="py-3 px-3 text-right">Access Authorization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdmins.map((admin) => {
                      const isPending = admin.status === 'pending_approval';
                      const isApproved = !admin.status || admin.status === 'approved';
                      const isRejected = admin.status === 'rejected';
                      const isActionLoading = actionLoadingId === admin.uid;

                      return (
                        <tr key={admin.uid} className={`transition ${isPending ? 'bg-amber-50/40 hover:bg-amber-50/60' : 'hover:bg-purple-50/30'}`}>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isPending ? 'bg-amber-100 text-amber-800' : isRejected ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </span>
                              <span>{admin.name}</span>
                            </div>
                            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                              UID: {admin.uid.slice(0, 16)}...
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-medium text-purple-950">
                            {admin.email}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">
                            {admin.phone}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200 w-fit">
                                Apex System Administrator
                              </span>
                              {isPending && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 w-fit animate-pulse">
                                  Pending Admin Approval
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-900 px-2 py-0.5 rounded-full border border-red-200 w-fit">
                                  Access Denied / Rejected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : 'System Inception'}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                            {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : isPending ? 'Pending Approval' : 'Active Session'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isPending && (
                                <>
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleAcceptAdmin(admin)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-800 hover:bg-purple-900 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>Approve Admin</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isActionLoading}
                                    onClick={() => handleRejectAdmin(admin)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                                  >
                                    <UserX className="w-3.5 h-3.5" />
                                    <span>Deny</span>
                                  </button>
                                </>
                              )}

                              {isApproved && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Full Privileges
                                </span>
                              )}

                              {isRejected && (
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleAcceptAdmin(admin)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition border border-slate-200 disabled:opacity-50 cursor-pointer"
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Re-instate</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            REGISTERED FARMERS
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1 font-heading">
            12,450
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            +320 added this week
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            TODAY&apos;S PROCUREMENT
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-800 mt-1 font-heading">
            3,420 Q
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Across 42 active centres
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            TOTAL DBT DISBURSED
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1 font-heading">
            ₹42.8 Cr
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            100% PFMS direct-credit
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            ACTIVE APMC STAFF
          </span>
          <p className="text-2xl sm:text-3xl font-black font-mono text-purple-900 mt-1 font-heading">
            {staffList.filter(s => s.status === 'approved').length} Officers
          </p>
          <span className="text-[11px] text-purple-700 font-semibold mt-1 block">
            2-Factor OTP Enforced
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Volume Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-800" />
                Procurement Throughput vs Target (Quintals)
              </h2>
              <p className="text-xs text-slate-500">7-day aggregated intake volume across all mandals</p>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
              +14% vs Target
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="volume" fill="#047857" radius={[6, 6, 0, 0]} name="Actual (Q)" />
                <Bar dataKey="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="Target (Q)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commodity Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-800" />
              Crop Share (MSP Intake)
            </h2>
            <p className="text-xs text-slate-500">Kharif harvest breakdown</p>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {cropShareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Share']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {cropShareData.map((crop) => (
              <div key={crop.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: crop.color }} />
                <span className="text-slate-600 truncate">{crop.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{crop.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Centre Congestion & Queue Bottlenecks Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              Centre Capacity &amp; Bottleneck Diagnostics
            </h2>
            <p className="text-xs text-slate-500">Live slot saturation &amp; estimated waiting period at weighbridge</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Updated just now
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3">APMC Centre</th>
                <th className="py-3">Booked / Daily Cap</th>
                <th className="py-3">Capacity Saturation</th>
                <th className="py-3">Est. Wait Time</th>
                <th className="py-3">Flow Status</th>
                <th className="py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {centreCapacityData.map((c) => {
                const ratio = Math.round((c.booked / c.capacity) * 100);
                const isOverloaded = ratio > 85;
                return (
                  <tr key={c.name} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 font-bold text-slate-900">
                      {c.name} APMC
                    </td>
                    <td className="py-3.5 font-mono text-slate-700">
                      {c.booked} / {c.capacity} slots
                    </td>
                    <td className="py-3.5">
                      <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isOverloaded ? 'bg-rose-500' : 'bg-emerald-600'}`}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-700 font-medium">
                      {c.wait} mins
                    </td>
                    <td className="py-3.5">
                      {isOverloaded ? (
                        <span className="text-[11px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                          High Congestion
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          Normal Flow
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {isOverloaded ? (
                        <button
                          type="button"
                          onClick={() => showToast(`Smart load reroute initiated from ${c.name} to adjacent centers.`)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Balance Load
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Automated ✓</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
