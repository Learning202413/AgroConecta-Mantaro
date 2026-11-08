namespace AgroConectaMantaro.Domain.Entities;

public class ConsolidatedRoute
{
    public int Id { get; set; }
    public int TransportVehicleId { get; set; }
    public TransportVehicle? TransportVehicle { get; set; }
    public string Destination { get; set; } = "Mercado Mayorista de Huancayo";
    public decimal TotalWeightKg { get; set; }
    public decimal TotalDistanceKm { get; set; }
    public int EstimatedDurationMinutes { get; set; }
    public string Status { get; set; } = "Planned"; // Planned, InTransit, Completed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<RouteStop> Stops { get; set; } = new();
    public List<HarvestLot> Lots { get; set; } = new();
}
