using AgroConectaMantaro.Application.DTOs;

namespace AgroConectaMantaro.Application.Interfaces;

public class TravelTimePredictionResult
{
    public int EstimatedTotalMinutes { get; set; }
    public int BaseDrivingMinutes { get; set; }
    public int WeightImpactMinutes { get; set; }
    public int RushHourImpactMinutes { get; set; }
    public int StowageLoadingMinutes { get; set; }
    public RegressionAuditDto Audit { get; set; } = new();
}

public interface ITravelTimePredictor
{
    TravelTimePredictionResult PredictTravelTime(double distanceKm, decimal weightKg, bool isRushHour, int numberOfStops = 1);
    RegressionAuditDto GetRegressionAudit();
}
