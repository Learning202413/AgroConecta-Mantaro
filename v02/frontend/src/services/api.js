/**
 * Base API client configuration with automatic backend-to-VPS fallback resilience.
 */

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5029').replace(/\/+$/, '');
const VPS_URL = (import.meta.env.VITE_VPS_URL || 'https://heladas-api.astrazynk.pp.ua').replace(/\/+$/, '');

export async function request(endpoint, options = {}) {
  const isPostPrediction = endpoint === '/api/predictions' && options.method === 'POST';
  const isModelInfo = endpoint === '/api/model/info';
  const isHealth = endpoint === '/api/health';

  try {
    // 1. First attempt: C# ASP.NET Core Clean Architecture Backend
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const backendResponse = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);

    if (backendResponse.ok) {
      if (backendResponse.status === 204) return null;
      return await backendResponse.json();
    }
    // If 400 error from backend, throw detailed message
    if (backendResponse.status === 400) {
      const errData = await backendResponse.json().catch(() => ({}));
      throw new Error(errData.message || 'Error de validación en los parámetros enviados.');
    }
  } catch (backendError) {
    console.warn(`[API] C# Backend unreachable on ${BACKEND_URL}${endpoint}. Testing fallback to VPS:`, backendError.message);
  }

  // 2. Fallback attempt directly to VPS ML API if backend is not running
  if (isPostPrediction) {
    try {
      const parsedBody = typeof options.body === 'string' ? JSON.parse(options.body) : options.body;
      const vpsPayload = {
        TT_18: Number(parsedBody.airTemp18),
        HR_18: Number(parsedBody.relativeHumidity18),
        PP_18: parsedBody.pressure18 ? Number(parsedBody.pressure18) : undefined,
        FF_18: parsedBody.windSpeed18 ? Number(parsedBody.windSpeed18) : undefined,
        DD_18: parsedBody.windDirection18 ? Number(parsedBody.windDirection18) : undefined,
        T_min_today: parsedBody.minTempToday ? Number(parsedBody.minTempToday) : undefined,
        date: parsedBody.date || new Date().toISOString().split('T')[0]
      };

      const vpsRes = await fetch(`${VPS_URL}/api/v1/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vpsPayload)
      });

      if (vpsRes.ok) {
        const vpsData = await vpsRes.json();
        return {
          id: Date.now(),
          cutoffDate: vpsData.cutoff_date,
          targetDate: vpsData.target_date,
          predictedTminC: vpsData.predicted_tmin_c,
          baseRidgeC: vpsData.base_ridge_c,
          residualRfC: vpsData.residual_rf_c,
          alertLevel: vpsData.alert_level,
          thresholdsC: vpsData.thresholds_c,
          coverage: vpsData.coverage,
          agronomicRecommendations: [
            vpsData.alert_level === 'RED'
              ? 'ALERTA CRÍTICA: Se pronostica helada severa (<= 1.0 °C). Iniciar riego por aspersión continuo.'
              : vpsData.alert_level === 'YELLOW'
              ? 'ALERTA TEMPRANA: Probable escarcha agronómica (<= 2.0 °C). Monitorear suelo.'
              : 'CONDICIÓN FAVORABLE: Sin riesgo de helada (> 2.0 °C).'
          ],
          createdAt: new Date().toISOString()
        };
      }
    } catch (vpsErr) {
      console.error('[API] Direct VPS fallback also failed:', vpsErr);
    }
  }

  if (isModelInfo) {
    try {
      const vpsRes = await fetch(`${VPS_URL}/api/v1/modelo`);
      if (vpsRes.ok) {
        const d = await vpsRes.json();
        return {
          serviceVersion: d.service_version,
          architecture: d.architecture,
          trainYears: d.train_years,
          sklearnVersion: d.sklearn_version,
          thresholdsC: d.thresholds_c,
          baseFeatures: d.base_features,
          residualFeatures: d.residual_features,
          coverage: d.coverage
        };
      }
    } catch (e) {
      console.error('[API] VPS model info failed:', e);
    }
  }

  if (isHealth) {
    return {
      status: 'offline',
      timestamp: new Date().toISOString(),
      service: 'MantaroFrostAlert',
      database: { connected: false, provider: 'None' },
      vpsMlService: { connected: false, endpoint: VPS_URL }
    };
  }

  throw new Error('No se pudo conectar ni con el backend local (http://localhost:5029) ni con el servicio VPS.');
}
