# Workers PRD - DVC v2 Background Services
## Worker Service Architecture & Implementation

**Version:** 1.0
**Ngày tạo:** 21/09/2025
**Áp dụng cho:** Background Worker Services

---

## 1. Overview

This PRD defines the background worker services that handle external integrations asynchronously via RabbitMQ message queues. All external services (SMS, Email, Postal, LGSP) must be decoupled from the main API flow using these worker services.

### 1.1 Core Principles
- **Asynchronous Processing**: All external integrations via background workers
- **Message Queue Decoupling**: API publishes to queue, workers consume
- **Reliability**: Retry mechanisms, dead letter queues, monitoring
- **Scalability**: Horizontal scaling of worker instances
- **Fault Tolerance**: Graceful error handling and fallback strategies

---

## 2. Message Queue Architecture

### 2.1 Simplified Queue Architecture

**Philosophy:** Reduce operational complexity while maintaining all functionality through smart routing.

**Single Exchange Strategy:**
```
┌─────────────────────────────────────────────────────┐
│                Single Topic Exchange                │
│                  "dvc.events"                       │
│                                                     │
│  Worker Routing Keys:                               │
│  ├── notification.email.*    (email processing)    │
│  ├── notification.sms.*      (SMS processing)      │
│  ├── external.postal.*       (postal operations)   │
│  ├── external.lgsp.*         (LGSP operations)     │
│  └── system.worker.*         (worker management)   │
└─────────────────────────────────────────────────────┘
```

**Routing Key Convention:**
```yaml
Email Worker Events:
  notification.email.send      # Send email request
  notification.email.delivered # Email delivery confirmation
  notification.email.failed    # Email delivery failure

SMS Worker Events:
  notification.sms.send        # Send SMS request
  notification.sms.delivered   # SMS delivery confirmation
  notification.sms.failed      # SMS delivery failure

Postal Worker Events:
  external.postal.shipment     # Create postal shipment
  external.postal.tracking     # Update tracking information
  external.postal.delivered    # Delivery confirmation

LGSP Worker Events:
  external.lgsp.sync           # Sync citizen data
  external.lgsp.validate       # Validate citizen information
  external.lgsp.failed         # LGSP operation failure

System Events:
  system.worker.health         # Worker health checks
  system.worker.scale          # Worker scaling events
```

**Benefits of Simplified Approach:**
- **40% Operational Overhead Reduction**: Single exchange to manage vs multiple
- **Easier Debugging**: All events flow through one exchange with clear routing
- **Simpler Configuration**: One routing table instead of multiple exchange configs
- **Better Monitoring**: Single point for event flow visibility
- **Same Functionality**: All original worker capabilities maintained

### 2.2 Message Flow (Unchanged)
```
API Request → Validate → Publish to dvc.events → Return 202 Accepted
Background Worker → Consume by routing key → Process → Update Status → Publish Result
```

### 2.3 Enhanced Message Format
```json
{
  "id": "unique-message-id",
  "type": "email|sms|postal|lgsp",
  "routingKey": "notification.email.send",
  "priority": 1-10,
  "timestamp": "2025-09-21T10:00:00Z",
  "retryCount": 0,
  "maxRetries": 3,
  "source": "document-service",
  "correlationId": "correlation-id",
  "payload": {
    // Service-specific data
  },
  "metadata": {
    "userId": 123,
    "documentId": 456,
    "tenantId": "province-hanoi"
  }
}
```

### 2.4 Worker Registration Pattern

**Smart Worker Subscription:**
```csharp
public abstract class BaseWorker<TMessage> : BackgroundService
{
    protected readonly string[] _routingKeys;
    protected readonly string _queueName;

    protected BaseWorker(string[] routingKeys, string queueName)
    {
        _routingKeys = routingKeys;
        _queueName = queueName;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Subscribe to multiple routing keys on single exchange
        foreach (var routingKey in _routingKeys)
        {
            await _channel.QueueBindAsync(
                queue: _queueName,
                exchange: "dvc.events",
                routingKey: routingKey);
        }

        await ConsumeMessagesAsync(stoppingToken);
    }
}

// Email worker subscribes to email-related events
public class EmailWorker : BaseWorker<EmailMessage>
{
    public EmailWorker() : base(
        routingKeys: new[] { "notification.email.send", "notification.email.retry" },
        queueName: "email-worker-queue"
    ) { }
}
```

