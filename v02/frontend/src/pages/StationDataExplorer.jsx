import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import KpiCard from '../components/KpiCard';
import Button from '../components/Button';
import { IGP_STATION_EXPLORER_ROWS } from '../utils/sampleData';
import {
  BarChart3,
  Database,
  MapPin,
  Play,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertTriangle,
  Flame,
  Snowflake
} from 'lucide-react';

export default function StationDataExplorer() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredRows = IGP_STATION_EXPLORER_ROWS.filter((r) => {
    if (selectedFilter === 'FROST') return r.scenario.includes('Helada');
    if (selectedFilter === 'YELLOW') return r.scenario.includes('Amarilla');
    if (selectedFilter === 'WARM') return r.scenario.includes('Sin Helada');
    return true;
  });

  const handleSimulateRow = (row) => {
    // Navigate to / and populate form or set preset
    navigate('/', {
      state: {
        prefill: {
          airTemp18: String(row.tt),
          relativeHumidity18: String(row.hr),
          pressure18: String(row.pp),
          windSpeed18: String(row.ff),
          windDirection18: String(row.dd),
          minTempToday: '2.5',
          date: `${row.year}-${String(row.month).padStart(2, '0')}-${String(row.day).padStart(2, '0')}`,
          notes: `Simulación directa desde registro histórico IGP Huayao (${row.year}-${row.month}-${row.day})`
        }
      }
    });
  };

  return (
    <PageContainer
      title="Explorador de Datos EMA - IGP Huayao"
      subtitle="Conjunto de datos meteorológicos horarios (2018-2025) de la Estación Automática del Observatorio de Huayao."
    >
      {/* Station Metadata KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Estación Primaria"
          value="Huayao"
          subtitle="UBIGEO 120904 • Huachac"
          icon={MapPin}
          color="cyan"
        />
        <KpiCard
          title="Altitud Observatorio"
          value="3,314"
          unit="msnm"
          subtitle="Valle del Mantaro, Junín"
          icon={Database}
          color="indigo"
        />
        <KpiCard
          title="Periodo Registro"
          value="2018 - 2025"
          subtitle="61,300+ registros horarios"
          icon={BarChart3}
          color="emerald"
        />
        <KpiCard
          title="Corte Operativo"
          value="18:00 h"
          subtitle="Ventana vespertina clave"
          icon={Snowflake}
          color="slate"
        />
      </div>

      {/* Filter and Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
        <div>
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Muestra de Días Representativos en el Archivo IGP_EstacionEMA_data_2018_2025.csv
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Seleccione cualquier registro para transferir instantáneamente sus lecturas de las 18:00 h al motor de pronóstico.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Tipo:
          </span>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'FROST', label: 'Heladas Severas' },
            { id: 'YELLOW', label: 'Alertas Tempranas' },
            { id: 'WARM', label: 'Días Cálidos' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedFilter === f.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Explorer Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3.5">Fecha</th>
              <th className="py-3 px-3.5">Hora</th>
              <th className="py-3 px-3.5">Temp (TT)</th>
              <th className="py-3 px-3.5">Humedad (HR)</th>
              <th className="py-3 px-3.5">Presión (PP)</th>
              <th className="py-3 px-3.5">Viento (FF)</th>
              <th className="py-3 px-3.5">Dirección (DD)</th>
              <th className="py-3 px-3.5">Escenario Histórico</th>
              <th className="py-3 px-3.5 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {filteredRows.map((r) => {
              const isFrost = r.scenario.includes('Severa');
              const isYellow = r.scenario.includes('Amarilla');

              return (
                <tr
                  key={r.id}
                  className="hover:bg-slate-800/40 transition-colors text-slate-300"
                >
                  <td className="py-3 px-3.5 font-medium text-slate-200">
                    {r.year}-{String(r.month).padStart(2, '0')}-{String(r.day).padStart(2, '0')}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-400">
                    {String(r.hour).padStart(2, '0')}:00 h
                  </td>
                  <td className="py-3 px-3.5 font-mono font-bold text-slate-200">
                    {r.tt.toFixed(2)} °C
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-300">
                    {r.hr.toFixed(1)} %
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-400">
                    {r.pp.toFixed(1)} hPa
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-400">
                    {r.ff.toFixed(2)} m/s
                  </td>
                  <td className="py-3 px-3.5 font-mono text-slate-400">
                    {r.dd.toFixed(1)}°
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isFrost
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : isYellow
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {r.scenario}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Play}
                      onClick={() => handleSimulateRow(r)}
                    >
                      Simular en Predictor
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
