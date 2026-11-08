using AgroConectaMantaro.Application.DTOs;

namespace AgroConectaMantaro.Application.Interfaces;

public interface IMarketPriceService
{
    Task<IEnumerable<MarketPriceDto>> GetAllPricesAsync();
    Task<IEnumerable<MarketPriceDto>> GetPricesByCropAsync(string cropType);
    Task<decimal> GetSuggestedPriceAsync(string cropType);
}
