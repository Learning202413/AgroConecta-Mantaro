import React from 'react';

export default function KpiCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  trend,
  color = 'cyan',
  className = ''
}) {
  const colorMap = {
    cyan: 'border-cyan-500/20 bg-cyan-950/20 text-cyan-400',
    red: 'border-red-500/30 bg-red-950/20 text-red-400',
    amber: 'border-amber-500/20 bg-amber-950/20 text-amber-400',
    emerald: 'border-emerald-500/20 bg-emerald-950/20 text-emerald-400',
    indigo: 'border-indigo-500/20 bg-indigo-950/20 text-indigo-400',
    slate: 'border-slate-800 bg-slate-900/60 text-slate-400'
  };

  const currentTheme = colorMap[color] || colorMap.cyan;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4.5 transition-all hover:border-slate-700 bg-slate-900/70 backdrop-blur-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border ${currentTheme}`}>
            <Icon className="w-4 h-4 text-current" />
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-slate-400 font-mono">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400">
          {trend && <span className="font-semibold">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
