using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Interfaces;

public interface IMarketPriceRepository
{
    Task<IEnumerable<MarketPrice>> GetAllAsync();
    Task<IEnumerable<MarketPrice>> GetByCropTypeAsync(string cropType);
    Task<MarketPrice> AddAsync(MarketPrice price);
}
