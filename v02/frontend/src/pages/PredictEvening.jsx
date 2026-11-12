import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import InputField from '../components/InputField';
import Button from '../components/Button';
import FormMessage from '../components/FormMessage';
import StatusBadge from '../components/StatusBadge';
import { frostPredictionService } from '../services/frostPredictionService';
import {
  weatherService,
  MANTARO_CORRIDOR_ZONES,
  EXCLUDED_ZONES
} from '../services/weatherService';
import { PRESET_SCENARIOS } from '../utils/sampleData';
import {
  Sparkles,
  Thermometer,
  Layers,
  Sprout,
  Radio,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldAlert,
  Copy,
  RotateCcw,
  Check,
  Sun,
  CloudRain,
  Moon,
  Sunrise,
  Droplets,
  Wind,
  Compass,
  Calendar,
  Wheat,
  Clock,
  Award
} from 'lucide-react';

const INITIAL_FORM = {
  airTemp18: '9.27',
  relativeHumidity18: '49.0',
  pressure18: '688.6',
  windSpeed18: '3.0',
  windDirection18: '303.4',
  minTempToday: '1.2',
  rrAfternoon: '0.0',
  date: '2026-06-25',
  notes: 'Escenario de helada severa invernal en el fondo del Valle del Mantaro.'
};