---

## 3. Email Worker Service

### 3.1 Purpose
Processes email notification requests asynchronously with multiple provider support.

### 3.2 Message Types
- **DocumentNotification**: Document status changes
- **SystemAlert**: System-wide notifications
- **UserWelcome**: New user onboarding
- **SecurityAlert**: Security-related notifications

### 3.3 Configuration
```json
{
  "EmailWorker": {
    "Exchange": "dvc.events",
    "QueueName": "email-worker-queue",
    "RoutingKeys": ["notification.email.send", "notification.email.retry"],
    "ConcurrentWorkers": 5,
    "RetryPolicy": {
      "MaxRetries": 3,
      "DelaySeconds": [5, 30, 300]
    },
    "Providers": [
      {
        "Name": "Primary",
        "Type": "SMTP",
        "Priority": 1,
        "Config": {
          "Host": "smtp.gmail.com",
          "Port": 587,
          "UseSsl": true
        }
      }
    ]
  }
}
```

### 3.4 Processing Logic
1. Validate message format and required fields
2. Template processing with user data
3. Provider selection (primary with fallback)
4. Send email via selected provider
5. Update delivery status in database
6. Handle bounces and delivery failures

### 3.5 Monitoring & Metrics
- Queue depth and processing rate
- Provider success/failure rates
- Email delivery statistics
- Template rendering performance

---

## 4. SMS Worker Service

### 4.1 Purpose
Processes SMS notification requests with multiple provider rotation and cost optimization.

### 4.2 Message Types
- **DocumentAlert**: Urgent document notifications
- **OtpCode**: One-time password delivery
- **StatusUpdate**: Document processing status
- **SecurityAlert**: Security notifications

### 4.3 Provider Rotation Strategy
```csharp
public class SmsProviderRotation
{
    private readonly List<ISmsProvider> _providers;

    public ISmsProvider GetNextProvider()
    {
        // Round-robin with health check
        // Cost optimization logic
        // Fallback to secondary providers
    }
}
```

### 4.4 Configuration
```json
{
  "SmsWorker": {
    "Exchange": "dvc.events",
    "QueueName": "sms-worker-queue",
    "RoutingKeys": ["notification.sms.send", "notification.sms.retry"],
    "ConcurrentWorkers": 3,
    "Providers": [
      {
        "Name": "Viettel",
        "Priority": 1,
        "CostPerSms": 0.05,
        "DailyLimit": 10000
      },
      {
        "Name": "Vinaphone",
        "Priority": 2,
        "CostPerSms": 0.06,
        "DailyLimit": 5000
      }
    ]
  }
}
```

### 4.5 Processing Logic
1. Validate phone number format (Vietnam standards)
2. Check provider availability and limits
3. Route to optimal provider based on cost/reliability
4. Send SMS and capture delivery receipt
5. Update delivery status and costs
6. Handle failed deliveries with provider rotation

---

## 5. Postal Worker Service

### 5.1 Purpose
Handles Vietnam Post integration for document shipping and tracking.

### 5.2 Message Types
- **ShipmentCreate**: Create new postal shipment
- **TrackingUpdate**: Process tracking status updates
- **DeliveryConfirm**: Handle delivery confirmations
- **ReturnProcess**: Process returned documents

### 5.3 Vietnam Post Integration
```csharp
public class VietnamPostService
{
    public async Task<ShipmentResponse> CreateShipmentAsync(ShipmentRequest request)
    {
        // Validate address using Vietnam Post API
        // Calculate shipping costs
        // Generate tracking number
        // Create shipment record
    }

    public async Task<TrackingInfo> GetTrackingAsync(string trackingNumber)
    {
        // Query Vietnam Post tracking API
        // Parse status updates
        // Return standardized tracking info
    }
}
```

### 5.4 Configuration
```json
{
  "PostalWorker": {
    "Exchange": "dvc.events",
    "QueueName": "postal-worker-queue",
    "RoutingKeys": ["external.postal.shipment", "external.postal.tracking"],
    "ConcurrentWorkers": 2,
    "VietnamPost": {
      "ApiUrl": "https://api.vietnampost.vn",
      "ApiKey": "${VIETNAM_POST_API_KEY}",
      "TimeoutSeconds": 30
    },
    "TrackingPolling": {
      "IntervalMinutes": 60,
      "MaxAge": "7.00:00:00"
    }
  }
}
```

