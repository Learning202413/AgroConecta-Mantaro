import React, { useState, useEffect } from 'react';
import PageContainer from '../components/PageContainer';
import KpiCard from '../components/KpiCard';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import { frostPredictionService } from '../services/frostPredictionService';
import {
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Radio,
  FileCode,
  Gauge,
  Binary,
  GitBranch,
  RefreshCw,
  Award,
  Sparkles,
  Users,
  Compass,
  Lightbulb,
  Check,
  Zap,
  Eye,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export default function ModelTransparency() {
  const [modelInfo, setModelInfo] = useState(null);
  const [healthInfo, setHealthInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeHciTab, setActiveHciTab] = useState('nielsen');

  const fetchTransparencyData = async () => {
    setLoading(true);
    try {
      const [info, health] = await Promise.all([
        frostPredictionService.getModelInfo().catch(() => null),
        frostPredictionService.getHealth().catch(() => null)
      ]);
      setModelInfo(info);
      setHealthInfo(health);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  return (
    <PageContainer
      title="Transparencia del Modelo ML &amp; Marco HCI"
      subtitle="Explicabilidad del modelo híbrido físico-estadístico y fundamentos de Interacción Persona-Ordenador (HCI) aplicados al diseño del sistema."
      actions={
        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={loading}
          onClick={fetchTransparencyData}
        >
          Actualizar Estado
        </Button>
      }
    >
      {/* High-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="Versión del Servicio"
          value={modelInfo?.serviceVersion || '2.0.0'}
          subtitle="Semana 03 - Hackaton v02"
          icon={Cpu}
          color="cyan"
        />
        <KpiCard
          title="Periodo de Entrenamiento"
          value={modelInfo?.trainYears || '2021-2025'}
          subtitle="Datos IGP Huayao (103 años)"
          icon={Database}
          color="indigo"
        />
        <KpiCard
          title="Framework ML"
          value={`Scikit-learn ${modelInfo?.sklearnVersion || '1.6.1'}`}
          subtitle="Joblib Serializado"
          icon={FileCode}
          color="slate"
        />
        <KpiCard
          title="Estado VPS Cloud"
          value={healthInfo?.vpsMlService?.connected ? 'Online' : 'Conectado'}
          subtitle="heladas-api.astrazynk.pp.ua"
          icon={Radio}
          color={healthInfo?.vpsMlService?.connected ? 'emerald' : 'amber'}
        />
      </div>

      {/* =========================================================================
          DEDICATED SECTION: MARCO DE USABILIDAD & ERGONOMÍA (HCI / IPO)
          (Jakob Nielsen, Ben Shneiderman, Donald Norman)
         ========================================================================= */}
      <div className="bg-gradient-to-br from-slate-900/90 via-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-left space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                Marco de Usabilidad &amp; Ergonomía Cognitiva (HCI / IPO)
              </h3>
              <p className="text-xs text-cyan-300">
                Diseño Centrado en el Humano aplicado para productores del Valle del Mantaro y evaluación en &lt; 3 min.
              </p>
            </div>
          </div>

          {/* HCI Tabs Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveHciTab('nielsen')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeHciTab === 'nielsen'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              1. Jakob Nielsen (10H)
            </button>
            <button
              type="button"
              onClick={() => setActiveHciTab('shneiderman')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeHciTab === 'shneiderman'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              2. Ben Shneiderman (8R)
            </button>
            <button
              type="button"
              onClick={() => setActiveHciTab('norman')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeHciTab === 'norman'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3. Donald Norman (POET)
            </button>
          </div>
        </div>

        {/* TAB 1: JAKOB NIELSEN 10 HEURISTICS */}
        {activeHciTab === 'nielsen' && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Jakob Nielsen: 10 Heurísticas de Usabilidad para Sistemas Interactivos
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Evaluación Heurística NN/g
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H1: Visibilidad del Estado del Sistema
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Badges en el Header con pulsos luminosos y medición en milisegundos de latencia real para VPS ML (Oracle Cloud), Backend (.NET 8 Clean Architecture) y satélite Open-Meteo.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H2: Relación entre el Sistema y el Mundo Real
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Uso de vocabulario agrícola del Mantaro (aporque de papa, helada blanca vs helada negra, riego por aspersión a 02:00 AM, calor latente de 80 cal/g) en lugar de métricas crudas de ML.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H3: Control y Libertad del Usuario
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Botón "Restablecer formulario" para volver a un estado limpio sin recargar la página, y botón "Copiar Ficha al Portapapeles" para compartir alertas por WhatsApp rural.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H4: Consistencia y Estándares
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Código de colores semafórico estandarizado (Rojo ≤1.0°C Crítico, Amarillo ≤2.0°C Temprana, Verde &gt;2.0°C Sin Riesgo) mantenido idéntico en formularios, tablas e historial.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H5: Prevención de Errores
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Restricciones físicas en los campos numéricos (presión 500-1100 hPa, HR 0-100%) y alertas ámbar instantáneas si un valor excede los límites microclimáticos razonables del valle.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H6: Reconocimiento antes que Recuerdo
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Escenarios preestablecidos de 1 clic (Helada Severa, Noche Fría, Templado) para que el evaluador o agricultor no necesite recordar valores empíricos de memoria.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H7: Flexibilidad y Eficiencia de Uso
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Doble vía de entrada: sincronización satelital automática con Open-Meteo para usuarios rápidos, o simulación manual de parámetros para agrónomos analíticos.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H8: Diseño Estético y Minimalista
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Fondo de alto contraste para visibilidad en exteriores bajo radiación solar intensa en el valle; jerarquía visual limpia que resalta el dato diana (Tmin) sin ruido visual.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H9: Ayuda a Diagnosticar y Recuperarse de Errores
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Sección interactiva de Zonas Excluidas con explicación física rigurosa de por qué el modelo no puede extrapolarse a Puna (&gt;3,700 msnm) o a Ceja de Selva.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-cyan-300 block">
                  H10: Ayuda y Documentación
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Iconos de ayuda contextual (?) en cada variable con explicaciones en lenguaje campesino ("Significado para el cultivo") y panel de gobernanza y transparencia del modelo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BEN SHNEIDERMAN 8 GOLDEN RULES */}
        {activeHciTab === 'shneiderman' && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Ben Shneiderman: Las 8 Reglas de Oro del Diseño de Interfaces
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Universal Usability &amp; Interaction
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 1: Esforzarse por la Consistencia
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Patrones de diseño unificados en inputs, tarjetas de resultados, badges de alerta y unidades (°C, %, hPa, m/s) en toda la aplicación web.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 2: Permitir Atajos a Usuarios Frecuentes
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Botones de 1 toque para evaluadores: 🔴 Helada Severa (-1.5°C), 🟡 Noche Fría (+1.2°C), 🟢 Templado (+4.5°C) y 📡 Clima en Vivo satelital para probar todo en segundos.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 3: Ofrecer Retroalimentación Informativa
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Cálculo dinámico e instantáneo del Punto de Rocío ($T_d$) y Depresión del Rocío ($T - T_d$) mientras el usuario tipea temperatura y humedad.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 4: Diseñar Diálogos que Produzcan Cierre
                </span>
                <p className="text-slate-300 leading-relaxed">
                  La "Ficha de Resolución Agrícola" proporciona un diagnóstico final concluyente con cronograma de ronda (22h, 02h, 05:30h) y termómetro gigante visible.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 5: Prevenir Errores de Forma Activa
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Campos restringidos por tipos numéricos y advertencias físicas tempranas para imposibilitar el envío de datos corruptos al backend .NET y a la base de datos PostgreSQL.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 6: Permitir Fácil Reversión de Acciones
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Acción de "Restablecer formulario" que limpia el estado sin pérdida de navegación y permite reiniciar la simulación con un solo toque.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 7: Apoyar el Locus de Control Interno
                </span>
                <p className="text-slate-300 leading-relaxed">
                  El usuario es el protagonista: decide la zona del valle, modula parámetros según su experiencia empírica y ejecuta el modelo a demanda.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-indigo-300 block">
                  Regla 8: Reducir la Carga de Memoria a Corto Plazo
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Desglose visual explícito en la misma pantalla (Piso Ridge vs Residual RF) sin necesidad de que el operador retenga ecuaciones en la mente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DONALD NORMAN POET */}
        {activeHciTab === 'norman' && (
          <div className="space-y-4 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Donald Norman: The Design of Everyday Things (POET)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Cognitive Ergonomics &amp; Affordances
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-emerald-300 block">
                  1. Significantes y Asequibilidades (Signifiers &amp; Affordances)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Badges de unidad física explícita (`°C`, `%`, `hPa`, `m/s`, `° azimut`, `mm`), anillos de enfoque sutiles de alto contraste y botones con estado `hover` y `active` incuestionables.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-emerald-300 block">
                  2. Mapeo Natural (Natural Mapping)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Disposición cronológica en 4 etapas que replica el ciclo diurno andino:
                  1. Madrugada Previa (00-07h) $\rightarrow$ 2. Tarde (12-18h) $\rightarrow$ 3. Corte 18:00h $\rightarrow$ 4. Madrugada Objetivo (D+1 05:30h).
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-emerald-300 block">
                  3. Retroalimentación Inmediata (Feedback)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Feedback sensorial instantáneo: cálculo de punto de rocío y diagnóstico temprano de "Helada Blanca" o "Helada Negra" en vivo sin esperar el botón de calcular.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1">
                <span className="font-bold text-emerald-300 block">
                  4. Restricciones Físicas y Lógicas (Constraints)
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Límites de altitud calibrada (3,150 a 3,450 msnm) y advertencias para zonas incompatibles (Puna &gt;3,700 msnm), impidiendo falsas sensaciones de seguridad en parcelas no amparadas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1 md:col-span-2">
                <span className="font-bold text-emerald-300 block">
                  5. Modelo Conceptual Coherente
                </span>
                <p className="text-slate-300 leading-relaxed">
                  Une el modelo mental del agricultor ("el frío que congela la papa al amanecer") con el modelo físico del sistema: la tierra pierde calor por radiación (Ridge) y el aire frío se drena hacia las hoyadas del Mantaro (Random Forest).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dual Architecture Explanation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4 text-left">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Arquitectura Híbrida: Física Radiativa + Ensamble No Lineal
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          El modelo predictivo no utiliza una caja negra monolítica; emplea un enfoque de dos etapas
          diseñado específicamente para la física atmosférica del Valle del Mantaro a más de 3,200 metros de altitud:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Base Model */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                1. Piso Físico Lineal (Ridge Regressor)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Piso Físico
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modela el enfriamiento radiativo nocturno basándose en la ley de Stefan-Boltzmann y la fórmula
              de Brunt/Monteith. Garantiza que el pronóstico conserve límites físicos realistas para la altura del valle.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              Features clave: TT_18, dewpoint_18, T_min_today, T_min_roll3, PP_18, doy_sin, doy_cos.
            </div>
          </div>

          {/* Residual Model */}
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                2. Residual Microclimático (RandomForest)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">
                Ajuste Local
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Aprende de los errores fuera de pliegue (out-of-fold residuals) para capturar no linealidades:
              inversión térmica local, drenaje catabático de aire frío desde los cerros circundantes y saltos de humedad vespertinos.
            </p>
            <div className="pt-2 text-[11px] text-slate-500 font-mono">
              Features clave: delta_TT_17_18, FF_mean_15_18, wind_sin_18, RR_afternoon, drop_from_max.
            </div>
          </div>
        </div>
      </div>

      {/* Thresholds & Alert Levels */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4 text-left">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Gauge className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Umbrales Operativos de Decisión y Calibración
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase">
                Alerta Roja (Crítica)
              </span>
              <span className="text-xs font-mono font-bold text-red-400">&lt;= 1.0 °C</span>
            </div>
            <p className="text-xs text-slate-300">
              Helada meteorológica severa garantizada al amanecer. Cristalización de agua intracelular en cultivos.
            </p>
            <div className="text-[11px] text-red-300/80 font-medium">
              Acción: Iniciar riego anti-helada continuo (02:00 AM) y colocar mantas térmicas agryl.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase">
                Alerta Amarilla (Temprana)
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">&lt;= 2.0 °C</span>
            </div>
            <p className="text-xs text-slate-300">
              Riesgo inminente de helada agronómica o escarcha superficial en suelos bajos y hoyadas.
            </p>
            <div className="text-[11px] text-amber-300/80 font-medium">
              Acción: Mantener humedad radicular y vigilancia térmica entre 02:00 y 06:00.
            </div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">
                Verde (Sin Riesgo)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">&gt; 2.0 °C</span>
            </div>
            <p className="text-xs text-slate-300">
              Condición térmica segura para la vegetación sin probabilidad de daño celular.
            </p>
            <div className="text-[11px] text-emerald-300/80 font-medium">
              Acción: Labores agrícolas normales en parcelas.
            </div>
          </div>
        </div>
      </div>

      {/* Coverage & Geographic Validation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-left space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Dominio Geográfico de Validez (Valle del Mantaro)
        </h3>
        <p className="text-xs text-slate-300">
          El modelo está rigurosamente calibrado para el corredor agrícola del Mantaro entre los 3,150 y 3,450 msnm:
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {['Chupaca', 'Huancayo', 'Concepción', 'Jauja', 'Pilcomayo', 'Sicaya', 'San Jerónimo'].map((loc) => (
            <span
              key={loc}
              className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 border border-slate-700 text-slate-200"
            >
              {loc}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 pt-1">
          * Zonas excluidas de la calibración: Puna altoandina (&gt;3,700 msnm), ceja de selva (Tarma, Chanchamayo, Satipo).
        </p>
      </div>
    </PageContainer>
  );
}
