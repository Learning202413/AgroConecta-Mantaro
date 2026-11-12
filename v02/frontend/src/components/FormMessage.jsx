import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function FormMessage({
  type = 'info', // 'success' | 'error' | 'info'
  message,
  onClose,
  className = ''
}) {
  if (!message) return null;

  const configs = {
    success: {
      bgClass: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200',
      icon: CheckCircle2,
      iconClass: 'text-emerald-400'
    },
    error: {
      bgClass: 'bg-red-950/60 border-red-500/40 text-red-200',
      icon: AlertCircle,
      iconClass: 'text-red-400'
    },
    info: {
      bgClass: 'bg-cyan-950/60 border-cyan-500/40 text-cyan-200',
      icon: Info,
      iconClass: 'text-cyan-400'
    }
  };

  const config = configs[type] || configs.info;
  const IconComponent = config.icon;

  return (
    <div
      className={`flex items-start justify-between gap-3 p-3.5 rounded-lg border text-sm backdrop-blur-sm ${config.bgClass} ${className}`}
    >
      <div className="flex items-start gap-2.5">
        <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconClass}`} />
        <div className="leading-snug">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
