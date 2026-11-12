using System;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;
using MantaroFrostAlert.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MantaroFrostAlert.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WeatherController : ControllerBase
{
    private readonly IWeatherService _weatherService;

    public WeatherController(IWeatherService weatherService)
    {
        _weatherService = weatherService;
    }

    /// <summary>
    /// Returns real-time or 18:00 forecast weather data for a delimited Mantaro corridor zone.
    /// </summary>
    /// <param name="zone">Zone identifier: 'chupaca', 'huancayo', 'concepcion', or 'jauja'.</param>
    /// <param name="ct">Cancellation token.</param>
    [HttpGet("live")]
    [ProducesResponseType(typeof(LiveWeatherDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetLiveWeather([FromQuery] string? zone, CancellationToken ct)
    {
        var zoneId = string.IsNullOrWhiteSpace(zone) ? "chupaca" : zone.Trim().ToLowerInvariant();

        try
        {
            var weather = await _weatherService.GetLiveWeatherForZoneAsync(zoneId, ct);
            return Ok(weather);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Returns the delimited corridor zones and explicit exclusion boundaries.
    /// </summary>
    [HttpGet("zones")]
    [ProducesResponseType(typeof(ZonesBoundaryResponseDto), StatusCodes.Status200OK)]
    public IActionResult GetZones()
    {
        var boundary = _weatherService.GetZonesBoundary();
        return Ok(boundary);
    }
}
