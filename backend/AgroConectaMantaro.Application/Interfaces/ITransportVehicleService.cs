using AgroConectaMantaro.Application.DTOs;

namespace AgroConectaMantaro.Application.Interfaces;

public interface ITransportVehicleService
{
    Task<IEnumerable<TransportVehicleDto>> GetAllAsync();
    Task<IEnumerable<TransportVehicleDto>> GetAvailableAsync();
    Task<TransportVehicleDto> CreateAsync(CreateTransportVehicleDto dto);
}
