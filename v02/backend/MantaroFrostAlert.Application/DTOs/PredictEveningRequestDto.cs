using System;
using System.ComponentModel.DataAnnotations;

namespace MantaroFrostAlert.Application.DTOs;

/// <summary>
/// Input DTO for evening frost prediction at 18:00 local time.
/// </summary>
public class PredictEveningRequestDto
{
    [Required]
    [Range(-20.0, 40.0)]
    public double AirTemp18 { get; set; }

    [Required]
    [Range(0.0, 100.0)]
    public double RelativeHumidity18 { get; set; }

    [Range(500.0, 1100.0)]
    public double? Pressure18 { get; set; }

    [Range(0.0, 50.0)]
    public double? WindSpeed18 { get; set; }

    [Range(0.0, 360.0)]
    public double? WindDirection18 { get; set; }

    [Range(-20.0, 35.0)]
    public double? MinTempToday { get; set; }

    [Range(-20.0, 35.0)]
    public double? MinTempRoll3 { get; set; }

    [Range(-20.0, 40.0)]
    public double? AirTemp17 { get; set; }

    [Range(0.0, 100.0)]
    public double? RelativeHumidity17 { get; set; }

    [Range(0.0, 50.0)]
    public double? MeanWindSpeed15To18 { get; set; }

    [Range(0.0, 200.0)]
    public double? RainfallAfternoon { get; set; }

    [Range(0.0, 300.0)]
    public double? Rainfall24h { get; set; }

    public string? Date { get; set; }

    public string? Notes { get; set; }
}
