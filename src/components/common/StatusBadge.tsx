import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Activity, 
  Hourglass, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className = '' }) => {
  const norm = status.toLowerCase();

  let bgClass = 'bg-slate-100 text-slate-800 border-slate-200';
  let IconComponent = Clock;
  let label = status;

  if (norm.includes('complete') || norm.includes('accepted') || norm.includes('credited')) {
    bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    IconComponent = CheckCircle2;
  } else if (norm.includes('approach') || norm.includes('soon') || norm.includes('now') || norm.includes('serving')) {
    bgClass = 'bg-amber-50 text-amber-900 border-amber-300 font-semibold animate-pulse';
    IconComponent = AlertCircle;
  } else if (norm.includes('process') || norm.includes('verif') || norm.includes('weigh') || norm.includes('inspect') || norm.includes('in_progress') || norm.includes('initiated')) {
    bgClass = 'bg-sky-50 text-sky-800 border-sky-300';
    IconComponent = Activity;
  } else if (norm.includes('wait') || norm.includes('upcoming')) {
    bgClass = 'bg-slate-100 text-slate-700 border-slate-300';
    IconComponent = Hourglass;
  } else if (norm.includes('cancel') || norm.includes('reject') || norm.includes('fail')) {
    bgClass = 'bg-rose-50 text-rose-800 border-rose-300';
    IconComponent = XCircle;
  } else if (norm.includes('full') || norm.includes('crowd')) {
    bgClass = 'bg-amber-50 text-amber-800 border-amber-300';
    IconComponent = AlertTriangle;
  } else if (norm.includes('open') || norm.includes('avail')) {
    bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    IconComponent = Check;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span 
      id={`badge-${norm.replace(/[^a-z0-9]/g, '-')}`}
      className={`inline-flex items-center rounded-full border ${bgClass} ${sizeClasses} whitespace-nowrap ${className}`}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      <span>{label}</span>
    </span>
  );
};
