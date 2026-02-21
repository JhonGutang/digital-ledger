---
description: How to create and apply EF Core database migrations safely
---

## Adding a New Migration

// turbo-all

1. Ensure the C# entity models have been updated first. Never modify the database directly with raw SQL.

2. Generate the migration from the backend project directory:
```bash
dotnet ef migrations add <MigrationName> --project apps/backend/
```
Replace `<MigrationName>` with a descriptive PascalCase name (e.g., `AddAccountEntity`, `AddTransactionStatusColumn`).

3. Review the generated migration file in `apps/backend/Migrations/` to verify the expected changes.

4. Apply the migration to the database:
```bash
dotnet ef database update --project apps/backend/
```

5. Verify the application still builds after the migration:
```bash
dotnet build apps/backend/
```

## Rolling Back a Migration

1. To revert the last migration (if it has NOT been pushed to production):
```bash
dotnet ef migrations remove --project apps/backend/
```

2. To revert to a specific migration:
```bash
dotnet ef database update <PreviousMigrationName> --project apps/backend/
```

## Rules
- Migration names must be descriptive and PascalCase.
- Always review the generated migration before applying it.
- Never manually edit migration files unless absolutely necessary.
- Always build after applying to verify nothing is broken.
