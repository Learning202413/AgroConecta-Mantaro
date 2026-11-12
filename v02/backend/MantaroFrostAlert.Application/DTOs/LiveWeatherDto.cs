using System;

namespace MantaroFrostAlert.Application.DTOs;

public class LiveWeatherDto
{
    public string ZoneId { get; set; } = string.Empty;
    public string ZoneName { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int ElevationM { get; set; }
    public string Date { get; set; } = string.Empty;

    // Model features at 18:00
    public double AirTemp18 { get; set; } // TT_18
    public double RelativeHumidity18 { get; set; } // HR_18
    public double Pressure18 { get; set; } // PP_18
    public double WindSpeed18 { get; set; } // FF_18
    public double WindDirection18 { get; set; } // DD_18

    // Additional engineered features
    public double MinTempToday { get; set; } // T_min_today (00:00 to 07:00)
    public double RainfallAfternoon { get; set; } // RR_afternoon (12:00 to 18:00)
    public double Rainfall24h { get; set; } // RR_24h

    // Operational metadata
    public string TargetHour { get; set; } = "18:00";
    public bool IsBefore18 { get; set; }
    public string CurrentLocalTime { get; set; } = string.Empty;
    public string Notation { get; set; } = string.Empty;
    public string Source { get; set; } = "Open-Meteo API v1 ECMWF/GFS Blend";
    public DateTime FetchedAtUtc { get; set; } = DateTime.UtcNow;
}
