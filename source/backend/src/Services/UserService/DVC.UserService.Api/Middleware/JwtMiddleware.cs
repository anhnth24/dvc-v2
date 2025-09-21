namespace DVC.UserService.Api.Middleware;

public class JwtMiddleware
{
    private readonly RequestDelegate _next;
    public JwtMiddleware(RequestDelegate next) => _next = next;
    public async Task Invoke(HttpContext context)
    {
        // TODO: implement JWT validation
        await _next(context);
    }
}
