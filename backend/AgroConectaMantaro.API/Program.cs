using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Application.Services;
using AgroConectaMantaro.Infrastructure.Data;
using AgroConectaMantaro.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add DbContext with PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Register Repositories (Infrastructure)
builder.Services.AddScoped<IHarvestLotRepository, HarvestLotRepository>();
builder.Services.AddScoped<ITransportVehicleRepository, TransportVehicleRepository>();
builder.Services.AddScoped<IConsolidatedRouteRepository, ConsolidatedRouteRepository>();
builder.Services.AddScoped<IMarketPriceRepository, MarketPriceRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Register Application Services
builder.Services.AddSingleton<ITravelTimePredictor, WhiteBoxTravelTimePredictor>();
builder.Services.AddScoped<IHarvestLotService, HarvestLotService>();
builder.Services.AddScoped<ITransportVehicleService, TransportVehicleService>();
builder.Services.AddScoped<IRouteOptimizationService, RouteOptimizationService>();
builder.Services.AddScoped<IMarketPriceService, MarketPriceService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// CORS configuration for Frontend (React Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Auto-apply migrations or ensure created during demo/development
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        context.Database.EnsureCreated();
        context.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS ""Users"" (
                ""Id"" SERIAL PRIMARY KEY,
                ""FullName"" TEXT NOT NULL,
                ""Email"" TEXT NOT NULL,
                ""Password"" TEXT NOT NULL,
                ""Role"" TEXT NOT NULL,
                ""Phone"" TEXT NOT NULL,
                ""TownName"" TEXT NOT NULL,
                ""CreatedAt"" TIMESTAMP WITH TIME ZONE NOT NULL
            );
            INSERT INTO ""Users"" (""Id"", ""FullName"", ""Email"", ""Password"", ""Role"", ""Phone"", ""TownName"", ""CreatedAt"")
            VALUES
            (1, 'Eusebio Poma', 'productor@agroconecta.pe', '1234', 'Producer', '964112233', 'Chupaca', NOW()),
            (2, 'Carlos Quispe', 'transportista@agroconecta.pe', '1234', 'Carrier', '954123890', 'Huancayo', NOW()),
            (3, 'Administrador Mayorista', 'admin@agroconecta.pe', '1234', 'Admin', '984556677', 'Huancayo', NOW())
            ON CONFLICT (""Id"") DO NOTHING;
        ");
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not automatically initialize PostgreSQL tables.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
