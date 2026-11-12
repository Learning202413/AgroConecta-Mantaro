import React from 'react';
import StatusBadge from './StatusBadge';
import { Trash2, ExternalLink } from 'lucide-react';

export default function PredictionRow({
  prediction,
  onSelect,
  onDelete
}) {
  const p = prediction;

  const cutoff = p.cutoffDate || p.CutoffDate || '-';
  const target = p.targetDate || p.TargetDate || '-';
  const tt18 = p.airTemp18 ?? p.AirTemp18 ?? '-';
  const hr18 = p.relativeHumidity18 ?? p.RelativeHumidity18 ?? '-';
  const tmin = (p.predictedTmin ?? p.predictedTminC ?? p.PredictedTmin ?? 0);
  const baseRidge = (p.baseRidge ?? p.baseRidgeC ?? p.BaseRidge ?? 0);
  const residualRf = (p.residualRf ?? p.residualRfC ?? p.ResidualRf ?? 0);
  const alert = p.alertLevel || p.AlertLevel || 'GREEN';

  return (
    <tr className="border-b border-slate-800/80 hover:bg-slate-800/40 transition-colors text-xs text-slate-300">
      <td className="py-3 px-3.5 font-mono text-slate-400 font-semibold">
        #{p.id || p.Id || '-'}
      </td>
      <td className="py-3 px-3.5 font-medium text-slate-200">
        <div>{cutoff}</div>
        <div className="text-[10px] text-slate-500">18:00 Horas</div>
      </td>
      <td className="py-3 px-3.5 font-medium text-slate-200">
        <div>{target}</div>
        <div className="text-[10px] text-slate-500">06:00 Horas</div>
      </td>
      <td className="py-3 px-3.5 font-mono text-slate-300">
        {typeof tt18 === 'number' ? `${tt18.toFixed(1)} °C` : tt18}
      </td>
      <td className="py-3 px-3.5 font-mono text-slate-300">
        {typeof hr18 === 'number' ? `${hr18.toFixed(0)} %` : hr18}
      </td>
      <td className="py-3 px-3.5 font-mono font-bold text-sm">
        <span
          className={
            tmin <= 1.0 ? 'text-red-400' : tmin <= 2.0 ? 'text-amber-400' : 'text-emerald-400'
          }
        >
          {typeof tmin === 'number' ? `${tmin.toFixed(2)} °C` : tmin}
        </span>
      </td>
      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-400">
        <div>Base: <span className="text-slate-300">{Number(baseRidge).toFixed(2)}</span></div>
        <div>RF: <span className="text-cyan-400">{Number(residualRf) >= 0 ? `+${Number(residualRf).toFixed(2)}` : Number(residualRf).toFixed(2)}</span></div>
      </td>
      <td className="py-3 px-3.5">
        <StatusBadge level={alert} size="sm" />
      </td>
      <td className="py-3 px-3.5 text-right">
        <div className="flex items-center justify-end gap-1.5">
          {onSelect && (
            <button
              onClick={() => onSelect(p)}
              title="Ver detalle y recomendaciones agronómicas"
              className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(p.id || p.Id)}
              title="Eliminar registro"
              className="p-1.5 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
