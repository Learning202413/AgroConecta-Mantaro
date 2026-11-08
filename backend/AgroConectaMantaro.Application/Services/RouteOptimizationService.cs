using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Services;

public class RouteOptimizationService : IRouteOptimizationService
{
    private readonly IConsolidatedRouteRepository _routeRepo;
    private readonly IHarvestLotRepository _lotRepo;
    private readonly ITransportVehicleRepository _vehicleRepo;

    // Coordenadas oficiales del Gran Mercado Mayorista de Huancayo (Puquio / El Tambo)
    private const double DestinationLat = -12.0682;
    private const double DestinationLng = -75.2100;

    public RouteOptimizationService(
        IConsolidatedRouteRepository routeRepo,
        IHarvestLotRepository lotRepo,
        ITransportVehicleRepository vehicleRepo)
    {
        _routeRepo = routeRepo;
        _lotRepo = lotRepo;
        _vehicleRepo = vehicleRepo;
    }

    public async Task<IEnumerable<ConsolidatedRouteDto>> GetAllRoutesAsync()
    {
        var routes = await _routeRepo.GetAllAsync();
        return routes.Select(MapToDto);
    }

    public async Task<ConsolidatedRouteDto?> GetRouteByIdAsync(int id)
    {
        var route = await _routeRepo.GetByIdAsync(id);
        return route == null ? null : MapToDto(route);
    }

    public async Task<ConsolidatedRouteDto> OptimizeAndCreateRouteAsync(RouteOptimizationRequestDto request)
    {
        var vehicle = await _vehicleRepo.GetByIdAsync(request.TransportVehicleId)
            ?? throw new InvalidOperationException($"Vehicle with ID {request.TransportVehicleId} not found.");

        var allLots = await _lotRepo.GetAllAsync();
        var selectedLots = allLots.Where(l => request.SelectedLotIds.Contains(l.Id) && l.Status == "Available").ToList();

        if (!selectedLots.Any())
        {
            throw new InvalidOperationException("No available harvest lots selected for routing.");
        }

        decimal totalWeight = selectedLots.Sum(l => l.WeightKg);
        if (totalWeight > vehicle.MaxCapacityKg)
        {
            throw new InvalidOperationException($"Total weight ({totalWeight} kg) exceeds vehicle max capacity ({vehicle.MaxCapacityKg} kg).");
        }

        // Nearest-neighbor heuristic ordering towards Huancayo Mayorista
        var unvisited = new List<HarvestLot>(selectedLots);
        var orderedStops = new List<RouteStop>();
        
        // Start from the lot furthest from Huancayo, picking up towards destination
        var current = unvisited.OrderByDescending(l => CalculateDistanceKm(l.Latitude, l.Longitude, DestinationLat, DestinationLng)).First();
        unvisited.Remove(current);

        int order = 1;
        orderedStops.Add(new RouteStop
        {
            StopOrder = order++,
            TownName = current.TownName,
            Latitude = current.Latitude,
            Longitude = current.Longitude,
            WeightToCollectKg = current.WeightKg,
            IsCollected = false
        });

        double totalDistance = 0;
        double lastLat = current.Latitude;
        double lastLng = current.Longitude;

        while (unvisited.Count > 0)
        {
            var next = unvisited.OrderBy(l => CalculateDistanceKm(lastLat, lastLng, l.Latitude, l.Longitude)).First();
            unvisited.Remove(next);

            totalDistance += CalculateDistanceKm(lastLat, lastLng, next.Latitude, next.Longitude);
            lastLat = next.Latitude;
            lastLng = next.Longitude;

            orderedStops.Add(new RouteStop
            {
                StopOrder = order++,
                TownName = next.TownName,
                Latitude = next.Latitude,
                Longitude = next.Longitude,
                WeightToCollectKg = next.WeightKg,
                IsCollected = false
            });
        }

        // Distance from last stop to final wholesale market
        totalDistance += CalculateDistanceKm(lastLat, lastLng, DestinationLat, DestinationLng);

        // Realistic driving time: 35 km/h avg in Mantaro rural roads + 15 min per pickup
        int estimatedMinutes = (int)Math.Round((totalDistance / 35.0) * 60.0) + (orderedStops.Count * 15);

        var consolidatedRoute = new ConsolidatedRoute
        {
            TransportVehicleId = vehicle.Id,
            Destination = "Mercado Mayorista de Huancayo",
            TotalWeightKg = totalWeight,
            TotalDistanceKm = (decimal)Math.Round(totalDistance, 2),
            EstimatedDurationMinutes = estimatedMinutes,
            Status = "Planned",
            CreatedAt = DateTime.UtcNow,
            Stops = orderedStops
        };

        var createdRoute = await _routeRepo.AddAsync(consolidatedRoute);

        // Update lots
        foreach (var lot in selectedLots)
        {
            lot.Status = "Assigned";
            lot.ConsolidatedRouteId = createdRoute.Id;
            await _lotRepo.UpdateAsync(lot);
        }

        // Update vehicle load
        vehicle.CurrentLoadKg = totalWeight;
        vehicle.IsAvailable = false;
        await _vehicleRepo.UpdateAsync(vehicle);

        createdRoute.TransportVehicle = vehicle;
        createdRoute.Lots = selectedLots;

        return MapToDto(createdRoute);
    }

    public async Task<bool> CompleteStopAsync(int routeId, int stopId)
    {
        var route = await _routeRepo.GetByIdAsync(routeId);
        if (route == null) return false;

        var stop = route.Stops.FirstOrDefault(s => s.Id == stopId);
        if (stop == null) return false;

        stop.IsCollected = true;

        if (route.Stops.All(s => s.IsCollected))
        {
            route.Status = "Completed";
            if (route.TransportVehicle != null)
            {
                route.TransportVehicle.CurrentLoadKg = 0;
                route.TransportVehicle.IsAvailable = true;
                await _vehicleRepo.UpdateAsync(route.TransportVehicle);
            }

            // Close delivery lifecycle for all lots assigned to this route
            if (route.Lots != null)
            {
                foreach (var lot in route.Lots)
                {
                    lot.Status = "Delivered";
                    await _lotRepo.UpdateAsync(lot);
                }
            }
        }
        else
        {
            route.Status = "InTransit";
        }

        await _routeRepo.UpdateAsync(route);
        return true;
    }

    private static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double r = 6371.0; // Earth radius in km
        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return r * c;
    }

    private static ConsolidatedRouteDto MapToDto(ConsolidatedRoute r) => new()
    {
        Id = r.Id,
        TransportVehicleId = r.TransportVehicleId,
        DriverName = r.TransportVehicle?.DriverName ?? "Conductor Asignado",
        LicensePlate = r.TransportVehicle?.LicensePlate ?? string.Empty,
        Destination = r.Destination,
        TotalWeightKg = r.TotalWeightKg,
        TotalDistanceKm = r.TotalDistanceKm,
        EstimatedDurationMinutes = r.EstimatedDurationMinutes,
        Status = r.Status,
        CreatedAt = r.CreatedAt,
        Stops = r.Stops.Select(s => new RouteStopDto
        {
            Id = s.Id,
            StopOrder = s.StopOrder,
            TownName = s.TownName,
            Latitude = s.Latitude,
            Longitude = s.Longitude,
            WeightToCollectKg = s.WeightToCollectKg,
            IsCollected = s.IsCollected
        }).ToList(),
        Lots = r.Lots.Select(l => new HarvestLotDto
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
        }).ToList()
    };
}
