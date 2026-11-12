import React from 'react';
import { AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function StatusBadge({ level, size = 'md', showIcon = true }) {
  const norm = (level || '').toUpperCase();

  const isRed = norm === 'RED' || norm === 'ROJO';
  const isYellow = norm === 'YELLOW' || norm === 'AMARILLO';

  let config = {
    label: 'Sin Riesgo (> 2.0°C)',
    colorClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: ShieldCheck,
    dotColor: 'bg-emerald-400'
  };

  if (isRed) {
    config = {
      label: 'Peligro Crítico (<= 1.0°C)',
      colorClass: 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse',
      icon: ShieldAlert,
      dotColor: 'bg-red-500'
    };
  } else if (isYellow) {
    config = {
      label: 'Alerta Temprana (<= 2.0°C)',
      colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: AlertTriangle,
      dotColor: 'bg-amber-400'
    };
  }

  const IconComponent = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.colorClass} ${sizeClasses}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />}
      <span>{config.label}</span>
    </span>
  );
}
