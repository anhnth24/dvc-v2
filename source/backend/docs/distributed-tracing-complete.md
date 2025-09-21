# Distributed Tracing Complete Guide - DVC v2
## OpenTelemetry Strategy + Implementation for Government Document System

**Version:** 1.0
**Ngày tạo:** 21/09/2025
**Áp dụng cho:** All DVC v2 Microservices & Workers

---

## 1. Executive Summary

Complete distributed tracing implementation for the DVC v2 system using OpenTelemetry, enabling 80% faster debugging and complete request flow visibility across all microservices, background workers, and external integrations.

### 1.1 Key Benefits

- **80% Faster Debugging**: Complete request flow visibility across all services
- **Performance Optimization**: Identify bottlenecks in real-time
- **Compliance Tracking**: Full audit trail for government requirements
- **Proactive Monitoring**: Early detection of issues before user impact

---

## 2. Quick Implementation Setup

### 2.1 Required Packages

```xml
<!-- Core OpenTelemetry packages -->
<PackageReference Include="OpenTelemetry" Version="1.6.0" />
<PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.6.0" />

<!-- Instrumentation packages -->
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.5.1-beta.1" />
<PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.5.1-beta.1" />
<PackageReference Include="OpenTelemetry.Instrumentation.EntityFrameworkCore" Version="1.0.0-beta.7" />
<PackageReference Include="OpenTelemetry.Instrumentation.StackExchangeRedis" Version="1.0.0-rc9.14" />

<!-- Exporters -->
<PackageReference Include="OpenTelemetry.Exporter.Jaeger" Version="1.5.1" />
<PackageReference Include="OpenTelemetry.Exporter.Prometheus.AspNetCore" Version="1.5.1-rc.1" />
```

### 2.2 Basic Configuration

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// Configure OpenTelemetry
builder.Services.AddOpenTelemetry()
    .WithTracing(tracerProviderBuilder =>
    {
        tracerProviderBuilder
            .AddSource("DVC.DocumentService") // Your service name
            .SetResourceBuilder(ResourceBuilder.CreateDefault()
                .AddService("DVC.DocumentService", "2.0.0"))
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddEntityFrameworkCoreInstrumentation()
            .AddJaegerExporter();
    });

var app = builder.Build();
app.UseMiddleware<CorrelationMiddleware>();
app.Run();
```

---

## 3. Activity Sources Setup

### 3.1 Central Activity Registry

```csharp
using System.Diagnostics;

namespace DVC.Shared.Observability
{
    public static class DvcActivitySources
    {
        // Service-specific activity sources
        public static readonly ActivitySource UserService = new("DVC.UserService", "2.0.0");
        public static readonly ActivitySource DocumentService = new("DVC.DocumentService", "2.0.0");
        public static readonly ActivitySource WorkflowService = new("DVC.WorkflowService", "2.0.0");
        public static readonly ActivitySource NotificationService = new("DVC.NotificationService", "2.0.0");
        public static readonly ActivitySource PostalService = new("DVC.PostalService", "2.0.0");
        public static readonly ActivitySource ApiGateway = new("DVC.ApiGateway", "2.0.0");

        // External integration sources
        public static readonly ActivitySource LgspIntegration = new("DVC.External.LGSP", "2.0.0");
        public static readonly ActivitySource SmsIntegration = new("DVC.External.SMS", "2.0.0");
        public static readonly ActivitySource PostalIntegration = new("DVC.External.Postal", "2.0.0");

        // Infrastructure sources
        public static readonly ActivitySource MessageQueue = new("DVC.MessageQueue", "2.0.0");
        public static readonly ActivitySource Database = new("DVC.Database", "2.0.0");
        public static readonly ActivitySource Cache = new("DVC.Cache", "2.0.0");
    }

