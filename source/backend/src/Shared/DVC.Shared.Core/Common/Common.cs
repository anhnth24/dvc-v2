namespace DVC.Shared.Core.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
}

public abstract class AuditableEntity : BaseEntity
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

public class PagedResult<T>
{
    public IReadOnlyList<T> Items { get; init; } = new List<T>();
    public int TotalCount { get; init; }
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;

    public PagedResult() { }

    public PagedResult(IReadOnlyList<T> items, int totalCount, int page, int pageSize)
    {
        Items = items;
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }
}

public class ApiResponse
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public object? Data { get; init; }
    public List<string> Errors { get; init; } = new();

    public static ApiResponse SuccessResult(string message = "Success", object? data = null)
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse ErrorResult(string message, List<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors ?? new List<string>() };

    public static ApiResponse ErrorResult(string message, string error)
        => new() { Success = false, Message = message, Errors = new List<string> { error } };
}

public class ApiResponse<T>
{
    public bool Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public T? Data { get; init; }
    public List<string> Errors { get; init; } = new();

    public static ApiResponse<T> SuccessResult(T data, string message = "Success")
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> ErrorResult(string message, List<string>? errors = null)
        => new() { Success = false, Message = message, Errors = errors ?? new List<string>() };

    public static ApiResponse<T> ErrorResult(string message, string error)
        => new() { Success = false, Message = message, Errors = new List<string> { error } };
}
