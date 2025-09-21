using Polly;

namespace DVC.Shared.Infrastructure.Resilience;

public static class ResiliencePolicies
{
    public static IAsyncPolicy RetryPolicy => Policy.Handle<Exception>().RetryAsync(1);
    public static IAsyncPolicy CircuitBreakerPolicy => Policy.Handle<Exception>().CircuitBreakerAsync(2, TimeSpan.FromSeconds(30));
}