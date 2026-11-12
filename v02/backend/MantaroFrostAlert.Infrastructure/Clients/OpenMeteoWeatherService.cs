using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;
using MantaroFrostAlert.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace MantaroFrostAlert.Infrastructure.Clients;

public class OpenMeteoWeatherService : IWeatherService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenMeteoWeatherService> _logger;

    private static readonly IReadOnlyList<CorridorZoneDto> CorridorZones = new List<CorridorZoneDto>
    {
        new()
        {
            Id = "chupaca",
            Name = "Chupaca (Huayao / Huachac)",
            Station = "Estación Referencial IGP Huayao",
            Ubigeo = "120904",
            Province = "Chupaca",
            Department = "Junín",
            Latitude = -12.0433,
            Longitude = -75.3211,
            ElevationM = 3314,
            IsReferenceStation = true,
            Description = "Estación base de calibración histórica del modelo (IGP 1922-2025). Observatorio geofísico de referencia."
        },
        new()
        {
            Id = "huancayo",
            Name = "Huancayo (El Tambo / Pilcomayo)",
            Station = "Fondo del Valle Central",
            Ubigeo = "120101",
            Province = "Huancayo",
            Department = "Junín",
            Latitude = -12.0651,
            Longitude = -75.2049,
            ElevationM = 3250,
            IsReferenceStation = false,
            Description = "Fondo del valle agrícola comercial y microclima urbano central."
        },
        new()
        {
            Id = "concepcion",
            Name = "Concepción (Matahuasi / Nueve de Julio)",
            Station = "Planicie Aluvial Mantaro",
            Ubigeo = "120201",
            Province = "Concepción",
            Department = "Junín",
            Latitude = -11.9186,
            Longitude = -75.3117,
            ElevationM = 3283,
            IsReferenceStation = false,
            Description = "Zona central del corredor agrícola y planicie aluvial del Mantaro."
        },
        new()
        {
            Id = "jauja",
            Name = "Jauja (Yauyos / Sausa)",
            Station = "Cabecera Norte Mantaro",
            Ubigeo = "120401",
            Province = "Jauja",
            Department = "Junín",
            Latitude = -11.7758,
            Longitude = -75.4967,
            ElevationM = 3350,
            IsReferenceStation = false,
            Description = "Cabecera norte del corredor del Mantaro, zona de alta susceptibilidad a heladas radiativas intensas."
        }
    };

    private static readonly IReadOnlyList<ExcludedZoneDto> ExcludedZones = new List<ExcludedZoneDto>
    {
        new()
        {
            Id = "high_puna",
            Name = "Puna Alta (> 3,700 msnm)",
            AltitudeRange = "> 3,700 msnm",
            Reason = "Inversión térmica severa y régimen barométrico fuera de la campana estadística de calibración del IGP Huayao (3,150 - 3,450 msnm). En altitudes de puna, los gradientes adiabáticos secos y la turbulencia orográfica difieren drásticamente del fondo del valle."
        },
        new()
        {
            Id = "tarma",
            Name = "Tarma (Valle de las Flores)",
            AltitudeRange = "3,050 msnm",
            Reason = "Microclima de vertiente oriental y cañón interandino con patrón eólico disímil y sombra de lluvia no representados en el balance radiativo del Mantaro."
        },
        new()
        {
            Id = "chanchamayo",
            Name = "Chanchamayo (Selva Central)",
            AltitudeRange = "750 - 1,200 msnm",
            Reason = "Zona subtropical y bosque montano con humedad de saturación permanente; régimen de heladas inexistente y gradiente adiabático incompatible con el modelo."
        },
        new()
        {
            Id = "satipo",
            Name = "Satipo (Selva Tropical)",
            AltitudeRange = "630 msnm",
            Reason = "Ecosistema de llanura amazónica y selva alta con balance de radiación dominado por convección tropical y libre de heladas meteorológicas."
        }
    };

    public OpenMeteoWeatherService(HttpClient httpClient, ILogger<OpenMeteoWeatherService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public IReadOnlyList<CorridorZoneDto> GetCorridorZones() => CorridorZones;

    public IReadOnlyList<ExcludedZoneDto> GetExcludedZones() => ExcludedZones;

    public ZonesBoundaryResponseDto GetZonesBoundary() => new()
    {
        Region = "Junin - Mantaro Valley",
        AltitudeRangeM = new[] { 3150, 3450 },
        ReferenceStation = "IGP Observatorio de Huayao (UBIGEO 120904, 3,314 msnm)",
        CorridorZones = CorridorZones,
        ExcludedZones = ExcludedZones
    };

    public async Task<LiveWeatherDto> GetLiveWeatherForZoneAsync(string zoneId, CancellationToken ct = default)
    {
        var normalizedId = (zoneId ?? "chupaca").Trim().ToLowerInvariant();

        // Check if explicitly excluded
        var excluded = ExcludedZones.FirstOrDefault(e => e.Id.Equals(normalizedId, StringComparison.OrdinalIgnoreCase) ||
                                                        e.Name.ToLowerInvariant().Contains(normalizedId));
        if (excluded != null)
        {
            throw new ArgumentException(
                $"La zona '{excluded.Name}' está EXCLUIDA de la cobertura del modelo: {excluded.Reason} (Rango altitudinal: {excluded.AltitudeRange}). Cobertura válida: 3,150 - 3,450 msnm.");
        }

        var zone = CorridorZones.FirstOrDefault(z => z.Id.Equals(normalizedId, StringComparison.OrdinalIgnoreCase));
        if (zone == null)
        {
            zone = CorridorZones[0]; // Default fallback to reference station Chupaca
            _logger.LogWarning("Requested zone '{ZoneId}' not found. Falling back to reference station Chupaca (Huayao).", zoneId);
        }

        var requestUri = $"v1/forecast?latitude={zone.Latitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}" +
                         $"&longitude={zone.Longitude.ToString(System.Globalization.CultureInfo.InvariantCulture)}" +
                         "&hourly=temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,precipitation" +
                         "&wind_speed_unit=ms&timezone=America%2FLima&forecast_days=2";

        _logger.LogInformation("Querying Open-Meteo for zone '{ZoneName}' at coordinates ({Lat}, {Lon})",
            zone.Name, zone.Latitude, zone.Longitude);

        using var response = await _httpClient.GetAsync(requestUri, ct);
        response.EnsureSuccessStatusCode();

        var openMeteoData = await response.Content.ReadFromJsonAsync<OpenMeteoForecastResponse>(cancellationToken: ct);
        if (openMeteoData?.Hourly?.Time == null || openMeteoData.Hourly.Time.Count == 0)
        {
            throw new InvalidOperationException("Respuesta inválida recibida de la API Open-Meteo.");
        }

        var times = openMeteoData.Hourly.Time;
        var todayStr = times[0].Split('T')[0];
        var t18Str = $"{todayStr}T18:00";
        var t18Idx = times.IndexOf(t18Str);
        if (t18Idx == -1)
        {
            t18Idx = Math.Min(18, times.Count - 1);
        }

        // Current Lima time calculation (UTC - 5)
        var limaNow = DateTime.UtcNow.AddHours(-5);
        var currentHour = limaNow.Hour;
        var isBefore18 = currentHour < 18;

        // Model observation features at 18:00
        var tt18 = Math.Round(openMeteoData.Hourly.Temperature2m.ElementAtOrDefault(t18Idx) ?? 0, 2);
        var hr18 = Math.Round(openMeteoData.Hourly.RelativeHumidity2m.ElementAtOrDefault(t18Idx) ?? 0, 1);
        var pp18 = Math.Round(openMeteoData.Hourly.SurfacePressure.ElementAtOrDefault(t18Idx) ?? 0, 1);
        var ff18 = Math.Round(openMeteoData.Hourly.WindSpeed10m.ElementAtOrDefault(t18Idx) ?? 0, 2);
        var dd18 = Math.Round(openMeteoData.Hourly.WindDirection10m.ElementAtOrDefault(t18Idx) ?? 0, 1);

        // T_min_today: minimum of 00:00 to 07:00 today
        var morningTemps = new List<double>();
        for (int h = 0; h <= 7; h++)
        {
            var key = $"{todayStr}T{h:D2}:00";
            var idx = times.IndexOf(key);
            if (idx != -1 && openMeteoData.Hourly.Temperature2m.ElementAtOrDefault(idx) is { } val)
            {
                morningTemps.Add(val);
            }
        }
        var tminToday = morningTemps.Count > 0 ? Math.Round(morningTemps.Min(), 2) : tt18;

        // RR_afternoon: sum 12:00 to 18:00
        double rrAfternoon = 0;
        for (int h = 12; h <= 18; h++)
        {
            var key = $"{todayStr}T{h:D2}:00";
            var idx = times.IndexOf(key);
            if (idx != -1 && openMeteoData.Hourly.Precipitation.ElementAtOrDefault(idx) is { } val)
            {
                rrAfternoon += val;
            }
        }
        rrAfternoon = Math.Round(rrAfternoon, 1);

        // RR_24h: sum of past 24h up to 18:00
        double rr24h = 0;
        var start24Idx = Math.Max(0, t18Idx - 23);
        for (int i = start24Idx; i <= t18Idx; i++)
        {
            if (openMeteoData.Hourly.Precipitation.ElementAtOrDefault(i) is { } val)
            {
                rr24h += val;
            }
        }
        rr24h = Math.Round(rr24h, 1);

        var notation = isBefore18
            ? $"Valores proyectados Open-Meteo para las 18:00 h (Hora local Lima actual: {currentHour:D2}:{limaNow.Minute:D2} h)."
            : $"Observación consolidada Open-Meteo a las 18:00 h (Hora local Lima: {currentHour:D2}:{limaNow.Minute:D2} h).";

        return new LiveWeatherDto
        {
            ZoneId = zone.Id,
            ZoneName = zone.Name,
            Province = zone.Province,
            Latitude = zone.Latitude,
            Longitude = zone.Longitude,
            ElevationM = (int)Math.Round(openMeteoData.Elevation ?? zone.ElevationM),
            Date = todayStr,
            AirTemp18 = tt18,
            RelativeHumidity18 = hr18,
            Pressure18 = pp18,
            WindSpeed18 = ff18,
            WindDirection18 = dd18,
            MinTempToday = tminToday,
            RainfallAfternoon = rrAfternoon,
            Rainfall24h = rr24h,
            TargetHour = "18:00",
            IsBefore18 = isBefore18,
            CurrentLocalTime = $"{currentHour:D2}:{limaNow.Minute:D2}",
            Notation = notation,
            Source = "Open-Meteo API v1 ECMWF/GFS Blend",
            FetchedAtUtc = DateTime.UtcNow
        };
    }

    private class OpenMeteoForecastResponse
    {
        [JsonPropertyName("elevation")]
        public double? Elevation { get; set; }

        [JsonPropertyName("hourly")]
        public OpenMeteoHourlyData? Hourly { get; set; }
    }

    private class OpenMeteoHourlyData
    {
        [JsonPropertyName("time")]
        public List<string> Time { get; set; } = new();

        [JsonPropertyName("temperature_2m")]
        public List<double?> Temperature2m { get; set; } = new();

        [JsonPropertyName("relative_humidity_2m")]
        public List<double?> RelativeHumidity2m { get; set; } = new();

        [JsonPropertyName("surface_pressure")]
        public List<double?> SurfacePressure { get; set; } = new();

        [JsonPropertyName("wind_speed_10m")]
        public List<double?> WindSpeed10m { get; set; } = new();

        [JsonPropertyName("wind_direction_10m")]
        public List<double?> WindDirection10m { get; set; } = new();

        [JsonPropertyName("precipitation")]
        public List<double?> Precipitation { get; set; } = new();
    }
}
