using AgroConectaMantaro.Application.DTOs;

namespace AgroConectaMantaro.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
    Task<IEnumerable<UserDto>> GetDemoUsersAsync();
}
