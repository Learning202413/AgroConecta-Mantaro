using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;
using AgroConectaMantaro.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgroConectaMantaro.Infrastructure.Repositories;

public class TransportVehicleRepository : ITransportVehicleRepository
{
    private readonly AppDbContext _context;

    public TransportVehicleRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TransportVehicle>> GetAllAsync()
    {
        return await _context.TransportVehicles.ToListAsync();
    }

    public async Task<IEnumerable<TransportVehicle>> GetAvailableAsync()
    {
        return await _context.TransportVehicles
            .Where(v => v.IsAvailable)
            .OrderByDescending(v => v.MaxCapacityKg)
            .ToListAsync();
    }

    public async Task<TransportVehicle?> GetByIdAsync(int id)
    {
        return await _context.TransportVehicles.FindAsync(id);
    }

    public async Task<TransportVehicle> AddAsync(TransportVehicle vehicle)
    {
        _context.TransportVehicles.Add(vehicle);
        await _context.SaveChangesAsync();
        return vehicle;
    }

    public async Task UpdateAsync(TransportVehicle vehicle)
    {
        _context.TransportVehicles.Update(vehicle);
        await _context.SaveChangesAsync();
    }
}
