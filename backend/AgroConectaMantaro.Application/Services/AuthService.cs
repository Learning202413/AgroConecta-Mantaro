using AgroConectaMantaro.Application.DTOs;
using AgroConectaMantaro.Application.Interfaces;
using AgroConectaMantaro.Domain.Entities;

namespace AgroConectaMantaro.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return new LoginResponseDto
            {
                Success = false,
                Message = "Debe ingresar el correo y la contraseña."
            };
        }

        var user = await _userRepository.GetByEmailAsync(request.Email.Trim().ToLower());

        if (user == null || user.Password != request.Password)
        {
            return new LoginResponseDto
            {
                Success = false,
                Message = "Credenciales incorrectas. Verifique su correo o contraseña."
            };
        }

        return new LoginResponseDto
        {
            Success = true,
            Message = "Inicio de sesión exitoso.",
            User = MapToDto(user),
            Token = $"demo-session-token-{user.Id}-{Guid.NewGuid():N}"
        };
    }

    public async Task<IEnumerable<UserDto>> GetDemoUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    private static UserDto MapToDto(User u) => new()
    {
        Id = u.Id,
        FullName = u.FullName,
        Email = u.Email,
        Role = u.Role,
        Phone = u.Phone,
        TownName = u.TownName
    };
}