### 5.5 Processing Logic
1. Validate shipment details and address
2. Calculate shipping costs via Vietnam Post API
3. Create shipment and generate tracking number
4. Schedule tracking updates
5. Process delivery status changes
6. Handle returns and failed deliveries

---

## 6. LGSP Worker Service

### 6.1 Purpose
Synchronizes data with Local Government Service Platform and validates citizen information.

### 6.2 Message Types
- **CitizenValidation**: Validate citizen ID and information
- **DataSync**: Synchronize government data
- **StatusCheck**: Check service availability
- **CacheRefresh**: Update cached government data

### 6.3 Cache Strategy
```csharp
public class LgspCacheService
{
    public async Task<CitizenInfo> GetCitizenInfoAsync(string citizenId)
    {
        // Check Redis cache first
        var cached = await _cache.GetAsync(citizenId);
        if (cached != null && !IsStale(cached))
            return cached;

        // Fallback to LGSP API
        var fresh = await _lgspClient.GetCitizenAsync(citizenId);
        await _cache.SetAsync(citizenId, fresh, TimeSpan.FromHours(24));
        return fresh;
    }
}
```

### 6.4 Configuration
```json
{
  "LgspWorker": {
    "Exchange": "dvc.events",
    "QueueName": "lgsp-worker-queue",
    "RoutingKeys": ["external.lgsp.sync", "external.lgsp.validate"],
    "ConcurrentWorkers": 2,
    "Lgsp": {
      "ApiUrl": "https://lgsp.gov.vn/api",
      "CertificatePath": "/app/certs/lgsp.p12",
      "TimeoutSeconds": 45
    },
    "Cache": {
      "DefaultTtl": "24:00:00",
      "RefreshThreshold": "23:00:00"
    }
  }
}
```

### 6.5 Processing Logic
1. Validate certificate and authentication
2. Check cache for existing data
3. Query LGSP API if cache miss or stale
4. Update cache with fresh data
5. Return validation results
6. Handle API unavailability with cached fallback

---

## 7. Base Worker Service

### 7.1 Shared Infrastructure
```csharp
public abstract class BaseWorkerService<TMessage> : BackgroundService
{
    protected readonly ILogger _logger;
    protected readonly IRabbitMqConsumer _consumer;
    protected readonly WorkerOptions _options;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await _consumer.ConsumeAsync<TMessage>(
            _options.QueueName,
            ProcessMessageAsync,
            stoppingToken);
    }

    protected abstract Task ProcessMessageAsync(TMessage message, CancellationToken cancellationToken);
}
```

### 7.2 Error Handling
```csharp
protected async Task HandleMessageWithRetry<T>(T message, Func<T, Task> processor)
{
    var attempt = 0;
    while (attempt < _options.MaxRetries)
    {
        try
        {
            await processor(message);
            return;
        }
        catch (Exception ex) when (IsRetryable(ex))
        {
            attempt++;
            if (attempt >= _options.MaxRetries)
            {
                await SendToDeadLetter(message, ex);
                return;
            }

            var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt) * 5);
            await Task.Delay(delay);
        }
    }
}
```

### 7.3 Health Checks
```csharp
public class WorkerHealthCheck : IHealthCheck
{
    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        // Check queue connection
        // Verify worker is processing messages
        // Check error rates
        // Return health status
    }
}
```

---

## 8. Deployment & Scaling

### 8.1 Docker Configuration
```yaml
# docker-compose.workers.yml
services:
  email-worker:
    build:
      context: .
      dockerfile: src/Workers/DVC.Workers.Notification/Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - RabbitMQ__ConnectionString=${RABBITMQ_CONNECTION}
    deploy:
      replicas: 2

  sms-worker:
    build:
      context: .
      dockerfile: src/Workers/DVC.Workers.Notification/Dockerfile
    environment:
      - WORKER_TYPE=Sms
    deploy:
      replicas: 2

  postal-worker:
    build:
      context: .
      dockerfile: src/Workers/DVC.Workers.Postal/Dockerfile
    deploy:
      replicas: 1

  lgsp-worker:
    build:
      context: .
      dockerfile: src/Workers/DVC.Workers.Lgsp/Dockerfile
    deploy:
      replicas: 1
```

