using AgroConectaMantaro.Application.DTOs;

namespace AgroConectaMantaro.Application.Interfaces;

public interface IRouteOptimizationService
{
    Task<IEnumerable<ConsolidatedRouteDto>> GetAllRoutesAsync();
    Task<ConsolidatedRouteDto?> GetRouteByIdAsync(int id);
    Task<ConsolidatedRouteDto> OptimizeAndCreateRouteAsync(RouteOptimizationRequestDto request);
    Task<RouteEstimateResponseDto> EstimateOptimalRouteAsync(RouteEstimateRequestDto request);
    Task<bool> CompleteStopAsync(int routeId, int stopId);
}
