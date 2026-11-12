using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;
using MantaroFrostAlert.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace MantaroFrostAlert.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelController : ControllerBase
{
    private readonly IFrostPredictionService _service;

    public ModelController(IFrostPredictionService service)
    {
        _service = service;
    }

    /// <summary>
    /// Returns model metadata, architecture description, and feature lists.
    /// </summary>
    [HttpGet("info")]
    [ProducesResponseType(typeof(ModelMetadataDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModelInfo(CancellationToken ct)
    {
        var info = await _service.GetModelInfoAsync(ct);
        return Ok(info);
    }
}