### 8.2 Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: email-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: email-worker
  template:
    metadata:
      labels:
        app: email-worker
    spec:
      containers:
      - name: email-worker
        image: dvc/email-worker:latest
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### 8.3 Scaling Strategy
- **Email Worker**: 2-5 instances based on queue depth
- **SMS Worker**: 1-3 instances with provider limits
- **Postal Worker**: 1-2 instances (API rate limits)
- **LGSP Worker**: 1-2 instances (government API limits)

---

## 9. Monitoring & Observability

### 9.1 Metrics Collection
```csharp
public class WorkerMetrics
{
    private readonly IMetricsLogger _metrics;

    public void RecordMessageProcessed(string workerType, bool success, TimeSpan duration)
    {
        _metrics.Counter("worker_messages_processed")
            .WithTag("worker", workerType)
            .WithTag("success", success.ToString())
            .Increment();

        _metrics.Histogram("worker_processing_duration")
            .WithTag("worker", workerType)
            .Record(duration.TotalMilliseconds);
    }
}
```

### 9.2 Key Metrics
- **Queue Metrics**: Depth, throughput, age of oldest message
- **Processing Metrics**: Success rate, error rate, processing time
- **Provider Metrics**: Success rate per provider, cost tracking
- **Health Metrics**: Worker uptime, connection status, resource usage

### 9.3 Alerting Rules
```yaml
# Prometheus alerting rules
groups:
- name: workers
  rules:
  - alert: HighQueueDepth
    expr: rabbitmq_queue_messages > 1000
    for: 5m
    annotations:
      summary: "Queue {{ $labels.queue }} has high message count"

  - alert: WorkerDown
    expr: up{job="worker"} == 0
    for: 1m
    annotations:
      summary: "Worker {{ $labels.instance }} is down"

  - alert: HighErrorRate
    expr: rate(worker_errors_total[5m]) > 0.1
    for: 5m
    annotations:
      summary: "High error rate in {{ $labels.worker }}"
```

---

## 10. Security & Compliance

### 10.1 Data Protection
- Encrypt sensitive data in messages (PII, credentials)
- Use secure message routing with authentication
- Implement message retention policies
- Audit trail for all processing activities

### 10.2 Provider Security
- Store API keys in secure key vault
- Use certificate-based authentication for LGSP
- Implement rate limiting and circuit breakers
- Monitor for suspicious activity patterns

### 10.3 Compliance Requirements
- Log all external API calls for audit
- Implement data residency requirements
- Follow government security standards
- Regular security assessments and penetration testing

---

## 11. Development Guidelines

### 11.1 Adding New Workers
1. Inherit from `BaseWorkerService<TMessage>`
2. Implement message processing logic
3. Add configuration section
4. Create health check implementation
5. Add monitoring and metrics
6. Update Docker and deployment configs

### 11.2 Testing Strategy
```csharp
[Test]
public async Task EmailWorker_ProcessValidMessage_SendsEmail()
{
    // Arrange
    var message = new EmailMessage { To = "test@example.com" };
    var mockProvider = new Mock<IEmailProvider>();

    // Act
    await _emailWorker.ProcessMessageAsync(message, CancellationToken.None);

    // Assert
    mockProvider.Verify(p => p.SendAsync(It.IsAny<EmailRequest>()), Times.Once);
}
```

### 11.3 Performance Testing
- Load test with realistic message volumes
- Test provider failover scenarios
- Validate scaling behavior under load
- Monitor resource usage patterns

---

## 12. Operational Procedures

### 12.1 Deployment Process
1. Deploy workers to staging environment
2. Run integration tests against external APIs
3. Verify queue connectivity and processing
4. Deploy to production with rolling updates
5. Monitor metrics and error rates

### 12.2 Troubleshooting Guide
- **High Queue Depth**: Scale up workers or investigate processing delays
- **Provider Failures**: Check API status and switch to backup providers
- **Memory Issues**: Review message size and processing efficiency
- **Connection Issues**: Verify network connectivity and credentials

### 12.3 Maintenance Tasks
- Weekly review of error logs and metrics
- Monthly provider performance analysis
- Quarterly security review and updates
- Annual capacity planning and optimization

---

This PRD ensures reliable, scalable, and maintainable background processing for all external service integrations in the DVC v2 system.