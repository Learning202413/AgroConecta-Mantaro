using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.Interfaces;
using MantaroFrostAlert.Domain.Entities;
using MantaroFrostAlert.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MantaroFrostAlert.Infrastructure.Repositories;

public class FrostPredictionRepository : IFrostPredictionRepository
{
    private readonly AppDbContext _context;

    public FrostPredictionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<FrostPredictionRecord> AddAsync(FrostPredictionRecord record, CancellationToken ct = default)
    {
        await _context.FrostPredictions.AddAsync(record, ct);
        await _context.SaveChangesAsync(ct);
        return record;
    }

    public async Task<IReadOnlyList<FrostPredictionRecord>> GetAllAsync(CancellationToken ct = default)
    {
        return await _context.FrostPredictions
            .OrderByDescending(p => p.CreatedAt)
            .AsNoTracking()
            .ToListAsync(ct);
    }

    public async Task<FrostPredictionRecord?> GetByIdAsync(int id, CancellationToken ct = default)
    {
        return await _context.FrostPredictions
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id, ct);
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken ct = default)
    {
        var entity = await _context.FrostPredictions.FindAsync(new object[] { id }, ct);
        if (entity == null)
            return false;

        _context.FrostPredictions.Remove(entity);
        await _context.SaveChangesAsync(ct);
        return true;
    }
}
