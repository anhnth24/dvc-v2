using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DVC.ApiGateway.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddGatewayServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddCors(options =>
        {
            options.AddPolicy("Default", policy =>
            {
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // TODO: add Authentication/Authorization and logging providers here
        return services;
    }
}
