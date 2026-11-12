using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;
using MantaroFrostAlert.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace MantaroFrostAlert.Infrastructure.Clients;

public class VpsMlClient : IVpsMlClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<VpsMlClient> _logger;

    public VpsMlClient(HttpClient httpClient, ILogger<VpsMlClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<PredictionResponseDto> PredictAsync(PredictEveningRequestDto request, CancellationToken ct = default)
    {
        var payload = new Dictionary<string, object?>
        {
            ["TT_18"] = request.AirTemp18,
            ["HR_18"] = request.RelativeHumidity18
        };

        if (request.Pressure18.HasValue) payload["PP_18"] = request.Pressure18.Value;
        if (request.WindSpeed18.HasValue) payload["FF_18"] = request.WindSpeed18.Value;
        if (request.WindDirection18.HasValue) payload["DD_18"] = request.WindDirection18.Value;
        if (request.MinTempToday.HasValue) payload["T_min_today"] = request.MinTempToday.Value;
        if (request.MinTempRoll3.HasValue) payload["T_min_roll3"] = request.MinTempRoll3.Value;
        if (request.AirTemp17.HasValue) payload["TT_17"] = request.AirTemp17.Value;
        if (request.RelativeHumidity17.HasValue) payload["HR_17"] = request.RelativeHumidity17.Value;
        if (request.MeanWindSpeed15To18.HasValue) payload["FF_mean_15_18"] = request.MeanWindSpeed15To18.Value;
        if (request.RainfallAfternoon.HasValue) payload["RR_afternoon"] = request.RainfallAfternoon.Value;
        if (request.Rainfall24h.HasValue) payload["RR_24h"] = request.Rainfall24h.Value;
        if (!string.IsNullOrWhiteSpace(request.Date)) payload["date"] = request.Date;

        _logger.LogInformation("Sending prediction request to ML VPS: {BaseAddress}/api/v1/predict", _httpClient.BaseAddress);

        using var response = await _httpClient.PostAsJsonAsync("/api/v1/predict", payload, ct);
        response.EnsureSuccessStatusCode();

        var vpsResult = await response.Content.ReadFromJsonAsync<VpsPredictionResponse>(cancellationToken: ct);
        if (vpsResult == null)
        {
            throw new InvalidOperationException("Failed to deserialize response from ML VPS service.");
        }

        return new PredictionResponseDto
        {
            CutoffDate = vpsResult.CutoffDate,
            TargetDate = vpsResult.TargetDate,
            PredictedTminC = vpsResult.PredictedTminC,
            BaseRidgeC = vpsResult.BaseRidgeC,
            ResidualRfC = vpsResult.ResidualRfC,
            AlertLevel = vpsResult.AlertLevel ?? "GREEN",
            ThresholdsC = vpsResult.ThresholdsC,
            Coverage = vpsResult.Coverage ?? new List<string>()
        };
    }

    public async Task<ModelMetadataDto> GetModelInfoAsync(CancellationToken ct = default)
    {
        using var response = await _httpClient.GetAsync("/api/v1/modelo", ct);
        response.EnsureSuccessStatusCode();

        var result = await response.Content.ReadFromJsonAsync<VpsModelMetadataResponse>(cancellationToken: ct);
        if (result == null)
        {
            throw new InvalidOperationException("Failed to deserialize model metadata from ML VPS service.");
        }

        return new ModelMetadataDto
        {
            ServiceVersion = result.ServiceVersion ?? "2.0.0",
            Architecture = result.Architecture ?? "Ridge + RandomForestRegressor",
            TrainYears = result.TrainYears ?? "2021-2025",
            SklearnVersion = result.SklearnVersion ?? "1.6.1",
            ThresholdsC = result.ThresholdsC ?? new Dictionary<string, double> { { "red", 1.0 }, { "yellow", 2.0 } },
            BaseFeatures = result.BaseFeatures ?? new List<string>(),
            ResidualFeatures = result.ResidualFeatures ?? new List<string>(),
            Coverage = result.Coverage != null ? new CoverageInfoDto
            {
                Region = result.Coverage.Region ?? "Junin - Mantaro Valley",
                ReferenceStation = result.Coverage.ReferenceStation ?? "IGP Huayao Observatory",
                AltitudeRangeM = result.Coverage.AltitudeRangeM ?? new List<int> { 3150, 3450 },
                CoveredCorridor = result.Coverage.CoveredCorridor ?? new List<string> { "Chupaca", "Huancayo", "Concepcion", "Jauja" },
                ExcludedZones = result.Coverage.ExcludedZones ?? new List<string> { "High Puna (>3700m)", "Tarma", "Chanchamayo", "Satipo" }
            } : null
        };
    }

    public async Task<bool> CheckHealthAsync(CancellationToken ct = default)
    {
        try
        {
            using var response = await _httpClient.GetAsync("/health", ct);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "VPS Health check failed.");
            return false;
        }
    }

    private class VpsPredictionResponse
    {
        [JsonPropertyName("cutoff_date")]
        public string CutoffDate { get; set; } = string.Empty;

        [JsonPropertyName("target_date")]
        public string TargetDate { get; set; } = string.Empty;

        [JsonPropertyName("predicted_tmin_c")]
        public double PredictedTminC { get; set; }

        [JsonPropertyName("base_ridge_c")]
        public double BaseRidgeC { get; set; }

        [JsonPropertyName("residual_rf_c")]
        public double ResidualRfC { get; set; }

        [JsonPropertyName("alert_level")]
        public string? AlertLevel { get; set; }

        [JsonPropertyName("thresholds_c")]
        public Dictionary<string, double>? ThresholdsC { get; set; }

        [JsonPropertyName("coverage")]
        public List<string>? Coverage { get; set; }
    }

    private class VpsModelMetadataResponse
    {
        [JsonPropertyName("service_version")]
        public string? ServiceVersion { get; set; }

        [JsonPropertyName("architecture")]
        public string? Architecture { get; set; }

        [JsonPropertyName("train_years")]
        public string? TrainYears { get; set; }

        [JsonPropertyName("sklearn_version")]
        public string? SklearnVersion { get; set; }

        [JsonPropertyName("thresholds_c")]
        public Dictionary<string, double>? ThresholdsC { get; set; }

        [JsonPropertyName("base_features")]
        public List<string>? BaseFeatures { get; set; }

        [JsonPropertyName("residual_features")]
        public List<string>? ResidualFeatures { get; set; }

        [JsonPropertyName("coverage")]
        public VpsCoverageInfo? Coverage { get; set; }
    }

    private class VpsCoverageInfo
    {
        [JsonPropertyName("region")]
        public string? Region { get; set; }

        [JsonPropertyName("reference_station")]
        public string? ReferenceStation { get; set; }

        [JsonPropertyName("altitude_range_m")]
        public List<int>? AltitudeRangeM { get; set; }

        [JsonPropertyName("covered_corridor")]
        public List<string>? CoveredCorridor { get; set; }

        [JsonPropertyName("excluded_zones")]
        public List<string>? ExcludedZones { get; set; }
    }
}
