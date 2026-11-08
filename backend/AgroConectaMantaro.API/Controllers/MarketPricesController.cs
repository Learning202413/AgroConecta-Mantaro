using AgroConectaMantaro.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace AgroConectaMantaro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarketPricesController : ControllerBase
{
    private readonly IMarketPriceService _service;

    public MarketPricesController(IMarketPriceService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var prices = await _service.GetAllPricesAsync();
        return Ok(prices);
    }

    [HttpGet("by-crop")]
    public async Task<IActionResult> GetByCrop([FromQuery] string crop)
    {
        var prices = await _service.GetPricesByCropAsync(crop);
        return Ok(prices);
    }

    [HttpGet("suggested")]
    public async Task<IActionResult> GetSuggested([FromQuery] string crop)
    {
        var price = await _service.GetSuggestedPriceAsync(crop);
        return Ok(new { cropType = crop, suggestedPricePerKg = price });
    }
}
