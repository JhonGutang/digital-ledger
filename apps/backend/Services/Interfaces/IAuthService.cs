using DigitalLedger.Api.Models.DTOs.Auth;

namespace DigitalLedger.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
    Task<AuthResponseDto> RegisterUserAsync(RegisterDto registerDto);
}