    public static class DvcTags
    {
        public const string ServiceName = "service.name";
        public const string ServiceVersion = "service.version";
        public const string UserId = "user.id";
        public const string DocumentId = "document.id";
        public const string WorkflowId = "workflow.id";
        public const string ProcedureId = "procedure.id";
        public const string CorrelationId = "correlation.id";
    }
}
```

---

## 4. Correlation Strategy

### 4.1 Correlation ID Implementation

**Correlation ID Format:**
```
Format: DVC-{Service}-{Timestamp}-{RandomId}
Example: DVC-DOC-20250921143055-A7B9C2E4
```

**Middleware Implementation:**
```csharp
public class CorrelationMiddleware
{
    private const string CorrelationHeaderName = "X-Correlation-ID";
    private const string TraceIdHeaderName = "X-Trace-ID";

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var correlationId = GetOrCreateCorrelationId(context);
        var traceId = Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString();

        // Add to context for downstream use
        context.Items[CorrelationHeaderName] = correlationId;
        context.Items[TraceIdHeaderName] = traceId;

        // Add to response headers
        context.Response.Headers.Add(CorrelationHeaderName, correlationId);
        context.Response.Headers.Add(TraceIdHeaderName, traceId);

        // Add to current activity
        Activity.Current?.SetTag("correlation.id", correlationId);
        Activity.Current?.SetTag("service.name", GetServiceName());

        await next(context);
    }

    private string GetOrCreateCorrelationId(HttpContext context)
    {
        var correlationId = context.Request.Headers[CorrelationHeaderName].FirstOrDefault();

        if (string.IsNullOrEmpty(correlationId))
        {
            var serviceName = GetServiceName();
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var randomId = Random.Shared.Next(10000000, 99999999).ToString("X");
            correlationId = $"DVC-{serviceName}-{timestamp}-{randomId}";
        }

        return correlationId;
    }
}
```

### 4.2 HTTP Client Propagation

```csharp
public class TracingHttpClientService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<TracingHttpClientService> _logger;

    public TracingHttpClientService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "DVC-v2-Service");
    }

    public async Task<T> GetAsync<T>(string endpoint)
    {
        using var activity = DvcActivitySources.DocumentService.StartActivity($"HTTP GET {endpoint}");

        try
        {
            // Correlation ID is automatically propagated via OpenTelemetry
            var response = await _httpClient.GetAsync(endpoint);

            // Add response details to span
            activity?.SetTag("http.status_code", (int)response.StatusCode);
            activity?.SetTag("http.response_size", response.Content.Headers.ContentLength ?? 0);

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            _logger.LogError(ex, "HTTP request failed for {Endpoint}", endpoint);
            throw;
        }
    }
}
```

---

## 5. Business Operation Instrumentation

### 5.1 Document Processing Example

```csharp
public class DocumentService : IDocumentService
{
    private static readonly ActivitySource ActivitySource = DvcActivitySources.DocumentService;

    public async Task<Document> ProcessDocumentAsync(ProcessDocumentRequest request)
    {
        using var activity = ActivitySource.StartActivity("ProcessDocument");
        activity?.SetTag(DvcTags.DocumentId, request.DocumentId);
        activity?.SetTag(DvcTags.UserId, request.UserId);
        activity?.SetTag(DvcTags.ProcedureId, request.ProcedureId);

        try
        {
            // Step 1: Validate document
            using var validateActivity = ActivitySource.StartActivity("ValidateDocument");
            var validationResult = await ValidateDocumentAsync(request.DocumentId);
            validateActivity?.SetTag("validation.result", validationResult.IsValid);

            if (!validationResult.IsValid)
            {
                activity?.SetStatus(ActivityStatusCode.Error, "Document validation failed");
                throw new ValidationException(validationResult.Errors);
            }

            // Step 2: Start workflow
            using var workflowActivity = ActivitySource.StartActivity("StartWorkflow");
            var workflowId = await _workflowService.StartWorkflowAsync(request);
            workflowActivity?.SetTag(DvcTags.WorkflowId, workflowId);

            // Step 3: Send notifications
            using var notificationActivity = ActivitySource.StartActivity("SendNotifications");
            await _notificationService.NotifyAssignedUsersAsync(workflowId);

            activity?.SetTag("processing.status", "completed");
            return await _repository.GetByIdAsync(request.DocumentId);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.SetTag("error.type", ex.GetType().Name);
            throw;
        }
    }
}
```

### 5.2 Database Operation Tracing

```csharp
public class TracingDbContext : DbContext
{
    private static readonly ActivitySource ActivitySource = DvcActivitySources.Database;

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.AddInterceptors(new TracingCommandInterceptor());
        base.OnConfiguring(optionsBuilder);
    }
}

