namespace DVC.Shared.Core.Exceptions;

public abstract class DvcException : Exception
{
    public string ErrorCode { get; }
    public Dictionary<string, object?> Data { get; }

    protected DvcException(string message, string? errorCode = null, Exception? innerException = null)
        : base(message, innerException)
    {
        ErrorCode = errorCode ?? GetType().Name;
        Data = new Dictionary<string, object?>();
    }
}

public class BusinessException : DvcException
{
    public BusinessException(string message, string? errorCode = null, Exception? innerException = null)
        : base(message, errorCode, innerException)
    {
    }
}

public class ValidationException : DvcException
{
    public List<ValidationError> Errors { get; }

    public ValidationException(string message, List<ValidationError>? errors = null)
        : base(message, "VALIDATION_FAILED")
    {
        Errors = errors ?? new List<ValidationError>();
    }

    public ValidationException(List<ValidationError> errors)
        : this("Validation failed", errors)
    {
    }
}

public class NotFoundException : DvcException
{
    public NotFoundException(string resourceType, object key)
        : base($"{resourceType} with key '{key}' was not found", "NOT_FOUND")
    {
        Data.Add("ResourceType", resourceType);
        Data.Add("Key", key);
    }

    public NotFoundException(string message)
        : base(message, "NOT_FOUND")
    {
    }
}

public class UnauthorizedException : DvcException
{
    public UnauthorizedException(string message = "Unauthorized access")
        : base(message, "UNAUTHORIZED")
    {
    }
}

public class ForbiddenException : DvcException
{
    public ForbiddenException(string message = "Access forbidden")
        : base(message, "FORBIDDEN")
    {
    }
}

public class ConflictException : DvcException
{
    public ConflictException(string message)
        : base(message, "CONFLICT")
    {
    }
}

public class ExternalServiceException : DvcException
{
    public string ServiceName { get; }

    public ExternalServiceException(string serviceName, string message, Exception? innerException = null)
        : base($"External service '{serviceName}' error: {message}", "EXTERNAL_SERVICE_ERROR", innerException)
    {
        ServiceName = serviceName;
        Data.Add("ServiceName", serviceName);
    }
}

public class ValidationError
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public object? AttemptedValue { get; set; }

    public ValidationError() { }

    public ValidationError(string field, string message, object? attemptedValue = null)
    {
        Field = field;
        Message = message;
        AttemptedValue = attemptedValue;
    }
}
