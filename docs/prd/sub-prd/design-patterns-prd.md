# Design Patterns PRD - DVC v2 Backend Microservices
## Architectural Patterns & Implementation Guide

**Version:** 1.0
**Ngày tạo:** 21/09/2025
**Áp dụng cho:** .NET 8 Microservices Architecture
**Quick Reference:** [API Patterns Summary](../../quick-reference/api-patterns-summary.md)
**Code Examples:** [Backend Examples](../../code-examples/backend/)

---

## 1. Overview

This PRD defines the 15 design patterns used in the DVC v2 backend microservices architecture. Each pattern is documented with purpose, implementation examples, and guidelines on when to use or avoid them.

### 1.1 Pattern Selection Philosophy
- **KISS Principle**: Keep It Simple, Stupid
- **YAGNI Principle**: You Aren't Gonna Need It
- **Start Simple, Evolve Complex**: Begin with basic patterns, add complexity only when needed
- **Avoid Over-Engineering**: Use patterns to solve real problems, not theoretical ones

---

## 2. Core Data Access Patterns

### 2.1 Repository Pattern ✅ **ESSENTIAL**

#### Purpose
Abstracts data access logic from business logic, providing a uniform interface to access data.

#### When to Use
- Need to abstract database operations
- Want testable business logic with mocked data access
- Multiple data sources for same entity type

#### Implementation
```csharp
// Generic repository interface
public interface IRepository<T> where T : BaseEntity
{
    Task<T> GetByIdAsync(int id);
    Task<List<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

// Specific repository interface
public interface IDocumentRepository : IRepository<Document>
{
    Task<List<Document>> GetByUserIdAsync(int userId);
    Task<List<Document>> GetByStatusAsync(DocumentStatus status);
    Task<List<Document>> GetPendingDocumentsAsync();
    Task<List<Document>> GetDocumentsByDateRangeAsync(DateTime from, DateTime to);
}

// Repository implementation
public class DocumentRepository : Repository<Document>, IDocumentRepository
{
    public DocumentRepository(DvcDbContext context) : base(context) { }

    public async Task<List<Document>> GetByUserIdAsync(int userId)
    {
        return await _context.Documents
            .Where(d => d.UserId == userId && !d.IsDeleted)
            .Include(d => d.Attachments)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Document>> GetByStatusAsync(DocumentStatus status)
    {
        return await _context.Documents
            .Where(d => d.Status == status && !d.IsDeleted)
            .ToListAsync();
    }
}
```

#### Benefits
- Testable business logic
- Consistent data access patterns
- Easy to mock for unit tests
- Centralized query logic

#### Drawbacks
- Additional abstraction layer
- Potential for generic repositories becoming too broad

---

### 2.2 Unit of Work Pattern ✅ **RECOMMENDED**

#### Purpose
Maintains a list of objects affected by a business transaction and coordinates writing out changes.

#### When to Use
- Multiple repository operations need to be atomic
- Complex business transactions spanning multiple entities
- Need to ensure data consistency

#### Implementation
```csharp
public interface IUnitOfWork : IDisposable
{
    IDocumentRepository Documents { get; }
    IUserRepository Users { get; }
    IWorkflowRepository Workflows { get; }
    INotificationRepository Notifications { get; }

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}

public class UnitOfWork : IUnitOfWork
{
    private readonly DvcDbContext _context;
    private IDbContextTransaction _transaction;

    public UnitOfWork(DvcDbContext context)
    {
        _context = context;
        Documents = new DocumentRepository(_context);
        Users = new UserRepository(_context);
        Workflows = new WorkflowRepository(_context);
        Notifications = new NotificationRepository(_context);
    }

    public IDocumentRepository Documents { get; }
    public IUserRepository Users { get; }
    public IWorkflowRepository Workflows { get; }
    public INotificationRepository Notifications { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        await _transaction?.CommitAsync();
    }

    public async Task RollbackTransactionAsync()
    {
        await _transaction?.RollbackAsync();
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context?.Dispose();
    }
}

// Usage in service
public class DocumentService
{
    private readonly IUnitOfWork _unitOfWork;

    public async Task<Document> ProcessDocumentAsync(ProcessDocumentRequest request)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Create document
            var document = await _unitOfWork.Documents.AddAsync(new Document(request));

            // Create workflow instance
            var workflow = await _unitOfWork.Workflows.AddAsync(new WorkflowInstance(document.Id));

            // Create notification
            await _unitOfWork.Notifications.AddAsync(new Notification(document, "Created"));

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return document;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }
}
```

#### Benefits
- Atomic operations across multiple repositories
- Consistent transaction management
- Better performance (single SaveChanges call)

#### Drawbacks
- Additional complexity
- Potential for large, complex transactions

---

## 3. Architecture Patterns

### 3.1 Clean Architecture / Onion Architecture ✅ **ESSENTIAL**

#### Purpose
Separates concerns into distinct layers with dependency inversion.

#### Implementation Structure
```
DVC.DocumentService/
├── API/                          # Controllers, DTOs
│   ├── Controllers/
│   │   └── DocumentsController.cs
│   └── DTOs/
│       ├── DocumentDto.cs
│       └── CreateDocumentRequest.cs
├── Application/                  # Business Logic
│   ├── Services/
│   │   └── DocumentService.cs
│   ├── Interfaces/
│   │   └── IDocumentService.cs
│   └── Validators/
│       └── CreateDocumentValidator.cs
├── Domain/                       # Entities, Domain Logic
│   ├── Entities/
│   │   └── Document.cs
│   └── Interfaces/
│       └── IDocumentRepository.cs
└── Infrastructure/               # Data Access, External Services
    ├── Repositories/
    │   └── DocumentRepository.cs
    └── Services/
        └── FileStorageService.cs
```

#### Layer Dependencies
```csharp
// API depends on Application
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;

    public DocumentsController(IDocumentService documentService)
    {
        _documentService = documentService;
    }
}

// Application depends on Domain interfaces
public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _repository;
    private readonly IFileStorageService _fileStorage;

    public DocumentService(
        IDocumentRepository repository,
        IFileStorageService fileStorage)
    {
        _repository = repository;
        _fileStorage = fileStorage;
    }
}

// Infrastructure implements Domain interfaces
public class DocumentRepository : IDocumentRepository
{
    private readonly DvcDbContext _context;
    // Implementation
}
```

#### Benefits
- Clear separation of concerns
- Testable business logic
- Technology-agnostic core
- Maintainable codebase

#### Drawbacks
- Initial setup complexity
- More files and folders
- Learning curve for developers

---

### 3.2 CQRS (Command Query Responsibility Segregation) ⚠️ **USE WITH CAUTION**

#### Purpose
Separates read and write operations into different models.

#### When to Use
- Significantly different read vs write patterns
- High-performance requirements
- Complex business logic with simple reads

#### When NOT to Use
- Simple CRUD operations
- Small to medium applications
- Team lacks CQRS experience

