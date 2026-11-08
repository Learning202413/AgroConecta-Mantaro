using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Interfaces;

public interface ITransportVehicleRepository
{
    Task<IEnumerable<TransportVehicle>> GetAllAsync();
    Task<IEnumerable<TransportVehicle>> GetAvailableAsync();
    Task<TransportVehicle?> GetByIdAsync(int id);
    Task<TransportVehicle> AddAsync(TransportVehicle vehicle);
    Task UpdateAsync(TransportVehicle vehicle);
}
