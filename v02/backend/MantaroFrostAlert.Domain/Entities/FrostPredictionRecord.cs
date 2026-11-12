using System;

namespace MantaroFrostAlert.Domain.Entities;

/// <summary>
/// Domain entity representing a recorded evening frost prediction event in the Mantaro Valley.
/// </summary>
public class FrostPredictionRecord
{
    public int Id { get; set; }

    /// <summary>
    /// Cutoff date for evening observation (e.g., YYYY-MM-DD).
    /// </summary>
    public string CutoffDate { get; set; } = string.Empty;

    /// <summary>
    /// Target morning date for minimum temperature prediction.
    /// </summary>
    public string TargetDate { get; set; } = string.Empty;

    /// <summary>
    /// Air temperature at 18:00 in degrees Celsius (TT_18).
    /// </summary>
    public double AirTemp18 { get; set; }

    /// <summary>
    /// Relative humidity at 18:00 in percentage (HR_18).
    /// </summary>
    public double RelativeHumidity18 { get; set; }

    /// <summary>
    /// Atmospheric pressure at 18:00 in hPa (PP_18).
    /// </summary>
    public double? Pressure18 { get; set; }

    /// <summary>
    /// Wind speed at 18:00 in m/s (FF_18).
    /// </summary>
    public double? WindSpeed18 { get; set; }

    /// <summary>
    /// Wind direction at 18:00 in degrees (DD_18).
    /// </summary>
    public double? WindDirection18 { get; set; }

    /// <summary>
    /// Minimum temperature recorded earlier today in degrees Celsius.
    /// </summary>
    public double? MinTempToday { get; set; }

    /// <summary>
    /// Final predicted minimum temperature for dawn (T_min) in degrees Celsius.
    /// </summary>
    public double PredictedTmin { get; set; }

    /// <summary>
    /// Linear physics base model contribution (Ridge regressor).
    /// </summary>
    public double BaseRidge { get; set; }

    /// <summary>
    /// Non-linear microclimate residual contribution (Random Forest regressor).
    /// </summary>
    public double ResidualRf { get; set; }

    /// <summary>
    /// Operational alert classification: RED (&lt;= 1.0 C), YELLOW (&lt;= 2.0 C), GREEN (&gt; 2.0 C).
    /// </summary>
    public string AlertLevel { get; set; } = "GREEN";

    /// <summary>
    /// Agro-ecological coverage zone summary.
    /// </summary>
    public string? Coverage { get; set; }

    /// <summary>
    /// Optional context or simulation notes.
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// UTC timestamp of record creation.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
