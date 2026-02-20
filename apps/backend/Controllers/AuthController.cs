using DigitalLedger.Api.Constants;
using DigitalLedger.Api.Models.DTOs.Auth;
using DigitalLedger.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalLedger.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var response = await _authService.LoginAsync(loginDto);

        if (response == null)
            return Unauthorized(new { message = "Invalid email or password." });

        return Ok(response);
    }

    [HttpPost("register")]
    [Authorize(Roles = Roles.ADMIN)]
    public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var response = await _authService.RegisterUserAsync(registerDto);

        if (response == null)
            return BadRequest(new { message = "User registration failed." });

        return Ok(response);
    }
}
