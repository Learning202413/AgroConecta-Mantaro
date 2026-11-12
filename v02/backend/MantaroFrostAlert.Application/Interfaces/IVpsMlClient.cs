using System.Threading;
using System.Threading.Tasks;
using MantaroFrostAlert.Application.DTOs;

namespace MantaroFrostAlert.Application.Interfaces;

public interface IVpsMlClient
{
    Task<PredictionResponseDto> PredictAsync(PredictEveningRequestDto request, CancellationToken ct = default);
    Task<ModelMetadataDto> GetModelInfoAsync(CancellationToken ct = default);
    Task<bool> CheckHealthAsync(CancellationToken ct = default);
}
