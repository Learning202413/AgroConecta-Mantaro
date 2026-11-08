namespace AgroConectaMantaro.Domain.Entities;

public class TransportVehicle
{
    public int Id { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal MaxCapacityKg { get; set; }
    public decimal CurrentLoadKg { get; set; } = 0;
    public bool IsAvailable { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<ConsolidatedRoute> Routes { get; set; } = new();
}