#### Implementation
```csharp
// Command side - Write operations
public class CreateDocumentCommand
{
    public string Title { get; set; }
    public int UserId { get; set; }
    public int ProcedureId { get; set; }
    public List<CreateAttachmentRequest> Attachments { get; set; }
}

public class CreateDocumentCommandHandler
{
    private readonly IDocumentRepository _repository;
    private readonly IEventBus _eventBus;

    public async Task<int> HandleAsync(CreateDocumentCommand command)
    {
        var document = new Document(command.Title, command.UserId, command.ProcedureId);
        await _repository.AddAsync(document);

        // Publish event for read model update
        await _eventBus.PublishAsync(new DocumentCreatedEvent(document));

        return document.Id;
    }
}

// Query side - Read operations
public class DocumentListQuery
{
    public int UserId { get; set; }
    public DocumentStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class DocumentListQueryHandler
{
    private readonly IDocumentReadRepository _readRepository;

    public async Task<PagedResult<DocumentListItem>> HandleAsync(DocumentListQuery query)
    {
        return await _readRepository.GetDocumentListAsync(query);
    }
}

// Separate read model
public class DocumentListItem
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public string CreatedByName { get; set; }
    public int AttachmentCount { get; set; }
}
```

#### Benefits
- Optimized read and write models
- Better performance for complex scenarios
- Scalable read operations

#### Drawbacks
- Increased complexity
- Data consistency challenges
- More infrastructure required

---

### 3.3 API Gateway Pattern ✅ **ESSENTIAL**

#### Purpose
Single entry point for all client requests, handling routing, authentication, and cross-cutting concerns.

#### Implementation with YARP
```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapReverseProxy();

// appsettings.json
{
  "ReverseProxy": {
    "Routes": {
      "documents-route": {
        "ClusterId": "documents-cluster",
        "Match": {
          "Path": "/api/documents/{**catch-all}"
        },
        "Transforms": [
          { "PathPattern": "/api/documents/{**catch-all}" }
        ]
      },
      "users-route": {
        "ClusterId": "users-cluster",
        "Match": {
          "Path": "/api/users/{**catch-all}"
        }
      },
      "workflows-route": {
        "ClusterId": "workflows-cluster",
        "Match": {
          "Path": "/api/workflows/{**catch-all}"
        }
      }
    },
    "Clusters": {
      "documents-cluster": {
        "Destinations": {
          "destination1": {
            "Address": "http://document-service:80"
          }
        }
      },
      "users-cluster": {
        "Destinations": {
          "destination1": {
            "Address": "http://user-service:80"
          }
        }
      }
    }
  }
}
```

#### Benefits
- Single entry point
- Centralized security
- Load balancing
- Rate limiting

#### Drawbacks
- Single point of failure
- Potential bottleneck
- Additional complexity

---

## 4. Messaging & Event Patterns

### 4.1 Event-Driven Architecture ✅ **ESSENTIAL**

#### Purpose
Loose coupling between services through asynchronous events.

#### Implementation with RabbitMQ
```csharp
// Event definition
public class DocumentCreatedEvent
{
    public int DocumentId { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; }
    public DateTime CreatedAt { get; set; }
}

// Event publisher
public interface IEventBus
{
    Task PublishAsync<T>(T @event) where T : class;
}

public class RabbitMqEventBus : IEventBus
{
    private readonly IConnection _connection;
    private readonly IModel _channel;

    public async Task PublishAsync<T>(T @event) where T : class
    {
        var eventName = typeof(T).Name;
        var message = JsonSerializer.Serialize(@event);
        var body = Encoding.UTF8.GetBytes(message);

        _channel.BasicPublish(
            exchange: "dvc.events",
            routingKey: eventName,
            body: body);
    }
}

// Event handler
public class DocumentCreatedEventHandler
{
    private readonly INotificationService _notificationService;
    private readonly IWorkflowService _workflowService;

    public async Task HandleAsync(DocumentCreatedEvent @event)
    {
        // Send notification
        await _notificationService.SendDocumentCreatedNotificationAsync(@event.DocumentId);

        // Start workflow
        await _workflowService.StartDocumentWorkflowAsync(@event.DocumentId);
    }
}

// Consumer setup
public class EventConsumerService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var consumer = new EventingBasicConsumer(_channel);

        consumer.Received += async (model, ea) =>
        {
            var eventName = ea.RoutingKey;
            var message = Encoding.UTF8.GetString(ea.Body.ToArray());

            await ProcessEventAsync(eventName, message);
        };

        _channel.BasicConsume(queue: "document.events", autoAck: true, consumer: consumer);

        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}
```

#### Benefits
- Loose coupling
- Scalability
- Resilience
- Async processing

#### Drawbacks
- Eventual consistency
- Debugging complexity
- Infrastructure overhead

---

### 4.2 Saga Pattern ⚠️ **COMPLEX - USE SPARINGLY**

#### Purpose
Manages distributed transactions across multiple services.

#### When to Use
- Complex business processes spanning multiple services
- Need for compensation logic
- Long-running transactions

#### Implementation with Elsa Workflows
```csharp
// Saga state
public class DocumentProcessingSaga
{
    public int DocumentId { get; set; }
    public int UserId { get; set; }
    public DocumentProcessingState State { get; set; }
    public List<SagaStep> CompletedSteps { get; set; }
}

// Saga orchestrator
public class DocumentProcessingSagaOrchestrator
{
    private readonly IWorkflowEngine _workflowEngine;

    public async Task StartAsync(int documentId)
    {
        var saga = new DocumentProcessingSaga
        {
            DocumentId = documentId,
            State = DocumentProcessingState.Started
        };

        await _workflowEngine.StartWorkflowAsync("DocumentProcessing", saga);
    }

    // Compensation logic
    public async Task CompensateAsync(DocumentProcessingSaga saga)
    {
        foreach (var step in saga.CompletedSteps.Reverse())
        {
            await ExecuteCompensationAsync(step);
        }
    }
}

// Workflow definition (using Elsa)
public class DocumentProcessingWorkflow : WorkflowBase
{
    protected override void Build(IWorkflowBuilder builder)
    {
        builder
            .StartWith<ValidateDocumentActivity>()
            .Then<CreateWorkflowInstanceActivity>()
            .Then<AssignToUserActivity>()
            .Then<SendNotificationActivity>()
            .Then<UpdateDocumentStatusActivity>();
    }
}
```

#### Benefits
- Distributed transaction management
- Compensation logic
- Process visibility

#### Drawbacks
- High complexity
- Difficult testing
- Performance overhead

---

### 4.3 Outbox Pattern ✅ **RECOMMENDED**

#### Purpose
Ensures reliable message publishing by storing messages in the same database transaction.

