---
name: mvc-conventions
description: Architectural guidelines and clean architecture rules for building and structuring backend MVC applications. Use this whenever writing backend code, controllers, services, or repositories.
---

## Required MVC Architecture Rules
When building or modifying the backend, you MUST follow these conventions strictly:

### 1. Strict Layered Architecture
All backend features MUST follow the `Controller → Service → Repository → Model` flow. Never skip a layer.

### 2. Controller Layer
- Only handles HTTP concerns: receives requests, calls the service, returns `IActionResult`.
- Must NOT contain business logic, data access, or try/catch blocks.
- Inject services via constructor DI.

```csharp
[HttpGet("{id}")]
public async Task<IActionResult> GetById(Guid id)
{
    var account = await _accountService.GetByIdAsync(id);
    return Ok(account);
}
```

### 3. Service Layer
- Contains 100% of the business logic.
- Orchestrates between repositories and applies domain rules.
- Throws domain-specific exceptions (e.g., `NotFoundException`, `ValidationException`).
- Must NOT touch `HttpContext`, return `IActionResult`, or handle HTTP concerns.

```csharp
public async Task<AccountResponseDto> GetByIdAsync(Guid id)
{
    var account = await _accountRepository.GetByIdAsync(id)
        ?? throw new NotFoundException("Account", id);

    return new AccountResponseDto
    {
        Id = account.Id,
        Code = account.Code,
        Name = account.Name
    };
}
```

### 4. Repository Layer
- Dedicated strictly for database and data access operations.
- Uses `ApplicationDbContext` via constructor DI.
- Must NOT contain business rules or throw business exceptions.

```csharp
public async Task<Account?> GetByIdAsync(Guid id)
{
    return await _context.Accounts.FindAsync(id);
}
```

### 5. Interfaces
Every Service and Repository MUST implement an interface. Interfaces live in a nested `Interfaces` folder.
- Service: `Services/Interfaces/IAccountService.cs`
- Repository: `Repositories/Interfaces/IAccountRepository.cs`

### 6. Dependency Injection
Always inject dependencies via constructors. Register in `Program.cs`:
```csharp
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
```

### 7. Strong Typing
All data transfers between layers MUST use strongly typed Models or DTOs. Never pass raw dictionaries, anonymous objects, or `dynamic`.

### 8. DTOs
- Group related DTOs in a single file named `{Feature}Dtos.cs` (e.g., `AccountDtos.cs`).
- Place under `Models/DTOs/{Feature}/` (e.g., `Models/DTOs/Account/AccountDtos.cs`).
- Use separate classes for request DTOs and response DTOs.
