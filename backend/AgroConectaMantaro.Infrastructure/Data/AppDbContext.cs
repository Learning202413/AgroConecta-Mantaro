using AgroConectaMantaro.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgroConectaMantaro.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<HarvestLot> HarvestLots => Set<HarvestLot>();
    public DbSet<TransportVehicle> TransportVehicles => Set<TransportVehicle>();
    public DbSet<ConsolidatedRoute> ConsolidatedRoutes => Set<ConsolidatedRoute>();
    public DbSet<RouteStop> RouteStops => Set<RouteStop>();
    public DbSet<MarketPrice> MarketPrices => Set<MarketPrice>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<HarvestLot>()
            .Property(h => h.WeightKg)
            .HasPrecision(10, 2);

        modelBuilder.Entity<HarvestLot>()
            .Property(h => h.EstimatedPricePerKg)
            .HasPrecision(10, 2);

        modelBuilder.Entity<TransportVehicle>()
            .Property(v => v.MaxCapacityKg)
            .HasPrecision(10, 2);

        modelBuilder.Entity<TransportVehicle>()
            .Property(v => v.CurrentLoadKg)
            .HasPrecision(10, 2);

        modelBuilder.Entity<ConsolidatedRoute>()
            .Property(r => r.TotalWeightKg)
            .HasPrecision(10, 2);

        modelBuilder.Entity<ConsolidatedRoute>()
            .Property(r => r.TotalDistanceKm)
            .HasPrecision(10, 2);

        modelBuilder.Entity<RouteStop>()
            .Property(s => s.WeightToCollectKg)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MarketPrice>()
            .Property(p => p.MinPrice)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MarketPrice>()
            .Property(p => p.MaxPrice)
            .HasPrecision(10, 2);

        modelBuilder.Entity<MarketPrice>()
            .Property(p => p.AveragePrice)
            .HasPrecision(10, 2);

        // Seed users for demonstration and testing (Norman / Nielsen Demo Personas)
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = 1,
                FullName = "Eusebio Poma",
                Email = "productor@agroconecta.pe",
                Password = "1234",
                Role = "Producer",
                Phone = "964112233",
                TownName = "Chupaca",
                CreatedAt = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 2,
                FullName = "Carlos Quispe",
                Email = "transportista@agroconecta.pe",
                Password = "1234",
                Role = "Carrier",
                Phone = "954123890",
                TownName = "Huancayo",
                CreatedAt = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new User
            {
                Id = 3,
                FullName = "Administrador Mayorista",
                Email = "admin@agroconecta.pe",
                Password = "1234",
                Role = "Admin",
                Phone = "984556677",
                TownName = "Huancayo",
                CreatedAt = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        // Seed data for quick testing and demonstration
        modelBuilder.Entity<TransportVehicle>().HasData(
            new TransportVehicle
            {
                Id = 1,
                DriverName = "Carlos Quispe",
                LicensePlate = "W2A-841",
                Phone = "954123890",
                MaxCapacityKg = 4000.00m,
                CurrentLoadKg = 0,
                IsAvailable = true,
                CreatedAt = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new TransportVehicle
            {
                Id = 2,
                DriverName = "Manuel Huamán",
                LicensePlate = "W3B-712",
                Phone = "964789123",
                MaxCapacityKg = 6000.00m,
                CurrentLoadKg = 0,
                IsAvailable = true,
                CreatedAt = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<HarvestLot>().HasData(
            new HarvestLot
            {
                Id = 1,
                ProducerName = "Eusebio Poma",
                ContactPhone = "964112233",
                CropType = "Papa Canchán",
                WeightKg = 1200.00m,
                EstimatedPricePerKg = 1.30m,
                TownName = "Chupaca",
                Latitude = -12.0625,
                Longitude = -75.2878,
                Status = "Available",
                HarvestDate = new DateTime(2026, 11, 6, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 11, 6, 0, 0, 0, DateTimeKind.Utc)
            },
            new HarvestLot
            {
                Id = 2,
                ProducerName = "Delfina Meza",
                ContactPhone = "954223344",
                CropType = "Papa Huayro",
                WeightKg = 900.00m,
                EstimatedPricePerKg = 2.10m,
                TownName = "Sicaya",
                Latitude = -12.0306,
                Longitude = -75.2817,
                Status = "Available",
                HarvestDate = new DateTime(2026, 11, 6, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 11, 6, 0, 0, 0, DateTimeKind.Utc)
            },
            new HarvestLot
            {
                Id = 3,
                ProducerName = "Toribio Ramos",
                ContactPhone = "974334455",
                CropType = "Zanahoria",
                WeightKg = 1500.00m,
                EstimatedPricePerKg = 0.90m,
                TownName = "Orcotuna",
                Latitude = -11.9681,
                Longitude = -75.3342,
                Status = "Available",
                HarvestDate = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc)
            },
            new HarvestLot
            {
                Id = 4,
                ProducerName = "Rosa Aliaga",
                ContactPhone = "984445566",
                CropType = "Arveja Verde",
                WeightKg = 600.00m,
                EstimatedPricePerKg = 3.20m,
                TownName = "Mito",
                Latitude = -11.9328,
                Longitude = -75.3392,
                Status = "Available",
                HarvestDate = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc),
                CreatedAt = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc)
            }
        );

        modelBuilder.Entity<MarketPrice>().HasData(
            new MarketPrice
            {
                Id = 1,
                CropType = "Papa Canchán",
                MarketName = "Mercado Mayorista de Huancayo",
                MinPrice = 1.10m,
                MaxPrice = 1.50m,
                AveragePrice = 1.30m,
                RecordDate = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc)
            },
            new MarketPrice
            {
                Id = 2,
                CropType = "Papa Huayro",
                MarketName = "Mercado Mayorista de Huancayo",
                MinPrice = 1.80m,
                MaxPrice = 2.40m,
                AveragePrice = 2.10m,
                RecordDate = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc)
            },
            new MarketPrice
            {
                Id = 3,
                CropType = "Zanahoria",
                MarketName = "Mercado Mayorista de Huancayo",
                MinPrice = 0.70m,
                MaxPrice = 1.10m,
                AveragePrice = 0.90m,
                RecordDate = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc)
            },
            new MarketPrice
            {
                Id = 4,
                CropType = "Arveja Verde",
                MarketName = "Mercado Mayorista de Huancayo",
                MinPrice = 2.80m,
                MaxPrice = 3.60m,
                AveragePrice = 3.20m,
                RecordDate = new DateTime(2026, 11, 7, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
