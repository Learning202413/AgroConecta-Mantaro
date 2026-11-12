/**
 * Open-Meteo Weather Service for the Mantaro Valley Agricultural Corridor.
 * Physical and statistical operational boundary: 3,150 - 3,450 m.a.s.l.
 */

export const MANTARO_CORRIDOR_ZONES = [
  {
    id: 'chupaca',
    name: 'Chupaca (Huayao / Huachac)',
    station: 'Estación Referencial IGP Huayao',
    ubigeo: '120904',
    province: 'Chupaca',
    department: 'Junín',
    latitude: -12.0433,
    longitude: -75.3211,
    elevation: 3314,
    isReference: true,
    description: 'Estación base de calibración histórica del modelo (IGP 1922-2025). Observatorio geofísico de referencia.'
  },
  {
    id: 'huancayo',
    name: 'Huancayo (El Tambo / Pilcomayo)',
    station: 'Fondo del Valle Central',
    ubigeo: '120101',
    province: 'Huancayo',
    department: 'Junín',
    latitude: -12.0651,
    longitude: -75.2049,
    elevation: 3250,
    isReference: false,
    description: 'Fondo del valle agrícola comercial y microclima urbano central.'
  },
  {
    id: 'concepcion',
    name: 'Concepción (Matahuasi / Nueve de Julio)',
    station: 'Planicie Aluvial Mantaro',
    ubigeo: '120201',
    province: 'Concepción',
    department: 'Junín',
    latitude: -11.9186,
    longitude: -75.3117,
    elevation: 3283,
    isReference: false,
    description: 'Zona central del corredor agrícola y planicie aluvial del Mantaro.'
  },
  {
    id: 'jauja',
    name: 'Jauja (Yauyos / Sausa)',
    station: 'Cabecera Norte Mantaro',
    ubigeo: '120401',
    province: 'Jauja',
    department: 'Junín',
    latitude: -11.7758,
    longitude: -75.4967,
    elevation: 3350,
    isReference: false,
    description: 'Cabecera norte del corredor del Mantaro, zona de alta susceptibilidad a heladas radiativas intensas.'
  }
];

export const EXCLUDED_ZONES = [
  {
    id: 'high_puna',
    name: 'Puna Alta (> 3,700 msnm)',
    altitudeRange: '> 3,700 msnm',
    reason: 'Inversión térmica severa y régimen barométrico fuera de la campana estadística de calibración del IGP Huayao (3,150 - 3,450 msnm). En altitudes de puna, los gradientes adiabáticos secos y la turbulencia orográfica difieren drásticamente del fondo del valle.'
  },
  {
    id: 'tarma',
    name: 'Tarma (Valle de las Flores)',
    altitudeRange: '3,050 msnm',
    reason: 'Microclima de vertiente oriental y cañón interandino con patrón eólico disímil y sombra de lluvia no representados en el balance radiativo del Mantaro.'
  },
  {
    id: 'chanchamayo',
    name: 'Chanchamayo (Selva Central)',
    altitudeRange: '750 - 1,200 msnm',
    reason: 'Zona subtropical y bosque montano con humedad de saturación permanente; régimen de heladas inexistente y gradiente adiabático incompatible con el modelo.'
  },
  {
    id: 'satipo',
    name: 'Satipo (Selva Tropical)',
    altitudeRange: '630 msnm',
    reason: 'Ecosistema de llanura amazónica y selva alta con balance de radiación dominado por convección tropical y libre de heladas meteorológicas.'
  }
];

/**
 * Fetch live weather from Open-Meteo for a specific corridor zone.
 * @param {string} zoneId - Identifier ('chupaca', 'huancayo', 'concepcion', 'jauja')
 * @returns {Promise<Object>} Weather features formatted for the frost prediction model
 */