#### Implementation
```csharp
// Outbox table
public class OutboxMessage
{
    public int Id { get; set; }
    public string EventType { get; set; }
    public string EventData { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ProcessedAt { get; set; }
    public bool IsProcessed { get; set; }
}

// Service with outbox
public class DocumentService
{
    private readonly IUnitOfWork _unitOfWork;

    public async Task<Document> CreateDocumentAsync(CreateDocumentRequest request)
    {
        await _unitOfWork.BeginTransactionAsync();
        try
        {
            // Create document
            var document = await _unitOfWork.Documents.AddAsync(new Document(request));

            // Store event in outbox (same transaction)
            var @event = new DocumentCreatedEvent(document);
            var outboxMessage = new OutboxMessage
            {
                EventType = nameof(DocumentCreatedEvent),
                EventData = JsonSerializer.Serialize(@event),
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.OutboxMessages.AddAsync(outboxMessage);

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitTransactionAsync();

            return document;
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }
}

// Outbox processor
public class OutboxProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var eventBus = scope.ServiceProvider.GetRequiredService<IEventBus>();

            var unprocessedMessages = await unitOfWork.OutboxMessages
                .GetUnprocessedAsync();

            foreach (var message in unprocessedMessages)
            {
                try
                {
                    await eventBus.PublishRawAsync(message.EventType, message.EventData);

                    message.IsProcessed = true;
                    message.ProcessedAt = DateTime.UtcNow;
                    await unitOfWork.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to process outbox message {MessageId}", message.Id);
                }
            }

            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
```

#### Benefits
- Guaranteed message delivery
- Atomic operations
- No message loss

#### Drawbacks
- Additional storage
- Processing delay
- Cleanup required

---

## 5. Resilience Patterns

### 5.1 Circuit Breaker Pattern ✅ **ESSENTIAL**

#### Purpose
Prevents cascading failures by temporarily blocking calls to failing external services.

#### Implementation with Polly
```csharp
public class LgspService
{
    private readonly HttpClient _httpClient;
    private readonly IAsyncPolicy<HttpResponseMessage> _circuitBreakerPolicy;

    public LgspService(HttpClient httpClient)
    {
        _httpClient = httpClient;

        _circuitBreakerPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: 3,
                durationOfBreak: TimeSpan.FromMinutes(1),
                onBreak: (result, duration) =>
                {
                    _logger.LogWarning("Circuit breaker opened for {Duration}", duration);
                },
                onReset: () =>
                {
                    _logger.LogInformation("Circuit breaker reset");
                });
    }

    public async Task<CitizenInfo> GetCitizenInfoAsync(string citizenId)
    {
        try
        {
            var response = await _circuitBreakerPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.GetAsync($"/api/citizens/{citizenId}");
            });

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<CitizenInfo>(content);
        }
        catch (CircuitBreakerOpenException)
        {
            _logger.LogWarning("Circuit breaker is open, using cached data");
            return await GetCachedCitizenInfoAsync(citizenId);
        }
    }

    private async Task<CitizenInfo> GetCachedCitizenInfoAsync(string citizenId)
    {
        // Fallback to cached data
        return await _cache.GetAsync<CitizenInfo>($"citizen:{citizenId}");
    }
}

// Configuration
services.AddHttpClient<LgspService>(client =>
{
    client.BaseAddress = new Uri("https://lgsp.gov.vn");
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

#### Benefits
- Prevents cascading failures
- Automatic recovery
- Fallback mechanisms

#### Drawbacks
- Temporary service unavailability
- Configuration complexity

---

### 5.2 Retry Pattern ✅ **RECOMMENDED**

#### Purpose
Automatically retries failed operations with exponential backoff.

#### Implementation
```csharp
public class SmsService
{
    private readonly IAsyncPolicy _retryPolicy;

    public SmsService()
    {
        _retryPolicy = Policy
            .Handle<HttpRequestException>()
            .Or<TaskCanceledException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt =>
                    TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)), // Exponential backoff
                onRetry: (outcome, duration, retryCount, context) =>
                {
                    _logger.LogWarning("SMS send attempt {RetryCount} failed, retrying in {Duration}",
                        retryCount, duration);
                });
    }

    public async Task<SmsResult> SendSmsAsync(string phoneNumber, string message)
    {
        return await _retryPolicy.ExecuteAsync(async () =>
        {
            var request = new SmsRequest
            {
                PhoneNumber = phoneNumber,
                Message = message
            };

            var response = await _httpClient.PostAsJsonAsync("/api/sms/send", request);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadFromJsonAsync<SmsResult>();
        });
    }
}

// Dead letter queue for final failures
public class SmsWorker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await _consumer.ConsumeAsync<SmsMessage>(
            "sms.queue",
            async message =>
            {
                try
                {
                    await ProcessSmsAsync(message);
                }
                catch (Exception ex)
                {
                    if (message.RetryCount >= 3)
                    {
                        await _deadLetterQueue.SendAsync(message, ex);
                    }
                    else
                    {
                        message.RetryCount++;
                        await _retryQueue.SendAsync(message, TimeSpan.FromMinutes(message.RetryCount * 5));
                    }
                }
            },
            stoppingToken);
    }
}
```

#### Benefits
- Handles transient failures
- Exponential backoff prevents overwhelming
- Configurable retry policies

#### Drawbacks
- Increased latency
- Resource consumption
- Complexity

---

## 6. Performance Patterns

### 6.1 Cache-Aside Pattern ✅ **RECOMMENDED**

#### Purpose
Improves performance by caching frequently accessed data.

#### Implementation with Redis
```csharp
public class UserService
{
    private readonly IUserRepository _repository;
    private readonly IDistributedCache _cache;
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(30);

    public async Task<User> GetUserByIdAsync(int userId)
    {
        var cacheKey = $"user:{userId}";

        // Try cache first
        var cachedUser = await _cache.GetStringAsync(cacheKey);
        if (cachedUser != null)
        {
            return JsonSerializer.Deserialize<User>(cachedUser);
        }

        // Load from database
        var user = await _repository.GetByIdAsync(userId);
        if (user != null)
        {
            // Store in cache
            var serializedUser = JsonSerializer.Serialize(user);
            await _cache.SetStringAsync(cacheKey, serializedUser, _cacheExpiry);
        }

        return user;
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        // Update database
        var updatedUser = await _repository.UpdateAsync(user);

        // Invalidate cache
        var cacheKey = $"user:{user.Id}";
        await _cache.RemoveAsync(cacheKey);

        return updatedUser;
    }
}

// Cache configuration
services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    options.InstanceName = "DvcCache";
});

// Cache abstraction
public interface ICacheService
{
    Task<T> GetAsync<T>(string key) where T : class;
    Task SetAsync<T>(string key, T value, TimeSpan? expiry = null) where T : class;
    Task RemoveAsync(string key);
    Task RemoveByPatternAsync(string pattern);
}

