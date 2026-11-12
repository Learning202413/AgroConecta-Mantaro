using System;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.Interfaces;
using MantaroFrostAlert.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace MantaroFrostAlert.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IVpsMlClient _vpsClient;
    private readonly AppDbContext _dbContext;

    public HealthController(IVpsMlClient vpsClient, AppDbContext dbContext)
    {
        _vpsClient = vpsClient;
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth(CancellationToken ct)
    {
        bool dbHealthy = false;
        try
        {
            dbHealthy = await _dbContext.Database.CanConnectAsync(ct);
        }
        catch
        {
            dbHealthy = false;
        }

        bool vpsHealthy = await _vpsClient.CheckHealthAsync(ct);

        return Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            service = "MantaroFrostAlert.API",
            database = new
            {
                provider = _dbContext.Database.ProviderName,
                connected = dbHealthy
            },
            vpsMlService = new
            {
                endpoint = "https://heladas-api.astrazynk.pp.ua",
                connected = vpsHealthy
            }
        });
    }
}