public class TracingCommandInterceptor : DbCommandInterceptor
{
    public override async ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        using var activity = DvcActivitySources.Database.StartActivity("Database Query");
        activity?.SetTag("db.operation", "SELECT");
        activity?.SetTag("db.table", ExtractTableName(command.CommandText));
        activity?.SetTag("db.duration_ms", eventData.Duration.TotalMilliseconds);
        activity?.SetTag("db.rows_affected", result.RecordsAffected);

        return await base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }
}
```

---

## 6. Message Queue Tracing

### 6.1 RabbitMQ Publisher

```csharp
public class TracingMessagePublisher : IMessagePublisher
{
    private static readonly ActivitySource ActivitySource = DvcActivitySources.MessageQueue;
    private readonly IConnection _connection;

    public async Task PublishAsync<T>(T message, string routingKey)
    {
        using var activity = ActivitySource.StartActivity("Message Publish");
        activity?.SetTag("messaging.system", "rabbitmq");
        activity?.SetTag("messaging.destination_kind", "topic");
        activity?.SetTag("messaging.routing_key", routingKey);

        try
        {
            // Inject trace context into message headers
            var properties = _channel.CreateBasicProperties();
            properties.Headers = new Dictionary<string, object>();

            // Propagate trace context
            var propagationContext = Activity.Current?.Context ?? default;
            var carrier = new MessageHeaderCarrier(properties.Headers);
            Propagators.DefaultTextMapPropagator.Inject(
                new PropagationContext(propagationContext, Baggage.Current),
                carrier,
                (c, key, value) => c.Set(key, value)
            );

            // Add correlation ID
            var correlationId = Activity.Current?.GetTagItem(DvcTags.CorrelationId)?.ToString();
            if (!string.IsNullOrEmpty(correlationId))
            {
                properties.CorrelationId = correlationId;
            }

            var messageBody = JsonSerializer.SerializeToUtf8Bytes(message);

            _channel.BasicPublish(
                exchange: "dvc.events",
                routingKey: routingKey,
                basicProperties: properties,
                body: messageBody
            );

            activity?.SetTag("messaging.message_size", messageBody.Length);
            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            throw;
        }
    }
}
```

### 6.2 RabbitMQ Consumer

```csharp
public class TracingMessageConsumer : IMessageConsumer
{
    private static readonly ActivitySource ActivitySource = DvcActivitySources.MessageQueue;

    public async Task ConsumeAsync(BasicDeliverEventArgs eventArgs)
    {
        // Extract trace context from message headers
        var propagationContext = Propagators.DefaultTextMapPropagator.Extract(
            default,
            eventArgs.BasicProperties.Headers,
            (headers, key) => headers.TryGetValue(key, out var value)
                ? new[] { Encoding.UTF8.GetString((byte[])value) }
                : Enumerable.Empty<string>()
        );

        using var activity = ActivitySource.StartActivity(
            "Message Process",
            ActivityKind.Consumer,
            propagationContext.ActivityContext
        );

        activity?.SetTag("messaging.system", "rabbitmq");
        activity?.SetTag("messaging.source_kind", "topic");
        activity?.SetTag("messaging.routing_key", eventArgs.RoutingKey);

        try
        {
            var messageBody = eventArgs.Body.ToArray();
            var message = JsonSerializer.Deserialize<object>(messageBody);

            await ProcessMessageAsync(message);

            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            throw;
        }
    }
}
```

---

## 7. External Service Tracing

### 7.1 LGSP Integration

```csharp
public class TracingLgspService : ILgspService
{
    private static readonly ActivitySource ActivitySource = DvcActivitySources.LgspIntegration;

