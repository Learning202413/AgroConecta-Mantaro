using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Interfaces;

public interface IHarvestLotRepository
{
    Task<IEnumerable<HarvestLot>> GetAllAsync();
    Task<IEnumerable<HarvestLot>> GetAvailableAsync();
    Task<HarvestLot?> GetByIdAsync(int id);
    Task<HarvestLot> AddAsync(HarvestLot lot);
    Task UpdateAsync(HarvestLot lot);
    Task DeleteAsync(int id);
}
