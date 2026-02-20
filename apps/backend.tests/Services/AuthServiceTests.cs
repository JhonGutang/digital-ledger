using DigitalLedger.Api.Constants;
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
    public async Task LoginAsync_InvalidPassword_ReturnsNull()
    {
        // Arrange
        var user = new ApplicationUser { Id = "1", Email = "test@test.com", IsActive = true, FirstName = "Test", LastName = "User" };
        var loginDto = new LoginDto { Email = "test@test.com", Password = "WrongPassword!" };

        _mockUserManager.Setup(x => x.FindByEmailAsync(loginDto.Email)).ReturnsAsync(user);
        _mockUserManager.Setup(x => x.CheckPasswordAsync(user, loginDto.Password)).ReturnsAsync(false);

        // Act
        var result = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.Null(result);
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
}
