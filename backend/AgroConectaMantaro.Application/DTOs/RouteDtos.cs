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
