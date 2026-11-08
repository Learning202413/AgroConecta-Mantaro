using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Application.Services;
using AgroConectaMantaro.Domain.Entities;
using Moq;
using Xunit;

namespace AgroConectaMantaro.Tests;

public class RouteOptimizationServiceTests
{
    private readonly Mock<IConsolidatedRouteRepository> _routeRepoMock;
    private readonly Mock<IHarvestLotRepository> _lotRepoMock;
    private readonly Mock<ITransportVehicleRepository> _vehicleRepoMock;
    private readonly RouteOptimizationService _service;

    public RouteOptimizationServiceTests()
    {
        _routeRepoMock = new Mock<IConsolidatedRouteRepository>();
        _lotRepoMock = new Mock<IHarvestLotRepository>();
        _vehicleRepoMock = new Mock<ITransportVehicleRepository>();

        _service = new RouteOptimizationService(
            _routeRepoMock.Object,
            _lotRepoMock.Object,
            _vehicleRepoMock.Object
        );
    }

    [Fact]
    public async Task OptimizeAndCreateRouteAsync_ThrowsException_WhenPayloadExceedsTruckCapacity()
    {
        // Arrange (Donald Norman Constraint: Overweight prevention)
        var vehicle = new TransportVehicle
        {
            Id = 1,
            DriverName = "Carlos Quispe",
            LicensePlate = "W2A-841",
            MaxCapacityKg = 4000,
            CurrentLoadKg = 0,
            IsAvailable = true
        };

        var heavyLots = new List<HarvestLot>
        {
            new() { Id = 1, ProducerName = "Eusebio Poma", WeightKg = 2500, Status = "Available", Latitude = -12.0625, Longitude = -75.2878, TownName = "Chupaca" },
            new() { Id = 2, ProducerName = "Raúl Lazo", WeightKg = 2000, Status = "Available", Latitude = -12.0150, Longitude = -75.2500, TownName = "Sicaya" }
        };

        _vehicleRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vehicle);
        _lotRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(heavyLots);

        var request = new RouteOptimizationRequestDto
        {
            TransportVehicleId = 1,
            SelectedLotIds = new List<int> { 1, 2 } // Total: 4,500 kg > 4,000 kg capacity
        };

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() => _service.OptimizeAndCreateRouteAsync(request));
        Assert.Contains("exceeds vehicle max capacity", ex.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task OptimizeAndCreateRouteAsync_OrdersStopsStartingFromFurthestPlotTowardsHuancayo()
    {
        // Arrange
        var vehicle = new TransportVehicle
        {
            Id = 1,
            DriverName = "Carlos Quispe",
            LicensePlate = "W2A-841",
            MaxCapacityKg = 5000,
            CurrentLoadKg = 0,
            IsAvailable = true
        };

        // Jauja is ~45km from Huancayo, Sicaya is ~12km, Chupaca is ~9km
        var lots = new List<HarvestLot>
        {
            new() { Id = 1, ProducerName = "Productor Chupaca", WeightKg = 1000, Status = "Available", Latitude = -12.0625, Longitude = -75.2878, TownName = "Chupaca" },
            new() { Id = 2, ProducerName = "Productor Jauja", WeightKg = 1200, Status = "Available", Latitude = -11.7750, Longitude = -75.5000, TownName = "Jauja" },
            new() { Id = 3, ProducerName = "Productor Sicaya", WeightKg = 800, Status = "Available", Latitude = -12.0150, Longitude = -75.2500, TownName = "Sicaya" }
        };

        _vehicleRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vehicle);
        _lotRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(lots);

        _routeRepoMock.Setup(r => r.AddAsync(It.IsAny<ConsolidatedRoute>()))
            .ReturnsAsync((ConsolidatedRoute cr) =>
            {
                cr.Id = 101;
                return cr;
            });

        var request = new RouteOptimizationRequestDto
        {
            TransportVehicleId = 1,
            SelectedLotIds = new List<int> { 1, 2, 3 }
        };

        // Act
        var result = await _service.OptimizeAndCreateRouteAsync(request);

        // Assert: Stop #1 must be Jauja (furthest from Huancayo wholesale market)
        Assert.NotNull(result);
        Assert.Equal(3, result.Stops.Count);
        Assert.Equal("Jauja", result.Stops[0].TownName);
        Assert.Equal(3000, result.TotalWeightKg);
    }

    [Fact]
    public async Task CompleteStopAsync_TransitionsAllLotsToDelivered_WhenAllStopsCompleted()
    {
        // Arrange (Shneiderman Closure / Traceability lifecycle)
        var vehicle = new TransportVehicle { Id = 1, MaxCapacityKg = 4000, CurrentLoadKg = 2000, IsAvailable = false };
        var lot1 = new HarvestLot { Id = 1, Status = "Assigned", WeightKg = 1000 };
        var lot2 = new HarvestLot { Id = 2, Status = "Assigned", WeightKg = 1000 };

        var route = new ConsolidatedRoute
        {
            Id = 55,
            Status = "InTransit",
            TransportVehicle = vehicle,
            Lots = new List<HarvestLot> { lot1, lot2 },
            Stops = new List<RouteStop>
            {
                new() { Id = 10, StopOrder = 1, IsCollected = true, WeightToCollectKg = 1000 },
                new() { Id = 20, StopOrder = 2, IsCollected = false, WeightToCollectKg = 1000 }
            }
        };

        _routeRepoMock.Setup(r => r.GetByIdAsync(55)).ReturnsAsync(route);

        // Act: Completing the second (and final) stop
        var result = await _service.CompleteStopAsync(55, 20);

        // Assert
        Assert.True(result);
        Assert.Equal("Completed", route.Status);
        Assert.True(vehicle.IsAvailable);
        Assert.Equal(0, vehicle.CurrentLoadKg);
        Assert.Equal("Delivered", lot1.Status);
        Assert.Equal("Delivered", lot2.Status);
    }

    [Fact]
    public async Task OptimizeAndCreateRouteAsync_ThrowsException_WhenNoAvailableLotsSelected()
    {
        // Arrange (Nielsen H5: Error prevention)
        var vehicle = new TransportVehicle { Id = 1, MaxCapacityKg = 4000 };
        _vehicleRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vehicle);
        _lotRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<HarvestLot>());

        var request = new RouteOptimizationRequestDto
        {
            TransportVehicleId = 1,
            SelectedLotIds = new List<int> { 99 }
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.OptimizeAndCreateRouteAsync(request));
    }
}
