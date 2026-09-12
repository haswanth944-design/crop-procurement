import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  CreditCard, 
  Calendar, 
  CloudRain, 
  ShieldAlert, 
  Trash2,
  Sparkles
} from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, navigate, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'queue' | 'payment' | 'system'>('all');

  const filtered = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'queue':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            SMS & Procurement Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time queue updates, slot confirmations, and DBT bank credits.
          </p>
        </div>

        <button
          onClick={() => {
            markAllNotificationsRead();
            showToast('All alerts marked as read.');
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'all' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('queue')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'queue' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Queue Alerts
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'payment' ? 'bg-emerald-800 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Payment Updates
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => markNotificationRead(item.id)}
            className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-4 ${
              !item.read 
                ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-200' 
                : 'bg-slate-50/70 border-slate-200 opacity-80'
            }`}
          >
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
              !item.read ? 'bg-emerald-100' : 'bg-slate-200'
            }`}>
              {getIcon(item.type)}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                  {item.title}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {item.message}
              </p>
            </div>

            {!item.read && (
              <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