export async function getLiveWeatherForZone(zoneId = 'chupaca') {
  const zone = MANTARO_CORRIDOR_ZONES.find((z) => z.id === zoneId) || MANTARO_CORRIDOR_ZONES[0];

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${zone.latitude}&longitude=${zone.longitude}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation&wind_speed_unit=ms&timezone=America%2FLima&forecast_days=2`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Error al consultar Open-Meteo (HTTP ${response.status}): ${response.statusText}`);
  }

  const data = await response.json();
  if (!data?.hourly?.time || data.hourly.time.length === 0) {
    throw new Error('Respuesta inválida de Open-Meteo: faltan datos horarios.');
  }

  const times = data.hourly.time;
  const todayStr = times[0].split('T')[0];
  const t18Str = `${todayStr}T18:00`;
  const t18Idx = times.indexOf(t18Str) !== -1 ? times.indexOf(t18Str) : 18;

  // Determine current time in America/Lima
  const nowLima = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }));
  const currentHour = nowLima.getHours();
  const isBefore18 = currentHour < 18;

  // Extract 18:00 features (primary for the evening prediction model)
  const TT_18 = Number(data.hourly.temperature_2m[t18Idx] ?? 0);
  const HR_18 = Number(data.hourly.relative_humidity_2m[t18Idx] ?? 0);
  const PP_18 = Number(data.hourly.surface_pressure[t18Idx] ?? 0);
  const FF_18 = Number(data.hourly.wind_speed_10m[t18Idx] ?? 0);
  const DD_18 = Number(data.hourly.wind_direction_10m[t18Idx] ?? 0);

  // T_min_today: minimum of 00:00 to 07:00 today
  const morningTemps = [];
  for (let h = 0; h <= 7; h++) {
    const hourKey = `${todayStr}T${String(h).padStart(2, '0')}:00`;
    const idx = times.indexOf(hourKey);
    if (idx !== -1 && data.hourly.temperature_2m[idx] !== null) {
      morningTemps.push(Number(data.hourly.temperature_2m[idx]));
    }
  }
  const T_min_today = morningTemps.length > 0 ? Math.min(...morningTemps) : TT_18;

  // RR_afternoon: sum of 12:00 to 18:00 today
  let rrAfternoon = 0;
  for (let h = 12; h <= 18; h++) {
    const hourKey = `${todayStr}T${String(h).padStart(2, '0')}:00`;
    const idx = times.indexOf(hourKey);
    if (idx !== -1 && data.hourly.precipitation[idx] !== null) {
      rrAfternoon += Number(data.hourly.precipitation[idx]);
    }
  }
  const RR_afternoon = Math.round(rrAfternoon * 10) / 10;

  // RR_24h: sum of past 24 hours up to 18:00
  let rr24h = 0;
  const start24hIdx = Math.max(0, t18Idx - 23);
  for (let i = start24hIdx; i <= t18Idx; i++) {
    if (data.hourly.precipitation[i] !== null) {
      rr24h += Number(data.hourly.precipitation[i]);
    }
  }
  const RR_24h = Math.round(rr24h * 10) / 10;

  // Clear notation explaining forecast vs real-time observation
  const notation = isBefore18
    ? `Valores proyectados Open-Meteo para las 18:00 h (Hora local Lima actual: ${String(currentHour).padStart(2, '0')}:${String(nowLima.getMinutes()).padStart(2, '0')} h).`
    : `Observación consolidada Open-Meteo a las 18:00 h (Hora local Lima: ${String(currentHour).padStart(2, '0')}:${String(nowLima.getMinutes()).padStart(2, '0')} h).`;

  return {
    zone,
    date: todayStr,
    TT_18: Math.round(TT_18 * 100) / 100,
    HR_18: Math.round(HR_18 * 10) / 10,
    PP_18: Math.round(PP_18 * 10) / 10,
    FF_18: Math.round(FF_18 * 100) / 100,
    DD_18: Math.round(DD_18 * 10) / 10,
    T_min_today: Math.round(T_min_today * 100) / 100,
    RR_afternoon,
    RR_24h,
    isBefore18,
    targetHour: '18:00',
    currentLocalTime: `${String(currentHour).padStart(2, '0')}:${String(nowLima.getMinutes()).padStart(2, '0')}`,
    notation,
    elevation: data.elevation ?? zone.elevation,
    source: 'Open-Meteo API v1 ECMWF/GFS Blend'
  };
}

export const weatherService = {
  MANTARO_CORRIDOR_ZONES,
  EXCLUDED_ZONES,
  getLiveWeatherForZone
};

export default weatherService;
