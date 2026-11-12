import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import PredictionTable from '../components/PredictionTable';
import KpiCard from '../components/KpiCard';
import Button from '../components/Button';
import FormMessage from '../components/FormMessage';
import StatusBadge from '../components/StatusBadge';
import { frostPredictionService } from '../services/frostPredictionService';
import {
  History,
  Download,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';

export default function PredictionHistory() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await frostPredictionService.getPredictionHistory();
      setPredictions(data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error al cargar el historial de predicciones.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`¿Está seguro de eliminar el registro de predicción #${id}?`)) {
      return;
    }
    try {
      await frostPredictionService.deletePrediction(id);
      setPredictions((prev) => prev.filter((p) => (p.id || p.Id) !== id));
      if (selectedItem && (selectedItem.id || selectedItem.Id) === id) {
        setSelectedItem(null);
      }
      setMessage({ type: 'success', text: `Registro #${id} eliminado correctamente.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'No se pudo eliminar el registro.' });
    }
  };

  const handleExportCsv = () => {
    if (!predictions.length) {
      setMessage({ type: 'info', text: 'No hay datos para exportar.' });
      return;
    }

    const headers = [
      'ID',
      'Fecha_Corte_18h',
      'Fecha_Diana_06h',
      'TT_18_C',
      'HR_18_pct',
      'PP_18_hPa',
      'FF_18_ms',
      'Tmin_Predicha_C',
      'Base_Ridge_C',
      'Residual_RF_C',
      'Nivel_Alerta',
      'Notas',
      'Fecha_Creacion'
    ];

    const rows = predictions.map((p) => [
      p.id || p.Id || '',
      p.cutoffDate || p.CutoffDate || '',
      p.targetDate || p.TargetDate || '',
      p.airTemp18 ?? p.AirTemp18 ?? '',
      p.relativeHumidity18 ?? p.RelativeHumidity18 ?? '',
      p.pressure18 ?? p.Pressure18 ?? '',
      p.windSpeed18 ?? p.WindSpeed18 ?? '',
      p.predictedTmin ?? p.predictedTminC ?? p.PredictedTmin ?? '',
      p.baseRidge ?? p.baseRidgeC ?? p.BaseRidge ?? '',
      p.residualRf ?? p.residualRfC ?? p.ResidualRf ?? '',
      p.alertLevel || p.AlertLevel || '',
      `"${(p.notes || p.Notes || '').replace(/"/g, '""')}"`,
      p.createdAt || p.CreatedAt || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `historial_heladas_mantaro_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter calculations
  const filteredPredictions = predictions.filter((p) => {
    const level = (p.alertLevel || p.AlertLevel || '').toUpperCase();
    if (filterLevel !== 'ALL' && level !== filterLevel) {
      return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const cutoff = (p.cutoffDate || p.CutoffDate || '').toLowerCase();
      const target = (p.targetDate || p.TargetDate || '').toLowerCase();
      const notes = (p.notes || p.Notes || '').toLowerCase();
      return cutoff.includes(term) || target.includes(term) || notes.includes(term);
    }
    return true;
  });

  const totalCount = predictions.length;
  const redCount = predictions.filter((p) => (p.alertLevel || p.AlertLevel || '').toUpperCase() === 'RED').length;
  const yellowCount = predictions.filter((p) => (p.alertLevel || p.AlertLevel || '').toUpperCase() === 'YELLOW').length;
  const greenCount = predictions.filter((p) => (p.alertLevel || p.AlertLevel || '').toUpperCase() === 'GREEN').length;

  return (
    <PageContainer
      title="Historial de Alertas Registradas"
      subtitle="Registro continuo de predicciones vespertinas almacenadas en PostgreSQL para el Valle del Mantaro."
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportCsv}
          >
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchHistory}
          >
            Actualizar
          </Button>
        </div>
      }
    >
      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Total Pronósticos"
          value={totalCount}
          subtitle="En base de datos"
          icon={History}
          color="slate"
        />
        <KpiCard
          title="Alertas Rojas"
          value={redCount}
          subtitle="Tmin <= 1.0 °C (Crítico)"
          icon={ShieldAlert}
          color="red"
        />
        <KpiCard
          title="Alertas Amarillas"
          value={yellowCount}
          subtitle="Tmin <= 2.0 °C (Temprana)"
          icon={AlertTriangle}
          color="amber"
        />
        <KpiCard
          title="Días Favorables"
          value={greenCount}
          subtitle="Tmin > 2.0 °C (Sin Helada)"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {message && (
        <FormMessage
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por fecha (YYYY-MM-DD) o notas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" /> Filtro:
          </span>
          {['ALL', 'RED', 'YELLOW', 'GREEN'].map((lvl) => {
            const labels = { ALL: 'Todos', RED: 'Rojo', YELLOW: 'Amarillo', GREEN: 'Verde' };
            const isActive = filterLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {labels[lvl]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
          <p className="text-xs">Cargando registros históricos de la base de datos...</p>
        </div>
      ) : (
        <PredictionTable
          predictions={filteredPredictions}
          onSelect={(p) => setSelectedItem(p)}
          onDelete={handleDelete}
        />
      )}

      {/* Detail Modal / Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Detalle del Registro #{selectedItem.id || selectedItem.Id}
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Corte Observación</span>
                <span className="font-semibold text-slate-200">
                  {selectedItem.cutoffDate || selectedItem.CutoffDate} 18:00 h
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Fecha Diana</span>
                <span className="font-semibold text-slate-200">
                  {selectedItem.targetDate || selectedItem.TargetDate} 06:00 h
                </span>
              </div>
            </div>

            {/* Prediction Values */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
              <div className="text-[11px] text-slate-400 uppercase font-semibold">
                Pronóstico de Temperatura Mínima
              </div>
              <div className="text-4xl font-extrabold font-mono text-cyan-400">
                {(selectedItem.predictedTmin ?? selectedItem.predictedTminC ?? selectedItem.PredictedTmin ?? 0).toFixed(2)} °C
              </div>
              <div>
                <StatusBadge level={selectedItem.alertLevel || selectedItem.AlertLevel} size="md" />
              </div>
              <div className="pt-2 text-xs text-slate-400 flex justify-center gap-4 border-t border-slate-900">
                <span>Base Ridge: <b>{(selectedItem.baseRidge ?? selectedItem.BaseRidge ?? 0).toFixed(2)} °C</b></span>
                <span>Residual RF: <b>{(selectedItem.residualRf ?? selectedItem.ResidualRf ?? 0).toFixed(2)} °C</b></span>
              </div>
            </div>

            {/* Meteorological Inputs */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-300">
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">TT 18h</span>
                {selectedItem.airTemp18 ?? selectedItem.AirTemp18} °C
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">HR 18h</span>
                {selectedItem.relativeHumidity18 ?? selectedItem.RelativeHumidity18} %
              </div>
              <div className="p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-500 block text-[9px]">Presión 18h</span>
                {selectedItem.pressure18 ?? selectedItem.Pressure18 ?? 'N/D'} hPa
              </div>
            </div>

            {/* Notes */}
            {selectedItem.notes && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
                <span className="font-semibold text-slate-300 block mb-1">Notas:</span>
                {selectedItem.notes}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedItem(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
