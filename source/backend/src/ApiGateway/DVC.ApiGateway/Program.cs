using DVC.ApiGateway.Extensions;
using Yarp.ReverseProxy;

var builder = WebApplication.CreateBuilder(args);

// Add YARP Reverse Proxy from configuration
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Add CORS, Auth, Logging extensions
builder.Services.AddGatewayServices(builder.Configuration);

var app = builder.Build();

app.UseCors("Default");
app.UseMiddleware<DVC.ApiGateway.Middleware.LoggingMiddleware>();
app.UseMiddleware<DVC.ApiGateway.Middleware.AuthenticationMiddleware>();

app.MapReverseProxy();

app.Run();
