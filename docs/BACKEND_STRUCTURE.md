# Backend Directory Conventions

This document defines the mandatory directory structure for the ASP.NET Core backend (`apps/backend/`).

## Directory Structure

```
apps/backend/
├── Constants/          # Static constant classes (e.g., Roles.cs)
├── Controllers/        # API Controllers — HTTP concerns only
├── Data/               # DbContext, seeders, and EF Core configuration
├── Exceptions/         # Custom domain exception classes
├── Middleware/          # Exception handlers, custom middleware
├── Migrations/         # EF Core auto-generated migrations (do not edit manually)
├── Models/             # Entity/EF Core models
│   ├── DTOs/           # Data Transfer Objects, grouped by feature
│   │   └── {Feature}/  # e.g., Auth/, Account/, Transaction/
│   └── Enums/          # Enum definitions (e.g., AccountCategory, NormalBalance)
├── Repositories/       # Data access layer
│   └── Interfaces/     # Repository interfaces (e.g., IAccountRepository.cs)
├── Services/           # Business logic layer
│   └── Interfaces/     # Service interfaces (e.g., IAccountService.cs)
└── Properties/         # Launch settings
```

## Rules

1. **Follow this structure exactly.** Place new files in the correct directory based on their role.
2. **Group DTOs by feature**, not by type. Example: `Models/DTOs/Account/AccountDtos.cs`, not `Models/DTOs/AccountRequestDto.cs`.
3. **Interfaces live in nested `Interfaces/` folders** inside `Services/` and `Repositories/`.
4. **If a feature requires a new top-level directory not listed above, ask the user for approval before creating it.**
5. Do not place business logic files directly in the project root.
