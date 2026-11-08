using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;
using AgroConectaMantaro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroConectaMantaro.Infrastructure.Repositories;

public class MarketPriceRepository : IMarketPriceRepository
{
    private readonly AppDbContext _context;

    public MarketPriceRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MarketPrice>> GetAllAsync()
    {
        return await _context.MarketPrices
            .OrderByDescending(p => p.RecordDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<MarketPrice>> GetByCropTypeAsync(string cropType)
    {
        return await _context.MarketPrices
            .Where(p => EF.Functions.ILike(p.CropType, $"%{cropType}%"))
            .OrderByDescending(p => p.RecordDate)
            .ToListAsync();
    }

    public async Task<MarketPrice> AddAsync(MarketPrice price)
    {
        _context.MarketPrices.Add(price);
        await _context.SaveChangesAsync();
        return price;
    }
}
