import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { 
  Calendar, 
  Clock, 
  Building2, 
  Plus, 
  Filter, 
  QrCode, 
  RotateCcw, 
  Trash2, 
  ArrowRight,
  Printer
} from 'lucide-react';

export const BookingsHistoryPage: React.FC = () => {
  const { bookings, navigate, showToast } = useApp();

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  const filteredBookings = bookings.filter(b => {
    if (filter === 'upcoming') return b.status === 'upcoming' || b.status === 'in_progress';
    if (filter === 'completed') return b.status === 'completed';
    return true;
  });

  const handleReschedule = (token: string) => {
    showToast(`Reschedule initiated for Token ${token}. Please choose a new date and time slot.`);
    navigate('/book-slot');
  };

  const handleCancelBooking = (token: string) => {
    showToast(`Appointment ${token} cancelled. Slot released for fellow farmers.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            My Appointments & Bookings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track upcoming slots, download digital tokens, or reschedule if delayed.
          </p>
        </div>

        <button
          onClick={() => navigate('/book-slot')}
          className="flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Slot</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filter === 'all' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Appointments ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filter === 'upcoming' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Upcoming Confirmed
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            filter === 'completed' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Past Completed
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            {/* Left Token & Info */}
            <div className="flex items-start gap-4">
              <div className="h-14 w-16 rounded-2xl bg-emerald-900 text-white flex flex-col items-center justify-center font-mono shrink-0 shadow-inner">
                <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest">TOKEN</span>
                <span className="text-xl font-black">{b.token}</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    {b.crop} • {b.quantityQuintals} Quintals
                  </h3>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-slate-600 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{b.centreName}</span>
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 font-mono">
                  <span>📅 {b.date}</span>
                  <span>⏰ {b.timeSlot}</span>
                </div>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
              <button
                onClick={() => navigate('/queue')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>Track Live Queue</span>
              </button>

              {b.status === 'upcoming' && (
                <>
                  <button
                    onClick={() => handleReschedule(b.token)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => handleCancelBooking(b.token)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                    title="Cancel Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
