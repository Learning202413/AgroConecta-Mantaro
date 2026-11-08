using AgroConectaMantaro.Application.DTOs;

namespace AgroConectaMantaro.Application.Interfaces;

public interface IHarvestLotService
{
    Task<IEnumerable<HarvestLotDto>> GetAllAsync();
    Task<IEnumerable<HarvestLotDto>> GetAvailableAsync();
    Task<HarvestLotDto?> GetByIdAsync(int id);
    Task<HarvestLotDto> CreateAsync(CreateHarvestLotDto dto);
    Task<bool> DeleteAsync(int id);
}
