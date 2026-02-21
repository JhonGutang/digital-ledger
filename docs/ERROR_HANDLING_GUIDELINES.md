# ASP.NET Core MVC (Web API) Error & Exception Handling Guidelines

## Purpose

This document defines the mandatory error and exception handling strategy for this ASP.NET Core MVC Web API application.

All AI agents and developers must follow these rules to ensure:

- Clean MVC separation of concerns
- Centralized error handling
- Proper HTTP semantics
- RFC 9457 compliance (ProblemDetails standard)
- Production-ready behavior

---

# Architectural Context

This application follows MVC pattern:

Controller → Service → Repository → Database

Error handling must respect this layering.

---

# 1. Exception Responsibility by Layer

## Repository Layer
- Throws infrastructure-related exceptions.
- May throw `NotFoundException` if entity does not exist.
- Must NOT handle HTTP concerns.

## Service Layer
- Throws domain/business exceptions.
- Enforces business rules.
- May translate lower-level exceptions into domain exceptions.
- Must NOT return HTTP responses.

## Controller Layer (MVC)
- Must remain thin.
- Must NOT contain business logic.
- Must NOT implement try/catch for general exception handling.
- Must NOT translate exceptions into HTTP responses manually.

Controllers delegate. They do not handle system errors.

---

# 2. Centralized Exception Handling (Mandatory)

The application must use `IExceptionHandler` (.NET 8+) for global exception handling.

All exception-to-HTTP mapping must exist in ONE centralized location.

Never duplicate mapping logic in controllers.

## Implementation

Create a single `GlobalExceptionHandler`:

```csharp
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        _logger.LogError(exception, "Unhandled exception occurred");

        var (statusCode, title) = exception switch
        {
            NotFoundException   => (404, "Resource not found"),
            ValidationException => (400, "Validation failed"),
            UnauthorizedException => (401, "Unauthorized"),
            ForbiddenException  => (403, "Forbidden"),
            ConflictException   => (409, "Conflict"),
            _                   => (500, "Internal server error")
        };

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Title = title,
            Status = statusCode,
            Detail = statusCode < 500 ? exception.Message : "An unexpected error occurred"
        }, cancellationToken);

        return true;
    }
}
```

## Registration in `Program.cs`

```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

app.UseExceptionHandler();
app.UseStatusCodePages();
```

`UseStatusCodePages` ensures that non-exception error responses (e.g., returning `NotFound()` directly) also return structured `ProblemDetails` instead of empty bodies.

---

# 3. API Error Response Format (RFC 9457)

All errors must return `ProblemDetails`.

Never return:
- Raw exception messages
- Stack traces
- Database errors
- Internal implementation details

Example response:

```json
{
  "title": "Resource not found",
  "status": 404,
  "detail": "User with id 123 was not found"
}
```

---

# 4. Exception → HTTP Status Mapping

| Exception Type            | HTTP Status |
|---------------------------|------------|
| ValidationException       | 400        |
| BusinessRuleException     | 422        |
| UnauthorizedException     | 401        |
| ForbiddenException        | 403        |
| NotFoundException         | 404        |
| ConflictException         | 409        |
| Unhandled Exception       | 500        |

Unhandled exceptions must default to 500.

---

# 5. Logging Policy

Logging must occur ONLY inside the global exception handler.

Do NOT log the same exception in:
- Repository
- Service
- Controller

This prevents duplicated logs and noise.

---

# 6. Do NOT Use Exceptions for Expected Flow

Exceptions must represent exceptional failures only.

Do NOT use exceptions for:
- Validation errors already handled by ModelState
- Simple null checks
- Normal conditional logic

Use:
- Model validation
- Guard clauses
- Result pattern (optional)
- Proper return types

---

# 7. Model Validation (MVC-Specific Rule)

Because this is MVC:

- `[ApiController]` attribute automatically handles invalid ModelState.
- Do NOT manually check `ModelState.IsValid`.
- Do NOT throw exceptions for model validation failures.

ASP.NET Core automatically returns 400 with ValidationProblemDetails.

---

# 8. Custom Exception Types

Create domain-specific exceptions with meaningful constructors:

```csharp
public class NotFoundException : Exception
{
    public NotFoundException(string entityName, object entityId)
        : base($"{entityName} with id '{entityId}' was not found.") { }
}

public class ValidationException : Exception
{
    public ValidationException(string message) : base(message) { }
}

public class BusinessRuleException : Exception
{
    public BusinessRuleException(string message) : base(message) { }
}

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}

public class UnauthorizedException : Exception
{
    public UnauthorizedException(string message = "You are not authenticated.")
        : base(message) { }
}

public class ForbiddenException : Exception
{
    public ForbiddenException(string message = "You do not have permission.")
        : base(message) { }
}
```

Usage in a Service:

```csharp
var user = await _userRepository.GetByIdAsync(id)
    ?? throw new NotFoundException("User", id);
```

Avoid throwing generic `Exception`.

---

# 9. Controller Rules (Strict)

Controllers:

✔ Call service methods  
✔ Return IActionResult  
✔ Rely on middleware for error handling  

Controllers must NOT:

✘ Catch Exception  
✘ Return StatusCode(500) manually  
✘ Contain business validation  
✘ Swallow exceptions  

---

# 10. Production Safety Rules

Never expose:
- Stack traces
- Connection strings
- SQL messages
- Internal class names

Only safe, structured ProblemDetails responses are allowed.

---

# Summary

Repository → throws  
Service → throws or translates  
Controller → does NOT catch  
Middleware → catches and maps to ProblemDetails  

Error handling is centralized, consistent, and predictable.

---

# Target Framework

ASP.NET Core 7+ / 8+
MVC Web API with `[ApiController]`