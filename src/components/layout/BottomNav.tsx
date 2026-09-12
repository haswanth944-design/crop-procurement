import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  CalendarPlus, 
  Clock, 
  FileCheck2, 
  User
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { currentPath, navigate, farmersAhead } = useApp();
  const { currentUser, userRole } = useAuth();

  // Only show farmer bottom bar if authenticated as a farmer
  if (!currentUser || userRole !== 'farmer') return null;

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="no-print xl:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Dashboard */}
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex flex-col items-center justify-center w-14 py-1 transition ${
            currentPath === '/dashboard' || currentPath === '/' 
              ? 'text-emerald-800 font-bold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Live Queue */}
        <button
          onClick={() => navigate('/queue')}
          className={`relative flex flex-col items-center justify-center w-14 py-1 transition ${
            currentPath === '/queue' 
              ? 'text-emerald-800 font-bold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Live Queue</span>
          {farmersAhead > 0 && (
            <span className="absolute top-0 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-black text-white">
              {farmersAhead}
            </span>
          )}
        </button>

        {/* Center Primary CTA: Book Slot */}
        <button
          onClick={() => navigate('/book-slot')}
          className="relative -top-3 flex flex-col items-center justify-center group"
          aria-label="Book Procurement Slot"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-800 text-white shadow-lg shadow-emerald-900/30 group-active:scale-95 transition border-2 border-white">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-emerald-900 mt-0.5">Book Slot</span>
        </button>

        {/* Procurement / Payments Status */}
        <button
          onClick={() => navigate('/procurement')}
          className={`flex flex-col items-center justify-center w-14 py-1 transition ${
            currentPath === '/procurement' || currentPath === '/payments' 
              ? 'text-emerald-800 font-bold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Status</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center w-14 py-1 transition ${
            currentPath === '/profile' 
              ? 'text-emerald-800 font-bold' 
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
