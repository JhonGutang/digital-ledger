# Reference Implementation: Account CRUD

This document provides a complete, end-to-end example of implementing a feature following the project's layered architecture. Use this as the pattern to replicate for all new features.

> This example implements the Account (Chart of Accounts) CRUD to demonstrate the required code structure, naming conventions, and file placement. **This reflects the actual implemented code.**

---

## 1. Model — `Models/Account.cs`

```csharp
using System.ComponentModel.DataAnnotations;
using DigitalLedger.Api.Models.Enums;

namespace DigitalLedger.Api.Models;

public class Account
{
    public Guid Id { get; set; }

    [Required, MaxLength(20)]
    public required string Code { get; set; }

    [Required, MaxLength(100)]
    public required string Name { get; set; }

    [Required]
    public AccountCategory Category { get; set; }

    [Required]
    public NormalBalance NormalBalance { get; set; }

    public string? Description { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
```

> **Note:** `Category` and `NormalBalance` use C# enum types, not strings. The enums are defined in `Models/Enums/`.

---

## 2. Enums — `Models/Enums/`

```csharp
// Models/Enums/AccountCategory.cs
namespace DigitalLedger.Api.Models.Enums;

public enum AccountCategory
{
    ASSET,
    LIABILITY,
    EQUITY,
    REVENUE,
    EXPENSE
}
```

```csharp
// Models/Enums/NormalBalance.cs
namespace DigitalLedger.Api.Models.Enums;

public enum NormalBalance
{
    DEBIT,
    CREDIT
}
```

---

## 3. DTOs — `Models/DTOs/Account/AccountDtos.cs`

```csharp
using System.ComponentModel.DataAnnotations;
using DigitalLedger.Api.Models.Enums;

namespace DigitalLedger.Api.Models.DTOs.Account;

public class CreateAccountDto
{
    [Required]
    public required string Code { get; set; }

    [Required]
    public required string Name { get; set; }

    [Required]
    public AccountCategory Category { get; set; }

    public string? Description { get; set; }
}

public class UpdateAccountDto
{
    [Required]
    public required string Name { get; set; }

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
    public DateTime CreatedAt { get; set; }
}
```

> **Note:** `CreateAccountDto` accepts `Category` as an enum. `NormalBalance` is NOT in the create DTO — it is auto-derived by the service. The `AccountResponseDto` serializes enums as strings.

---

## 4. Repository Interface — `Repositories/Interfaces/IAccountRepository.cs`

```csharp
using DigitalLedger.Api.Models;

namespace DigitalLedger.Api.Repositories.Interfaces;

public interface IAccountRepository
{
    Task<List<Account>> GetAllAsync();
    Task<Account?> GetByIdAsync(Guid id);
    Task<Account?> GetByCodeAsync(string code);
    Task<Account> CreateAsync(Account account);
    Task<Account> UpdateAsync(Account account);
}
```

---

## 5. Repository — `Repositories/AccountRepository.cs`

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
    
    public async Task<Account?> GetByCodeAsync(string code)
    {
        return await _context.Accounts.FirstOrDefaultAsync(a => a.Code == code);
    }

    public async Task<Account> CreateAsync(Account account)
    {
        _context.Accounts.Add(account);
        await _context.SaveChangesAsync();
        return account;
    }

    public async Task<Account> UpdateAsync(Account account)
    {
        _context.Accounts.Update(account);
        await _context.SaveChangesAsync();
        return account;
    }
}
```

---

## 6. Service Interface — `Services/Interfaces/IAccountService.cs`

```csharp
using DigitalLedger.Api.Models.DTOs.Account;

namespace DigitalLedger.Api.Services.Interfaces;

