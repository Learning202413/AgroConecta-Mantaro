using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Application.Services;
using AgroConectaMantaro.Domain.Entities;
using Moq;
using Xunit;

namespace AgroConectaMantaro.Tests;

public class WhiteBoxTravelTimePredictorTests
{
    private readonly WhiteBoxTravelTimePredictor _predictor;

    public WhiteBoxTravelTimePredictorTests()
    {
        _predictor = new WhiteBoxTravelTimePredictor();
    }

    [Fact]
    public void Constructor_FitsOLSModelWithHighGoodnessOfFit()
    {
        // Act
        var audit = _predictor.GetRegressionAudit();

        // Assert (OLS Closed-Form properties as taught by Prof. Jowel Cabrera)
        Assert.NotNull(audit);
        Assert.True(audit.RSquared >= 0.90, $"Expected R^2 >= 0.90 but got {audit.RSquared}");
        Assert.True(audit.MeanSquaredError <= 15.0, $"Expected MSE <= 15.0 but got {audit.MeanSquaredError}");
        Assert.True(audit.DistanceBeta1 > 0, "Distance coefficient must be positive");
        Assert.True(audit.WeightBeta2 > 0, "Weight coefficient must be positive on Andean roads");
        Assert.True(audit.RushHourBeta3 > 0, "Rush hour coefficient must represent a positive traffic penalty");
        Assert.Contains("T_viaje", audit.Formula);
    }

    [Fact]
    public void PredictTravelTime_HeavierPayloadTakesMoreTimeThanEmptyTruck()
    {
        // Arrange
        double distanceKm = 25.0;
        bool isRushHour = false;

        // Act
        var emptyTruck = _predictor.PredictTravelTime(distanceKm, weightKg: 500, isRushHour, numberOfStops: 1);
        var heavyTruck = _predictor.PredictTravelTime(distanceKm, weightKg: 5000, isRushHour, numberOfStops: 1);

        // Assert
        Assert.True(heavyTruck.EstimatedTotalMinutes > emptyTruck.EstimatedTotalMinutes,
            "A truck with 5.0 metric tons must have a higher travel time than a truck with 0.5 tons due to Andean grades.");
        Assert.True(heavyTruck.WeightImpactMinutes > emptyTruck.WeightImpactMinutes);
    }

    [Fact]
    public void PredictTravelTime_RushHourAddsSubstantialUrbanDelay()
    {
        // Arrange
        double distanceKm = 20.0;
        decimal weightKg = 3000;

        // Act
        var offPeak = _predictor.PredictTravelTime(distanceKm, weightKg, isRushHour: false, numberOfStops: 1);
        var rushHour = _predictor.PredictTravelTime(distanceKm, weightKg, isRushHour: true, numberOfStops: 1);

        // Assert
        Assert.True(rushHour.EstimatedTotalMinutes > offPeak.EstimatedTotalMinutes);
        Assert.True(rushHour.RushHourImpactMinutes > 0);
        Assert.Equal(0, offPeak.RushHourImpactMinutes);
    }

    [Fact]
    public void PredictTravelTime_MultipleStopsAccountForLoadingStowageTime()
    {
        // Arrange
        double distanceKm = 30.0;
        decimal weightKg = 3000;
        bool isRushHour = false;

        // Act
        var singleStop = _predictor.PredictTravelTime(distanceKm, weightKg, isRushHour, numberOfStops: 1);
        var threeStops = _predictor.PredictTravelTime(distanceKm, weightKg, isRushHour, numberOfStops: 3);

        // Assert
        Assert.True(threeStops.StowageLoadingMinutes > singleStop.StowageLoadingMinutes);
        Assert.Equal(36, threeStops.StowageLoadingMinutes); // 3 stops * 12 min
    }

    [Fact]
    public async Task RouteOptimizationService_EstimateOptimalRouteAsync_ReturnsAuditAndBestSequence()
    {
        // Arrange
        var routeRepoMock = new Mock<IConsolidatedRouteRepository>();
        var lotRepoMock = new Mock<IHarvestLotRepository>();
        var vehicleRepoMock = new Mock<ITransportVehicleRepository>();

        var vehicle = new TransportVehicle { Id = 1, DriverName = "Carlos Quispe", MaxCapacityKg = 6000, IsAvailable = true };
        var lots = new List<HarvestLot>
        {
            new() { Id = 10, TownName = "Chupaca", Latitude = -12.0625, Longitude = -75.2878, WeightKg = 1500, Status = "Available" },
            new() { Id = 20, TownName = "Jauja", Latitude = -11.7750, Longitude = -75.5000, WeightKg = 2000, Status = "Available" },
            new() { Id = 30, TownName = "Concepción", Latitude = -11.9167, Longitude = -75.3114, WeightKg = 1000, Status = "Available" }
        };

        lotRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(lots);
        vehicleRepoMock.Setup(r => r.GetByIdAsync(1)).ReturnsAsync(vehicle);

        var service = new RouteOptimizationService(routeRepoMock.Object, lotRepoMock.Object, vehicleRepoMock.Object, _predictor);

        var request = new RouteEstimateRequestDto
        {
            TransportVehicleId = 1,
            SelectedLotIds = new List<int> { 10, 20, 30 },
            IsRushHour = false
        };

        // Act
        var result = await service.EstimateOptimalRouteAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.OrderedStops.Count);
        // Best sequence must start from furthest point (Jauja) towards Huancayo Wholesale Market
        Assert.Equal("Jauja", result.OrderedStops[0].TownName);
        Assert.Equal(4500, result.TotalWeightKg);
        Assert.True(result.TotalDistanceKm > 30, "Route covering Jauja, Concepción, Chupaca must exceed 30 km");
        Assert.True(result.EstimatedDurationMinutes > 0);
        Assert.NotNull(result.RegressionAudit);
        Assert.True(result.RegressionAudit.RSquared > 0.90);
    }
}
