import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sparkles,
  History,
  BarChart3,
  Cpu,
  Layers,
  ThermometerSnowflake,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  {
    path: '/',
    label: 'Predicción Vespertina',
    icon: Sparkles,
    badge: '18:00 h'
  },
  {
    path: '/history',
    label: 'Historial de Alertas',
    icon: History
  },
  {
    path: '/explorer',
    label: 'Explorador EMA (IGP)',
    icon: BarChart3
  },
  {
    path: '/model',
    label: 'Transparencia Modelo',
    icon: Cpu
  }
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-950 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-md shadow-cyan-900/40">
            <ThermometerSnowflake className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-white tracking-wide">
              MANTARO FROST
            </div>
            <div className="text-[10px] text-cyan-400 font-mono">
              SISTEMA DE ALERTA
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1 text-left">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Módulos del Sistema
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-mono">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info / Course Context */}
      <div className="p-4 border-t border-slate-800/80 text-left bg-slate-900/30">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <GraduationCap className="w-4 h-4 text-cyan-400" />
          <span>Construcción de Software</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Hackaton v02 • Clean Architecture (.NET 8 + React + PostgreSQL)
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
          <span>Corredor Mantaro</span>
          <span>Junín, Perú</span>
        </div>
      </div>
    </aside>
  );
}