public interface IAccountService
{
    Task<List<AccountResponseDto>> GetAllAsync();
    Task<AccountResponseDto> GetByIdAsync(Guid id);
    Task<AccountResponseDto> CreateAsync(CreateAccountDto createAccountDto);
    Task<AccountResponseDto> UpdateAsync(Guid id, UpdateAccountDto updateAccountDto);
}
```

---

## 7. Service — `Services/AccountService.cs`

```csharp
using DigitalLedger.Api.Exceptions;
using DigitalLedger.Api.Models;
using DigitalLedger.Api.Models.DTOs.Account;
using DigitalLedger.Api.Models.Enums;
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
        return accounts.Select(MapToResponse).ToList();
    }

    public async Task<AccountResponseDto> GetByIdAsync(Guid id)
    {
        var account = await _accountRepository.GetByIdAsync(id) ?? throw new NotFoundException("Account", id);
        return MapToResponse(account);
    }

    public async Task<AccountResponseDto> CreateAsync(CreateAccountDto dto)
    {
        // Check for duplicate code
        var existingAccount = await _accountRepository.GetByCodeAsync(dto.Code);
        if (existingAccount != null)
        {
            throw new ConflictException($"An account with code '{dto.Code}' already exists.");
        }

        var account = new Account
        {
            Id = Guid.NewGuid(),
            Code = dto.Code,
            Name = dto.Name,
            Category = dto.Category,
            NormalBalance = DeriveNormalBalance(dto.Category),
            Description = dto.Description,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var createdAccount = await _accountRepository.CreateAsync(account);
        return MapToResponse(createdAccount);
    }

    public async Task<AccountResponseDto> UpdateAsync(Guid id, UpdateAccountDto dto)
    {
        var account = await _accountRepository.GetByIdAsync(id) ?? throw new NotFoundException("Account", id);
        
        account.Name = dto.Name;
        account.Description = dto.Description;
        account.UpdatedAt = DateTime.UtcNow;

        var updatedAccount = await _accountRepository.UpdateAsync(account);
        return MapToResponse(updatedAccount);
    }

    private static AccountResponseDto MapToResponse(Account account)
    {
        return new AccountResponseDto
        {
            Id = account.Id,
            Code = account.Code,
            Name = account.Name,
            Category = account.Category.ToString(),
            NormalBalance = account.NormalBalance.ToString(),
            Description = account.Description,
            IsActive = account.IsActive,
            CreatedAt = account.CreatedAt
        };
    }

    private static NormalBalance DeriveNormalBalance(AccountCategory category)
    {
        return category switch
        {
            AccountCategory.ASSET => NormalBalance.DEBIT,
            AccountCategory.EXPENSE => NormalBalance.DEBIT,
            AccountCategory.LIABILITY => NormalBalance.CREDIT,
            AccountCategory.EQUITY => NormalBalance.CREDIT,
            AccountCategory.REVENUE => NormalBalance.CREDIT,
            _ => throw new ValidationException("Invalid account category")
        };
    }
}
```

> **Key Patterns:**
> - `DeriveNormalBalance` automatically sets the NormalBalance based on the AccountCategory, removing the burden from the API consumer.
> - `GetByCodeAsync` prevents duplicate account codes via a `ConflictException`.
> - `MapToResponse` centralizes entity-to-DTO mapping as a private helper.

---

## 8. Controller — `Controllers/AccountsController.cs`

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
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
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
    [Authorize(Roles = Roles.ADMIN + "," + Roles.ACCOUNTANT)]
    public async Task<IActionResult> Create([FromBody] CreateAccountDto createAccountDto)
    {
        var account = await _accountService.CreateAsync(createAccountDto);
        return CreatedAtAction(nameof(GetById), new { id = account.Id }, account);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.ADMIN + "," + Roles.ACCOUNTANT)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAccountDto updateAccountDto)
    {
        var account = await _accountService.UpdateAsync(id, updateAccountDto);
        return Ok(account);
    }
}
```

> **Note:** The controller name is **`AccountsController`** (plural), which maps to the route `api/accounts`.

---

## 9. DI Registration — `Program.cs`

```csharp
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
```

---

## 10. xUnit Test — `AccountServiceTests.cs`

```csharp
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

    [Fact]
    public async Task GetByIdAsync_ExistingId_ReturnsAccountResponseDto()
    {
        var accountId = Guid.NewGuid();
        var account = new Account
        {
            Id = accountId,
            Code = "1000",
            Name = "Cash",
            Category = AccountCategory.ASSET,
            NormalBalance = NormalBalance.DEBIT,
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
- **Service owns the logic**: mapping, validation, exception throwing, and domain derivation (e.g., `DeriveNormalBalance`).
- **Repository is pure data access**: no business rules, just EF Core queries.
- **DTOs are grouped by feature**: `Models/DTOs/Account/AccountDtos.cs`.
- **Enums are in `Models/Enums/`**: used by both models and DTOs.
- **Interfaces live in nested `Interfaces/` folders**.
- **Tests mock the repository** and test the service layer directly.
- **Controller names are plural** (e.g., `AccountsController` → `api/accounts`).
