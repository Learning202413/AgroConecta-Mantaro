namespace AgroConectaMantaro.Application.DTOs;

public class RouteOptimizationRequestDto
{
    public int TransportVehicleId { get; set; }
    public List<int> SelectedLotIds { get; set; } = new();
}

public class RouteStopDto
{
    public int Id { get; set; }
    public int StopOrder { get; set; }
    public string TownName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal WeightToCollectKg { get; set; }
    public bool IsCollected { get; set; }
}

public class ConsolidatedRouteDto
{
    public int Id { get; set; }
    public int TransportVehicleId { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public decimal TotalWeightKg { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public List<RouteStopDto> Stops { get; set; } = new();
    public List<HarvestLotDto> Lots { get; set; } = new();
}

public class RouteEstimateRequestDto
{
    public int? TransportVehicleId { get; set; }
    public List<int> SelectedLotIds { get; set; } = new();
    public bool? IsRushHour { get; set; }
}

public class RegressionAuditDto
{
    public string Formula { get; set; } = string.Empty;
    public double RSquared { get; set; }
    public double MeanSquaredError { get; set; }
    public double InterceptBeta0 { get; set; }
    public double DistanceBeta1 { get; set; }
    public double WeightBeta2 { get; set; }
    public double RushHourBeta3 { get; set; }
    public int SampleSize { get; set; }
    public string Interpretation { get; set; } = string.Empty;
}

public class RouteEstimateResponseDto
{
    public List<RouteStopDto> OrderedStops { get; set; } = new();
    public string Destination { get; set; } = string.Empty;
    public double DestinationLatitude { get; set; }
    public double DestinationLongitude { get; set; }
    public decimal TotalWeightKg { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public int BaseDrivingMinutes { get; set; }
    public int WeightImpactMinutes { get; set; }
    public int RushHourImpactMinutes { get; set; }
    public int StowageLoadingMinutes { get; set; }
    public bool IsRushHour { get; set; }
    public RegressionAuditDto RegressionAudit { get; set; } = new();
    public List<List<double>>? PolylineCoordinates { get; set; }
}
