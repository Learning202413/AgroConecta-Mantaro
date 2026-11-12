using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Domain.Entities;

namespace MantaroFrostAlert.Application.Interfaces;

public interface IFrostPredictionRepository
{
    Task<FrostPredictionRecord> AddAsync(FrostPredictionRecord record, CancellationToken ct = default);
    Task<IReadOnlyList<FrostPredictionRecord>> GetAllAsync(CancellationToken ct = default);
    Task<FrostPredictionRecord?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
}
