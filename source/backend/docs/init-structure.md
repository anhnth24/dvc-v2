# DVC v2 Backend Code Skeleton Implementation Plan

## 📋 Solution Structure Checklist

### ✅ **1. Solution & Global Configuration**
- [x] Create `DVC.sln` solution file
- [x] Create `Directory.Packages.props` for central package management
- [x] Create `Directory.Build.props` for global project properties
- [x] Create `nuget.config` for NuGet configuration
- [x] Create `.gitignore` file for .NET projects

### ✅ **2. API Gateway**
- [x] Create `src/ApiGateway/DVC.ApiGateway/` project
  - [x] `Program.cs` with YARP configuration
  - [x] `appsettings.json` with routing config
  - [x] `Configuration/` folder:
    - [x] `RouteConfig.cs` for route configurations
    - [x] `LoadBalancerConfig.cs` for load balancing
    - [x] `RateLimitConfig.cs` for rate limiting
  - [x] `Middleware/` folder:
    - [x] `AuthenticationMiddleware.cs`
    - [x] `LoggingMiddleware.cs`
    - [x] `CorsMiddleware.cs`
  - [x] `Extensions/ServiceCollectionExtensions.cs`

### ✅ **3. Core Microservices**

#### 3.1 User Service
- [x] `src/Services/UserService/DVC.UserService.Api/`
  - [x] Controllers: `AuthController.cs`, `UsersController.cs`, `RolesController.cs`, `PermissionsController.cs`
  - [x] Middleware: `JwtMiddleware.cs`, `AuditMiddleware.cs`
  - [x] `Program.cs` with service configuration
  - [x] `appsettings.json`
- [x] `src/Services/UserService/DVC.UserService.Core/`
  - [x] Entities: `User.cs`, `Role.cs`, `Permission.cs`, `UserRole.cs`, `AuditLog.cs`
  - [x] Interfaces: `IUserRepository.cs`, `IAuthService.cs`, etc.
  - [x] Services: `AuthService.cs`, `UserService.cs`, etc.
  - [x] DTOs: `LoginDto.cs`, `UserDto.cs`, etc.
  - [x] Exceptions: `AuthenticationException.cs`, `AuthorizationException.cs`
- [x] `src/Services/UserService/DVC.UserService.Infrastructure/`
  - [x] Repositories: `UserRepository.cs`, `RoleRepository.cs`
  - [x] Data: `UserDbContext.cs`, Migrations folder
  - [x] External: `LdapService.cs`, `SmsService.cs`
  - [x] Configuration: Entity configurations

#### 3.2 Workflow Service
- [x] `src/Services/WorkflowService/DVC.WorkflowService.Api/`
  - [x] Controllers: `WorkflowController.cs`, `InstanceController.cs`, `DesignerController.cs`
  - [x] Hubs: `WorkflowHub.cs` for SignalR
  - [x] `Program.cs` with Elsa configuration
- [x] `src/Services/WorkflowService/DVC.WorkflowService.Core/`
  - [x] Entities: `WorkflowDefinition.cs`, `WorkflowInstance.cs`, `WorkflowStep.cs`
  - [x] Services: `WorkflowEngine.cs`, `ElsaIntegration.cs`, `BpmnService.cs`
  - [x] Interfaces & DTOs
- [x] `src/Services/WorkflowService/DVC.WorkflowService.Infrastructure/`
  - [x] Repositories, DbContext, Elsa configuration
  - [x] External: `BpmnParser.cs`

#### 3.3 Document Service
- [x] `src/Services/DocumentService/DVC.DocumentService.Api/`
  - [x] Controllers: `DocumentController.cs`, `UploadController.cs`, `SignatureController.cs`
- [x] `src/Services/DocumentService/DVC.DocumentService.Core/`
  - [x] Entities: `Document.cs`, `DocumentVersion.cs`, `Attachment.cs`, `Signature.cs`
  - [x] Services: `DocumentProcessor.cs`, `FileUploadService.cs`, `DigitalSignatureService.cs`, `OcrService.cs`
