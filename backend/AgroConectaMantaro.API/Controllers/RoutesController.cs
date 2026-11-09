using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgroConectaMantaro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoutesController : ControllerBase
{
    private readonly IRouteOptimizationService _service;

    public RoutesController(IRouteOptimizationService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var routes = await _service.GetAllRoutesAsync();
        return Ok(routes);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var route = await _service.GetRouteByIdAsync(id);
        if (route == null) return NotFound(new { message = $"Route with ID {id} not found." });
        return Ok(route);
    }

    [HttpPost("estimate")]
    public async Task<IActionResult> Estimate([FromBody] RouteEstimateRequestDto request)
    {
        try
        {
            var result = await _service.EstimateOptimalRouteAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("optimize")]
    public async Task<IActionResult> Optimize([FromBody] RouteOptimizationRequestDto request)
    {
        try
        {
            var result = await _service.OptimizeAndCreateRouteAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{routeId}/stops/{stopId}/complete")]
    public async Task<IActionResult> CompleteStop(int routeId, int stopId)
    {
        var success = await _service.CompleteStopAsync(routeId, stopId);
        if (!success) return NotFound(new { message = "Stop or Route not found." });
        return Ok(new { message = "Stop collected successfully." });
    }
}
