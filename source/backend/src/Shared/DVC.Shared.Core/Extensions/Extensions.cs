namespace DVC.Shared.Core.Extensions;

public static class StringExtensions
{
    public static bool IsNullOrEmpty(this string? value) => string.IsNullOrEmpty(value);
}

public static class DateTimeExtensions
{
    public static bool IsDefault(this DateTime dt) => dt == default;
}
