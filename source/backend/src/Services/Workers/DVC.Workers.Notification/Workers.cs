namespace DVC.Workers.Notification;

public class EmailWorkerService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
        => Task.CompletedTask;
}

public class SmsWorkerService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken)
        => Task.CompletedTask;
}
