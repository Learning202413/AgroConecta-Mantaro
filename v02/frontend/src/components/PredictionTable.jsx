import React from 'react';
import PredictionRow from './PredictionRow';
import { Inbox } from 'lucide-react';

export default function PredictionTable({
  predictions = [],
  onSelect,
  onDelete
}) {
  if (!predictions || predictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40">
        <Inbox className="w-10 h-10 text-slate-600 mb-2" />
        <p className="text-sm font-medium text-slate-400">
          No hay registros de predicción en el historial.
        </p>
        <p className="text-xs text-slate-600 mt-1">
          Genere una predicción en la pantalla de "Predicción Vespertina" para guardarla automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <th className="py-3 px-3.5">ID</th>
            <th className="py-3 px-3.5">Corte Vespertino</th>
            <th className="py-3 px-3.5">Fecha Diana</th>
            <th className="py-3 px-3.5">TT 18h</th>
            <th className="py-3 px-3.5">HR 18h</th>
            <th className="py-3 px-3.5">Tmin Predicha</th>
            <th className="py-3 px-3.5">Modelo Dual</th>
            <th className="py-3 px-3.5">Nivel Alerta</th>
            <th className="py-3 px-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {predictions.map((p, idx) => (
            <PredictionRow
              key={p.id || p.Id || idx}
              prediction={p}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
