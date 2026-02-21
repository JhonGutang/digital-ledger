using DigitalLedger.Api.Exceptions;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Account;
using DigitalLedger.Api.Models.Enums;
using DigitalLedger.Api.Repositories.Interfaces;
using DigitalLedger.Api.Services;
using Moq;

namespace DigitalLedger.Tests.Services;

public class AccountServiceTests
{
    private readonly Mock<IAccountRepository> _mockAccountRepository;
    private readonly AccountService _accountService;

    public AccountServiceTests()
    {
        _mockAccountRepository = new Mock<IAccountRepository>();
        _accountService = new AccountService(_mockAccountRepository.Object);
    }

    [Theory]
    [InlineData(AccountCategory.ASSET, "DEBIT")]
    [InlineData(AccountCategory.EXPENSE, "DEBIT")]
    [InlineData(AccountCategory.LIABILITY, "CREDIT")]
    [InlineData(AccountCategory.EQUITY, "CREDIT")]
    [InlineData(AccountCategory.REVENUE, "CREDIT")]
    public async Task CreateAsync_ValidCategory_DerivesCorrectNormalBalance(AccountCategory category, string expectedBalance)
    {
        // Arrange
        var createDto = new CreateAccountDto
        {
            Code = "Test-123",
            Name = "Test Account",
            Category = category
        };

        _mockAccountRepository.Setup(r => r.GetByCodeAsync(createDto.Code))
            .ReturnsAsync((Account?)null);

        _mockAccountRepository.Setup(r => r.CreateAsync(It.IsAny<Account>()))
            .ReturnsAsync((Account a) => a);

        // Act
        var result = await _accountService.CreateAsync(createDto);

        // Assert
        Assert.Equal(expectedBalance, result.NormalBalance);
    }

    [Fact]
    public async Task CreateAsync_DuplicateCode_ThrowsConflictException()
    {
        // Arrange
        var createDto = new CreateAccountDto
        {
            Code = "DUP-123",
            Name = "Test Duplicate",
            Category = AccountCategory.ASSET
        };

        var existingAccount = new Account
        {
            Id = Guid.NewGuid(),
            Code = "DUP-123",
            Name = "Existing",
            Category = AccountCategory.ASSET,
            NormalBalance = NormalBalance.DEBIT
        };

        _mockAccountRepository.Setup(r => r.GetByCodeAsync(createDto.Code))
            .ReturnsAsync(existingAccount);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() => _accountService.CreateAsync(createDto));
    }
}
