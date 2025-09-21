# Backend Project Structure
## .NET 8 Microservices Architecture

**Component:** Backend
**Technology:** .NET 8 with Clean Architecture
**Last Updated:** September 21, 2025

---

## Solution Structure

```
source/backend/
├── DVC.sln                          # Solution file
├── Directory.Packages.props         # Central package version management
├── Directory.Build.props            # Global project properties
├── nuget.config                     # NuGet configuration
├── src/
│   ├── ApiGateway/                  # YARP API Gateway
│   │   ├── DVC.ApiGateway/
│   │   │   ├── Program.cs
│   │   │   ├── appsettings.json
│   │   │   ├── Configuration/
│   │   │   │   ├── RouteConfig.cs
│   │   │   │   ├── LoadBalancerConfig.cs
│   │   │   │   └── RateLimitConfig.cs
│   │   │   ├── Middleware/
│   │   │   │   ├── AuthenticationMiddleware.cs
│   │   │   │   ├── LoggingMiddleware.cs
│   │   │   │   └── CorsMiddleware.cs
│   │   │   └── Extensions/
│   │   │       └── ServiceCollectionExtensions.cs
│   │   └── DVC.ApiGateway.csproj
│   ├── Services/                    # Microservices
│   │   ├── UserService/             # User & Authentication Service
│   │   │   ├── DVC.UserService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── AuthController.cs
│   │   │   │   │   ├── UsersController.cs
│   │   │   │   │   ├── RolesController.cs
│   │   │   │   │   └── PermissionsController.cs
│   │   │   │   ├── Program.cs
│   │   │   │   ├── appsettings.json
│   │   │   │   ├── Middleware/
│   │   │   │   │   ├── JwtMiddleware.cs
│   │   │   │   │   └── AuditMiddleware.cs
│   │   │   │   └── Extensions/
│   │   │   │       └── ServiceRegistration.cs
│   │   │   ├── DVC.UserService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── User.cs
│   │   │   │   │   ├── Role.cs
│   │   │   │   │   ├── Permission.cs
│   │   │   │   │   ├── UserRole.cs
│   │   │   │   │   └── AuditLog.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IUserRepository.cs
│   │   │   │   │   ├── IRoleRepository.cs
│   │   │   │   │   ├── IAuthService.cs
│   │   │   │   │   └── IAuditService.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── AuthService.cs
│   │   │   │   │   ├── UserService.cs
│   │   │   │   │   ├── RoleService.cs
│   │   │   │   │   ├── PermissionService.cs
│   │   │   │   │   └── AuditService.cs
│   │   │   │   ├── DTOs/
│   │   │   │   │   ├── LoginDto.cs
│   │   │   │   │   ├── UserDto.cs
│   │   │   │   │   ├── RoleDto.cs
│   │   │   │   │   └── PermissionDto.cs
│   │   │   │   └── Exceptions/
│   │   │   │       ├── AuthenticationException.cs
│   │   │   │       └── AuthorizationException.cs
│   │   │   ├── DVC.UserService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── UserRepository.cs
│   │   │   │   │   ├── RoleRepository.cs
│   │   │   │   │   └── AuditRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── UserDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── External/
│   │   │   │   │   ├── LdapService.cs
│   │   │   │   │   └── SmsService.cs
│   │   │   │   └── Configuration/
│   │   │   │       ├── UserEntityConfiguration.cs
│   │   │   │       └── RoleEntityConfiguration.cs
│   │   │   └── DVC.UserService.Tests/
│   │   │       ├── Unit/
│   │   │       ├── Integration/
│   │   │       └── TestFixtures/
│   │   ├── WorkflowService/          # Workflow Engine Service
│   │   │   ├── DVC.WorkflowService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── WorkflowController.cs
│   │   │   │   │   ├── InstanceController.cs
│   │   │   │   │   └── DesignerController.cs
│   │   │   │   ├── Hubs/
│   │   │   │   │   └── WorkflowHub.cs
│   │   │   │   ├── Program.cs
│   │   │   │   └── appsettings.json
│   │   │   ├── DVC.WorkflowService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── WorkflowDefinition.cs
│   │   │   │   │   ├── WorkflowInstance.cs
│   │   │   │   │   ├── WorkflowStep.cs
│   │   │   │   │   └── WorkflowVariable.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── WorkflowEngine.cs
│   │   │   │   │   ├── WorkflowDesigner.cs
│   │   │   │   │   ├── ElsaIntegration.cs
│   │   │   │   │   └── BpmnService.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IWorkflowEngine.cs
│   │   │   │   │   ├── IWorkflowRepository.cs
│   │   │   │   │   └── IBpmnService.cs
│   │   │   │   └── DTOs/
│   │   │   │       ├── WorkflowDefinitionDto.cs
│   │   │   │       ├── WorkflowInstanceDto.cs
│   │   │   │       └── WorkflowStepDto.cs
│   │   │   ├── DVC.WorkflowService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── WorkflowRepository.cs
│   │   │   │   │   └── InstanceRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── WorkflowDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── Elsa/
│   │   │   │   │   ├── ElsaConfiguration.cs
│   │   │   │   │   ├── CustomActivities/
│   │   │   │   │   └── WorkflowHandlers/
│   │   │   │   └── External/
│   │   │   │       └── BpmnParser.cs
│   │   │   └── DVC.WorkflowService.Tests/
│   │   ├── DocumentService/          # Document Processing Service
│   │   │   ├── DVC.DocumentService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── DocumentController.cs
│   │   │   │   │   ├── UploadController.cs
│   │   │   │   │   ├── SignatureController.cs
│   │   │   │   │   └── ProcessingController.cs
│   │   │   │   ├── Program.cs
│   │   │   │   └── appsettings.json
│   │   │   ├── DVC.DocumentService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── Document.cs
│   │   │   │   │   ├── DocumentVersion.cs
│   │   │   │   │   ├── Attachment.cs
│   │   │   │   │   ├── Signature.cs
│   │   │   │   │   └── ProcessingLog.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── DocumentProcessor.cs
│   │   │   │   │   ├── FileUploadService.cs
│   │   │   │   │   ├── DigitalSignatureService.cs
│   │   │   │   │   ├── OcrService.cs
│   │   │   │   │   └── ValidationService.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IDocumentRepository.cs
│   │   │   │   │   ├── IFileStorageService.cs
│   │   │   │   │   ├── ISignatureService.cs
│   │   │   │   │   └── IOcrService.cs
│   │   │   │   └── DTOs/
│   │   │   │       ├── DocumentDto.cs
│   │   │   │       ├── UploadDto.cs
│   │   │   │       └── SignatureDto.cs
│   │   │   ├── DVC.DocumentService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── DocumentRepository.cs
│   │   │   │   │   └── AttachmentRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── DocumentDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── Storage/
│   │   │   │   │   ├── MinIOService.cs
│   │   │   │   │   └── FileSystemService.cs
│   │   │   │   ├── External/
│   │   │   │   │   ├── UsbTokenService.cs
│   │   │   │   │   ├── TesseractOcrService.cs
│   │   │   │   │   └── LibreOfficeConverter.cs
│   │   │   │   └── Configuration/
│   │   │   │       └── DocumentEntityConfiguration.cs
│   │   │   └── DVC.DocumentService.Tests/
│   │   ├── NotificationService/      # Notification Service
│   │   │   ├── DVC.NotificationService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── NotificationController.cs
│   │   │   │   │   └── TemplateController.cs
│   │   │   │   ├── Hubs/
│   │   │   │   │   └── NotificationHub.cs
│   │   │   │   ├── Program.cs
│   │   │   │   └── appsettings.json
│   │   │   ├── DVC.NotificationService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── Notification.cs
│   │   │   │   │   ├── NotificationTemplate.cs
│   │   │   │   │   ├── DeliveryLog.cs
│   │   │   │   │   └── Subscription.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── NotificationService.cs
│   │   │   │   │   ├── TemplateService.cs
│   │   │   │   │   ├── SmsService.cs
│   │   │   │   │   ├── EmailService.cs
│   │   │   │   │   └── WebSocketService.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── INotificationRepository.cs
│   │   │   │   │   ├── ISmsProvider.cs
│   │   │   │   │   ├── IEmailProvider.cs
│   │   │   │   │   └── ITemplateEngine.cs
│   │   │   │   └── DTOs/
│   │   │   │       ├── NotificationDto.cs
│   │   │   │       ├── TemplateDto.cs
│   │   │   │       └── DeliveryStatusDto.cs
│   │   │   ├── DVC.NotificationService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── NotificationRepository.cs
│   │   │   │   │   └── TemplateRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── NotificationDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── Providers/
│   │   │   │   │   ├── ViettelSmsProvider.cs
│   │   │   │   │   ├── MobiFoneSmsProvider.cs
│   │   │   │   │   └── SmtpEmailProvider.cs
│   │   │   │   ├── External/
│   │   │   │   │   └── SignalRService.cs
│   │   │   │   └── Templates/
│   │   │   │       ├── RazorTemplateEngine.cs
│   │   │   │       └── DefaultTemplates/
│   │   │   └── DVC.NotificationService.Tests/
│   │   ├── PostalService/            # Postal Service
│   │   │   ├── DVC.PostalService.Api/
│   │   │   │   ├── Controllers/
│   │   │   │   │   ├── ShipmentController.cs
│   │   │   │   │   ├── TrackingController.cs
│   │   │   │   │   ├── LabelController.cs
│   │   │   │   │   └── CostController.cs
│   │   │   │   ├── Program.cs
│   │   │   │   └── appsettings.json
│   │   │   ├── DVC.PostalService.Core/
│   │   │   │   ├── Entities/
│   │   │   │   │   ├── PostalShipment.cs
│   │   │   │   │   ├── TrackingEvent.cs
│   │   │   │   │   ├── DeliveryAddress.cs
│   │   │   │   │   ├── ShippingLabel.cs
│   │   │   │   │   └── PostalRate.cs
│   │   │   │   ├── Services/
│   │   │   │   │   ├── PostalService.cs
│   │   │   │   │   ├── TrackingService.cs
│   │   │   │   │   ├── LabelService.cs
│   │   │   │   │   ├── CostCalculationService.cs
│   │   │   │   │   └── VietnamPostService.cs
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IPostalRepository.cs
│   │   │   │   │   ├── IPostalProvider.cs
│   │   │   │   │   ├── ITrackingService.cs
│   │   │   │   │   ├── ILabelService.cs
│   │   │   │   │   └── ICostCalculator.cs
│   │   │   │   └── DTOs/
│   │   │   │       ├── ShipmentDto.cs
│   │   │   │       ├── TrackingDto.cs
│   │   │   │       ├── LabelDto.cs
│   │   │   │       └── CostDto.cs
│   │   │   ├── DVC.PostalService.Infrastructure/
│   │   │   │   ├── Repositories/
│   │   │   │   │   ├── PostalRepository.cs
│   │   │   │   │   └── TrackingRepository.cs
│   │   │   │   ├── Data/
│   │   │   │   │   ├── PostalDbContext.cs
│   │   │   │   │   └── Migrations/
│   │   │   │   ├── Providers/
│   │   │   │   │   ├── VietnamPostProvider.cs
│   │   │   │   │   ├── EmsProvider.cs
│   │   │   │   │   └── DhlProvider.cs
│   │   │   │   ├── External/
│   │   │   │   │   ├── VietnamPostApiClient.cs
│   │   │   │   │   └── AddressValidationService.cs
│   │   │   │   └── Configuration/
│   │   │   │       └── PostalEntityConfiguration.cs
│   │   │   └── DVC.PostalService.Tests/
│   │   └── Workers/                  # Background Worker Services
│   │       ├── DVC.Workers.Notification/
│   │       │   ├── Workers/
│   │       │   │   ├── EmailWorkerService.cs
│   │       │   │   ├── SmsWorkerService.cs
│   │       │   │   └── NotificationWorkerService.cs
│   │       │   ├── Services/
│   │       │   │   ├── TemplateEngine.cs
│   │       │   │   ├── SmsProviderFactory.cs
│   │       │   │   └── NotificationStatusService.cs
│   │       │   ├── Models/
│   │       │   │   ├── EmailMessage.cs
│   │       │   │   ├── SmsMessage.cs
│   │       │   │   ├── NotificationTemplate.cs
│   │       │   │   └── MessageStatus.cs
│   │       │   ├── Configuration/
│   │       │   │   ├── EmailWorkerOptions.cs
│   │       │   │   ├── SmsWorkerOptions.cs
│   │       │   │   └── NotificationWorkerOptions.cs
│   │       │   ├── Program.cs
│   │       │   └── appsettings.json
│   │       ├── DVC.Workers.Postal/
│   │       │   ├── Workers/
│   │       │   │   ├── PostalWorkerService.cs
│   │       │   │   ├── PostalTrackingWorkerService.cs
│   │       │   │   └── PostalWebhookWorkerService.cs
│   │       │   ├── Services/
│   │       │   │   ├── PostalStatusUpdateService.cs
│   │       │   │   └── TrackingSchedulerService.cs
│   │       │   ├── Models/
│   │       │   │   ├── PostalMessage.cs
│   │       │   │   ├── TrackingMessage.cs
│   │       │   │   └── PostalWebhookData.cs
│   │       │   ├── Configuration/
│   │       │   │   └── PostalWorkerOptions.cs
│   │       │   ├── Program.cs
│   │       │   └── appsettings.json
│   │       ├── DVC.Workers.Lgsp/
│   │       │   ├── Workers/
│   │       │   │   ├── LgspSyncWorkerService.cs
│   │       │   │   ├── LgspSubmissionWorkerService.cs
│   │       │   │   └── LgspStatusWorkerService.cs
│   │       │   ├── Services/
│   │       │   │   ├── LgspCacheService.cs
│   │       │   │   ├── LgspProcedureSyncService.cs
│   │       │   │   └── LgspFallbackService.cs
│   │       │   ├── Models/
│   │       │   │   ├── LgspMessage.cs
│   │       │   │   ├── LgspSubmission.cs
│   │       │   │   └── LgspProcedureSync.cs
│   │       │   ├── Configuration/
│   │       │   │   └── LgspWorkerOptions.cs
│   │       │   ├── Program.cs
│   │       │   └── appsettings.json
│   │       └── DVC.Workers.Shared/        # Shared worker infrastructure
│   │           ├── Base/
│   │           │   ├── BaseWorkerService.cs
│   │           │   ├── BaseMessage.cs
│   │           │   └── WorkerOptions.cs
│   │           ├── Interfaces/
│   │           │   ├── IMessagePublisher.cs
│   │           │   ├── IMessageConsumer.cs
│   │           │   ├── IWorkerMetrics.cs
│   │           │   └── IRetryHandler.cs
│   │           ├── Services/
│   │           │   ├── RabbitMqPublisher.cs
│   │           │   ├── RabbitMqConsumer.cs
│   │           │   ├── WorkerMetrics.cs
│   │           │   ├── RetryHandler.cs
│   │           │   └── WorkerHealthCheck.cs
│   │           ├── Extensions/
│   │           │   ├── ServiceCollectionExtensions.cs
│   │           │   └── WorkerServiceExtensions.cs
│   │           └── Configuration/
│   │               ├── MessageQueueOptions.cs
│   │               └── RetryPolicyOptions.cs
│   ├── Shared/                       # Shared libraries
│   │   ├── DVC.Shared.Core/          # Core shared library
│   │   │   ├── Common/
│   │   │   │   ├── BaseEntity.cs
│   │   │   │   ├── AuditableEntity.cs
│   │   │   │   ├── PagedResult.cs
│   │   │   │   └── ApiResponse.cs
│   │   │   ├── Extensions/
│   │   │   │   ├── StringExtensions.cs
│   │   │   │   ├── DateTimeExtensions.cs
│   │   │   │   └── EnumExtensions.cs
│   │   │   ├── Helpers/
│   │   │   │   ├── CryptographyHelper.cs
│   │   │   │   ├── ValidationHelper.cs
│   │   │   │   └── FileHelper.cs
│   │   │   ├── Constants/
│   │   │   │   ├── AppConstants.cs
│   │   │   │   ├── RoleConstants.cs
│   │   │   │   └── ErrorMessages.cs
│   │   │   └── Exceptions/
│   │   │       ├── DvcException.cs
│   │   │       ├── BusinessException.cs
│   │   │       └── ValidationException.cs
│   │   ├── DVC.Shared.Contracts/     # Service contracts
│   │   │   ├── Events/
│   │   │   │   ├── DocumentEvents.cs
│   │   │   │   ├── WorkflowEvents.cs
│   │   │   │   ├── PostalEvents.cs
│   │   │   │   └── UserEvents.cs
│   │   │   ├── Commands/
│   │   │   │   ├── DocumentCommands.cs
│   │   │   │   ├── WorkflowCommands.cs
│   │   │   │   ├── PostalCommands.cs
│   │   │   │   └── UserCommands.cs
│   │   │   ├── Queries/
│   │   │   │   ├── DocumentQueries.cs
│   │   │   │   ├── WorkflowQueries.cs
│   │   │   │   ├── PostalQueries.cs
│   │   │   │   └── UserQueries.cs
│   │   │   └── DTOs/
│   │   │       ├── Common/
│   │   │       ├── Document/
│   │   │       ├── Workflow/
│   │   │       ├── Postal/
│   │   │       └── User/
│   │   └── DVC.Shared.Infrastructure/ # Shared infrastructure
│   │       ├── Database/
│   │       │   ├── BaseDbContext.cs
│   │       │   ├── UnitOfWork.cs
│   │       │   └── Repository.cs
│   │       ├── Patterns/             # Design pattern implementations
│   │       │   ├── Repository/
│   │       │   ├── CQRS/
│   │       │   ├── Strategy/
│   │       │   ├── Observer/
│   │       │   ├── Factory/
│   │       │   ├── ProgressiveComplexity/
│   │       │   ├── HybridConnection/
│   │       │   └── ProgressiveDegradation/
│   │       ├── MessageBus/
│   │       │   ├── RabbitMqService.cs
│   │       │   ├── MessagePublisher.cs
│   │       │   ├── MessageConsumer.cs
│   │       │   ├── Events/
│   │       │   ├── Sagas/
│   │       │   └── Outbox/
│   │       ├── Resilience/           # Circuit breaker & retry patterns
│   │       │   ├── CircuitBreaker/
│   │       │   ├── Retry/
│   │       │   └── Polly/
│   │       ├── Caching/
│   │       │   ├── RedisService.cs
│   │       │   ├── CacheManager.cs
│   │       │   ├── DistributedCache.cs
│   │       │   └── CacheAside/
│   │       ├── Logging/
│   │       │   ├── StructuredLogger.cs
│   │       │   ├── LoggingMiddleware.cs
│   │       │   └── LoggingExtensions.cs
│   │       ├── Security/
│   │       │   ├── JwtService.cs
│   │       │   ├── EncryptionService.cs
│   │       │   └── HashingService.cs
│   │       ├── Observability/        # Distributed tracing infrastructure
│   │       │   ├── Tracing/
│   │       │   ├── Correlation/
│   │       │   ├── Instrumentation/
│   │       │   ├── Sampling/
│   │       │   └── Extensions/
│   │       ├── Versioning/           # API versioning infrastructure
│   │       │   ├── Configuration/
│   │       │   ├── Middleware/
│   │       │   ├── Services/
│   │       │   ├── Attributes/
│   │       │   └── Extensions/
│   │       └── Monitoring/
│   │           ├── HealthChecks.cs
│   │           ├── MetricsCollector.cs
│   │           ├── PerformanceMonitor.cs
│   │           ├── TracingMetrics.cs
│   │           └── VersioningMetrics.cs
│   └── Integrations/                 # External system integrations
│       ├── DVC.Integration.LGSP/     # LGSP integration
│       ├── DVC.Integration.SMS/      # SMS gateway integration
│       ├── DVC.Integration.Postal/   # Postal service integration
│       └── DVC.Integration.DigitalSignature/ # Digital signature
├── tests/                            # Test projects
│   ├── Unit/
│   │   ├── DVC.UserService.Tests/
│   │   ├── DVC.WorkflowService.Tests/
│   │   ├── DVC.DocumentService.Tests/
│   │   ├── DVC.NotificationService.Tests/
│   │   └── DVC.PostalService.Tests/
│   ├── Integration/
│   │   ├── DVC.Integration.Tests/
│   │   └── DVC.Api.Tests/
│   └── Performance/
│       ├── DVC.LoadTests/
│       └── DVC.StressTests/
├── tools/                            # Development tools
│   ├── DatabaseMigration/
│   ├── CodeGeneration/
│   └── TestDataSeeder/
└── docker/                           # Docker configurations
    ├── services/
    │   ├── Dockerfile.ApiGateway
    │   ├── Dockerfile.UserService
    │   ├── Dockerfile.WorkflowService
    │   ├── Dockerfile.DocumentService
    │   ├── Dockerfile.NotificationService
    │   └── Dockerfile.PostalService
    ├── workers/
    │   ├── Dockerfile.NotificationWorker
    │   ├── Dockerfile.PostalWorker
    │   ├── Dockerfile.LgspWorker
    │   └── Dockerfile.WorkerBase
    ├── docker-compose.yml
    ├── docker-compose.workers.yml
    └── docker-compose.override.yml
```