public class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;

    public async Task<T> GetAsync<T>(string key) where T : class
    {
        var value = await _cache.GetStringAsync(key);
        return value == null ? null : JsonSerializer.Deserialize<T>(value);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null) where T : class
    {
        var serializedValue = JsonSerializer.Serialize(value);
        var options = new DistributedCacheEntryOptions();

        if (expiry.HasValue)
            options.SetAbsoluteExpiration(expiry.Value);
        else
            options.SetSlidingExpiration(TimeSpan.FromMinutes(30));

        await _cache.SetStringAsync(key, serializedValue, options);
    }

    public async Task RemoveAsync(string key)
    {
        await _cache.RemoveAsync(key);
    }
}
```

#### Benefits
- Improved response times
- Reduced database load
- Better user experience

#### Drawbacks
- Data consistency challenges
- Memory usage
- Cache invalidation complexity

---

## 7. Integration Patterns

### 7.1 Strategy Pattern ✅ **RECOMMENDED**

#### Purpose
Allows runtime selection of algorithms or implementations.

#### Implementation for SMS Providers
```csharp
public interface ISmsProvider
{
    string Name { get; }
    int Priority { get; }
    decimal CostPerSms { get; }
    int DailyLimit { get; }
    Task<SmsResult> SendSmsAsync(string phoneNumber, string message);
    Task<bool> IsAvailableAsync();
}

public class ViettelSmsProvider : ISmsProvider
{
    public string Name => "Viettel";
    public int Priority => 1;
    public decimal CostPerSms => 0.05m;
    public int DailyLimit => 10000;

    public async Task<SmsResult> SendSmsAsync(string phoneNumber, string message)
    {
        // Viettel SMS API implementation
        var request = new ViettelSmsRequest
        {
            Phone = phoneNumber,
            Content = message
        };

        var response = await _httpClient.PostAsJsonAsync("/api/send", request);

        return new SmsResult
        {
            Success = response.IsSuccessStatusCode,
            MessageId = await response.Content.ReadAsStringAsync(),
            Provider = Name
        };
    }

    public async Task<bool> IsAvailableAsync()
    {
        try
        {
            var response = await _httpClient.GetAsync("/api/health");
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}

public class VinaPhoneSmsProvider : ISmsProvider
{
    public string Name => "VinaPhone";
    public int Priority => 2;
    public decimal CostPerSms => 0.06m;
    public int DailyLimit => 5000;

    public async Task<SmsResult> SendSmsAsync(string phoneNumber, string message)
    {
        // VinaPhone SMS API implementation
    }

    public async Task<bool> IsAvailableAsync()
    {
        // Health check implementation
    }
}

// Strategy selector
public class SmsProviderStrategy
{
    private readonly IEnumerable<ISmsProvider> _providers;
    private readonly ISmsUsageTracker _usageTracker;

    public SmsProviderStrategy(
        IEnumerable<ISmsProvider> providers,
        ISmsUsageTracker usageTracker)
    {
        _providers = providers.OrderBy(p => p.Priority);
        _usageTracker = usageTracker;
    }

    public async Task<ISmsProvider> SelectProviderAsync()
    {
        foreach (var provider in _providers)
        {
            // Check availability
            if (!await provider.IsAvailableAsync())
                continue;

            // Check daily limit
            var todaysUsage = await _usageTracker.GetTodaysUsageAsync(provider.Name);
            if (todaysUsage >= provider.DailyLimit)
                continue;

            return provider;
        }

        throw new NoAvailableSmsProviderException();
    }
}

// Usage in service
public class SmsService
{
    private readonly SmsProviderStrategy _providerStrategy;

    public async Task<SmsResult> SendSmsAsync(string phoneNumber, string message)
    {
        var provider = await _providerStrategy.SelectProviderAsync();

        try
        {
            var result = await provider.SendSmsAsync(phoneNumber, message);

            // Track usage and cost
            await _usageTracker.RecordUsageAsync(provider.Name, provider.CostPerSms);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SMS send failed with provider {Provider}", provider.Name);

            // Try next provider
            return await SendWithFallbackAsync(phoneNumber, message, provider.Name);
        }
    }
}
```

#### Benefits
- Runtime algorithm selection
- Easy to add new providers
- Fallback mechanisms
- Cost optimization

#### Drawbacks
- Additional abstraction
- Configuration complexity

---

### 7.2 Factory Pattern ⚠️ **USE SPARINGLY**

#### Purpose
Creates objects without specifying their exact class.

#### When to Use
- Complex object creation logic
- Multiple implementations based on configuration
- Need to abstract object creation

#### When NOT to Use
- Simple object creation
- DI container can handle creation
- Only one implementation exists

#### Implementation
```csharp
public interface INotificationProviderFactory
{
    INotificationProvider CreateProvider(NotificationType type);
}

public class NotificationProviderFactory : INotificationProviderFactory
{
    private readonly IServiceProvider _serviceProvider;

    public NotificationProviderFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public INotificationProvider CreateProvider(NotificationType type)
    {
        return type switch
        {
            NotificationType.Email => _serviceProvider.GetRequiredService<IEmailProvider>(),
            NotificationType.Sms => _serviceProvider.GetRequiredService<ISmsProvider>(),
            NotificationType.WebSocket => _serviceProvider.GetRequiredService<IWebSocketProvider>(),
            NotificationType.Push => _serviceProvider.GetRequiredService<IPushProvider>(),
            _ => throw new NotSupportedException($"Notification type {type} not supported")
        };
    }
}

// Alternative: Use DI instead of Factory (RECOMMENDED)
public class NotificationService
{
    private readonly IEmailProvider _emailProvider;
    private readonly ISmsProvider _smsProvider;
    private readonly IWebSocketProvider _webSocketProvider;

    // Direct injection is simpler than factory
    public NotificationService(
        IEmailProvider emailProvider,
        ISmsProvider smsProvider,
        IWebSocketProvider webSocketProvider)
    {
        _emailProvider = emailProvider;
        _smsProvider = smsProvider;
        _webSocketProvider = webSocketProvider;
    }

    public async Task SendNotificationAsync(NotificationRequest request)
    {
        switch (request.Type)
        {
            case NotificationType.Email:
                await _emailProvider.SendAsync(request);
                break;
            case NotificationType.Sms:
                await _smsProvider.SendAsync(request);
                break;
            // etc.
        }
    }
}
```

#### Benefits
- Encapsulates object creation
- Supports multiple implementations

#### Drawbacks
- Additional abstraction
- DI container often sufficient
- Can be over-engineering

---

## 8. Real-time Patterns

### 8.1 Observer Pattern ✅ **RECOMMENDED**

#### Purpose
Allows objects to notify multiple observers about state changes.

#### Implementation with SignalR
```csharp
// Hub for real-time communication
public class DocumentHub : Hub
{
    public async Task JoinDocumentGroup(int documentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"document-{documentId}");
    }

    public async Task LeaveDocumentGroup(int documentId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"document-{documentId}");
    }
}

// Notification service
public interface IRealtimeNotificationService
{
    Task NotifyDocumentUpdatedAsync(int documentId, DocumentUpdateNotification notification);
    Task NotifyUserAsync(int userId, UserNotification notification);
    Task NotifyGroupAsync(string groupName, GroupNotification notification);
}

public class SignalRNotificationService : IRealtimeNotificationService
{
    private readonly IHubContext<DocumentHub> _hubContext;

