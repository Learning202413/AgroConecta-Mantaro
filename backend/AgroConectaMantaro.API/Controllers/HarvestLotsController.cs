using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgroConectaMantaro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HarvestLotsController : ControllerBase
{
    private readonly IHarvestLotService _service;

    public HarvestLotsController(IHarvestLotService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? producer = null)
    {
        var lots = await _service.GetAllAsync(producer);
        return Ok(lots);
    }

    [HttpGet("available")]
    public async Task<IActionResult> GetAvailable()
    {
        var lots = await _service.GetAvailableAsync();
        return Ok(lots);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var lot = await _service.GetByIdAsync(id);
        if (lot == null) return NotFound(new { message = $"Harvest lot with id {id} not found" });
        return Ok(lot);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateHarvestLotDto dto)
    {
        if (dto.WeightKg <= 0)
        {
            return BadRequest(new { message = "Weight must be greater than zero." });
        }

        var created = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            if (!success) return NotFound(new { message = $"Harvest lot with id {id} not found." });
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