- [x] `src/Services/DocumentService/DVC.DocumentService.Infrastructure/`
  - [x] Storage: `MinIOService.cs`, `FileSystemService.cs`
  - [x] External: `UsbTokenService.cs`, `TesseractOcrService.cs`

#### 3.4 Notification Service
- [x] `src/Services/NotificationService/DVC.NotificationService.Api/`
  - [x] Controllers: `NotificationController.cs`, `TemplateController.cs`
  - [x] Hubs: `NotificationHub.cs`
- [x] `src/Services/NotificationService/DVC.NotificationService.Core/`
  - [x] Entities: `Notification.cs`, `NotificationTemplate.cs`, `DeliveryLog.cs`
  - [x] Services: `NotificationService.cs`, `SmsService.cs`, `EmailService.cs`
- [x] `src/Services/NotificationService/DVC.NotificationService.Infrastructure/`
  - [x] Providers: `ViettelSmsProvider.cs`, `MobiFoneSmsProvider.cs`, `SmtpEmailProvider.cs`
  - [x] Templates: `RazorTemplateEngine.cs`

#### 3.5 Postal Service
- [x] `src/Services/PostalService/DVC.PostalService.Api/`
  - [x] Controllers: `ShipmentController.cs`, `TrackingController.cs`, `LabelController.cs`, `CostController.cs`
- [x] `src/Services/PostalService/DVC.PostalService.Core/`
  - [x] Entities: `PostalShipment.cs`, `TrackingEvent.cs`, `DeliveryAddress.cs`, `ShippingLabel.cs`
  - [x] Services: `PostalService.cs`, `TrackingService.cs`, `VietnamPostService.cs`
- [x] `src/Services/PostalService/DVC.PostalService.Infrastructure/`
  - [x] Providers: `VietnamPostProvider.cs`, `EmsProvider.cs`, `DhlProvider.cs`
  - [x] External: `VietnamPostApiClient.cs`, `AddressValidationService.cs`

### ✅ **4. Background Workers**

#### 4.1 Notification Worker
- [x] `src/Services/Workers/DVC.Workers.Notification/`
  - [x] Workers: `EmailWorkerService.cs`, `SmsWorkerService.cs`
  - [x] Services: `TemplateEngine.cs`, `SmsProviderFactory.cs`
  - [x] Models: `EmailMessage.cs`, `SmsMessage.cs`
  - [x] Configuration: Worker options classes
  - [x] `Program.cs` with hosted service setup

#### 4.2 Postal Worker
- [x] `src/Services/Workers/DVC.Workers.Postal/`
  - [x] Workers: `PostalWorkerService.cs`, `PostalTrackingWorkerService.cs`
  - [x] Services: `PostalStatusUpdateService.cs`
  - [x] Models: `PostalMessage.cs`, `TrackingMessage.cs`

#### 4.3 LGSP Worker
- [x] `src/Services/Workers/DVC.Workers.Lgsp/`
  - [x] Workers: `LgspSyncWorkerService.cs`, `LgspSubmissionWorkerService.cs`
  - [x] Services: `LgspCacheService.cs`, `LgspProcedureSyncService.cs`
  - [x] Models: `LgspMessage.cs`, `LgspSubmission.cs`

#### 4.4 Shared Worker Infrastructure
- [x] `src/Services/Workers/DVC.Workers.Shared/`
  - [x] Base: `BaseWorkerService.cs`, `BaseMessage.cs`, `WorkerOptions.cs`
  - [x] Interfaces: `IMessagePublisher.cs`, `IMessageConsumer.cs`, `IWorkerMetrics.cs`
  - [x] Services: `RabbitMqPublisher.cs`, `RabbitMqConsumer.cs`, `RetryHandler.cs`

### ✅ **5. Shared Libraries**

#### 5.1 Core Shared
- [x] `src/Shared/DVC.Shared.Core/`
  - [x] Common: `BaseEntity.cs`, `AuditableEntity.cs`, `PagedResult.cs`, `ApiResponse.cs`
  - [x] Extensions: `StringExtensions.cs`, `DateTimeExtensions.cs`
  - [x] Helpers: `CryptographyHelper.cs`, `ValidationHelper.cs`
  - [x] Constants: `AppConstants.cs`, `RoleConstants.cs`, `ErrorMessages.cs`
  - [x] Exceptions: `DvcException.cs`, `BusinessException.cs`, `ValidationException.cs`

