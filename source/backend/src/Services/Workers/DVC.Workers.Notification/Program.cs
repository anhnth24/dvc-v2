using DVC.Workers.Notification;

var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddHostedService<EmailWorkerService>();
builder.Services.AddHostedService<SmsWorkerService>();

var host = builder.Build();
host.Run();
