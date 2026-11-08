namespace AgroConectaMantaro.Domain.Entities;

public class RouteStop
{
    public int Id { get; set; }
    public int ConsolidatedRouteId { get; set; }
    public ConsolidatedRoute? ConsolidatedRoute { get; set; }
    public int StopOrder { get; set; }
    public string TownName { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public decimal WeightToCollectKg { get; set; }
    public bool IsCollected { get; set; } = false;
}
