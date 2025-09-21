using DVC.Workers.Lgsp;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<LgspSyncWorkerService>();
builder.Services.AddHostedService<LgspSubmissionWorkerService>();

var host = builder.Build();
host.Run();
