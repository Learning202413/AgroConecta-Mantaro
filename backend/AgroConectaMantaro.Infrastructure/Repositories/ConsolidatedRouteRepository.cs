using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;
using AgroConectaMantaro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroConectaMantaro.Infrastructure.Repositories;

public class ConsolidatedRouteRepository : IConsolidatedRouteRepository
{
    private readonly AppDbContext _context;

    public ConsolidatedRouteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ConsolidatedRoute>> GetAllAsync()
    {
        return await _context.ConsolidatedRoutes
            .Include(r => r.TransportVehicle)
            .Include(r => r.Stops)
            .Include(r => r.Lots)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<ConsolidatedRoute?> GetByIdAsync(int id)
    {
        return await _context.ConsolidatedRoutes
            .Include(r => r.TransportVehicle)
            .Include(r => r.Stops)
            .Include(r => r.Lots)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<ConsolidatedRoute> AddAsync(ConsolidatedRoute route)
    {
        _context.ConsolidatedRoutes.Add(route);
        await _context.SaveChangesAsync();
        return route;
    }

    public async Task UpdateAsync(ConsolidatedRoute route)
    {
        _context.ConsolidatedRoutes.Update(route);
        await _context.SaveChangesAsync();
    }
}
