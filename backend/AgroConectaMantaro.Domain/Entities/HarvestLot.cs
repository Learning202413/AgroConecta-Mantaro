namespace AgroConectaMantaro.Domain.Entities;

public class HarvestLot
{
    public int Id { get; set; }
    public string ProducerName { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string CropType { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public decimal EstimatedPricePerKg { get; set; }
    public string TownName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Status { get; set; } = "Available"; // Available, Assigned, InTransit, Delivered
    public DateTime HarvestDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? ConsolidatedRouteId { get; set; }
    public ConsolidatedRoute? ConsolidatedRoute { get; set; }
}
