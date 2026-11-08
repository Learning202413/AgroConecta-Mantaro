using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Services;

public class TransportVehicleService : ITransportVehicleService
{
    private readonly ITransportVehicleRepository _repository;

    public TransportVehicleService(ITransportVehicleRepository repository)
    {
        _repository = repository;
    }

    public async Task<IEnumerable<TransportVehicleDto>> GetAllAsync()
    {
        var vehicles = await _repository.GetAllAsync();
        return vehicles.Select(MapToDto);
    }

    public async Task<IEnumerable<TransportVehicleDto>> GetAvailableAsync()
    {
        var vehicles = await _repository.GetAvailableAsync();
        return vehicles.Select(MapToDto);
    }

    public async Task<TransportVehicleDto> CreateAsync(CreateTransportVehicleDto dto)
    {
        var entity = new TransportVehicle
        {
            DriverName = dto.DriverName,
            LicensePlate = dto.LicensePlate,
            Phone = dto.Phone,
            MaxCapacityKg = dto.MaxCapacityKg,
            CurrentLoadKg = 0,
            IsAvailable = true,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _repository.AddAsync(entity);
        return MapToDto(created);
    }

    private static TransportVehicleDto MapToDto(TransportVehicle v) => new()
    {
        Id = v.Id,
        DriverName = v.DriverName,
        LicensePlate = v.LicensePlate,
        Phone = v.Phone,
        MaxCapacityKg = v.MaxCapacityKg,
        CurrentLoadKg = v.CurrentLoadKg,
        IsAvailable = v.IsAvailable
    };
}
