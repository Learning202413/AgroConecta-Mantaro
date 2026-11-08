namespace AgroConectaMantaro.Domain.Entities;

public class MarketPrice
{
    public int Id { get; set; }
    public string CropType { get; set; } = string.Empty;
    public string MarketName { get; set; } = "Mercado Mayorista de Huancayo";
    public decimal MinPrice { get; set; }
    public decimal MaxPrice { get; set; }
    public decimal AveragePrice { get; set; }
    public DateTime RecordDate { get; set; } = DateTime.UtcNow;
}
