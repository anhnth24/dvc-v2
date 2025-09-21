using DVC.UserService.Api.Extensions;
using DVC.UserService.Infrastructure.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/user-service-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Starting DVC User Service");

    // Add services to the container
    builder.Services.AddApiServices(builder.Configuration);
    builder.Services.AddUserServices(builder.Configuration);
    builder.Services.AddLogging(builder.Configuration);

    var app = builder.Build();

    // Configure middleware pipeline
    app.ConfigureMiddleware();

    // Ensure database is created and migrated
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<UserDbContext>();
        await context.Database.EnsureCreatedAsync();

        // TODO: Add seed data if needed
        // await SeedDataAsync(context);
    }

    Log.Information("DVC User Service started successfully");

    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "DVC User Service terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
