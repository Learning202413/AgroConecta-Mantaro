namespace AgroConectaMantaro.Application.DTOs;

public class CreateHarvestLotDto
{
    public string ProducerName { get; set; } = string.Empty;
    public string ContactPhone { get; set; } = string.Empty;
    public string CropType { get; set; } = string.Empty;
    public decimal WeightKg { get; set; }
    public decimal EstimatedPricePerKg { get; set; }
    public string TownName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}

public class HarvestLotDto
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
    public string Status { get; set; } = string.Empty;
    public DateTime HarvestDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? ConsolidatedRouteId { get; set; }
}
