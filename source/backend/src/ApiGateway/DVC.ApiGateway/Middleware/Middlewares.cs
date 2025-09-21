namespace DVC.ApiGateway.Middleware;

public class AuthenticationMiddleware
{
    private readonly RequestDelegate _next;
    public AuthenticationMiddleware(RequestDelegate next) => _next = next;
    public async Task Invoke(HttpContext context)
    {
        // TODO: validate auth token, set user context
        await _next(context);
    }
}

public class LoggingMiddleware
{
    private readonly RequestDelegate _next;
    public LoggingMiddleware(RequestDelegate next) => _next = next;
    public async Task Invoke(HttpContext context)
    {
        // TODO: add request/response logging
        await _next(context);
    }
}

public static class CorsMiddleware
{
    public static void UseDefaultCors(this IApplicationBuilder app)
    {
        app.UseCors("Default");
    }
}
