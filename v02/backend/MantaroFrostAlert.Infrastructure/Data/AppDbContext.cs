using MantaroFrostAlert.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MantaroFrostAlert.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<FrostPredictionRecord> FrostPredictions => Set<FrostPredictionRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<FrostPredictionRecord>(entity =>
        {
            entity.ToTable("frost_predictions");

            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).ValueGeneratedOnAdd();

            entity.Property(e => e.CutoffDate).HasMaxLength(20).IsRequired();
            entity.Property(e => e.TargetDate).HasMaxLength(20).IsRequired();
            entity.Property(e => e.AlertLevel).HasMaxLength(20).IsRequired();
            entity.Property(e => e.Coverage).HasMaxLength(255);
            entity.Property(e => e.Notes).HasMaxLength(500);

            entity.HasIndex(e => e.CreatedAt);
            entity.HasIndex(e => e.CutoffDate);
            entity.HasIndex(e => e.AlertLevel);
        });
    }
}