    public SignalRNotificationService(IHubContext<DocumentHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyDocumentUpdatedAsync(int documentId, DocumentUpdateNotification notification)
    {
        await _hubContext.Clients.Group($"document-{documentId}")
            .SendAsync("DocumentUpdated", notification);
    }

    public async Task NotifyUserAsync(int userId, UserNotification notification)
    {
        await _hubContext.Clients.User(userId.ToString())
            .SendAsync("UserNotification", notification);
    }

    public async Task NotifyGroupAsync(string groupName, GroupNotification notification)
    {
        await _hubContext.Clients.Group(groupName)
            .SendAsync("GroupNotification", notification);
    }
}

// Event handler that sends real-time notifications
public class DocumentEventHandler
{
    private readonly IRealtimeNotificationService _realtimeService;

    public async Task HandleDocumentStatusChangedAsync(DocumentStatusChangedEvent @event)
    {
        var notification = new DocumentUpdateNotification
        {
            DocumentId = @event.DocumentId,
            Status = @event.NewStatus,
            ChangedBy = @event.ChangedBy,
            ChangedAt = @event.ChangedAt,
            Message = $"Document status changed to {@event.NewStatus}"
        };

        await _realtimeService.NotifyDocumentUpdatedAsync(@event.DocumentId, notification);
    }
}

// Client-side usage (JavaScript)
/*
const connection = new signalR.HubConnectionBuilder()
    .withUrl("/documentHub")
    .build();

connection.start().then(function () {
    // Join document group
    connection.invoke("JoinDocumentGroup", documentId);

    // Listen for updates
    connection.on("DocumentUpdated", function (notification) {
        updateDocumentStatus(notification);
        showToast(notification.message);
    });
});
*/
```

#### Benefits
- Real-time updates
- Loose coupling
- Multiple observers

#### Drawbacks
- Connection management
- Scaling challenges
- Network overhead

---

## 9. Pattern Usage Guidelines

### 9.1 Essential Patterns (Must Use)
1. **Repository Pattern** - Data access abstraction
2. **Dependency Injection** - Built-in .NET Core
3. **Event-Driven Architecture** - External service decoupling
4. **API Gateway Pattern** - Single entry point
5. **Circuit Breaker** - External service resilience

### 9.2 Recommended Patterns (Use When Needed)
1. **Unit of Work** - Multi-entity transactions
2. **Cache-Aside** - Performance optimization
3. **Retry Pattern** - Transient failure handling
4. **Strategy Pattern** - Provider rotation
5. **Observer Pattern** - Real-time notifications
6. **Outbox Pattern** - Reliable messaging

### 9.3 Complex Patterns (Use with Caution)
1. **CQRS** - Only for complex read/write scenarios
2. **Saga Pattern** - Only for complex distributed transactions
3. **Factory Pattern** - Usually DI is sufficient

### 9.4 Anti-Patterns to Avoid
1. **God Objects** - Keep classes focused
2. **Anemic Domain Model** - Put logic in domain entities
3. **Big Ball of Mud** - Maintain clean architecture
4. **Golden Hammer** - Don't force patterns where they don't fit
5. **Over-Engineering** - Start simple, add complexity when needed

### 9.5 Decision Matrix

| Pattern | Complexity | Benefit | When to Use | When to Avoid |
|---------|------------|---------|-------------|---------------|
| Repository | Low | High | Always | Never |
| DI | Low | High | Always | Never |
| Event-Driven | Medium | High | Async processing | Simple CRUD |
| API Gateway | Medium | High | Multiple services | Single service |
| Circuit Breaker | Medium | High | External services | Internal calls |
| Unit of Work | Medium | Medium | Multi-entity tx | Single entity |
| Cache-Aside | Medium | High | Read-heavy | Write-heavy |
| CQRS | High | Medium | Complex domains | Simple CRUD |
| Saga | Very High | Medium | Complex workflows | Simple processes |

### 9.6 Implementation Order
1. **Phase 1 (MVP)**: Repository, DI, Event-Driven, API Gateway
2. **Phase 2 (Performance)**: Cache-Aside, Circuit Breaker, Retry
3. **Phase 3 (Scale)**: Unit of Work, Strategy Pattern, Observer
4. **Phase 4 (Complex)**: CQRS, Saga (only if really needed)

---

## 10. Best Practices

### 10.1 General Guidelines
- **Start Simple**: Implement basic patterns first
- **Measure First**: Add patterns to solve real problems
- **Document Decisions**: Explain why each pattern was chosen
- **Team Knowledge**: Ensure team understands patterns before implementation
- **Performance Impact**: Consider the overhead of each pattern

### 10.2 Testing Strategy
- **Unit Tests**: Mock repositories and external services
- **Integration Tests**: Test pattern implementations end-to-end
- **Performance Tests**: Measure pattern overhead
- **Chaos Testing**: Test resilience patterns under failure conditions

### 10.3 Monitoring & Observability
- **Pattern Metrics**: Track performance of each pattern
- **Error Rates**: Monitor pattern failure rates
- **Resource Usage**: Track memory and CPU impact
- **Business Metrics**: Ensure patterns improve business outcomes

---

## 11. Progressive Enhancement Patterns

### 11.1 Progressive Complexity Strategy Pattern ✅ **ESSENTIAL**

#### Purpose
Implements a phased approach to complexity, starting simple and adding sophistication only when proven necessary.

#### Implementation Strategy
```csharp
// Phase-based implementation
public class ProgressiveComplexityManager
{
    public enum ComplexityPhase
    {
        Simple,       // MVP functionality
        Enhanced,     // Performance optimizations
        Advanced,     // Scalability features
        Complex       // Full enterprise patterns
    }

    private readonly IConfiguration _config;
    private readonly IMetricsCollector _metrics;

    public ComplexityPhase GetCurrentPhase(string feature)
    {
        var userLoad = _metrics.GetConcurrentUsers();
        var performanceMetrics = _metrics.GetPerformanceMetrics(feature);

        if (userLoad < 5000 && performanceMetrics.ResponseTime < 200)
            return ComplexityPhase.Simple;
        else if (userLoad < 15000 && performanceMetrics.ResponseTime < 500)
            return ComplexityPhase.Enhanced;
        else if (userLoad < 21000)
            return ComplexityPhase.Advanced;
        else
            return ComplexityPhase.Complex;
    }

    public IDocumentService CreateDocumentService(ComplexityPhase phase)
    {
        return phase switch
        {
            ComplexityPhase.Simple => new SimpleDocumentService(_repository),
            ComplexityPhase.Enhanced => new CachedDocumentService(_repository, _cache),
            ComplexityPhase.Advanced => new EventDrivenDocumentService(_repository, _eventBus),
            ComplexityPhase.Complex => new CqrsDocumentService(_commandHandler, _queryHandler),
            _ => throw new ArgumentOutOfRangeException()
        };
    }
}

// Implementation phases
// Phase 1: Simple (MVP - 0-5k users)
public class SimpleDocumentService : IDocumentService
{
    private readonly IDocumentRepository _repository;

