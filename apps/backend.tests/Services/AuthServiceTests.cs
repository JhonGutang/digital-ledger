using DigitalLedger.Api.Constants;
using DigitalLedger.Api.Exceptions;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Auth;
using DigitalLedger.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace DigitalLedger.Tests.Services;

public class AuthServiceTests
{
    private readonly Mock<UserManager<ApplicationUser>> _mockUserManager;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        _mockUserManager = new Mock<UserManager<ApplicationUser>>(store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
        
        _mockConfiguration = new Mock<IConfiguration>();
        
        var mockJwtSection = new Mock<IConfigurationSection>();
        mockJwtSection.Setup(x => x["SecretKey"]).Returns("SuperSecretKeyEnsureThisIsVeryLongAndSecureForLocalDevOnly");
        mockJwtSection.Setup(x => x["Issuer"]).Returns("DigitalLedger");
        mockJwtSection.Setup(x => x["Audience"]).Returns("DigitalLedgerFrontend");
        
        _mockConfiguration.Setup(a => a.GetSection("JwtSettings")).Returns(mockJwtSection.Object);

        _authService = new AuthService(_mockUserManager.Object, _mockConfiguration.Object);
    }

    [Fact]
    public async Task LoginAsync_ValidCredentials_ReturnsAuthResponseDto()
    {
        // Arrange
        var user = new ApplicationUser { Id = "1", Email = "test@test.com", IsActive = true, FirstName = "Test", LastName = "User" };
        var loginDto = new LoginDto { Email = "test@test.com", Password = "Password123!" };

        _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, loginDto.Password)).ReturnsAsync(true);
        _mockUserManager.Setup(x => x.GetRolesAsync(user)).ReturnsAsync(new List<string> { Roles.ADMIN });

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(Roles.ADMIN, result.Role);
        Assert.NotNull(result.Token);
    }

    [Fact]
    public async Task LoginAsync_UserNotFound_ThrowsUnauthorizedException()
    {
        // Arrange
        var loginDto = new LoginDto { Email = "nonexistent@test.com", Password = "Password123!" };
        _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync((ApplicationUser)null!);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginAsync(loginDto));
    }

    [Fact]
    public async Task LoginAsync_InvalidPassword_ThrowsUnauthorizedException()
    {
        // Arrange
        var user = new ApplicationUser { Id = "1", Email = "test@test.com", IsActive = true, FirstName = "Test", LastName = "User" };
        var loginDto = new LoginDto { Email = "test@test.com", Password = "WrongPassword!" };

        _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, loginDto.Password)).ReturnsAsync(false);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginAsync(loginDto));
    }

    [Fact]
    public async Task LoginAsync_InactiveUser_ThrowsUnauthorizedException()
    {
        // Arrange
        var user = new ApplicationUser { Id = "1", Email = "test@test.com", IsActive = false, FirstName = "Test", LastName = "User" };
        var loginDto = new LoginDto { Email = "test@test.com", Password = "Password123!" };

        _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync(user);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginAsync(loginDto));
    }

    [Fact]
    public async Task RegisterUserAsync_ValidData_ReturnsAuthResponseDto()
    {
        // Arrange
        var registerDto = new RegisterDto 
        { 
            Email = "new@test.com", 
            Password = "Password123!", 
            FirstName = "Test", 
            LastName = "User",
            Role = Roles.ACCOUNTANT
        };

        _mockUserManager.Setup(x => x.FindByEmailAsync(registerDto.Email)).ReturnsAsync((ApplicationUser)null!);
        _mockUserManager.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), registerDto.Password)).ReturnsAsync(IdentityResult.Success);
        
        // Act
        var result = await _authService.RegisterUserAsync(registerDto);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(registerDto.Email, result.Email);
        Assert.Equal(Roles.ACCOUNTANT, result.Role);
        Assert.NotNull(result.Token);
    }

    [Fact]
    public async Task RegisterUserAsync_ExistingEmail_ThrowsConflictException()
    {
        // Arrange
        var existingUser = new ApplicationUser { Id = "1", Email = "existing@test.com", IsActive = true, FirstName = "Existing", LastName = "User" };
        var registerDto = new RegisterDto 
        { 
            Email = "existing@test.com", 
            Password = "Password123!", 
            FirstName = "Test", 
            LastName = "User",
            Role = Roles.ACCOUNTANT
        };

        _mockUserManager.Setup(x => x.FindByEmailAsync(registerDto.Email)).ReturnsAsync(existingUser);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() => _authService.RegisterUserAsync(registerDto));
    }

    [Fact]
    public async Task RegisterUserAsync_CreateFailed_ThrowsValidationException()
    {
        // Arrange
        var registerDto = new RegisterDto 
        { 
            Email = "new@test.com", 
            Password = "weak", 
            FirstName = "Test", 
            LastName = "User",
            Role = Roles.ACCOUNTANT
        };

        _mockUserManager.Setup(x => x.FindByEmailAsync(registerDto.Email)).ReturnsAsync((ApplicationUser)null!);
        _mockUserManager.Setup(x => x.CreateAsync(It.IsAny<ApplicationUser>(), registerDto.Password))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Description = "Password too weak." }));

        // Act & Assert
        var exception = await Assert.ThrowsAsync<DigitalLedger.Api.Exceptions.ValidationException>(
            () => _authService.RegisterUserAsync(registerDto));
        Assert.Contains("Password too weak", exception.Message);
    }
}
