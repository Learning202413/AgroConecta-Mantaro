using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Services;

public class RouteOptimizationService : IRouteOptimizationService
{
    private readonly IConsolidatedRouteRepository _routeRepo;
    private readonly IHarvestLotRepository _lotRepo;
    private readonly ITransportVehicleRepository _vehicleRepo;
    private readonly ITravelTimePredictor _travelTimePredictor;

    // Coordenadas oficiales del Gran Mercado Mayorista de Huancayo (Sector Puquio / El Tambo)
    private const double DestinationLat = -12.0682;
    private const double DestinationLng = -75.2100;
    private const string DestinationName = "Gran Mercado Mayorista de Huancayo";

    public RouteOptimizationService(
        IConsolidatedRouteRepository routeRepo,
        IHarvestLotRepository lotRepo,
        ITransportVehicleRepository vehicleRepo,
        ITravelTimePredictor? travelTimePredictor = null)
    {
        _routeRepo = routeRepo;
        _lotRepo = lotRepo;
        _vehicleRepo = vehicleRepo;
        _travelTimePredictor = travelTimePredictor ?? new WhiteBoxTravelTimePredictor();
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

    /// <summary>
    /// Simulates and estimates the optimal pickup route, stop sequence, and travel time
    /// using White-Box Multiple Linear Regression (OLS) without persisting changes to DB.
    /// </summary>
    public async Task<RouteEstimateResponseDto> EstimateOptimalRouteAsync(RouteEstimateRequestDto request)
    {
        if (request.SelectedLotIds == null || !request.SelectedLotIds.Any())
        {
            throw new InvalidOperationException("No se han seleccionado lotes de cosecha para la estimación de ruta.");
        }

        var allLots = await _lotRepo.GetAllAsync();
        var selectedLots = allLots.Where(l => request.SelectedLotIds.Contains(l.Id)).ToList();

        if (!selectedLots.Any())
        {
            throw new InvalidOperationException("Ninguno de los lotes seleccionados fue encontrado en el sistema.");
        }

        // Validate vehicle capacity if vehicle ID provided
        if (request.TransportVehicleId.HasValue && request.TransportVehicleId.Value > 0)
        {
            var vehicle = await _vehicleRepo.GetByIdAsync(request.TransportVehicleId.Value);
            if (vehicle != null)
            {
                decimal currentTotalWeight = selectedLots.Sum(l => l.WeightKg);
                if (currentTotalWeight > vehicle.MaxCapacityKg)
                {
                    throw new InvalidOperationException($"El peso total ({currentTotalWeight:N0} kg) excede la capacidad máxima del camión ({vehicle.MaxCapacityKg:N0} kg).");
                }
            }
        }

        // Compute optimal pickup sequence to minimize total road distance to Huancayo Wholesale Market
        var orderedLots = ComputeOptimalPickupSequence(selectedLots);

        // Calculate total road distance along the sequence
        double totalDistanceKm = CalculateTotalRouteDistanceKm(orderedLots);
        decimal totalWeightKg = orderedLots.Sum(l => l.WeightKg);

        // Determine rush hour status (Peru local time UTC-5 if not explicitly requested)
        bool isRush = request.IsRushHour ?? IsPeruRushHour();

        // Predict travel time using White-Box Multiple Linear Regression
        var prediction = _travelTimePredictor.PredictTravelTime(
            totalDistanceKm,
            totalWeightKg,
            isRush,
            numberOfStops: orderedLots.Count
        );

        int order = 1;
        var orderedStops = orderedLots.Select(lot => new RouteStopDto
        {
            Id = lot.Id,
            StopOrder = order++,
            TownName = lot.TownName,
            Latitude = lot.Latitude,
            Longitude = lot.Longitude,
            WeightToCollectKg = lot.WeightKg,
            IsCollected = false
        }).ToList();

        return new RouteEstimateResponseDto
        {
            OrderedStops = orderedStops,
            Destination = DestinationName,
            DestinationLatitude = DestinationLat,
            DestinationLongitude = DestinationLng,
            TotalWeightKg = totalWeightKg,
            TotalDistanceKm = (decimal)Math.Round(totalDistanceKm, 2),
            EstimatedDurationMinutes = prediction.EstimatedTotalMinutes,
            BaseDrivingMinutes = prediction.BaseDrivingMinutes,
            WeightImpactMinutes = prediction.WeightImpactMinutes,
            RushHourImpactMinutes = prediction.RushHourImpactMinutes,
            StowageLoadingMinutes = prediction.StowageLoadingMinutes,
            IsRushHour = isRush,
            RegressionAudit = prediction.Audit
        };
    }

    /// <summary>
    /// Optimizes stop sequence, calculates ML travel time, and commits the consolidated route to DB.
    /// </summary>
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

        // Multi-stop Traveling Salesperson optimization ending at Huancayo Wholesale Market
        var orderedLots = ComputeOptimalPickupSequence(selectedLots);
        double totalDistance = CalculateTotalRouteDistanceKm(orderedLots);
        bool isRush = IsPeruRushHour();

        var prediction = _travelTimePredictor.PredictTravelTime(
            totalDistance,
            totalWeight,
            isRush,
            numberOfStops: orderedLots.Count
        );

        int order = 1;
        var orderedStops = orderedLots.Select(l => new RouteStop
        {
            StopOrder = order++,
            TownName = l.TownName,
            Latitude = l.Latitude,
            Longitude = l.Longitude,
            WeightToCollectKg = l.WeightKg,
            IsCollected = false
        }).ToList();

        var consolidatedRoute = new ConsolidatedRoute
        {
            TransportVehicleId = vehicle.Id,
            Destination = DestinationName,
            TotalWeightKg = totalWeight,
            TotalDistanceKm = (decimal)Math.Round(totalDistance, 2),
            EstimatedDurationMinutes = prediction.EstimatedTotalMinutes,
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

    /// <summary>
    /// Solves Multi-Stop Traveling Salesperson ordering ending at Huancayo Wholesale Market.
    /// Prioritizes starting at the furthest plot from Huancayo to avoid backtracking along the Mantaro Valley.
    /// Evaluates optimal path for N <= 7 via exhaustive permutation, and Nearest Neighbor for N > 7.
    /// </summary>
    private static List<HarvestLot> ComputeOptimalPickupSequence(List<HarvestLot> lots)
    {
        if (lots.Count <= 1) return new List<HarvestLot>(lots);

        if (lots.Count <= 7)
        {
            // Evaluate all permutations of stops ending at Destination
            var permutations = GetPermutations(lots, lots.Count).ToList();
            List<HarvestLot>? bestSequence = null;
            double minTotalDistance = double.MaxValue;

            // Find the maximum distance from destination to identify natural furthest starting plots
            double maxDistToDest = lots.Max(l => CalculateDistanceKm(l.Latitude, l.Longitude, DestinationLat, DestinationLng));

            foreach (var perm in permutations)
            {
                var candidate = perm.ToList();
                double dist = CalculateTotalRouteDistanceKm(candidate);

                // Give slight preference to starting at the plot furthest from Huancayo to enforce natural inbound logistics
                double startDistToDest = CalculateDistanceKm(candidate[0].Latitude, candidate[0].Longitude, DestinationLat, DestinationLng);
                bool startsAtFurthest = Math.Abs(startDistToDest - maxDistToDest) < 0.1;

                if (dist < minTotalDistance - 0.01 || (Math.Abs(dist - minTotalDistance) < 0.05 && startsAtFurthest))
                {
                    minTotalDistance = dist;
                    bestSequence = candidate;
                }
            }

            if (bestSequence != null) return bestSequence;
        }

        // Greedy Nearest-Neighbor Fallback for larger sets
        var unvisited = new List<HarvestLot>(lots);
        var ordered = new List<HarvestLot>();

        // Start from furthest plot from Huancayo
        var current = unvisited.OrderByDescending(l => CalculateDistanceKm(l.Latitude, l.Longitude, DestinationLat, DestinationLng)).First();
        unvisited.Remove(current);
        ordered.Add(current);

        while (unvisited.Count > 0)
        {
            var next = unvisited.OrderBy(l => CalculateDistanceKm(current.Latitude, current.Longitude, l.Latitude, l.Longitude)).First();
            unvisited.Remove(next);
            ordered.Add(next);
            current = next;
        }

        return ordered;
    }

    private static double CalculateTotalRouteDistanceKm(List<HarvestLot> orderedLots)
    {
        if (!orderedLots.Any()) return 0;

        double distance = 0;
        for (int i = 0; i < orderedLots.Count - 1; i++)
        {
            distance += CalculateDistanceKm(orderedLots[i].Latitude, orderedLots[i].Longitude,
                                             orderedLots[i + 1].Latitude, orderedLots[i + 1].Longitude);
        }

        // Leg from last stop to final wholesale market
        var lastStop = orderedLots.Last();
        distance += CalculateDistanceKm(lastStop.Latitude, lastStop.Longitude, DestinationLat, DestinationLng);

        return distance;
    }

    /// <summary>
    /// Haversine road-adjusted distance calculation in kilometers.
    /// Incorporates a 1.25 winding/tortuosity factor characteristic of Andean valleys.
    /// </summary>
    private static double CalculateDistanceKm(double lat1, double lon1, double lat2, double lon2)
    {
        const double r = 6371.0; // Earth radius in km
        const double roadTortuosityFactor = 1.25;

        var dLat = (lat2 - lat1) * Math.PI / 180.0;
        var dLon = (lon2 - lon1) * Math.PI / 180.0;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) * Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        return r * c * roadTortuosityFactor;
    }

    private static bool IsPeruRushHour()
    {
        // Peru is UTC-5
        var peruTime = DateTime.UtcNow.AddHours(-5);
        int hour = peruTime.Hour;
        return (hour >= 6 && hour < 9) || (hour >= 17 && hour < 20);
    }

    private static IEnumerable<IEnumerable<T>> GetPermutations<T>(IEnumerable<T> list, int length)
    {
        if (length == 1) return list.Select(t => new T[] { t });
        return GetPermutations(list, length - 1)
            .SelectMany(t => list.Where(e => !t.Contains(e)),
                (t1, t2) => t1.Concat(new T[] { t2 }));
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
