using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Interfaces;

public interface IConsolidatedRouteRepository
{
    Task<IEnumerable<ConsolidatedRoute>> GetAllAsync();
    Task<ConsolidatedRoute?> GetByIdAsync(int id);
    Task<ConsolidatedRoute> AddAsync(ConsolidatedRoute route);
    Task UpdateAsync(ConsolidatedRoute route);
}
