namespace DVC.UserService.Api.Middleware;

public class AuditMiddleware
{
    private readonly RequestDelegate _next;
    public AuditMiddleware(RequestDelegate next) => _next = next;
    public async Task Invoke(HttpContext context)
    {
        // TODO: implement audit logging
        await _next(context);
    }
}
