using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DVC.Workers.Shared.Base;

public abstract class BaseWorkerService : BackgroundService
{
    protected readonly ILogger Logger;
    protected BaseWorkerService(ILogger logger) { Logger = logger; }
}

public abstract record BaseMessage;

public class WorkerOptions { }
