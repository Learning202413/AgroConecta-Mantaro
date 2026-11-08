namespace AgroConectaMantaro.Application.DTOs;

public class MarketPriceDto
{
    public int Id { get; set; }
    public string CropType { get; set; } = string.Empty;
    public string MarketName { get; set; } = string.Empty;
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public decimal AveragePrice { get; set; }
    public DateTime RecordDate { get; set; }
}
