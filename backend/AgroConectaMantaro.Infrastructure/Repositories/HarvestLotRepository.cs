using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;
using AgroConectaMantaro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroConectaMantaro.Infrastructure.Repositories;

public class HarvestLotRepository : IHarvestLotRepository
{
    private readonly AppDbContext _context;

    public HarvestLotRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<HarvestLot>> GetAllAsync()
    {
        return await _context.HarvestLots.OrderByDescending(l => l.CreatedAt).ToListAsync();
    }

    public async Task<IEnumerable<HarvestLot>> GetAvailableAsync()
    {
        return await _context.HarvestLots
            .Where(l => l.Status == "Available")
            .OrderBy(l => l.TownName)
            .ToListAsync();
    }

    public async Task<HarvestLot?> GetByIdAsync(int id)
    {
        return await _context.HarvestLots.FindAsync(id);
    }

    public async Task<HarvestLot> AddAsync(HarvestLot lot)
    {
        _context.HarvestLots.Add(lot);
        await _context.SaveChangesAsync();
        return lot;
    }

    public async Task UpdateAsync(HarvestLot lot)
    {
        _context.HarvestLots.Update(lot);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(int id)
    {
        var lot = await _context.HarvestLots.FindAsync(id);
        if (lot != null)
        {
            _context.HarvestLots.Remove(lot);
            await _context.SaveChangesAsync();
        }
    }
}