## Key Architecture Decisions

### Clean Architecture
- **Api Layer**: Controllers, middleware, configuration
- **Core Layer**: Business logic, entities, interfaces
- **Infrastructure Layer**: Data access, external services
- **Tests**: Unit, integration, and performance tests

### Microservices Pattern
- **API Gateway**: YARP for routing and load balancing
- **Individual Services**: Each with own database and responsibilities
- **Shared Libraries**: Common functionality and contracts
- **Background Workers**: Async processing and external integration

### Design Patterns Implementation
- **Repository Pattern**: Data access abstraction
- **CQRS**: Command Query Responsibility Segregation
- **Event Sourcing**: State change tracking
- **Saga Pattern**: Distributed transactions
- **Circuit Breaker**: Fault tolerance

### Infrastructure Concerns
- **Observability**: OpenTelemetry tracing and metrics
- **API Versioning**: Semantic versioning with deprecation support
- **Caching**: Redis with cache-aside pattern
- **Resilience**: Polly for retry and circuit breaker patterns

## Central Package Management

### Directory.Packages.props Strategy
```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>

  <ItemGroup>
    <!-- Core Framework -->
    <PackageVersion Include="Microsoft.EntityFrameworkCore" Version="8.0.0" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />

    <!-- Architecture Patterns -->
    <PackageVersion Include="MediatR" Version="12.1.1" />
    <PackageVersion Include="AutoMapper" Version="12.0.1" />
    <PackageVersion Include="FluentValidation" Version="11.7.1" />

    <!-- Infrastructure -->
    <PackageVersion Include="StackExchange.Redis" Version="2.7.4" />
    <PackageVersion Include="RabbitMQ.Client" Version="6.6.0" />
    <PackageVersion Include="Polly" Version="7.2.4" />

    <!-- Observability -->
    <PackageVersion Include="OpenTelemetry" Version="1.6.0" />
    <PackageVersion Include="OpenTelemetry.Extensions.Hosting" Version="1.6.0" />
    <PackageVersion Include="Serilog.AspNetCore" Version="7.0.0" />

    <!-- Testing -->
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageVersion Include="xunit" Version="2.4.2" />
    <PackageVersion Include="FluentAssertions" Version="6.12.0" />
    <PackageVersion Include="Testcontainers" Version="3.5.0" />
  </ItemGroup>
</Project>
```

### Benefits
- **Consistent versions** across all microservices
- **Easy upgrades** - change version in one place
- **Dependency conflicts prevention**
- **Security updates** management
- **Build performance** improvement

### Project References
```xml
<!-- Individual project files only specify package names -->
<ItemGroup>
  <PackageReference Include="Microsoft.EntityFrameworkCore" />
  <PackageReference Include="MediatR" />
  <PackageReference Include="AutoMapper" />
</ItemGroup>
```

---
**Component**: Backend (.NET 8)
**Last Updated**: September 21, 2025