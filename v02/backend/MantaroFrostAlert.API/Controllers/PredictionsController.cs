using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;
using MantaroFrostAlert.Application.Interfaces;
using MantaroFrostAlert.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MantaroFrostAlert.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PredictionsController : ControllerBase
{
    private readonly IFrostPredictionService _service;

    public PredictionsController(IFrostPredictionService service)
    {
        _service = service;
    }

    /// <summary>
    /// Executes a frost prediction using 18:00 observation data and persists the record.
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(PredictionResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Predict([FromBody] PredictEveningRequestDto request, CancellationToken ct)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _service.PredictAndSaveAsync(request, ct);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves historical predictions recorded in the database.
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<FrostPredictionRecord>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHistory(CancellationToken ct)
    {
        var records = await _service.GetHistoryAsync(ct);
        return Ok(records);
    }

    /// <summary>
    /// Retrieves a single prediction by its identifier.
    /// </summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(FrostPredictionRecord), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id, CancellationToken ct)
    {
        var record = await _service.GetByIdAsync(id, ct);
        if (record == null)
        {
            return NotFound(new { message = $"Prediction with ID {id} was not found." });
        }

        return Ok(record);
    }

    /// <summary>
    /// Deletes a prediction record by its identifier.
    /// </summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var deleted = await _service.DeleteAsync(id, ct);
        if (!deleted)
        {
            return NotFound(new { message = $"Prediction with ID {id} was not found." });
        }

        return NoContent();
    }
}
