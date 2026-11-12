using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;
using MantaroFrostAlert.Domain.Entities;

namespace MantaroFrostAlert.Application.Interfaces;

public interface IFrostPredictionService
{
    Task<PredictionResponseDto> PredictAndSaveAsync(PredictEveningRequestDto request, CancellationToken ct = default);
    Task<IReadOnlyList<FrostPredictionRecord>> GetHistoryAsync(CancellationToken ct = default);
    Task<FrostPredictionRecord?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> DeleteAsync(int id, CancellationToken ct = default);
    Task<ModelMetadataDto> GetModelInfoAsync(CancellationToken ct = default);
}
