using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Services;

public class HarvestLotService : IHarvestLotService
{
    private readonly IHarvestLotRepository _repository;

    public HarvestLotService(IHarvestLotRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<HarvestLotDto>> GetAllAsync()
    {
        var lots = await _repository.GetAllAsync();
        return lots.Select(MapToDto);
    }

    public async Task<IEnumerable<HarvestLotDto>> GetAvailableAsync()
    {
        var lots = await _repository.GetAvailableAsync();
        return lots.Select(MapToDto);
    }

    public async Task<HarvestLotDto?> GetByIdAsync(int id)
    {
        var lot = await _repository.GetByIdAsync(id);
        return lot == null ? null : MapToDto(lot);
    }

    public async Task<HarvestLotDto> CreateAsync(CreateHarvestLotDto dto)
    {
        var entity = new HarvestLot
        {
            ProducerName = dto.ProducerName,
            ContactPhone = dto.ContactPhone,
            CropType = dto.CropType,
            WeightKg = dto.WeightKg,
            EstimatedPricePerKg = dto.EstimatedPricePerKg,
            TownName = dto.TownName,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            Status = "Available",
            HarvestDate = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var lot = await _repository.GetByIdAsync(id);
        if (lot == null) return false;
        await _repository.DeleteAsync(id);
        return true;
    }

    private static HarvestLotDto MapToDto(HarvestLot l) => new()
    {
        Id = l.Id,
        ProducerName = l.ProducerName,
        ContactPhone = l.ContactPhone,
        CropType = l.CropType,
        WeightKg = l.WeightKg,
        EstimatedPricePerKg = l.EstimatedPricePerKg,
        TownName = l.TownName,
        Latitude = l.Latitude,
        Longitude = l.Longitude,
        Status = l.Status,
        HarvestDate = l.HarvestDate,
        CreatedAt = l.CreatedAt,
        ConsolidatedRouteId = l.ConsolidatedRouteId
    };
}
