namespace DVC.Workers.Lgsp;

public class LgspSyncWorkerService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.CompletedTask;
}

public class LgspSubmissionWorkerService : BackgroundService
{
    protected override Task ExecuteAsync(CancellationToken stoppingToken) => Task.CompletedTask;
}

public class LgspCacheService { }
public class LgspProcedureSyncService { }

public record LgspMessage;
public record LgspSubmission;
