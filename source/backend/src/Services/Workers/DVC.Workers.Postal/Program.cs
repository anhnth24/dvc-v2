using DVC.Workers.Postal;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<PostalWorkerService>();
builder.Services.AddHostedService<PostalTrackingWorkerService>();

var host = builder.Build();
host.Run();
