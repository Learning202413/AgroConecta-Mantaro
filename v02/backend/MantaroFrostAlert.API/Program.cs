using System;
using MantaroFrostAlert.Application.Interfaces;
using MantaroFrostAlert.Application.Services;
using MantaroFrostAlert.Infrastructure.Clients;
using MantaroFrostAlert.Infrastructure.Data;
using MantaroFrostAlert.Infrastructure.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Controller services
builder.Services.AddControllers();

// 2. Swagger / OpenAPI documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Mantaro Frost Alert API",
        Version = "v1",
        Description = "Clean Architecture REST API for frost risk prediction and agronomic advisory in the Mantaro Valley."
    });
});

// 3. CORS configuration for frontend clients
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 4. Database configuration (PostgreSQL with InMemory fallback)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrWhiteSpace(connectionString))
    {
        options.UseNpgsql(connectionString);
    }
    else
    {
        options.UseInMemoryDatabase("MantaroFrostAlertDb");
    }
});

// 5. Dependency Injection registration
builder.Services.AddScoped<IFrostPredictionRepository, FrostPredictionRepository>();
builder.Services.AddScoped<IFrostPredictionService, FrostPredictionService>();

// 6. External ML VPS client configuration
var vpsBaseUrl = builder.Configuration["VpsApi:BaseUrl"] ?? "https://heladas-api.astrazynk.pp.ua";
builder.Services.AddHttpClient<IVpsMlClient, VpsMlClient>(client =>
{
    client.BaseAddress = new Uri(vpsBaseUrl.TrimEnd('/') + "/");
    client.Timeout = TimeSpan.FromSeconds(15);
});

// 7. Open-Meteo Weather Client configuration
builder.Services.AddHttpClient<IWeatherService, OpenMeteoWeatherService>(client =>
{
    client.BaseAddress = new Uri("https://api.open-meteo.com/");
    client.Timeout = TimeSpan.FromSeconds(15);
});

var app = builder.Build();

// 8. Ensure database is created and apply schema
using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();
        logger.LogInformation("Database connection verified and schema ensured using provider: {Provider}", db.Database.ProviderName);
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "Could not ensure PostgreSQL schema. If PostgreSQL is offline, predictions will operate with memory/resilience.");
    }
}

// 8. Pipeline configuration
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mantaro Frost Alert API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

app.Run();
