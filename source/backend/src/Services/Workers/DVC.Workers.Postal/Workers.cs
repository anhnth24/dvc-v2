namespace DVC.Workers.Postal;

public class PostalWorkerService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.CompletedTask;
}

public class PostalTrackingWorkerService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.CompletedTask;
}

public class PostalStatusUpdateService { }

public record PostalMessage;
public record TrackingMessage;
