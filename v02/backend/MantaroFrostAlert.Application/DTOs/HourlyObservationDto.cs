namespace MantaroFrostAlert.Application.DTOs;

public class HourlyObservationDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int Day { get; set; }
    public int Hour { get; set; }
    public double AirTemp { get; set; }
    public double RelativeHumidity { get; set; }
    public double? Pressure { get; set; }
    public double? WindSpeed { get; set; }
    public double? WindDirection { get; set; }
    public double? Rainfall { get; set; }
}