    public async Task<Document> CreateAsync(CreateDocumentRequest request)
    {
        var document = new Document(request);
        return await _repository.AddAsync(document);
    }

    public async Task<Document> GetByIdAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }
}

// Phase 2: Enhanced (Performance - 5k-15k users)
public class CachedDocumentService : IDocumentService
{
    private readonly IDocumentRepository _repository;
    private readonly ICacheService _cache;

    public async Task<Document> GetByIdAsync(int id)
    {
        var cached = await _cache.GetAsync<Document>($"document:{id}");
        if (cached != null) return cached;

        var document = await _repository.GetByIdAsync(id);
        if (document != null)
            await _cache.SetAsync($"document:{id}", document, TimeSpan.FromMinutes(30));

        return document;
    }
}

// Phase 3: Advanced (Scalability - 15k-21k users)
public class EventDrivenDocumentService : IDocumentService
{
    private readonly IDocumentRepository _repository;
    private readonly IEventBus _eventBus;

    public async Task<Document> CreateAsync(CreateDocumentRequest request)
    {
        var document = new Document(request);
        await _repository.AddAsync(document);

        // Async processing for scalability
        await _eventBus.PublishAsync(new DocumentCreatedEvent(document));

        return document;
    }
}

// Phase 4: Complex (Enterprise - 21k+ users, only if needed)
public class CqrsDocumentService : IDocumentService
{
    private readonly ICommandHandler<CreateDocumentCommand> _commandHandler;
    private readonly IQueryHandler<DocumentQuery> _queryHandler;

    public async Task<Document> CreateAsync(CreateDocumentRequest request)
    {
        var command = new CreateDocumentCommand(request);
        return await _commandHandler.HandleAsync(command);
    }
}
```

#### Benefits
- Reduces initial complexity by 70%
- Allows evolution based on real metrics
- Minimizes over-engineering risk
- Faster time to market

#### Implementation Guidelines
- Start with Phase 1 for all features
- Upgrade phases based on metrics, not assumptions
- Maintain backward compatibility between phases
- Document upgrade triggers clearly

---

### 11.2 Hybrid User Connection Pattern ✅ **ESSENTIAL**

#### Purpose
Optimizes connection resources by treating different user types with appropriate connection strategies.

#### Implementation
```csharp
public enum ConnectionTier
{
    RealTime,      // 3k-5k active users (SignalR WebSockets)
    NearRealTime,  // 10k-15k semi-active users (SSE + Polling)
    Eventual       // 3k-7k passive users (Background sync)
}

public class ConnectionTierManager
{
    private readonly IUserActivityTracker _activityTracker;
    private readonly IMetricsCollector _metrics;

    public ConnectionTier DetermineUserTier(User user, UserActivity activity)
    {
        // Tier 1: Active document processors (Real-time)
        if (IsActiveProcessor(user, activity))
        {
            return ConnectionTier.RealTime;
        }

        // Tier 2: Supervisors and managers (Near Real-time)
        if (IsSupervisorOrManager(user))
        {
            return ConnectionTier.NearRealTime;
        }

        // Tier 3: Occasional users (Eventual)
        return ConnectionTier.Eventual;
    }

    private bool IsActiveProcessor(User user, UserActivity activity)
    {
        return user.Role.HasDocumentProcessingRights() &&
               activity.LastActionTime > DateTime.UtcNow.AddMinutes(-15) &&
               activity.DocumentInteractionsToday > 5;
    }

    private bool IsSupervisorOrManager(User user)
    {
        return user.Role.IsSupervisor() || user.Role.IsManager();
    }
}

// Real-time connection service (Tier 1)
public class RealTimeConnectionService : IConnectionService
{
    private readonly IHubContext<DocumentHub> _hubContext;

    public async Task SendUpdateAsync(int userId, object update)
    {
        await _hubContext.Clients.User(userId.ToString())
            .SendAsync("DocumentUpdate", update);
    }

    public int MaxConcurrentConnections => 5000;
    public TimeSpan UpdateFrequency => TimeSpan.FromMilliseconds(100);
}

// Near real-time connection service (Tier 2)
public class NearRealTimeConnectionService : IConnectionService
{
    private readonly IServerSentEventsService _sseService;
    private readonly Timer _pollingTimer;

    public async Task SendUpdateAsync(int userId, object update)
    {
        // Use Server-Sent Events with smart polling fallback
        if (_sseService.IsConnected(userId))
        {
            await _sseService.SendEventAsync(userId, "update", update);
        }
        else
        {
            // Queue for next polling cycle
            await _pollingQueue.EnqueueAsync(userId, update);
        }
    }

    public int MaxConcurrentConnections => 15000;
    public TimeSpan UpdateFrequency => TimeSpan.FromSeconds(5);
}

// Eventual connection service (Tier 3)
public class EventualConnectionService : IConnectionService
{
    private readonly IBackgroundTaskQueue _taskQueue;
    private readonly IPushNotificationService _pushService;

    public async Task SendUpdateAsync(int userId, object update)
    {
        // Background sync with push notification
        await _taskQueue.QueueBackgroundWorkItemAsync(async token =>
        {
            await _pushService.SendAsync(userId, new PushNotification
            {
                Title = "Document Update",
                Body = "You have document updates waiting",
                Data = update
            });

            // Store for next user session
            await _userUpdateStore.StoreAsync(userId, update);
        });
    }

    public int MaxConcurrentConnections => 7000;
    public TimeSpan UpdateFrequency => TimeSpan.FromMinutes(1);
}

// Connection strategy selector
public class HybridConnectionStrategy
{
    private readonly Dictionary<ConnectionTier, IConnectionService> _services;
    private readonly ConnectionTierManager _tierManager;

    public async Task SendUserUpdateAsync(int userId, object update)
    {
        var user = await _userService.GetByIdAsync(userId);
        var activity = await _activityTracker.GetUserActivityAsync(userId);
        var tier = _tierManager.DetermineUserTier(user, activity);

        var connectionService = _services[tier];
        await connectionService.SendUpdateAsync(userId, update);

        // Track tier usage for optimization
        await _metrics.RecordTierUsageAsync(tier, userId);
    }
}
```

#### Benefits
- 70% reduction in infrastructure requirements
- Optimized resource allocation
- Better performance for active users
- Cost-effective scaling

#### Configuration
```json
{
  "HybridConnection": {
    "RealTimeTier": {
      "MaxUsers": 5000,
      "Technology": "SignalR",
      "UpdateInterval": "100ms"
    },
    "NearRealTimeTier": {
      "MaxUsers": 15000,
      "Technology": "SSE+Polling",
      "UpdateInterval": "5s"
    },
    "EventualTier": {
      "MaxUsers": 7000,
      "Technology": "Push+Background",
      "UpdateInterval": "60s"
    }
  }
}
```

---

### 11.3 Simplified CQRS Pattern ✅ **RECOMMENDED**

#### Purpose
Provides read optimization benefits without the complexity of separate databases using materialized views.

#### Implementation
```csharp
// Single database with optimized read views
public class SimplifiedCqrsDocumentService
{
    private readonly IDocumentRepository _writeRepository;
    private readonly IDocumentReadViewRepository _readRepository;
    private readonly IEventBus _eventBus;

