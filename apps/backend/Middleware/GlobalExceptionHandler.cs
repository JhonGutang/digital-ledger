using DigitalLedger.Api.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace DigitalLedger.Api.Middleware;

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
        var (statusCode, title) = exception switch
        {
            NotFoundException      => (StatusCodes.Status404NotFound, "Resource not found"),
            Exceptions.ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            UnauthorizedException  => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            ForbiddenException     => (StatusCodes.Status403Forbidden, "Forbidden"),
            ConflictException      => (StatusCodes.Status409Conflict, "Conflict"),
            _                      => (StatusCodes.Status500InternalServerError, "Internal server error")
        };

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            _logger.LogError(exception, "Unhandled exception occurred. TraceId: {TraceId}", httpContext.TraceIdentifier);
        }
        else
        {
            _logger.LogWarning("Handled domain exception: {ExceptionType} - {Message}", exception.GetType().Name, exception.Message);
        }

        httpContext.Response.StatusCode = statusCode;

        await httpContext.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Title = title,
            Status = statusCode,
            Detail = statusCode < StatusCodes.Status500InternalServerError
                ? exception.Message
                : "An unexpected error occurred."
        }, cancellationToken);

        return true;
    }
}