export default function PredictEvening() {
  const location = useLocation();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Open-Meteo & Zone Coverage States
  const [selectedZone, setSelectedZone] = useState('chupaca');
  const [syncingWeather, setSyncingWeather] = useState(false);
  const [liveSyncBanner, setLiveSyncBanner] = useState(null);
  const [showExcludedZones, setShowExcludedZones] = useState(false);
  const [selectedExcludedZone, setSelectedExcludedZone] = useState(null);

  useEffect(() => {
    if (location.state?.prefill) {
      setFormData((prev) => ({
        ...prev,
        ...location.state.prefill
      }));
      setMessage({
        type: 'info',
        text: 'Datos cargados automáticamente desde el Explorador EMA Huayao.'
      });
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Norman & Shneiderman: Dynamic Dew Point & Depression calculation (Instant Feedback)
  const dewPointAnalysis = useMemo(() => {
    const temp = parseFloat(formData.airTemp18);
    const rh = parseFloat(formData.relativeHumidity18);

    if (isNaN(temp) || isNaN(rh) || rh <= 0 || rh > 100) {
      return null;
    }

    // Magnus-Tetens approximation
    const a = 17.27;
    const b = 237.7;
    const alpha = (a * temp) / (b + temp) + Math.log(rh / 100);
    const td = (b * alpha) / (a - alpha);
    const depression = temp - td;

    let condition = 'safe';
    let label = 'Punto de Rocío Seguro';
    let advice = 'Humedad y temperatura lejos del punto de congelación.';
    let badgeClass = 'text-emerald-400 bg-emerald-950/60 border-emerald-500/30';

    if (td <= 0 && depression <= 2.5) {
      condition = 'white-frost';
      label = '⚠️ Riesgo Inminente de Helada Blanca (Escarcha)';
      advice =
        'El vapor condensará y se congelará directamente sobre las hojas de papa y maíz. Formación de escarcha superficial.';
      badgeClass = 'text-amber-300 bg-amber-950/70 border-amber-500/40 animate-pulse';
    } else if (td < 0 && rh < 48) {
      condition = 'black-frost';
      label = '🚨 Riesgo Extremo de Helada Negra (Seca)';
      advice =
        'Aire extremadamente seco sin escarcha visible. El frío penetrará quemando la savia y destruyendo el tejido foliar.';
      badgeClass = 'text-red-300 bg-red-950/80 border-red-500/50 animate-pulse';
    } else if (td <= 2.0) {
      condition = 'cold-warning';
      label = '❄️ Condición Térmica Muy Fría';
      advice = 'Vigilancia de temperaturas en parcelas bajas y hondonadas.';
      badgeClass = 'text-cyan-300 bg-cyan-950/60 border-cyan-500/30';
    }

    return {
      dewPoint: td.toFixed(1),
      depression: depression.toFixed(1),
      condition,
      label,
      advice,
      badgeClass
    };
  }, [formData.airTemp18, formData.relativeHumidity18]);

  // Shneiderman Rule 2: 1-Click Evaluator Preset Shortcuts
  const applyPreset = (preset) => {
    setFormData({
      airTemp18: String(preset.data.airTemp18),
      relativeHumidity18: String(preset.data.relativeHumidity18),
      pressure18: preset.data.pressure18 ? String(preset.data.pressure18) : '',
      windSpeed18: preset.data.windSpeed18 ? String(preset.data.windSpeed18) : '',
      windDirection18: preset.data.windDirection18 ? String(preset.data.windDirection18) : '',
      minTempToday: preset.data.minTempToday ? String(preset.data.minTempToday) : '',
      rrAfternoon: preset.data.rrAfternoon !== undefined ? String(preset.data.rrAfternoon) : '0.0',
      date: preset.data.date || new Date().toISOString().split('T')[0],
      notes: preset.data.notes || ''
    });
    setLiveSyncBanner(null);
    setMessage({
      type: 'info',
      text: `Escenario de prueba cargado: "${preset.shortTitle}"`
    });
  };

  // Nielsen H3: User Control & Freedom (Reset)
  const handleResetForm = () => {
    setFormData({
      airTemp18: '',
      relativeHumidity18: '',
      pressure18: '688.0',
      windSpeed18: '1.5',
      windDirection18: '270.0',
      minTempToday: '3.0',
      rrAfternoon: '0.0',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setResult(null);
    setMessage({
      type: 'info',
      text: 'Formulario restablecido a valores limpios.'
    });
  };

  // Shneiderman Shortcuts & Norman Feedback: Live Weather Sync
  const handleSyncLiveWeather = async () => {
    setSyncingWeather(true);
    setSelectedExcludedZone(null);
    setMessage(null);
    try {
      const liveData = await weatherService.getLiveWeatherForZone(selectedZone);

      setFormData({
        airTemp18: String(liveData.TT_18),
        relativeHumidity18: String(liveData.HR_18),
        pressure18: String(liveData.PP_18),
        windSpeed18: String(liveData.FF_18),
        windDirection18: String(liveData.DD_18),
        minTempToday: String(liveData.T_min_today),
        rrAfternoon: String(liveData.RR_afternoon || 0.0),
        date: liveData.date,
        notes: `Sincronizado vía Open-Meteo para ${liveData.zone.name} (${liveData.elevation} msnm). ${liveData.notation}`
      });

      setLiveSyncBanner({
        zoneName: liveData.zone.name,
        elevation: liveData.elevation,
        data: liveData
      });

      setMessage({
        type: 'success',
        text: `Datos meteorológicos en vivo sincronizados para ${liveData.zone.name}.`
      });
    } catch (err) {
      console.error('[Open-Meteo Error]', err);
      setMessage({
        type: 'error',
        text: `Error al consultar Open-Meteo: ${err.message}`
      });
    } finally {
      setSyncingWeather(false);
    }
  };

  const handleSelectExcludedZone = (exZone) => {
    setSelectedExcludedZone(exZone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // Validation (Norman Error Prevention)
    if (!formData.airTemp18 || isNaN(Number(formData.airTemp18))) {
      setMessage({ type: 'error', text: 'Ingrese una temperatura válida a las 18:00 h.' });
      return;
    }
    if (!formData.relativeHumidity18 || isNaN(Number(formData.relativeHumidity18))) {
      setMessage({ type: 'error', text: 'Ingrese una humedad relativa válida (0 - 100%).' });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        airTemp18: parseFloat(formData.airTemp18),
        relativeHumidity18: parseFloat(formData.relativeHumidity18),
        pressure18: formData.pressure18 ? parseFloat(formData.pressure18) : null,
        windSpeed18: formData.windSpeed18 ? parseFloat(formData.windSpeed18) : null,
        windDirection18: formData.windDirection18 ? parseFloat(formData.windDirection18) : null,
        minTempToday: formData.minTempToday ? parseFloat(formData.minTempToday) : null,
        date: formData.date || new Date().toISOString().split('T')[0],
        notes: formData.notes
      };

      const res = await frostPredictionService.predictEvening(payload);
      setResult(res);
      setMessage({
        type: 'success',
        text: `¡Pronóstico generado exitosamente! Registrado con ID #${res.id || 'N/A'}.`
      });
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: err.message || 'Error al comunicarse con el servicio de pronóstico.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Nielsen H3: Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (!result) return;
    const summaryText = `🌾 FICHA DE RESOLUCIÓN AGRÍCOLA - VALLE DEL MANTARO
📅 Diana: ${result.targetDate || 'Madrugada D+1'} (05:30 h)
🌡️ T. Mínima Pronosticada: ${result.predictedTminC?.toFixed(2)} °C
🚨 Nivel de Alerta: ${result.alertLevel}
🔬 Descomposición:
  • Piso Físico (Ridge): ${result.baseRidgeC?.toFixed(2)} °C
  • Residual Microclimático (Random Forest): ${result.residualRfC?.toFixed(2)} °C
🚜 Acciones Inmediatas para el Agricultor:
  - Papa: Activar riego por aspersión continuo a las 02:00 AM (80 cal/g calor latente).
  - Maíz/Alcachofa: Encender quemadores perimetrales / cubrir con manta agryl 17 g/m².
ℹ️ Sistema Mantaro Frost Alert • Observatorio Huayao IGP (3,314 msnm)`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <PageContainer
      title="Predicción Vespertina de Heladas"
      subtitle="Corte sincrónico de las 18:00 h • Calibrado para el fondo del Valle del Mantaro (3,150 – 3,450 msnm)"
    >
      {/* =========================================================================
          SHNEIDERMAN RULE 2: SHORTCUTS FOR EVALUATORS & FREQUENT USERS (1-CLICK)
         ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border border-cyan-500/40 rounded-xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Atajos de Evaluación Rápida (1-Clic) • Heurística Shneiderman &amp; Nielsen
            </span>
          </div>
          <span className="text-[11px] text-cyan-300 font-mono">
            Evaluación completa en &lt; 3 minutos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`p-3 text-left rounded-lg border transition-all cursor-pointer group flex flex-col justify-between ${preset.badgeClass}`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-100 group-hover:text-white">
                  {preset.shortTitle}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-950/80 border border-current">
                  {preset.targetTemp}
                </span>
              </div>
              <p className="text-[11px] text-slate-300/90 mt-1 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}

          {/* 4th Shortcut: Live Weather Sync */}
          <button
            type="button"
            onClick={handleSyncLiveWeather}
            disabled={syncingWeather}
            className="p-3 text-left rounded-lg border border-cyan-500/50 bg-gradient-to-r from-cyan-950/70 to-blue-950/70 hover:from-cyan-900/80 hover:to-blue-900/80 text-cyan-200 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white group-hover:text-cyan-200 flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 text-cyan-400 ${syncingWeather ? 'animate-spin' : 'animate-pulse'}`} />
                📡 Clima en Vivo (Huayao)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-900/80 text-cyan-300 border border-cyan-500/50">
                Open-Meteo
              </span>
            </div>
            <p className="text-[11px] text-cyan-200/80 mt-1 line-clamp-2 leading-relaxed">
              Descarga telemetría satelital a las 18:00 h en tiempo real para el valle.
            </p>
          </button>
        </div>
      </div>

      {/* =========================================================================
          NORMAN PHYSICAL CONSTRAINTS: CORRIDOR VALIDATION & EXCLUSION LIMITS
         ========================================================================= */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Ámbito Físico-Estadístico Calibrado: Fondo del Valle del Mantaro
            </h2>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono">
            Rango Operativo Válido: 3,150 – 3,450 msnm
          </span>
        </div>

        {/* 4 Valid Corridor Zones Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {MANTARO_CORRIDOR_ZONES.map((zone) => {
            const isSelected = selectedZone === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                onClick={() => {
                  setSelectedZone(zone.id);
                  setSelectedExcludedZone(null);
                }}
                className={`p-2.5 text-left rounded-lg border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/50 shadow-md shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                    {zone.name}
                  </span>
                  {zone.isReference && (
                    <span className="text-[9px] bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 px-1 py-0.5 rounded font-mono font-semibold">
                      IGP REF
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 mt-1">
                  {zone.elevation} msnm
                </div>
              </button>
            );
          })}
        </div>

        {/* Collapsible Excluded Zones Accordion */}
        <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/50">
          <button
            type="button"
            onClick={() => setShowExcludedZones((prev) => !prev)}
            className="w-full px-3.5 py-2 flex items-center justify-between text-left hover:bg-slate-900/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">
                Restricciones de Altitud: Por qué NO aplica a Puna (&gt;3,700 msnm) o Selva
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="text-[11px]">
                {showExcludedZones ? 'Ocultar' : 'Ver límites'}
              </span>
              {showExcludedZones ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>
          </button>

          {showExcludedZones && (
            <div className="p-3 border-t border-slate-800/80 space-y-2 bg-slate-950/80">
              <p className="text-xs text-slate-400">
                El modelo Ridge + Random Forest fue entrenado con la estación EMA Huayao (3,314 msnm). En altitudes mayores a 3,700 msnm o en la vertiente oriental amazónica, los balances de radiación difieren drásticamente:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {EXCLUDED_ZONES.map((exZone) => (
                  <button
                    key={exZone.id}
                    type="button"
                    onClick={() => handleSelectExcludedZone(exZone)}
                    className="p-2.5 text-left rounded-lg border border-red-900/40 bg-red-950/20 hover:bg-red-950/40 hover:border-red-500/50 transition-all text-xs text-slate-300"
                  >
                    <div className="font-bold text-red-300 flex items-center justify-between">
                      <span>{exZone.name}</span>
                      <span className="text-[10px] font-mono text-red-400">{exZone.altitudeRange}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {exZone.reason}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Live Synchronization Banner */}
      {liveSyncBanner && (
        <div className="p-3.5 rounded-xl border border-cyan-500/50 bg-gradient-to-r from-cyan-950/60 via-slate-900/80 to-blue-950/60 shadow-xl space-y-2 relative">
          <button
            type="button"
            onClick={() => setLiveSyncBanner(null)}
            className="absolute top-2.5 right-2.5 text-slate-400 hover:text-white cursor-pointer"
            title="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="text-xs font-bold text-cyan-200">
              Datos meteorológicos en vivo sincronizados para {liveSyncBanner.zoneName} ({liveSyncBanner.elevation} msnm)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-left">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">TT 18:00</span>
              <span className="text-sm font-mono font-bold text-cyan-300">{liveSyncBanner.data.TT_18} °C</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-left">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">HR 18:00</span>
              <span className="text-sm font-mono font-bold text-cyan-300">{liveSyncBanner.data.HR_18} %</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-left">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">PP 18:00</span>
              <span className="text-sm font-mono font-bold text-cyan-300">{liveSyncBanner.data.PP_18} hPa</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-left">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">FF 18:00</span>
              <span className="text-sm font-mono font-bold text-cyan-300">{liveSyncBanner.data.FF_18} m/s</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-left">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Tmin Hoy</span>
              <span className="text-sm font-mono font-bold text-cyan-300">{liveSyncBanner.data.T_min_today} °C</span>
            </div>
            <div className="bg-slate-950/80 p-2 rounded border border-slate-800 text-left">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Lluvia Tarde</span>
              <span className="text-sm font-mono font-bold text-cyan-300">{liveSyncBanner.data.RR_afternoon || 0} mm</span>
            </div>
          </div>
        </div>
      )}

      {message && (
        <FormMessage
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}

      {/* =========================================================================
          NORMAN NATURAL MAPPING: CHRONOLOGICAL DIURNAL CYCLE (4 STAGES)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form structured in chronological stages */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ETAPA 1: MADRUGADA PREVIA (00:00 - 07:00 h) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-md text-left">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sunrise className="w-3.5 h-3.5 text-indigo-400" />
                    Etapa 1: Madrugada Previa (00:00 - 07:00 h)
                  </h3>
                </div>
                <span className="text-[11px] text-indigo-300/80 font-mono">
                  Inercia Térmica del Suelo
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="minTempToday"
                  name="minTempToday"
                  label="Temperatura Mínima de Hoy (Tmin 06h)"
                  unit="°C"
                  type="number"
                  step="0.1"
                  min="-20"
                  max="35"
                  value={formData.minTempToday}
                  onChange={handleInputChange}
                  helperText="Termómetro de mínima en casilla meteorológica."
                  farmerExplanation="Mide qué tan frío amaneció el suelo hoy. Si ya estuvo cerca de 0°C, la tierra absorbió menos calor y la siguiente helada será más severa."
                />

                <InputField
                  id="date"
                  name="date"
                  label="Fecha de la Observación"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  helperText="Determina la estacionalidad astronómica (doy)."
                  farmerExplanation="En el Mantaro el riesgo máximo ocurre entre mayo y agosto (temporada seca con cielo despejado y noches largas)."
                />
              </div>
            </div>

            {/* ETAPA 2: TARDE ANDINA (12:00 - 18:00 h) */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 shadow-md text-left">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Etapa 2: Tarde Andina (12:00 - 18:00 h)
                  </h3>
                </div>
                <span className="text-[11px] text-amber-300/80 font-mono">
                  Humectación y Lluvia Previa
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="rrAfternoon"
                  name="rrAfternoon"
                  label="Precipitación de la Tarde (RR Tarde)"
                  unit="mm"
                  type="number"
                  step="0.1"
                  min="0"
                  max="150"
                  value={formData.rrAfternoon}
                  onChange={handleInputChange}
                  helperText="Lluvia acumulada entre 12:00 y 18:00 h."
                  farmerExplanation="Si llovió en la tarde, el suelo húmedo retiene calor por evaporación y reduce drásticamente el riesgo de helada por radiación."
                />

                <InputField
                  id="notes"
                  name="notes"
                  label="Condición de Parcela / Cultivo"
                  type="text"
                  placeholder="Ej. Parcela Chupaca, floración papa"
                  value={formData.notes}
                  onChange={handleInputChange}
                  helperText="Notas de campo para el registro histórico."
                  farmerExplanation="Indique el estado fenológico (aporque, floración, llenado de grano) para adecuar la acción de rescate."
                />
              </div>
            </div>

            {/* ETAPA 3: CORTE VESPERTINO CLAVE (18:00 h) */}
            <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-xl p-4 shadow-lg text-left space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-cyan-600/30 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-xs font-bold text-cyan-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Etapa 3: Corte Vespertino Clave (18:00 h Sincrónico)
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-cyan-300 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40">
                  Datos Principales ML
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField
                  id="airTemp18"
                  name="airTemp18"
                  label="Temperatura Aire (TT 18:00)"
                  unit="°C"
                  type="number"
                  step="0.01"
                  min="-20"
                  max="40"
                  required
                  value={formData.airTemp18}
                  onChange={handleInputChange}
                  helperText="Punto de partida del enfriamiento nocturno."
                  farmerExplanation="Si a las 6 de la tarde la temperatura ya está por debajo de 10°C, el enfriamiento nocturno alcanzará el punto de congelación antes del amanecer."
                />

                <InputField
                  id="relativeHumidity18"
                  name="relativeHumidity18"
                  label="Humedad Relativa (HR 18:00)"
                  unit="%"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={formData.relativeHumidity18}
                  onChange={handleInputChange}
                  helperText="Humedad ambiental al caer la tarde."
                  farmerExplanation="El vapor de agua actúa como un invernadero natural. Si la humedad es menor a 50%, no hay vapor que retenga el calor y el suelo se enfría a gran velocidad."
                />

                <InputField
                  id="pressure18"
                  name="pressure18"
                  label="Presión Barométrica (PP 18:00)"
                  unit="hPa"
                  type="number"
                  step="0.1"
                  min="500"
                  max="1100"
                  value={formData.pressure18}
                  onChange={handleInputChange}
                  helperText="En Huayao (3,314 msnm) ronda ~688 hPa."
                  farmerExplanation="La presión alta andina suele asociarse a cielos completamente despejados y aire seco que facilitan la helada."
                />

                <InputField
                  id="windSpeed18"
                  name="windSpeed18"
                  label="Velocidad del Viento (FF 18:00)"
                  unit="m/s"
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  value={formData.windSpeed18}
                  onChange={handleInputChange}
                  helperText="Viento calmo (<1.5 m/s) intensifica heladas."
                  farmerExplanation="Si no hay viento, el aire helado más pesado se asienta en el fondo de las chacras (inversión térmica) y congela las plantas."
                />

                <InputField
                  id="windDirection18"
                  name="windDirection18"
                  label="Dirección del Viento (DD 18:00)"
                  unit="° azimut"
                  type="number"
                  step="0.1"
                  min="0"
                  max="360"
                  value={formData.windDirection18}
                  onChange={handleInputChange}
                  helperText="270° = Oeste, 315° = Noroeste."
                  farmerExplanation="En el valle, los vientos del oeste y noroeste bajan de las cordilleras secas y traen aire polar a los cultivos."
                />
              </div>

              {/* REAL-TIME FEEDBACK: LIVE DEW POINT & DEPRESSION CALCULATION */}
              {dewPointAnalysis && (
                <div className={`p-3 rounded-lg border text-left space-y-1.5 transition-all ${dewPointAnalysis.badgeClass}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5" />
                      {dewPointAnalysis.label}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-xs font-semibold">
                      <span>Punto Rocío: <strong>{dewPointAnalysis.dewPoint} °C</strong></span>
                      <span>Depresión: <strong>{dewPointAnalysis.depression} °C</strong></span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-200 leading-snug">
                    {dewPointAnalysis.advice}
                  </p>
                </div>
              )}
            </div>

            {/* Actions: Execute & Reset (Nielsen H3) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={RotateCcw}
                onClick={handleResetForm}
                className="w-full sm:w-auto text-slate-300 border-slate-700 hover:bg-slate-800"
              >
                Restablecer formulario
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={Sparkles}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-950 font-bold"
              >
                {loading ? 'Calculando Modelo Dual...' : 'Ejecutar Pronóstico de Helada'}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Stage 4 - Ficha de Resolución Agrícola */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <div className="bg-slate-900/90 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
              {/* Header result */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Ficha de Resolución Agrícola
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Diana: {result.targetDate} (05:30 h)
                </span>
              </div>

              {/* Giant Thermal Gauge */}
              <div className="text-center py-5 px-4 bg-slate-950/80 rounded-xl border border-slate-800 relative overflow-hidden">
                <div className="text-xs text-slate-300 font-semibold tracking-wider uppercase">
                  Temperatura Mínima Pronosticada (T_min)
                </div>

                {/* Big Temperature Display */}
                <div
                  className={`text-6xl font-black font-mono my-2 tracking-tight ${
                    result.predictedTminC <= 1.0
                      ? 'text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.3)]'
                      : result.predictedTminC <= 2.0
                      ? 'text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                      : 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]'
                  }`}
                >
                  {result.predictedTminC.toFixed(2)} °C
                </div>

                <div className="flex items-center justify-center gap-2 mt-2">
                  <StatusBadge level={result.alertLevel} size="lg" />
                </div>

                {/* Plain-Spanish Diagnosis for Farmers */}
                <p className="text-xs text-slate-300 mt-3 max-w-sm mx-auto leading-relaxed">
                  {result.predictedTminC <= 0
                    ? '⚠️ HELADA METEOROLÓGICA SEVERA: Agua celular congelará tejidos de hojas y flores.'
                    : result.predictedTminC <= 2.0
                    ? '❄️ RIESGO DE ESCARCHA AGRONÓMICA: Aire frío en el suelo afectará hondonadas y parcelas bajas.'
                    : '✅ CONDICIÓN TÉRMICA SEGURA: Sin peligro de daño por bajas temperaturas al amanecer.'}
                </p>
              </div>

              {/* Dual Architecture Decomposition (Ridge + Random Forest) */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Descomposición Físico-Estadística</span>
                  <span className="text-cyan-400 font-mono">Clean Architecture</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Piso Físico (Ridge)
                    </div>
                    <div className="text-xl font-bold font-mono text-slate-100 mt-1">
                      {result.baseRidgeC.toFixed(2)} °C
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Ley Stefan-Boltzmann
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                    <div className="text-[10px] uppercase font-bold text-slate-400">
                      Residual (Random Forest)
                    </div>
                    <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                      {result.residualRfC >= 0 ? `+${result.residualRfC.toFixed(2)}` : result.residualRfC.toFixed(2)} °C
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Inversión térmica local
                    </div>
                  </div>
                </div>
              </div>

              {/* Immediate Concrete Actions for Mantaro Crops */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>Acciones Inmediatas para Cultivos del Valle</span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-amber-300 block">🥔 Papa (Canchán, Yungay, Peruanita):</span>
                    {result.predictedTminC <= 1.0 ? (
                      <p className="mt-0.5 text-slate-300 leading-relaxed">
                        Activar <strong>riego por aspersión continuo a las 02:00 AM</strong>. La congelación del agua sobre las hojas libera 80 cal/g de calor latente, protegiendo las células de la necrosis. En parcelas en floración, desplegar mantas térmicas agryl (17 g/m²) antes de las 19:00 h.
                      </p>
                    ) : (
                      <p className="mt-0.5 text-slate-300 leading-relaxed">
                        Mantener humedad superficial en aporque. Monitorear hondonadas de Chupaca y Sicaya.
                      </p>
                    )}
                  </div>

                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                    <span className="font-bold text-amber-300 block">🌽 Maíz Choclo &amp; Alcachofa:</span>
                    <p className="mt-0.5 text-slate-300 leading-relaxed">
                      {result.predictedTminC <= 1.5
                        ? 'Encender quemadores de aserrín o generadores de niebla en el borde barlovento (noroeste) a las 03:00 AM para frenar el escape de radiación terrestre. Suspender fertilización nitrogenada.'
                        : 'Condición controlada. Mantener labores ordinarias de riego.'}
                    </p>
                  </div>
                </div>

                {/* Cronograma de Ronda Crítica */}
                <div className="pt-2 border-t border-emerald-500/20 text-[11px] text-slate-300 space-y-1">
                  <span className="font-bold text-slate-200 block">⏰ Cronograma de Guardia en Parcela:</span>
                  <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                    <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">22:00 h</span>
                      <span className="text-slate-200">Ronda 1</span>
                    </div>
                    <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                      <span className="text-amber-400 block text-[10px]">02:00 h</span>
                      <span className="text-amber-300 font-bold">Riego ON</span>
                    </div>
                    <div className="bg-slate-950/80 p-1.5 rounded border border-slate-800">
                      <span className="text-red-400 block text-[10px]">05:30 h</span>
                      <span className="text-red-300 font-bold">Pico Mín.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nielsen H3: User Control Actions (Copy Summary to WhatsApp/Clipboard) */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={copied ? Check : Copy}
                  onClick={handleCopySummary}
                  className={`w-full ${
                    copied
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  {copied ? '¡Ficha Copiada al Portapapeles!' : 'Copiar Ficha Resumen (WhatsApp / SMS)'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[420px] space-y-3">
              <Layers className="w-14 h-14 text-slate-700" />
              <h4 className="text-sm font-bold text-slate-300">
                Esperando Ejecución del Pronóstico
              </h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Seleccione uno de los <strong>atajos de evaluación de 1-clic</strong> arriba o ajuste los parámetros de las 18:00 h y haga clic en "Ejecutar Pronóstico de Helada".
              </p>
              <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono pt-2">
                <span>Obs. Huayao IGP • 3,314 msnm</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
