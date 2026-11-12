using System;
using System.Collections.Generic;

namespace MantaroFrostAlert.Application.DTOs;

/// <summary>
/// Output DTO returned after computing or retrieving an evening frost prediction.
/// </summary>
public class PredictionResponseDto
{
    public int? Id { get; set; }
    public string CutoffDate { get; set; } = string.Empty;
    public string TargetDate { get; set; } = string.Empty;
    public double PredictedTminC { get; set; }
    public double BaseRidgeC { get; set; }
    public double ResidualRfC { get; set; }
    public string AlertLevel { get; set; } = "GREEN";
    public Dictionary<string, double>? ThresholdsC { get; set; }
    public List<string> Coverage { get; set; } = new();
    public List<string> AgronomicRecommendations { get; set; } = new();
    public DateTime? CreatedAt { get; set; }
}
