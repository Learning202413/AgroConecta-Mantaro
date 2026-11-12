using System.Collections.Generic;

namespace MantaroFrostAlert.Application.DTOs;

public class ModelMetadataDto
{
    public string ServiceVersion { get; set; } = string.Empty;
    public string Architecture { get; set; } = string.Empty;
    public string TrainYears { get; set; } = string.Empty;
    public string SklearnVersion { get; set; } = string.Empty;
    public Dictionary<string, double> ThresholdsC { get; set; } = new();
    public List<string> BaseFeatures { get; set; } = new();
    public List<string> ResidualFeatures { get; set; } = new();
    public CoverageInfoDto? Coverage { get; set; }
}

public class CoverageInfoDto
{
    public string Region { get; set; } = string.Empty;
    public string ReferenceStation { get; set; } = string.Empty;
    public List<int> AltitudeRangeM { get; set; } = new();
    public List<string> CoveredCorridor { get; set; } = new();
    public List<string> ExcludedZones { get; set; } = new();
}