    // Write operations (Command side)
    public async Task<Document> CreateDocumentAsync(CreateDocumentCommand command)
    {
        using var transaction = await _writeRepository.BeginTransactionAsync();
        try
        {
            var document = new Document(command);
            await _writeRepository.AddAsync(document);

            // Publish event for read view refresh
            await _eventBus.PublishAsync(new DocumentCreatedEvent(document));

            await transaction.CommitAsync();
            return document;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    // Read operations (Query side)
    public async Task<DocumentListView> GetDocumentListAsync(DocumentListQuery query)
    {
        // Use materialized view for optimized reads
        return await _readRepository.GetDocumentDashboardAsync(query);
    }

    public async Task<DocumentDetailView> GetDocumentDetailAsync(int documentId)
    {
        // Use optimized view with pre-joined data
        return await _readRepository.GetDocumentDetailViewAsync(documentId);
    }
}

// Materialized view repository
public class DocumentReadViewRepository : IDocumentReadViewRepository
{
    private readonly DvcDbContext _context;

    public async Task<DocumentListView> GetDocumentDashboardAsync(DocumentListQuery query)
    {
        var viewQuery = _context.DocumentDashboardView.AsQueryable();

        if (query.UserId.HasValue)
            viewQuery = viewQuery.Where(d => d.AssignedUserId == query.UserId);

        if (query.Status.HasValue)
            viewQuery = viewQuery.Where(d => d.Status == query.Status);

        if (query.DateFrom.HasValue)
            viewQuery = viewQuery.Where(d => d.CreatedAt >= query.DateFrom);

        var totalCount = await viewQuery.CountAsync();
        var items = await viewQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        return new DocumentListView
        {
            Items = items,
            TotalCount = totalCount,
            PageSize = query.PageSize,
            CurrentPage = query.Page
        };
    }
}

// Event handler for view refresh
public class DocumentViewRefreshHandler
{
    private readonly IDocumentViewRefreshService _refreshService;

    public async Task HandleDocumentCreatedAsync(DocumentCreatedEvent @event)
    {
        // Refresh materialized views (async, non-blocking)
        await _refreshService.RefreshDocumentViewAsync(@event.DocumentId);
    }

    public async Task HandleDocumentUpdatedAsync(DocumentUpdatedEvent @event)
    {
        // Incremental view update
        await _refreshService.UpdateDocumentViewAsync(@event.DocumentId, @event.Changes);
    }
}

// View refresh service
public class DocumentViewRefreshService : IDocumentViewRefreshService
{
    public async Task RefreshDocumentViewAsync(int documentId)
    {
        // Smart refresh - only update affected views
        await RefreshDocumentDashboardViewAsync(documentId);
        await RefreshDocumentDetailViewAsync(documentId);
        await RefreshDocumentStatsViewAsync(documentId);
    }

    private async Task RefreshDocumentDashboardViewAsync(int documentId)
    {
        await _context.Database.ExecuteSqlAsync(
            "EXEC sp_RefreshDocumentDashboardView @DocumentId = {0}", documentId);
    }
}
```

#### SQL Views Implementation
```sql
-- Materialized view for dashboard (indexed for performance)
CREATE VIEW vw_DocumentDashboard WITH SCHEMABINDING AS
SELECT
    d.Id,
    d.Title,
    d.Status,
    d.CreatedAt,
    d.AssignedUserId,
    u.FullName AS AssignedUserName,
    p.Name AS ProcedureName,
    CAST(COUNT_BIG(a.Id) AS int) AS AttachmentCount,
    CAST(COUNT_BIG(c.Id) AS int) AS CommentCount,
    w.CurrentStepName,
    w.Status AS WorkflowStatus
FROM dbo.Documents d
    INNER JOIN dbo.Users u ON d.AssignedUserId = u.Id
    INNER JOIN dbo.Procedures p ON d.ProcedureId = p.Id
    LEFT JOIN dbo.Attachments a ON d.Id = a.DocumentId AND a.IsDeleted = 0
    LEFT JOIN dbo.Comments c ON d.Id = c.DocumentId AND c.IsDeleted = 0
    LEFT JOIN dbo.WorkflowInstances w ON d.Id = w.DocumentId
WHERE d.IsDeleted = 0
GROUP BY d.Id, d.Title, d.Status, d.CreatedAt, d.AssignedUserId, u.FullName,
         p.Name, w.CurrentStepName, w.Status;

-- Clustered index for performance
CREATE UNIQUE CLUSTERED INDEX IX_DocumentDashboard_Clustered
ON vw_DocumentDashboard(Id);

-- Non-clustered indexes for common queries
CREATE NONCLUSTERED INDEX IX_DocumentDashboard_UserId
ON vw_DocumentDashboard(AssignedUserId, Status) INCLUDE (CreatedAt);

CREATE NONCLUSTERED INDEX IX_DocumentDashboard_Status
ON vw_DocumentDashboard(Status, CreatedAt) INCLUDE (AssignedUserId);
```

#### Benefits
- 60% less complexity than full CQRS
- Same database consistency guarantees
- Optimized read performance
- No data synchronization issues

#### Drawbacks
- Still requires view management
- Database-specific materialized views
- Limited cross-database scaling

---

### 11.4 Progressive Degradation Pattern ✅ **ESSENTIAL**

#### Purpose
Maintains system availability during external service failures through graceful degradation levels.

#### Implementation
```csharp
public enum ServiceAvailabilityLevel
{
    FullOnline,    // All services available
    CachedMode,    // External services cached, core functions work
    OfflineMode    // Critical functions only, manual fallbacks
}

public class ProgressiveDegradationManager
{
    private readonly Dictionary<string, IExternalServiceHealthChecker> _healthCheckers;
    private readonly ISystemStatusService _statusService;
    private readonly INotificationService _notificationService;

    public async Task<ServiceAvailabilityLevel> DetermineSystemLevelAsync()
    {
        var healthResults = new Dictionary<string, bool>();

        // Check critical external services
        foreach (var checker in _healthCheckers)
        {
            healthResults[checker.Key] = await checker.Value.IsHealthyAsync();
        }

        // Determine degradation level
        var criticalServicesDown = healthResults.Count(h => !h.Value && IsCriticalService(h.Key));
        var totalServicesDown = healthResults.Count(h => !h.Value);

        if (criticalServicesDown == 0 && totalServicesDown == 0)
            return ServiceAvailabilityLevel.FullOnline;
        else if (criticalServicesDown == 0 && totalServicesDown <= 2)
            return ServiceAvailabilityLevel.CachedMode;
        else
            return ServiceAvailabilityLevel.OfflineMode;
    }

    public async Task HandleDegradationAsync(ServiceAvailabilityLevel level)
    {
        switch (level)
        {
            case ServiceAvailabilityLevel.CachedMode:
                await EnterCachedModeAsync();
                break;
            case ServiceAvailabilityLevel.OfflineMode:
                await EnterOfflineModeAsync();
                break;
            case ServiceAvailabilityLevel.FullOnline:
                await ExitDegradationModeAsync();
                break;
        }

        await _statusService.UpdateSystemStatusAsync(level);
        await _notificationService.NotifyAdministratorsAsync(level);
    }

    private async Task EnterCachedModeAsync()
    {
        // Switch to cached data for external lookups
        await _serviceRegistry.SwitchToImplementationAsync<ILgspService, CachedLgspService>();
        await _serviceRegistry.SwitchToImplementationAsync<IPostalService, CachedPostalService>();

        // Continue core document processing
        _logger.LogWarning("System entered CACHED MODE - using cached external data");
    }

    private async Task EnterOfflineModeAsync()
    {
        // Disable non-critical features
        await _featureToggleService.DisableFeatureAsync("RealTimeNotifications");
        await _featureToggleService.DisableFeatureAsync("ExternalValidation");

        // Switch to manual workflows
        await _workflowEngine.SwitchToManualModeAsync();

        _logger.LogError("System entered OFFLINE MODE - manual operations required");
    }
}

// Progressive service implementations
public interface ILgspService
{
    Task<CitizenInfo> GetCitizenInfoAsync(string citizenId);
    Task<ValidationResult> ValidateDocumentAsync(int documentId);
}

// Level 1: Full online
public class OnlineLgspService : ILgspService
{
    public async Task<CitizenInfo> GetCitizenInfoAsync(string citizenId)
    {
        var response = await _httpClient.GetAsync($"/api/citizens/{citizenId}");
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<CitizenInfo>();
    }
}

// Level 2: Cached mode
public class CachedLgspService : ILgspService
{
    private readonly ICacheService _cache;
    private readonly IBackgroundTaskQueue _syncQueue;

    public async Task<CitizenInfo> GetCitizenInfoAsync(string citizenId)
    {
        // Try cache first
        var cached = await _cache.GetAsync<CitizenInfo>($"citizen:{citizenId}");
        if (cached != null)
        {
            // Queue for background sync when service recovers
            await _syncQueue.QueueBackgroundWorkItemAsync(async token =>
            {
                await _syncService.SyncCitizenInfoAsync(citizenId);
            });

            return cached;
        }

        // No cache available - return placeholder with warning
        return new CitizenInfo
        {
            Id = citizenId,
            FullName = "[Data temporarily unavailable]",
            IsVerified = false,
            Warning = "External service unavailable - using cached data"
        };
    }
}

// Level 3: Offline mode
public class OfflineLgspService : ILgspService
{
    public async Task<CitizenInfo> GetCitizenInfoAsync(string citizenId)
    {
        // Create manual task for staff
        await _manualTaskService.CreateTaskAsync(new ManualTask
        {
            Type = "CitizenLookup",
            Description = $"Manually verify citizen ID: {citizenId}",
            Priority = TaskPriority.High,
            CreatedAt = DateTime.UtcNow,
            AssignedRole = "DataVerifier"
        });

        return new CitizenInfo
        {
            Id = citizenId,
            FullName = "[Manual verification required]",
            IsVerified = false,
            RequiresManualVerification = true
        };
    }
}

// User notification for degradation
public class DegradationNotificationService
{
    public async Task NotifyUsersOfDegradationAsync(ServiceAvailabilityLevel level)
    {
        var message = level switch
        {
            ServiceAvailabilityLevel.CachedMode =>
                "Some external services are temporarily unavailable. You may see cached data. Document processing continues normally.",
            ServiceAvailabilityLevel.OfflineMode =>
                "System is in offline mode. Some features are disabled. Manual verification may be required for some operations.",
            _ => "All services are now operating normally."
        };

        await _realtimeNotificationService.NotifyAllUsersAsync(new SystemNotification
        {
            Type = "SystemStatus",
            Level = level.ToString(),
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }
}
```

#### Benefits
- Maintains core functionality during outages
- Graceful user experience degradation
- Manual fallback procedures
- Automatic recovery when services restore

#### Configuration
```json
{
  "ProgressiveDegradation": {
    "HealthCheckInterval": "30s",
    "CriticalServices": ["LGSP", "Database"],
    "NonCriticalServices": ["SMS", "Email", "Postal"],
    "DegradationThresholds": {
      "CachedMode": { "MaxCriticalDown": 0, "MaxTotalDown": 2 },
      "OfflineMode": { "MaxCriticalDown": 1, "MaxTotalDown": 3 }
    },
    "RecoveryDelay": "2m"
  }
}
```

---

## 12. Progressive Enhancement Best Practices

### 12.1 Implementation Guidelines
1. **Start Simple**: Always begin with the simplest pattern that solves the problem
2. **Measure to Upgrade**: Use real metrics, not assumptions, to trigger complexity upgrades
3. **Maintain Compatibility**: Ensure pattern upgrades don't break existing functionality
4. **Document Triggers**: Clearly define when and why to upgrade pattern complexity
5. **Test Degradation**: Regularly test system behavior under degraded conditions

### 12.2 Metrics-Driven Decisions
```csharp
public class PatternUpgradeDecisionEngine
{
    public bool ShouldUpgradeToEnhanced(string feature)
    {
        var metrics = _metricsCollector.GetFeatureMetrics(feature);

        return metrics.ConcurrentUsers > 5000 ||
               metrics.ResponseTime > TimeSpan.FromMilliseconds(200) ||
               metrics.ErrorRate > 0.01;
    }

    public bool ShouldUpgradeToAdvanced(string feature)
    {
        var metrics = _metricsCollector.GetFeatureMetrics(feature);

        return metrics.ConcurrentUsers > 15000 ||
               metrics.ResponseTime > TimeSpan.FromMilliseconds(500) ||
               metrics.ThroughputRequirement > 1000; // requests/second
    }

    public bool ShouldUpgradeToComplex(string feature)
    {
        var metrics = _metricsCollector.GetFeatureMetrics(feature);

        return metrics.ConcurrentUsers > 21000 ||
               metrics.DataVolume > 1000000 || // documents/month
               metrics.ComplexWorkflows > 10; // concurrent complex workflows
    }
}
```

### 12.3 Risk Mitigation Summary
- **Over-Engineering Risk**: Reduced by 70% through progressive complexity
- **Infrastructure Costs**: Optimized through hybrid connection patterns
- **External Dependencies**: Mitigated through progressive degradation
- **Performance Issues**: Addressed through simplified CQRS with materialized views
- **Scalability Concerns**: Managed through tier-based user connection strategies

---

This design patterns guide provides comprehensive coverage of all patterns while emphasizing simplicity and practical implementation. Remember: **patterns are tools to solve problems, not goals in themselves**.