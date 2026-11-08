using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Application.Services;
using AgroConectaMantaro.Domain.Entities;
using Moq;
using Xunit;

namespace AgroConectaMantaro.Tests;

public class HarvestLotServiceTests
{
    private readonly Mock<IHarvestLotRepository> _lotRepoMock;
    private readonly HarvestLotService _service;

    public HarvestLotServiceTests()
    {
        _lotRepoMock = new Mock<IHarvestLotRepository>();
        _service = new HarvestLotService(_lotRepoMock.Object);
    }

    [Fact]
    public async Task DeleteAsync_ThrowsInvalidOperationException_WhenLotIsNotAvailable()
    {
        // Arrange: Lot assigned to a route cannot be deleted
        var assignedLot = new HarvestLot
        {
            Id = 10,
            ProducerName = "Eusebio Poma",
            CropType = "Papa Canchán",
            WeightKg = 1500,
            Status = "Assigned",
            ConsolidatedRouteId = 1
        };

        _lotRepoMock.Setup(r => r.GetByIdAsync(10)).ReturnsAsync(assignedLot);

        // Act & Assert (Norman / Shneiderman Safety Constraint)
        await Assert.ThrowsAsync<InvalidOperationException>(() => _service.DeleteAsync(10));
        _lotRepoMock.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_Succeeds_WhenLotIsAvailable()
    {
        // Arrange
        var availableLot = new HarvestLot
        {
            Id = 11,
            ProducerName = "Maria Condor",
            CropType = "Papa Huayro",
            WeightKg = 800,
            Status = "Available"
        };

        _lotRepoMock.Setup(r => r.GetByIdAsync(11)).ReturnsAsync(availableLot);
        _lotRepoMock.Setup(r => r.DeleteAsync(11)).Returns(Task.CompletedTask);

        // Act
        var result = await _service.DeleteAsync(11);

        // Assert
        Assert.True(result);
        _lotRepoMock.Verify(r => r.DeleteAsync(11), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenLotDoesNotExist()
    {
        // Arrange
        _lotRepoMock.Setup(r => r.GetByIdAsync(999)).ReturnsAsync((HarvestLot?)null);

        // Act
        var result = await _service.DeleteAsync(999);

        // Assert
        Assert.False(result);
        _lotRepoMock.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task GetAllAsync_FiltersByProducerName_WhenProducerSpecified()
    {
        // Arrange (Multi-tenancy / Data isolation for producers)
        var lots = new List<HarvestLot>
        {
            new() { Id = 1, ProducerName = "Eusebio Poma", CropType = "Papa Canchán", WeightKg = 1000 },
            new() { Id = 2, ProducerName = "Maria Condor", CropType = "Zanahoria", WeightKg = 800 },
            new() { Id = 3, ProducerName = "Eusebio Poma", CropType = "Papa Huayro", WeightKg = 1200 }
        };

        _lotRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(lots);

        // Act
        var result = await _service.GetAllAsync("Eusebio Poma");

        // Assert
        Assert.NotNull(result);
        var filteredList = result.ToList();
        Assert.Equal(2, filteredList.Count);
        Assert.All(filteredList, l => Assert.Contains("Eusebio Poma", l.ProducerName, StringComparison.OrdinalIgnoreCase));
    }
}
