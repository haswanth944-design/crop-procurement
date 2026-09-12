import React, { ReactNode } from 'react';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    text: string;
    positive?: boolean;
  };
  highlight?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = false,
  onClick
}) => {
  return (
    <div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${
        highlight 
          ? 'bg-gradient-to-br from-emerald-900 to-emerald-950 text-white border-emerald-800 shadow-md' 
          : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 shadow-sm'
      } ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wider ${highlight ? 'text-emerald-200' : 'text-slate-500'}`}>
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl lg:text-3xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>
              {value}
            </span>
          </div>
          {subtitle && (
            <p className={`mt-1 text-xs ${highlight ? 'text-emerald-100' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`font-semibold ${trend.positive ? (highlight ? 'text-emerald-300' : 'text-emerald-600') : 'text-amber-500'}`}>
                {trend.text}
              </span>
            </div>
          )}
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          highlight ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
