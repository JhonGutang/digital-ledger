namespace DigitalLedger.Api.Exceptions;

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

public class ConflictException : Exception
{
    public ConflictException(string message) : base(message) { }
}
