---
name: coding-style
description: General coding style guidelines, naming conventions, and best practices. Use this skill whenever writing, modifying, or refactoring any code.
---

## Required Coding Styles and Conventions
When writing or reviewing code, you MUST strictly adhere to the following rules:

### 1. Top-level Imports
Do not use inline imports within functions; always place imports at the top of the file.

### 2. Strong Typing
Ensure all code is strictly typed leveraging the full capabilities of the language (e.g., interfaces, types, explicit return types). Never use `dynamic`, `any`, or `object` as a lazy shortcut.

### 3. Constant Variables
Use `UPPERCASE_SNAKE_CASE` for all constant variables.

### 4. Environment Variables
Never hardcode configuration or sensitive data. Always read from environment variables or configuration providers (e.g., `IConfiguration` in C#, `process.env` in JS/TS).

### 5. Self-Documenting Code
Strictly avoid adding unnecessary comments during implementation. Write simple, readable code that explains itself. Only add comments for unusually complex logic, and always strive to simplify the code first before falling back to commenting.

### 6. Naming Conventions

**C# (Backend):**
- `PascalCase` for classes, methods, properties, and public fields.
- `_camelCase` with underscore prefix for private fields (e.g., `_authService`).
- `I` prefix for interfaces (e.g., `IAuthService`, `IAccountRepository`).
- Suffix classes by their role: `Controller`, `Service`, `Repository`, `Dto`.

**TypeScript/React (Frontend):**
- `PascalCase` for components and types/interfaces.
- `camelCase` for functions, variables, and hooks.
- `use` prefix for custom hooks (e.g., `useLogin`).

**General:**
- Names must be descriptive and reveal intent. Avoid vague names like `data`, `info`, `temp`, `result`.
- Boolean variables should read as assertions: `isActive`, `hasPermission`, `canApprove`.

#### Good Examples
```csharp
// C# — clear, descriptive, follows conventions
private readonly IAccountService _accountService;
public async Task<AccountResponseDto> GetAccountByIdAsync(Guid accountId) { ... }
public const string DEFAULT_CURRENCY = "PHP";
```

```typescript
// TypeScript — clear, descriptive, follows conventions
const isTransactionPosted = transaction.status === "POSTED";
function useAccountList() { ... }
interface AccountResponseDto { ... }
```

#### Bad Examples
```csharp
// Too vague, wrong casing
private IAccountService svc;
public async Task<object> Get(Guid id) { ... }
public const string currency = "PHP";
```

```typescript
// Vague, no typing, wrong casing
const flag = transaction.status === "POSTED";
function getData() { ... }
```