    public async Task<CitizenInfo> GetCitizenInfoAsync(string citizenId)
    {
        using var activity = ActivitySource.StartActivity("LGSP GetCitizenInfo");
        activity?.SetTag("external.service", "lgsp");
        activity?.SetTag("external.operation", "get_citizen_info");
        activity?.SetTag("citizen.id", citizenId);

        try
        {
            var startTime = DateTime.UtcNow;
            var result = await _lgspClient.GetCitizenAsync(citizenId);
            var duration = DateTime.UtcNow - startTime;

            activity?.SetTag("external.duration_ms", duration.TotalMilliseconds);
            activity?.SetTag("external.status", "success");

            return result;
        }
        catch (LgspUnavailableException ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, "LGSP service unavailable");
            activity?.SetTag("external.status", "unavailable");

            // Trigger degraded mode
            return await GetCachedCitizenInfoAsync(citizenId);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.SetTag("external.status", "error");
            throw;
        }
    }
}
```

### 7.2 SMS Provider Tracing

```csharp
public class TracingSmsService : ISmsService
{
    private static readonly ActivitySource ActivitySource = DvcActivitySources.SmsIntegration;

    public async Task<SmsResult> SendSmsAsync(string phoneNumber, string message)
    {
        using var activity = ActivitySource.StartActivity("SMS Send");
        activity?.SetTag("external.service", "sms");
        activity?.SetTag("sms.phone", MaskPhoneNumber(phoneNumber));
        activity?.SetTag("sms.message_length", message.Length);

        foreach (var provider in _providers)
        {
            using var providerActivity = ActivitySource.StartActivity($"SMS Send via {provider.Name}");
            providerActivity?.SetTag("sms.provider", provider.Name);
            providerActivity?.SetTag("sms.provider_priority", provider.Priority);

            try
            {
                var result = await provider.SendAsync(phoneNumber, message);

                providerActivity?.SetTag("sms.result", "success");
                providerActivity?.SetTag("sms.message_id", result.MessageId);
                activity?.SetTag("sms.successful_provider", provider.Name);

                return result;
            }
            catch (Exception ex)
            {
                providerActivity?.SetStatus(ActivityStatusCode.Error, ex.Message);
                providerActivity?.SetTag("sms.result", "failed");
                continue;
            }
        }

        activity?.SetStatus(ActivityStatusCode.Error, "All SMS providers failed");
        throw new SmsDeliveryException("Unable to send SMS via any provider");
    }
}
```

---

## 8. Background Worker Tracing

### 8.1 Notification Worker

```csharp
public class TracingNotificationWorker : BackgroundService
{
    private static readonly ActivitySource ActivitySource = DvcActivitySources.NotificationService;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var activity = ActivitySource.StartActivity("Process Notification Queue");

            try
            {
                var messages = await _messageQueue.ReceiveAsync(10);
                activity?.SetTag("queue.messages_received", messages.Count);

                foreach (var message in messages)
                {
                    await ProcessNotificationMessage(message);
                }

                activity?.SetStatus(ActivityStatusCode.Ok);
            }
            catch (Exception ex)
            {
                activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
                _logger.LogError(ex, "Error processing notification queue");
            }

