import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function InputField({
  id,
  name,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  step,
  min,
  max,
  unit,
  helperText,
  farmerExplanation,
  error,
  disabled = false,
  className = ''
}) {
  const [showExplanation, setShowExplanation] = useState(false);

  // Norman Physical Constraints: Instant validation
  const numValue = type === 'number' && value !== '' && value !== null && value !== undefined
    ? parseFloat(value)
    : null;

  const isOutOfRange =
    numValue !== null &&
    !isNaN(numValue) &&
    ((min !== undefined && numValue < min) || (max !== undefined && numValue > max));

  return (
    <div className={`flex flex-col gap-1.5 text-left ${className}`}>
      {/* Label & Signifiers */}
      {label && (
        <div className="flex items-center justify-between gap-1 text-xs">
          <label
            htmlFor={id || name}
            className="font-bold text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{label}</span>
            {required && (
              <span className="text-cyan-400 font-bold" title="Campo obligatorio">
                *
              </span>
            )}
          </label>

          <div className="flex items-center gap-1.5">
            {farmerExplanation && (
              <button
                type="button"
                onClick={() => setShowExplanation((prev) => !prev)}
                className="text-slate-400 hover:text-cyan-300 p-0.5 rounded transition-colors focus:outline-none"
                title="Ver explicación en lenguaje del agricultor"
                aria-label="Ayuda para agricultores"
              >
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400/80 hover:text-cyan-300" />
              </button>
            )}

            {unit && (
              <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-[11px] font-semibold">
                {unit}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Input container with Norman Affordances */}
      <div className="relative rounded-lg shadow-sm">
        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          step={step}
          min={min}
          max={max}
          disabled={disabled}
          className={`w-full rounded-lg bg-slate-900/90 border px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono transition-all duration-150 focus:outline-none focus:ring-2 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/40 bg-red-950/20'
              : isOutOfRange
              ? 'border-amber-400/80 focus:border-amber-400 focus:ring-amber-400/30 bg-amber-950/20 text-amber-200'
              : 'border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-cyan-500/30'
          } ${unit ? 'pr-14' : ''}`}
        />

        {/* Distinct Unit Badge (Affordance) */}
        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-xs font-semibold font-mono text-cyan-400/90 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/70">
              {unit}
            </span>
          </div>
        )}
      </div>

      {/* Norman Explanation Banner for Farmers */}
      {showExplanation && farmerExplanation && (
        <div className="p-2.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-200 text-xs leading-relaxed animate-in fade-in-50">
          <span className="font-bold text-cyan-300 block mb-0.5">🌾 Significado para el cultivo:</span>
          {farmerExplanation}
        </div>
      )}

      {/* Physical Constraint Warning (Norman Heuristic) */}
      {isOutOfRange && !error && (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Fuera de rango físico admisible ({min} a {max} {unit || ''}). Verifique el dato.
          </span>
        </div>
      )}

      {/* Standard Helper Text */}
      {helperText && !error && !isOutOfRange && (
        <p className="text-[11px] text-slate-400 leading-snug">{helperText}</p>
      )}

      {/* Strict Error message */}
      {error && (
        <div className="flex items-center gap-1 text-xs text-red-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
