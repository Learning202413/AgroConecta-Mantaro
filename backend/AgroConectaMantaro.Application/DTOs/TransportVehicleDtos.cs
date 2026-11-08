namespace AgroConectaMantaro.Application.DTOs;

public class CreateTransportVehicleDto
{
    public string DriverName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal MaxCapacityKg { get; set; }
}

public class TransportVehicleDto
{
    public int Id { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public decimal MaxCapacityKg { get; set; }
    public decimal CurrentLoadKg { get; set; }
    public bool IsAvailable { get; set; }
}