#### 5.2 Contracts
- [x] `src/Shared/DVC.Shared.Contracts/`
  - [x] Events: `DocumentEvents.cs`, `WorkflowEvents.cs`, `PostalEvents.cs`, `UserEvents.cs`
  - [x] Commands: CQRS command classes
  - [x] Queries: CQRS query classes
  - [x] DTOs: Shared DTOs organized by domain

#### 5.3 Infrastructure
- [x] `src/Shared/DVC.Shared.Infrastructure/`
  - [x] Database: `BaseDbContext.cs`, `UnitOfWork.cs`, `Repository.cs`
  - [x] Patterns:
    - [x] Repository pattern implementation
    - [x] CQRS pattern implementation
    - [x] Strategy, Observer, Factory patterns
    - [x] Progressive Complexity, Hybrid Connection patterns
  - [x] MessageBus: `RabbitMqService.cs`, `MessagePublisher.cs`, `MessageConsumer.cs`
  - [x] Resilience: Circuit breaker, Retry with Polly
  - [x] Caching: `RedisService.cs`, `CacheManager.cs`, `DistributedCache.cs`
  - [x] Logging: `StructuredLogger.cs`, `LoggingMiddleware.cs`
  - [x] Security: `JwtService.cs`, `EncryptionService.cs`
  - [x] Observability: Tracing, Correlation, Instrumentation with OpenTelemetry
  - [x] Versioning: API versioning infrastructure
  - [x] Monitoring: `HealthChecks.cs`, `MetricsCollector.cs`

### ✅ **6. External Integrations**
- [x] `src/Integrations/DVC.Integration.LGSP/` - LGSP integration adapter
- [x] `src/Integrations/DVC.Integration.SMS/` - SMS gateway adapter
- [x] `src/Integrations/DVC.Integration.Postal/` - Postal service adapter
- [x] `src/Integrations/DVC.Integration.DigitalSignature/` - Digital signature adapter

### ✅ **7. Test Projects**
- [x] `tests/Unit/` - Unit test projects for each service
- [x] `tests/Integration/DVC.Integration.Tests/` - Integration tests
- [x] `tests/Performance/DVC.LoadTests/` - Load testing projects

### ✅ **8. Development Tools**
- [x] `tools/DatabaseMigration/` - EF migration tools
- [x] `tools/CodeGeneration/` - Code generation utilities
- [x] `tools/TestDataSeeder/` - Test data seeding tools

### ✅ **9. Docker Configuration**
- [x] `docker/services/` - Dockerfiles for each service
- [x] `docker/workers/` - Dockerfiles for workers
- [x] `docker-compose.yml` - Main compose file
- [x] `docker-compose.workers.yml` - Workers compose
- [x] `docker-compose.override.yml` - Local overrides

## 🔧 Implementation Notes

### Package Versions (Directory.Packages.props):
- .NET 8.0
- Entity Framework Core 8.0.0
- MediatR 12.1.1
- AutoMapper 12.0.1
- FluentValidation 11.7.1
- Polly 7.2.4
- RabbitMQ.Client 6.6.0
- StackExchange.Redis 2.7.4
- OpenTelemetry 1.6.0
- Serilog.AspNetCore 7.0.0
- xUnit 2.4.2

### Coding Standards:
- Max 100 lines per function
- Single responsibility principle
- Repository pattern for data access
- Service layer for business logic
- FluentValidation for input validation
- Structured exception handling
- Async/await best practices
- No hardcoded strings - use constants
- Comprehensive logging with Serilog

### Architecture Patterns:
- Clean Architecture (Api/Core/Infrastructure layers)
- CQRS with MediatR
- Repository & Unit of Work patterns
- Circuit breaker with Polly
- Cache-aside pattern with Redis
- Event-driven with RabbitMQ
- API versioning
- OpenTelemetry distributed tracing

This skeleton will provide a complete foundation for implementing all the microservices following .NET 8 best practices and Clean Architecture principles.