using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Services;

public class MarketPriceService : IMarketPriceService
{
    private readonly IMarketPriceRepository _repository;

    public MarketPriceService(IMarketPriceRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<MarketPriceDto>> GetAllPricesAsync()
    {
        var prices = await _repository.GetAllAsync();
        return prices.Select(MapToDto);
    }

    public async Task<IEnumerable<MarketPriceDto>> GetPricesByCropAsync(string cropType)
    {
        var prices = await _repository.GetByCropTypeAsync(cropType);
        return prices.Select(MapToDto);
    }

    public async Task<decimal> GetSuggestedPriceAsync(string cropType)
    {
        var prices = await _repository.GetByCropTypeAsync(cropType);
        var latest = prices.OrderByDescending(p => p.RecordDate).FirstOrDefault();
        return latest?.AveragePrice ?? 2.50m;
    }

    private static MarketPriceDto MapToDto(MarketPrice p) => new()
    {
        Id = p.Id,
        CropType = p.CropType,
        MarketName = p.MarketName,
        MinPrice = p.MinPrice,
        MaxPrice = p.MaxPrice,
        AveragePrice = p.AveragePrice,
        RecordDate = p.RecordDate
    };
}
