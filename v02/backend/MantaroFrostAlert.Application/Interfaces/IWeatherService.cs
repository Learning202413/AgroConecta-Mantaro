using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;

namespace MantaroFrostAlert.Application.Interfaces;

public interface IWeatherService
{
    Task<LiveWeatherDto> GetLiveWeatherForZoneAsync(string zoneId, CancellationToken ct = default);
    IReadOnlyList<CorridorZoneDto> GetCorridorZones();
    IReadOnlyList<ExcludedZoneDto> GetExcludedZones();
    ZonesBoundaryResponseDto GetZonesBoundary();
}