            await Task.Delay(5000, stoppingToken);
        }
    }

    private async Task ProcessNotificationMessage(NotificationMessage message)
    {
        // Extract trace context from message
        var propagationContext = ExtractTraceContext(message);

        using var activity = ActivitySource.StartActivity(
            "Process Notification",
            ActivityKind.Consumer,
            propagationContext.ActivityContext
        );

        activity?.SetTag("notification.type", message.Type);
        activity?.SetTag("notification.recipient", message.Recipient);
        activity?.SetTag(DvcTags.CorrelationId, message.CorrelationId);

        try
        {
            switch (message.Type)
            {
                case NotificationType.Email:
                    await ProcessEmailNotification(message);
                    break;
                case NotificationType.Sms:
                    await ProcessSmsNotification(message);
                    break;
            }

            activity?.SetStatus(ActivityStatusCode.Ok);
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            throw;
        }
    }
}
```

---

## 9. Advanced Configuration

### 9.1 Complete OpenTelemetry Setup

```csharp
public static class OpenTelemetryExtensions
{
    public static IServiceCollection AddDvcOpenTelemetry(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var serviceName = configuration["OpenTelemetry:ServiceName"];
        var serviceVersion = configuration["OpenTelemetry:ServiceVersion"];

        services.AddOpenTelemetry()
            .WithTracing(builder =>
            {
                builder
                    .SetSampler(new TraceIdRatioBasedSampler(0.1)) // Sample 10% of traces
                    .AddSource(serviceName)
                    .AddSource("DVC.*") // All DVC activity sources
                    .AddAspNetCoreInstrumentation(options =>
                    {
                        options.RecordException = true;
                        options.Filter = ShouldTraceRequest;
                    })
                    .AddHttpClientInstrumentation(options =>
                    {
                        options.RecordException = true;
                        options.FilterHttpRequestMessage = ShouldTraceHttpRequest;
                    })
                    .AddEntityFrameworkCoreInstrumentation(options =>
                    {
                        options.SetDbStatementForText = true;
                        options.RecordException = true;
                    })
                    .AddRedisInstrumentation()
                    .AddJaegerExporter(options =>
                    {
                        options.AgentHost = configuration["Jaeger:AgentHost"];
                        options.AgentPort = int.Parse(configuration["Jaeger:AgentPort"]);
                    });
            })
            .WithMetrics(builder =>
            {
                builder
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation()
                    .AddPrometheusExporter();
            });

        return services;
    }

    private static bool ShouldTraceRequest(HttpContext context)
    {
        // Don't trace health checks and metrics endpoints
        var path = context.Request.Path.Value?.ToLowerInvariant();
        return !path?.Contains("/health") == true && !path?.Contains("/metrics") == true;
    }
}
```

### 9.2 Configuration Settings

```json
{
  "OpenTelemetry": {
    "ServiceName": "DVC.DocumentService",
    "ServiceVersion": "2.0.0",
    "Sampling": {
      "Rate": 0.1,
      "MaxTracesPerSecond": 1000
    }
  },
  "Jaeger": {
    "AgentHost": "jaeger-agent",
    "AgentPort": 6831,
    "CollectorEndpoint": "http://jaeger-collector:14268/api/traces"
  },
  "Tracing": {
    "CorrelationHeader": "X-Correlation-ID",
    "TraceHeader": "X-Trace-ID",
    "EnabledEnvironments": ["Development", "Staging", "Production"]
  }
}
```

---

## 10. Deployment & Infrastructure

### 10.1 Jaeger Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: jaeger
  namespace: dvc-observability
spec:
  replicas: 1
  selector:
    matchLabels:
      app: jaeger
  template:
    metadata:
      labels:
        app: jaeger
    spec:
      containers:
      - name: jaeger
        image: jaegertracing/all-in-one:1.50
        ports:
        - containerPort: 16686
          name: ui
        - containerPort: 14268
          name: collector
        - containerPort: 6831
          name: agent-udp
        env:
        - name: COLLECTOR_ZIPKIN_HOST_PORT
          value: ":9411"
        - name: SPAN_STORAGE_TYPE
          value: "elasticsearch"
        - name: ES_SERVER_URLS
          value: "http://elasticsearch:9200"
        - name: ES_INDEX_PREFIX
          value: "dvc-traces"
```

### 10.2 Monitoring Dashboard

