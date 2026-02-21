# Reference Implementation: Account CRUD

This document provides a complete, end-to-end example of implementing a feature following the project's layered architecture. Use this as the pattern to replicate for all new features.

> This example implements a simplified Account (Chart of Accounts) CRUD to demonstrate the required code structure, naming conventions, and file placement.

---

## 1. Model — `Models/Account.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace DigitalLedger.Api.Models;

public class Account
{
    public Guid Id { get; set; }

    [Required, MaxLength(10)]
    public required string Code { get; set; }

    [Required, MaxLength(100)]
    public required string Name { get; set; }

    [Required]
    public required string Category { get; set; }

    [Required]
    public required string NormalBalance { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

---

## 2. DTOs — `Models/DTOs/Account/AccountDtos.cs`

```csharp
namespace DigitalLedger.Api.Models.DTOs.Account;

public class CreateAccountDto
{
    public required string Code { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string NormalBalance { get; set; }
    public string? Description { get; set; }
}

public class AccountResponseDto
{
    public Guid Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public required string Category { get; set; }
    public required string NormalBalance { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
}
```

---

## 3. Repository Interface — `Repositories/Interfaces/IAccountRepository.cs`

```csharp
using DigitalLedger.Api.Models;

namespace DigitalLedger.Api.Repositories.Interfaces;

public interface IAccountRepository
{
    Task<List<Account>> GetAllAsync();
    Task<Account?> GetByIdAsync(Guid id);
    Task<Account> CreateAsync(Account account);
}
```

---

## 4. Repository — `Repositories/AccountRepository.cs`

```csharp
using DigitalLedger.Api.Data;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DigitalLedger.Api.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly ApplicationDbContext _context;

    public AccountRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Account>> GetAllAsync()
    {
        return await _context.Accounts.Where(a => a.IsActive).ToListAsync();
    }

    public async Task<Account?> GetByIdAsync(Guid id)
    {
        return await _context.Accounts.FindAsync(id);
    }

    public async Task<Account> CreateAsync(Account account)
    {
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();
        return account;
    }
}
```

---

## 5. Service Interface — `Services/Interfaces/IAccountService.cs`

```csharp
using DigitalLedger.Api.Models.DTOs.Account;

namespace DigitalLedger.Api.Services.Interfaces;

public interface IAccountService
{
    Task<List<AccountResponseDto>> GetAllAsync();
    Task<AccountResponseDto> GetByIdAsync(Guid id);
    Task<AccountResponseDto> CreateAsync(CreateAccountDto createAccountDto);
}
```

---

## 6. Service — `Services/AccountService.cs`

```csharp
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Account;
using DigitalLedger.Api.Repositories.Interfaces;
using DigitalLedger.Api.Services.Interfaces;

namespace DigitalLedger.Api.Services;

public class AccountService : IAccountService
{
    private readonly IAccountRepository _accountRepository;

    public AccountService(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<List<AccountResponseDto>> GetAllAsync()
    {
        var accounts = await _accountRepository.GetAllAsync();

        return accounts.Select(a => new AccountResponseDto
        {
            Id = a.Id,
            Code = a.Code,
            Name = a.Name,
            Category = a.Category,
            NormalBalance = a.NormalBalance,
            Description = a.Description,
            IsActive = a.IsActive
        }).ToList();
    }

    public async Task<AccountResponseDto> GetByIdAsync(Guid id)
    {
        var account = await _accountRepository.GetByIdAsync(id)
            ?? throw new NotFoundException("Account", id);

        return new AccountResponseDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            Category = account.Category,
            NormalBalance = account.NormalBalance,
            Description = account.Description,
            IsActive = account.IsActive
        };
    }

    public async Task<AccountResponseDto> CreateAsync(CreateAccountDto createAccountDto)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            Code = createAccountDto.Code,
            Name = createAccountDto.Name,
            Category = createAccountDto.Category,
            NormalBalance = createAccountDto.NormalBalance,
            Description = createAccountDto.Description
        };

        var createdAccount = await _accountRepository.CreateAsync(account);

        return new AccountResponseDto
        {
            Id = createdAccount.Id,
            Code = createdAccount.Code,
            Name = createdAccount.Name,
            Category = createdAccount.Category,
            NormalBalance = createdAccount.NormalBalance,
            Description = createdAccount.Description,
            IsActive = createdAccount.IsActive
        };
    }
}
```

---

## 7. Controller — `Controllers/AccountController.cs`

```csharp
using DigitalLedger.Api.Constants;
using DigitalLedger.Api.Models.DTOs.Account;
using DigitalLedger.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DigitalLedger.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var accounts = await _accountService.GetAllAsync();
        return Ok(accounts);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var account = await _accountService.GetByIdAsync(id);
        return Ok(account);
    }

    [HttpPost]
    [Authorize(Roles = Roles.ADMIN)]
    public async Task<IActionResult> Create([FromBody] CreateAccountDto createAccountDto)
    {
        var account = await _accountService.CreateAsync(createAccountDto);
        return CreatedAtAction(nameof(GetById), new { id = account.Id }, account);
    }
}
```

---

## 8. DI Registration — `Program.cs`

```csharp
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
```

---

## 9. xUnit Test — `AccountServiceTests.cs`

```csharp
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Account;
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

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsAccountResponseDto()
    {
        var accountId = Guid.NewGuid();
        var account = new Account
        {
            Id = accountId,
            Code = "1000",
            Name = "Cash",
            Category = "ASSET",
            NormalBalance = "DEBIT",
            IsActive = true
        };

        _mockAccountRepository
            .Setup(r => r.GetByIdAsync(accountId))
            .ReturnsAsync(account);

        var result = await _accountService.GetByIdAsync(accountId);

        Assert.Equal(accountId, result.Id);
        Assert.Equal("Cash", result.Name);
    }

    [Fact]
    public async Task GetByIdAsync_NonExistingId_ThrowsNotFoundException()
    {
        var accountId = Guid.NewGuid();

        _mockAccountRepository
            .Setup(r => r.GetByIdAsync(accountId))
            .ReturnsAsync((Account?)null);

        await Assert.ThrowsAsync<NotFoundException>(
            () => _accountService.GetByIdAsync(accountId));
    }
}
```

---

## Key Takeaways

- **Controller is thin**: no business logic, no try/catch, just calls the service.
- **Service owns the logic**: mapping, validation, exception throwing.
- **Repository is pure data access**: no business rules, just EF Core queries.
- **DTOs are grouped by feature**: `Models/DTOs/Account/AccountDtos.cs`.
- **Interfaces live in nested `Interfaces/` folders**.
- **Tests mock the repository** and test the service layer directly.
