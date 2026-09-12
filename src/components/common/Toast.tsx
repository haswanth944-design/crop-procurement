import React from 'react';
import { Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div 
      id="global-toast"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex max-w-md items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-white shadow-xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
        <Info className="w-4 h-4" />
      </div>
      <p className="text-sm font-medium leading-snug flex-1">
        {message}
      </p>
      {onClose && (
        <button 
          onClick={onClose}
          className="shrink-0 text-slate-400 hover:text-white p-1"
          aria-label="Dismiss message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