```json
{
  "dashboard": {
    "title": "DVC v2 Distributed Tracing",
    "panels": [
      {
        "title": "Request Rate by Service",
        "type": "graph",
        "targets": [
          {
            "expr": "sum(rate(traces_total[5m])) by (service_name)",
            "legendFormat": "{{service_name}}"
          }
        ]
      },
      {
        "title": "P95 Latency by Operation",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(trace_duration_bucket[5m])) by (operation_name, le))",
            "legendFormat": "{{operation_name}}"
          }
        ]
      }
    ]
  }
}
```

---

## 11. Security & Compliance

### 11.1 PII Protection

```csharp
public class PiiProtectionProcessor : BaseProcessor<Activity>
{
    private static readonly string[] SensitiveFields =
    {
        "citizen.id", "phone.number", "email.address", "document.content"
    };

    public override void OnEnd(Activity activity)
    {
        foreach (var tag in activity.Tags.ToList())
        {
            if (SensitiveFields.Any(field => tag.Key.Contains(field)))
            {
                // Replace with masked value
                activity.SetTag(tag.Key, MaskSensitiveValue(tag.Value));
            }
        }

        base.OnEnd(activity);
    }

    private string MaskSensitiveValue(string value)
    {
        if (string.IsNullOrEmpty(value) || value.Length <= 4)
            return "****";

        return value.Substring(0, 2) + new string('*', value.Length - 4) + value.Substring(value.Length - 2);
    }
}
```

### 11.2 Performance Optimization

```csharp
public class AdaptiveSampler : Sampler
{
    private readonly double _baseSamplingRate;
    private readonly Dictionary<string, double> _operationSamplingRates;

    public AdaptiveSampler(double baseSamplingRate = 0.1)
    {
        _baseSamplingRate = baseSamplingRate;
        _operationSamplingRates = new Dictionary<string, double>
        {
            // High-value operations - sample more
            ["ProcessDocument"] = 0.5,
            ["StartWorkflow"] = 0.3,
            ["SignDocument"] = 1.0, // Always trace signatures

            // High-volume, low-value operations - sample less
            ["HealthCheck"] = 0.01,
            ["GetUserInfo"] = 0.05,
            ["SearchDocuments"] = 0.1
        };
    }

    public override SamplingResult ShouldSample(in SamplingParameters samplingParameters)
    {
        var operationName = samplingParameters.Name;
        var samplingRate = _operationSamplingRates.GetValueOrDefault(operationName, _baseSamplingRate);

        // Always sample errors
        if (samplingParameters.Tags?.Any(t => t.Key == "error" && t.Value == "true") == true)
        {
            return SamplingResult.Create(SamplingDecision.RecordAndSample);
        }

        var shouldSample = Random.Shared.NextDouble() < samplingRate;
        return SamplingResult.Create(shouldSample ? SamplingDecision.RecordAndSample : SamplingDecision.Drop);
    }
}
```

---

## 12. Implementation Roadmap

### 12.1 Phase 1: Foundation (Week 1-2)
- Deploy Jaeger backend in Kubernetes
- Configure OpenTelemetry Collector
- Set up basic instrumentation in API Gateway
- Create Grafana dashboards

### 12.2 Phase 2: Service Instrumentation (Week 3-4)
- Implement tracing in all 5 microservices
- Add correlation ID middleware
- Configure database and HTTP client instrumentation
- Test trace propagation across services

### 12.3 Phase 3: Advanced Features (Week 5-6)
- Add message queue tracing
- Implement external service instrumentation
- Configure background worker tracing
- Set up sampling and performance optimization

### 12.4 Phase 4: Production Readiness (Week 7-8)
- Performance testing and optimization
- Security and compliance validation
- Team training and documentation
- Production deployment and monitoring

---

## 13. Success Metrics

- 100% trace coverage across all services
- <1ms P95 tracing overhead
- 80% reduction in mean time to resolution (MTTR)
- Complete request flow visibility for all operations

---

**Document Status:** Ready for Implementation
**Last Updated:** 21/09/2025
**Next Review:** 21/12/2025