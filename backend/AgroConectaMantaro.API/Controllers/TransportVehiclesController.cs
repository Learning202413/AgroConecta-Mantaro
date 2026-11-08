using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgroConectaMantaro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransportVehiclesController : ControllerBase
{
    private readonly ITransportVehicleService _service;

    public TransportVehiclesController(ITransportVehicleService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var vehicles = await _service.GetAllAsync();
        return Ok(vehicles);
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable()
    {
        var vehicles = await _service.GetAvailableAsync();
        return Ok(vehicles);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTransportVehicleDto dto)
    {
        var created = await _service.CreateAsync(dto);
        return Ok(created);
    }
}
