# Backend Product Requirements Document (PRD)
## Hệ Thống Quản Lý Thủ Tục Hành Chính - Backend Services

**Version:** 1.0
**Ngày tạo:** 20/12/2024
**Người tạo:** Backend Architecture Team
**Trạng thái:** Draft
**Parent Document:** [Main PRD](../PRD.MD)

---

## 1. Executive Summary

Backend system nội bộ xử lý 800,000 hồ sơ/tháng với 21,000 concurrent civil servants, bao gồm 4 core services (.NET 8): User Service (authentication/RBAC), Workflow Service (Elsa engine), Document Service (processing/digital signature), và Notification Service. API Gateway (YARP) điều phối traffic với integration LGSP/SMS. Message queue (RabbitMQ) xử lý async operations. Đảm bảo <100ms write response time, 270 docs/sec throughput với 99.9% uptime cho cán bộ công chức.

## 2. Scope & Objectives

### 2.1 In Scope
- **Core Services:** User, Workflow, Document, Notification services cho cán bộ công chức
- **API Gateway:** YARP với routing, load balancing, rate limiting
- **Workflow Engine:** Elsa 3.0 với BPMN 2.0 support
- **External Integrations:** LGSP, SMS Gateway, **Postal Service (VietnamPost/EMS)**, Digital Signature
- **Message Processing:** RabbitMQ với event-driven architecture
- **Security:** OAuth2, JWT, PKI, audit trail
- **Internal APIs:** Document processing, workflow management, user management, postal tracking

### 2.2 Out of Scope
- Citizen-facing APIs (document submission, tracking portals)
- Frontend applications (separate PRD)
- Database design (separate PRD)
- Mobile APIs (Phase 2)
- Payment gateway integration (Phase 2)

### 2.3 Success Criteria
- API response time <100ms (95th percentile)
- Support 21,000 concurrent civil servant connections
- Process 270 documents/second peak load
- 99.9% service availability
- Zero data loss with message queue
- Improve government processing efficiency by 50%

---

## 3. Core Services Architecture

### 3.1 User Service (.NET 8)

#### 3.1.1 Authentication Module
**Endpoints:**
```
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/mfa/enable
POST /api/auth/mfa/verify
```

**Features:**
- **Multi-factor Authentication:**
  - SMS OTP (6 digits, 5 min expiry)
  - TOTP with QR code generation
  - PKI certificate integration (USB tokens)
  - Backup codes (10 single-use codes)

- **Session Management:**
  - JWT access tokens (15 min expiry)
  - Refresh tokens (7 days, sliding expiration)
  - Concurrent session limit: 3 per user
  - Device fingerprinting for security

- **OAuth2/OpenID Connect:**
  - Authorization Code flow
  - Client credentials for service-to-service
  - Scopes: read, write, admin, delegate
  - PKCE for public clients

- **Active Directory Integration:**
  - LDAP bind authentication
  - Group membership sync
  - Attribute mapping (email, phone, department)
  - Fallback to local authentication

#### 3.1.2 RBAC Authorization Engine
**Database Schema References:**
- Users, Roles, Permissions, UserRoles tables
- Hierarchical units: Province → Department → District → Ward

**Permission Matrix:**
```
Roles: Tiếp nhận, Thụ lý, Lãnh đạo, Trả kết quả
Procedures: 2000 administrative procedures
Workflows: 200-300 distinct workflow types
Units: 4-level hierarchy across 63 provinces
```

**Advanced Features:**
- **Temporal Permissions:**
  - Start/end datetime with timezone
  - Approval workflow for delegation
  - Auto-revoke on expiry
  - Bulk permission changes

- **Dynamic Role Assignment:**
  - Multiple roles per user
  - Context-sensitive permissions (procedure-specific)
  - Inherited permissions from unit hierarchy
  - Override permissions with audit trail

**Endpoints:**
```
GET /api/users/{id}/permissions
POST /api/users/{id}/delegate
GET /api/roles/hierarchy
POST /api/permissions/bulk-assign
```

#### 3.1.3 Audit & Compliance
**Audit Events:**
- Login/logout with IP/device info
- Permission changes with before/after state
- Delegation create/revoke/expire
- Failed authentication attempts
- Privilege escalation attempts

**Compliance Features:**
- GDPR-compliant data retention (7 years)
- Personal data anonymization tools
- Consent management for optional data
- Data export in machine-readable format

### 3.2 Workflow Service (Elsa 3.0 + .NET 8)

#### 3.2.1 Workflow Execution Engine
**BPMN 2.0 Elements Support:**
- **Flow Objects:** Events, Activities, Gateways
- **Connecting Objects:** Sequence flows, Message flows
- **Swimlanes:** Pools (organizations), Lanes (roles)
- **Artifacts:** Data objects, Groups, Annotations

**Workflow Types:**
```csharp
public enum WorkflowPattern
{
    Sequential,           // Linear approval chain
    Parallel,            // Multiple reviewers simultaneously
    ConditionalBranch,   // If-then-else logic
    Loop,                // Repeat until condition
    SubProcess,          // Nested workflows
    CompensationFlow     // Rollback procedures
}
```

**Execution Features:**
- **State Persistence:** Workflow instances in SQL Server with checkpoints
- **Long-running Support:** Workflow dehydration/rehydration
- **Compensation Handling:** Automatic rollback on failure
- **Correlation:** Multi-instance workflow coordination
- **Versioning:** Hot-swap workflow definitions

#### 3.2.2 Dynamic Workflow Configuration
**Visual Designer API:**
```
GET /api/workflows/designer/elements     # Available BPMN elements
POST /api/workflows/definition           # Save workflow definition
GET /api/workflows/{id}/versions         # Version history
POST /api/workflows/{id}/migrate         # Migrate active instances
```

**Configuration Options:**
- **Step Properties:**
  - Display name, description
  - Assigned roles/users
  - SLA time (hours/days)
  - Required documents
  - Approval conditions

- **Dynamic Updates:**
  - Add/remove steps in running workflows
  - Change assignments without restart
  - Modify SLA times with notification
  - Branching logic updates

#### 3.2.3 Inter-department Workflows
**Cross-unit Processing:**
```
POST /api/workflows/transfer             # Transfer to another unit
POST /api/workflows/consult              # Request consultation
POST /api/workflows/consolidate          # Merge consultation results
GET /api/workflows/{id}/tracking         # Multi-unit status tracking
```

**Coordination Patterns:**
- **Sequential Transfer:** Document moves between units
- **Parallel Consultation:** Multiple departments review simultaneously
- **Aggregation:** Collect opinions before decision
- **Escalation:** Automatic escalation on SLA breach

### 3.3 Document Service (.NET 8)

#### 3.3.1 File Processing Pipeline
**Upload API:**
```
POST /api/documents/upload               # Multi-part upload
GET /api/documents/{id}/progress         # Upload progress
POST /api/documents/{id}/finalize        # Complete upload
DELETE /api/documents/{id}/cancel        # Cancel upload
```

**Processing Stages:**
1. **Validation:**
   - File type verification (magic bytes)
   - Size limits (50-100MB per file)
   - Virus scanning (ClamAV integration)
   - Metadata extraction

2. **Conversion:**
   - Office documents → PDF (LibreOffice API)
   - Images → PDF with OCR (Tesseract)
   - Quality optimization (compression)
   - Thumbnail generation

3. **Storage:**
   - Original file preservation
   - Converted PDF storage
   - Metadata to SQL Server
   - Binary data to MinIO

**OCR Integration:**
```csharp
public class OcrService
{
    public async Task<string> ExtractTextAsync(byte[] imageData, string language = "vie")
    public async Task<BoundingBox[]> DetectTextRegionsAsync(byte[] imageData)
    public async Task<OcrResult> ProcessDocumentAsync(string filePath)
}
```

#### 3.3.2 Digital Signature Integration
**USB Token Support:**
```
GET /api/signature/certificates         # List available certificates
POST /api/signature/sign                # Sign document
GET /api/signature/verify               # Verify signature
POST /api/signature/batch-sign          # Bulk signing
```

**Signature Standards:**
- **PAdES (PDF Advanced Electronic Signatures):**
  - Visible signature with signer info
  - Timestamp from trusted TSA
  - Certificate chain validation
  - Long-term validation (LTV)

- **XAdES (XML Advanced Electronic Signatures):**
  - Detached signatures for XML documents
  - Enveloped signatures for data integrity
  - Manifest for multiple file signing

**Integration Flow:**
1. Convert document to PDF if needed
2. Load certificate from USB token
3. Create signature appearance
4. Apply PAdES signature with timestamp
5. Store signed and original separately
6. Update document status in database

#### 3.3.3 Document Lifecycle Management
**Status Transitions:**
```
UPLOADED → PROCESSING → VALIDATED → IN_WORKFLOW → SIGNED → COMPLETED → ARCHIVED
```

**API Endpoints:**
```
GET /api/documents/{id}/history          # Audit trail
POST /api/documents/{id}/attach          # Attach additional files
GET /api/documents/{id}/preview          # PDF preview
POST /api/documents/{id}/annotate        # Add comments/markup
GET /api/documents/search                # Full-text search
```

### 3.4 Notification Service (.NET 8)

#### 3.4.1 Real-time Notifications
**SignalR Hubs:**
```csharp
public class NotificationHub : Hub
{
    public async Task JoinUserGroup(string userId)
    public async Task JoinDepartmentGroup(string departmentId)
    public async Task SendToUser(string userId, Notification notification)
    public async Task BroadcastToGroup(string groupId, Notification notification)
}
```

**Event Triggers:**
- New document assignment
- SLA deadline warnings (1 hour before)
- Document status changes
- Delegation requests/approvals
- System maintenance notifications

**Notification Types:**
```csharp
public enum NotificationType
{
    DocumentAssigned,     // New work item
    DeadlineWarning,      // SLA alert
    DocumentReturned,     // Rejection/revision
    StatusUpdate,         // Progress update
    SystemAlert          // Maintenance/outage
}
```

#### 3.4.2 External Notification Channels

**SMS Gateway Integration:**
```
POST /api/notifications/sms/send         # Send single SMS
POST /api/notifications/sms/bulk         # Bulk SMS sending
GET /api/notifications/sms/{id}/status   # Delivery status
```

**Provider Configuration:**
- **Primary:** Viettel SMS Gateway
- **Secondary:** MobiFone SMS API
- **Tertiary:** VinaPhone Bulk SMS
- **Fallback:** Email notification if all SMS fail

**Template Management:**
```csharp
public class NotificationTemplate
{
    public string Id { get; set; }
    public string Subject { get; set; }           // Email subject/SMS prefix
    public string Body { get; set; }              // Template with variables
    public Dictionary<string, object> Variables { get; set; }
    public NotificationChannel Channel { get; set; }
    public string Language { get; set; } = "vi";
}
```

**Delivery Features:**
- Queue-based sending (100 SMS/second)
- Retry logic (3 attempts with exponential backoff)
- Delivery tracking and reporting
- Cost optimization with provider rotation
- Webhook callbacks for delivery status

### 3.5 Intelligent Connection Management

#### 3.5.1 Hybrid User Model Implementation

**Challenge:** Supporting 21,000 concurrent users with real-time features requires smart resource allocation.

**Solution: Adaptive Connection Strategy**

```csharp
public class ConnectionManager
{
    public enum ConnectionTier
    {
        RealTime,      // WebSocket connections
        NearRealTime,  // Server-Sent Events + Smart polling
        Eventual       // Background sync + Push notifications
    }

    public ConnectionTier DetermineUserTier(User user, UserActivity activity)
    {
        // Tier 1: Active document processors (3,000-5,000 users)
        if (IsActiveProcessor(user, activity))
            return ConnectionTier.RealTime;

        // Tier 2: Supervisors and managers (10,000-15,000 users)
        if (IsSupervisorOrManager(user))
            return ConnectionTier.NearRealTime;

        // Tier 3: Occasional users (remaining)
        return ConnectionTier.Eventual;
    }

    private bool IsActiveProcessor(User user, UserActivity activity)
    {
        return user.Roles.Any(r => r.Name.Contains("Processor") || r.Name.Contains("Approver"))
               && activity.LastDocumentAction < TimeSpan.FromMinutes(30)
               && activity.ActiveDocuments > 0;
    }

    private bool IsSupervisorOrManager(User user)
    {
        return user.Roles.Any(r => r.Name.Contains("Supervisor") ||
                                   r.Name.Contains("Manager") ||
                                   r.Name.Contains("Leader"));
    }
}
```

**Real-time Connection Hub (Tier 1 - 5,000 users max):**
```csharp
[Authorize]
public class RealTimeHub : Hub
{
    private readonly ConnectionManager _connectionManager;
    private readonly IUserActivityService _activityService;

    public override async Task OnConnectedAsync()
    {
        var user = await GetCurrentUserAsync();
        var activity = await _activityService.GetUserActivityAsync(user.Id);

        var tier = _connectionManager.DetermineUserTier(user, activity);

        if (tier != ConnectionTier.RealTime)
        {
            // Redirect to appropriate tier
            await Clients.Caller.SendAsync("RedirectToTier", tier.ToString());
            Context.Abort();
            return;
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{user.Id}");
        await Groups.AddToGroupAsync(Context.ConnectionId, $"dept-{user.DepartmentId}");

        await base.OnConnectedAsync();
    }

    public async Task JoinDocumentGroup(int documentId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"doc-{documentId}");
    }
}
```

**Near Real-time Service (Tier 2 - Server-Sent Events):**
```csharp
[ApiController]
[Route("api/[controller]")]
public class EventStreamController : ControllerBase
{
    [HttpGet("stream")]
    public async Task<IActionResult> GetEventStream()
    {
        var user = await GetCurrentUserAsync();

        Response.Headers.Add("Content-Type", "text/event-stream");
        Response.Headers.Add("Cache-Control", "no-cache");
        Response.Headers.Add("Connection", "keep-alive");

        var tokenSource = new CancellationTokenSource();

        // Start background task to send events
        _ = Task.Run(async () =>
        {
            await SendUserEventsAsync(user.Id, tokenSource.Token);
        }, tokenSource.Token);

        // Keep connection alive
        await Task.Delay(Timeout.Infinite, HttpContext.RequestAborted);

        tokenSource.Cancel();
        return new EmptyResult();
    }

    private async Task SendUserEventsAsync(int userId, CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                var events = await _eventService.GetPendingEventsAsync(userId);

                foreach (var @event in events)
                {
                    var data = $"data: {JsonSerializer.Serialize(@event)}\n\n";
                    await Response.Body.WriteAsync(Encoding.UTF8.GetBytes(data), cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }

                await Task.Delay(TimeSpan.FromSeconds(10), cancellationToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
```

**Background Sync Service (Tier 3 - Eventual consistency):**
```csharp
public class BackgroundSyncService : BackgroundService
{
    private readonly IUserService _userService;
    private readonly INotificationService _notificationService;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                // Get users who need sync updates
                var usersNeedingSync = await _userService.GetUsersNeedingSyncAsync();

                foreach (var user in usersNeedingSync)
                {
                    var pendingUpdates = await GetPendingUpdatesAsync(user.Id);

                    if (pendingUpdates.Any())
                    {
                        // Send push notification summary
                        await _notificationService.SendPushNotificationAsync(user.Id,
                            $"You have {pendingUpdates.Count} pending updates");

                        // Mark as synced
                        await MarkUserAsSyncedAsync(user.Id);
                    }
                }

                // Sync every 60 seconds for eventual tier
                await Task.Delay(TimeSpan.FromSeconds(60), stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background sync service");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
            }
        }
    }
}
```

#### 3.5.2 Dynamic Tier Switching

**Automatic Tier Management:**
```csharp
public class TierSwitchingService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Evaluate user activity every 5 minutes
            var allConnectedUsers = await _connectionService.GetAllConnectedUsersAsync();

            foreach (var connection in allConnectedUsers)
            {
                var activity = await _activityService.GetRecentActivityAsync(connection.UserId, TimeSpan.FromMinutes(30));
                var newTier = _connectionManager.DetermineUserTier(connection.User, activity);

                if (connection.CurrentTier != newTier)
                {
                    await SwitchUserTierAsync(connection, newTier);
                }
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }

    private async Task SwitchUserTierAsync(UserConnection connection, ConnectionTier newTier)
    {
        // Gracefully transition user to new tier
        switch (newTier)
        {
            case ConnectionTier.RealTime:
                await _hubContext.Clients.User(connection.UserId.ToString())
                    .SendAsync("UpgradeToRealTime");
                break;

            case ConnectionTier.NearRealTime:
                await _hubContext.Clients.User(connection.UserId.ToString())
                    .SendAsync("DowngradeToNearRealTime");
                break;

            case ConnectionTier.Eventual:
                await _hubContext.Clients.User(connection.UserId.ToString())
                    .SendAsync("DowngradeToEventual");
                break;
        }

        connection.CurrentTier = newTier;
        await _connectionService.UpdateConnectionTierAsync(connection);
    }
}
```

#### 3.5.3 Resource Management & Monitoring

**Connection Monitoring:**
```csharp
public class ConnectionMetrics
{
    public int RealTimeConnections { get; set; }
    public int NearRealTimeConnections { get; set; }
    public int EventualUsers { get; set; }
    public double AverageResponseTime { get; set; }
    public double MemoryUsage { get; set; }
    public double CpuUsage { get; set; }
}

public class ConnectionMonitoringService
{
    public async Task<ConnectionMetrics> GetCurrentMetricsAsync()
    {
        return new ConnectionMetrics
        {
            RealTimeConnections = await _hubContext.Clients.All.Count(),
            NearRealTimeConnections = await _sseService.GetActiveStreamCountAsync(),
            EventualUsers = await _userService.GetEventualTierUserCountAsync(),
            AverageResponseTime = await _performanceService.GetAverageResponseTimeAsync(),
            MemoryUsage = GC.GetTotalMemory(false) / (1024 * 1024),
            CpuUsage = await _performanceService.GetCpuUsageAsync()
        };
    }

    public async Task<bool> ShouldScaleResourcesAsync()
    {
        var metrics = await GetCurrentMetricsAsync();

        // Scale if real-time connections exceed 4,000 or CPU > 80%
        return metrics.RealTimeConnections > 4000 ||
               metrics.CpuUsage > 80 ||
               metrics.MemoryUsage > 4096; // 4GB
    }
}
```

**Benefits of Hybrid Approach:**
- **70% Infrastructure Savings**: Only 5,000 real-time connections vs 21,000
- **Same User Experience**: Users get appropriate update frequency for their work
- **Automatic Scaling**: System adapts to actual usage patterns
- **Graceful Degradation**: Never completely fails, just reduces update frequency
- **Cost Effective**: Resources allocated based on actual need

---

## 4. API Gateway & Integration Layer

### 4.1 YARP Configuration

#### 4.1.1 Routing Rules
```json
{
  "ReverseProxy": {
    "Routes": {
      "user-service": {
        "ClusterId": "user-cluster",
        "Match": { "Path": "/api/users/{**catch-all}" },
        "Transforms": [
          { "PathPattern": "/api/users/{**catch-all}" }
        ]
      },
      "workflow-service": {
        "ClusterId": "workflow-cluster",
        "Match": { "Path": "/api/workflows/{**catch-all}" }
      },
      "document-service": {
        "ClusterId": "document-cluster",
        "Match": { "Path": "/api/documents/{**catch-all}" }
      }
    },
    "Clusters": {
      "user-cluster": {
        "LoadBalancingPolicy": "RoundRobin",
        "Destinations": {
          "user-1": { "Address": "https://user-service-1:443/" },
          "user-2": { "Address": "https://user-service-2:443/" }
        }
      }
    }
  }
}
```

#### 4.1.2 Rate Limiting & Circuit Breaker
**Rate Limiting Strategy:**
- **Per User:** 1000 requests/minute
- **Per Service:** 10000 requests/minute
- **Upload Endpoints:** 100 requests/hour
- **Anonymous Endpoints:** 100 requests/minute

**Circuit Breaker Configuration:**
```csharp
services.AddHttpClient("downstream-service")
    .AddPolicyHandler(Policy
        .Handle<HttpRequestException>()
        .CircuitBreakerAsync(
            exceptionsAllowedBeforeBreaking: 3,
            durationOfBreak: TimeSpan.FromSeconds(30),
            onBreak: (exception, duration) => { /* Log circuit opened */ },
            onReset: () => { /* Log circuit closed */ }
        ));
```

#### 4.1.3 Request/Response Transformation
**Request Enrichment:**
- Add correlation ID header
- User context injection
- Request logging with sanitization
- Compression for large payloads

**Response Processing:**
- Error standardization
- Response time headers
- CORS headers for web clients
- Cache headers for static content

### 4.2 External System Integrations

#### 4.2.1 LGSP Integration
**Service Configuration:**
```csharp
public class LgspClientConfiguration
{
    public string BaseUrl { get; set; } = "https://lgsp.gov.vn/api/v2";
    public string ClientId { get; set; }
    public string ClientSecret { get; set; }
    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(30);
    public int MaxRetries { get; set; } = 3;
    public TimeSpan RetryDelay { get; set; } = TimeSpan.FromSeconds(2);
}
```

**API Operations:**
```
GET /api/lgsp/procedures                 # Sync procedure catalog
POST /api/lgsp/submit                   # Submit document
GET /api/lgsp/status/{id}               # Check submission status
POST /api/lgsp/callback                 # Receive status updates
```

**Data Synchronization:**
- **Citizens:** Personal information updates
- **Organizations:** Business registry changes
- **Procedures:** New/modified administrative procedures
- **Classifications:** Standard code lists

**Error Handling:**
- Exponential backoff for failed requests
- Circuit breaker for service degradation
- Fallback to cached data when LGSP unavailable
- Dead letter queue for failed sync operations

#### 4.2.2 SMS Gateway Integration
**Multi-Provider Architecture:**
```csharp
public interface ISmsProvider
{
    Task<SmsResult> SendAsync(SmsMessage message);
    Task<SmsResult> SendBulkAsync(IEnumerable<SmsMessage> messages);
    Task<DeliveryReport> GetDeliveryStatusAsync(string messageId);
}

public class SmsProviderFactory
{
    public ISmsProvider GetProvider(SmsProviderType type);
    public ISmsProvider GetNextAvailableProvider();
}
```

**Provider Implementations:**
- **ViettelSmsProvider:** REST API with JSON payload
- **MobiFoneSmsProvider:** SOAP web service
- **VinaPhoneSmsProvider:** HTTP GET parameters

**Delivery Optimization:**
- Provider rotation based on success rate
- Cost-based routing (cheapest available)
- Geographic routing (local providers)
- Bulk optimization (group messages by provider)

#### 4.2.3 Postal Service Integration
**VietnamPost/EMS Integration:**
```csharp
public interface IPostalService
{
    Task<PostalResult> CreateShipmentAsync(ShipmentRequest request);
    Task<TrackingInfo> TrackShipmentAsync(string trackingNumber);
    Task<DeliveryConfirmation> ConfirmDeliveryAsync(string trackingNumber);
    Task<ShippingCost> CalculateShippingCostAsync(ShippingCostRequest request);
    Task<PrintResult> PrintShippingLabelAsync(string shipmentId);
}

public class VietnamPostService : IPostalService
{
    private readonly HttpClient _httpClient;
    private readonly PostalConfiguration _config;

    public async Task<PostalResult> CreateShipmentAsync(ShipmentRequest request)
    {
        var payload = new
        {
            senderAddress = request.SenderAddress,
            receiverAddress = request.ReceiverAddress,
            packageWeight = request.Weight,
            serviceType = request.ServiceType, // EXPRESS, STANDARD, ECONOMY
            isInsured = request.IsInsured,
            insuranceValue = request.InsuranceValue,
            contents = request.Contents,
            notes = request.SpecialInstructions
        };

        var response = await _httpClient.PostAsJsonAsync("/api/shipments", payload);
        var result = await response.Content.ReadFromJsonAsync<PostalApiResponse>();

        return new PostalResult
        {
            TrackingNumber = result.TrackingNumber,
            EstimatedDelivery = result.EstimatedDeliveryDate,
            ShippingCost = result.Cost,
            Success = result.Success
        };
    }

    public async Task<TrackingInfo> TrackShipmentAsync(string trackingNumber)
    {
        var response = await _httpClient.GetAsync($"/api/tracking/{trackingNumber}");
        var trackingData = await response.Content.ReadFromJsonAsync<TrackingApiResponse>();

        return new TrackingInfo
        {
            TrackingNumber = trackingNumber,
            Status = MapStatus(trackingData.Status),
            LastUpdated = trackingData.LastUpdated,
            CurrentLocation = trackingData.CurrentLocation,
            DeliveryDate = trackingData.DeliveryDate,
            TrackingHistory = trackingData.Events.Select(e => new TrackingEvent
            {
                Timestamp = e.Timestamp,
                Status = e.Status,
                Location = e.Location,
                Description = e.Description
            }).ToList()
        };
    }
}
```

**API Operations:**
```
POST /api/postal/shipments              # Create shipment
GET /api/postal/tracking/{number}       # Track shipment
POST /api/postal/delivery-confirm       # Confirm delivery
GET /api/postal/calculate-cost          # Calculate shipping cost
POST /api/postal/print-label            # Print shipping label
GET /api/postal/pickup-schedule         # Schedule pickup
```

**Features:**
- **Shipment Creation:** Automatic shipment creation when document is ready
- **Real-time Tracking:** Integration with VietnamPost tracking API
- **Cost Calculation:** Automatic shipping cost calculation based on weight/distance
- **Label Printing:** Generate and print shipping labels with barcodes
- **Delivery Confirmation:** Automatic confirmation when package is delivered
- **Pickup Scheduling:** Schedule pickup from government offices

---

## 5. Message Queue Architecture

### 5.1 Simplified RabbitMQ Configuration

#### 5.1.1 Single Exchange Design (Simplified Approach)

**Philosophy:** Reduce operational complexity while maintaining all functionality through smart routing.

```
┌─────────────────────────────────────────────────────┐
│                Single Topic Exchange                │
│                  "dvc.events"                       │
│                                                     │
│  Routing Keys Hierarchy:                            │
│  ├── document.*     (document events)               │
│  ├── workflow.*     (workflow events)               │
│  ├── notification.* (notification events)           │
│  ├── external.*     (external service events)       │
│  └── system.*       (system-wide events)            │
└─────────────────────────────────────────────────────┘
```

**Smart Routing Strategy:**
```yaml
Routing Key Convention:
  document.created         # Document lifecycle events
  document.updated
  document.completed

  workflow.started         # Workflow events
  workflow.completed
  workflow.failed

  notification.email.send  # Notification requests
  notification.sms.send
  notification.push.send

  external.lgsp.sync       # External service events
  external.postal.track
  external.sms.delivery

  system.alert            # System-wide broadcasts
  system.maintenance
```

**Implementation Example:**
```csharp
public class SimpleEventBus : IEventBus
{
    private const string EXCHANGE = "dvc.events";

    public async Task PublishAsync<T>(T @event, Priority priority = Priority.Normal)
    {
        var routingKey = GetRoutingKey<T>();
        var properties = new BasicProperties
        {
            Priority = (byte)(priority == Priority.High ? 10 : 5),
            MessageId = Guid.NewGuid().ToString(),
            Timestamp = new AmqpTimestamp(DateTimeOffset.UtcNow.ToUnixTimeSeconds())
        };

        var body = JsonSerializer.SerializeToUtf8Bytes(@event);

        await _channel.BasicPublishAsync(
            exchange: EXCHANGE,
            routingKey: routingKey,
            mandatory: false,
            basicProperties: properties,
            body: body);
    }

    private string GetRoutingKey<T>() => typeof(T).Name switch
    {
        "DocumentCreated" => "document.created",
        "DocumentUpdated" => "document.updated",
        "WorkflowStarted" => "workflow.started",
        "EmailNotification" => "notification.email.send",
        "SmsNotification" => "notification.sms.send",
        "LgspSync" => "external.lgsp.sync",
        "PostalTracking" => "external.postal.track",
        _ => "system.unknown"
    };
}
```

**Benefits of Simplified Approach:**
- **40% Operational Overhead Reduction**: Single exchange to manage vs multiple
- **Easier Debugging**: All events flow through one exchange
- **Simpler Routing Logic**: Clear hierarchical routing keys
- **Same Functionality**: All original features maintained
- **Better Monitoring**: Single point of event flow visibility

#### 5.1.2 Queue Patterns
**Work Queues:**
```csharp
// Document processing queue
services.Configure<QueueOptions>("document-processing", options =>
{
    options.QueueName = "document.processing";
    options.Durable = true;
    options.AutoDelete = false;
    options.ConsumerCount = 10;
    options.PrefetchCount = 5;
    options.MessageTtl = TimeSpan.FromHours(24);
});
```

**Priority Queues:**
```
Priority 1: Emergency documents (medical, urgent permits)
Priority 2: Standard documents with SLA < 2 days
Priority 3: Standard documents with SLA > 2 days
Priority 4: Batch processing documents
```

**Message Routing:**
```csharp
public class DocumentMessage
{
    public string DocumentId { get; set; }
    public string WorkflowId { get; set; }
    public int Priority { get; set; } = 3;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Dictionary<string, object> Properties { get; set; }
    public string CorrelationId { get; set; }
}
```

#### 5.1.3 Message Processing Patterns
**Idempotent Processing:**
```csharp
public class MessageHandler
{
    private readonly IIdempotencyService _idempotency;

    public async Task<bool> HandleAsync(IMessage message)
    {
        if (await _idempotency.IsProcessedAsync(message.Id))
            return true; // Already processed

        var result = await ProcessMessageAsync(message);

        if (result.Success)
            await _idempotency.MarkProcessedAsync(message.Id);

        return result.Success;
    }
}
```

**Retry and Dead Letter Handling:**
- 3 retry attempts with exponential backoff
- Dead letter queue for permanently failed messages
- Manual reprocessing interface for dead letters
- Poison message detection and quarantine

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| **API Response Time** | <100ms write, <50ms read | 95th percentile |
| **Throughput** | 270 documents/sec peak | Load testing |
| **Concurrent Users** | 21,000 simultaneous | Connection pooling |
| **Message Processing** | 1000 messages/sec | Queue monitoring |
| **Database Queries** | <20ms average | APM tools |

**Optimization Strategies:**
- **Caching:** Redis for frequently accessed data
- **Connection Pooling:** 200 connections per service
- **Async Processing:** Non-blocking I/O operations
- **Query Optimization:** Indexed database queries
- **CDN:** Static content delivery

### 6.2 Security Requirements

#### 6.2.1 Authentication & Authorization
- **JWT Configuration:**
  - RSA 256 signature algorithm
  - 15-minute access token expiry
  - Refresh token rotation
  - Token revocation support

- **API Security:**
  - TLS 1.3 for all communications
  - CORS configuration for web clients
  - Input validation and sanitization
  - SQL injection prevention

#### 6.2.2 Data Protection
- **Encryption:**
  - AES-256 for data at rest
  - TLS 1.3 for data in transit
  - Key rotation every 90 days
  - Hardware security modules (HSM)

- **Audit Logging:**
  - All API calls with request/response
  - Authentication events
  - Permission changes
  - Data access patterns

### 6.3 Reliability & Availability

#### 6.3.1 High Availability
- **Service Redundancy:** Minimum 2 instances per service
- **Load Balancing:** Health check-based routing
- **Circuit Breakers:** Fail-fast for degraded services
- **Graceful Degradation:** Core functions remain available

#### 6.3.2 Disaster Recovery
- **Backup Strategy:**
  - Database: Point-in-time recovery
  - Message Queue: Mirrored queues
  - Configuration: Version-controlled deployment

- **Recovery Targets:**
  - RTO (Recovery Time Objective): 1 hour
  - RPO (Recovery Point Objective): 15 minutes

---

## 7. Dependencies & Integrations

### 7.1 Internal Dependencies
- **Database Services:** SQL Server cluster, Redis cache
- **Storage Services:** MinIO object storage
- **Message Queue:** RabbitMQ cluster
- **Monitoring:** Elasticsearch, Kibana, Prometheus

### 7.2 External Dependencies
- **LGSP Platform:** Government service integration
- **SMS Providers:** Viettel, MobiFone, VinaPhone
- **Certificate Authority:** Digital signature validation
- **Time Stamping Authority:** Signature timestamping

### 7.3 Network Requirements
- **Bandwidth:** 10 Gbps inter-service communication
- **Latency:** <5ms between services in same region
- **DNS:** Internal service discovery via Consul
- **Firewall:** Whitelist-based access control

---

## 8. Success Metrics

### 8.1 Performance KPIs
| KPI | Target | Current | Measurement |
|-----|--------|---------|-------------|
| **API Latency** | <100ms | TBD | APM monitoring |
| **Error Rate** | <0.1% | TBD | Error tracking |
| **Throughput** | 270 docs/sec | TBD | Load testing |
| **Uptime** | 99.9% | TBD | Service monitoring |

### 8.2 Business KPIs
| KPI | Target | Measurement |
|-----|--------|-------------|
| **Document Processing Time** | 30% reduction | Workflow analytics |
| **Automation Rate** | 80% processes automated | Manual vs automated tracking |
| **Integration Success** | 100% LGSP connectivity | Connection monitoring |

---

## 9. Risk Assessment & Mitigation

### 9.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Third-party API failure** | High | Medium | Circuit breakers, fallback mechanisms |
| **Message queue overflow** | Medium | Low | Auto-scaling, dead letter queues |
| **Security breach** | High | Low | Multi-factor auth, encryption, audit logs |
| **Performance degradation** | Medium | Medium | Caching, load balancing, monitoring |

### 9.2 Integration Risks
- **LGSP downtime:** Cache critical data locally
- **SMS provider limits:** Multi-provider failover
- **Certificate expiry:** Automated renewal alerts
- **Version compatibility:** Backward-compatible APIs

---

## 10. Implementation Roadmap

### 10.1 Phase 1: Core Services (8 weeks)
- User Service with basic authentication
- Simple workflow engine
- Document upload/storage
- Basic notification system

### 10.2 Phase 2: Advanced Features (8 weeks)
- Visual workflow designer
- Digital signature integration
- Advanced RBAC with delegation
- Real-time notifications

### 10.3 Phase 3: Integrations (6 weeks)
- LGSP integration
- SMS gateway integration
- Enhanced security features
- Performance optimization

---

## 8. Background Worker Services

### 8.1 Worker Service Architecture

#### 8.1.1 Base Worker Service Pattern
```csharp
public abstract class BaseWorkerService : BackgroundService
{
    protected readonly ILogger _logger;
    protected readonly IMessageConsumer _consumer;
    protected readonly IServiceProvider _serviceProvider;
    protected readonly WorkerOptions _options;

    public BaseWorkerService(
        ILogger logger,
        IMessageConsumer consumer,
        IServiceProvider serviceProvider,
        IOptions<WorkerOptions> options)
    {
        _logger = logger;
        _consumer = consumer;
        _serviceProvider = serviceProvider;
        _options = options.Value;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await _consumer.ConsumeAsync<TMessage>(
            _options.QueueName,
            ProcessMessageAsync,
            stoppingToken);
    }

    protected abstract Task<bool> ProcessMessageAsync(TMessage message);

    protected async Task HandleRetryAsync(TMessage message, Exception exception)
    {
        if (message.RetryCount < _options.MaxRetries)
        {
            message.RetryCount++;
            message.NextRetryAt = DateTime.UtcNow.AddSeconds(
                Math.Pow(2, message.RetryCount) * _options.BaseRetryDelaySeconds);

            await _consumer.PublishAsync("retry.exchange", message);
        }
        else
        {
            await _consumer.PublishAsync("dlq.exchange", message);
            _logger.LogError("Message moved to DLQ after {RetryCount} attempts", message.RetryCount);
        }
    }
}
```

#### 8.1.2 Worker Configuration
```csharp
public class WorkerOptions
{
    public string QueueName { get; set; }
    public int MaxRetries { get; set; } = 3;
    public int BaseRetryDelaySeconds { get; set; } = 5;
    public int ConcurrentWorkers { get; set; } = 5;
    public int PrefetchCount { get; set; } = 10;
    public TimeSpan HealthCheckInterval { get; set; } = TimeSpan.FromMinutes(1);
}
```

### 8.2 Notification Worker Service

#### 8.2.1 Email Worker Implementation
```csharp
public class EmailWorkerService : BaseWorkerService<EmailMessage>
{
    private readonly IEmailService _emailService;
    private readonly ITemplateEngine _templateEngine;

    public EmailWorkerService(
        ILogger<EmailWorkerService> logger,
        IMessageConsumer consumer,
        IServiceProvider serviceProvider,
        IOptions<WorkerOptions> options,
        IEmailService emailService,
        ITemplateEngine templateEngine)
        : base(logger, consumer, serviceProvider, options)
    {
        _emailService = emailService;
        _templateEngine = templateEngine;
    }

    protected override async Task<bool> ProcessMessageAsync(EmailMessage message)
    {
        try
        {
            // Render email template
            var renderedContent = await _templateEngine.RenderAsync(
                message.TemplateId,
                message.TemplateData);

            var emailRequest = new EmailRequest
            {
                To = message.Recipients,
                Subject = renderedContent.Subject,
                Body = renderedContent.Body,
                IsHtml = true,
                Priority = message.Priority
            };

            // Send email
            var result = await _emailService.SendAsync(emailRequest);

            // Update status
            await UpdateMessageStatusAsync(message.Id,
                result.Success ? MessageStatus.Delivered : MessageStatus.Failed,
                result.ErrorMessage);

            return result.Success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process email message {MessageId}", message.Id);
            await HandleRetryAsync(message, ex);
            return false;
        }
    }
}
```

#### 8.2.2 SMS Worker Implementation
```csharp
public class SmsWorkerService : BaseWorkerService<SmsMessage>
{
    private readonly ISmsService _smsService;
    private readonly ISmsProviderFactory _providerFactory;

    protected override async Task<bool> ProcessMessageAsync(SmsMessage message)
    {
        var providers = _providerFactory.GetProviders();

        foreach (var provider in providers)
        {
            try
            {
                var result = await provider.SendAsync(new SmsRequest
                {
                    PhoneNumber = message.PhoneNumber,
                    Content = message.Content,
                    Priority = message.Priority
                });

                if (result.Success)
                {
                    await UpdateMessageStatusAsync(message.Id, MessageStatus.Delivered);
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "SMS provider {Provider} failed, trying next", provider.Name);
                continue;
            }
        }

        // All providers failed
        await HandleRetryAsync(message, new Exception("All SMS providers failed"));
        return false;
    }
}

// SMS Provider Factory with rotation
public class SmsProviderFactory : ISmsProviderFactory
{
    private readonly List<ISmsProvider> _providers;

    public SmsProviderFactory(IEnumerable<ISmsProvider> providers)
    {
        _providers = providers.OrderBy(p => p.Priority).ToList();
    }

    public IEnumerable<ISmsProvider> GetProviders()
    {
        // Return providers in priority order
        return _providers.Where(p => p.IsHealthy);
    }
}
```

### 8.3 Postal Worker Service

#### 8.3.1 Postal Shipment Worker
```csharp
public class PostalWorkerService : BaseWorkerService<PostalMessage>
{
    private readonly IPostalService _postalService;
    private readonly IDocumentService _documentService;

    protected override async Task<bool> ProcessMessageAsync(PostalMessage message)
    {
        switch (message.Type)
        {
            case PostalMessageType.CreateShipment:
                return await ProcessCreateShipmentAsync(message);

            case PostalMessageType.UpdateTracking:
                return await ProcessTrackingUpdateAsync(message);

            case PostalMessageType.DeliveryConfirmation:
                return await ProcessDeliveryConfirmationAsync(message);

            default:
                _logger.LogWarning("Unknown postal message type: {Type}", message.Type);
                return false;
        }
    }

    private async Task<bool> ProcessCreateShipmentAsync(PostalMessage message)
    {
        try
        {
            var shipmentRequest = JsonSerializer.Deserialize<ShipmentRequest>(message.Data);

            // Create shipment with VietnamPost
            var result = await _postalService.CreateShipmentAsync(shipmentRequest);

            if (result.Success)
            {
                // Update document with tracking number
                await _documentService.UpdateShipmentInfoAsync(
                    shipmentRequest.DocumentId,
                    result.TrackingNumber,
                    result.EstimatedDelivery);

                // Schedule tracking updates
                await ScheduleTrackingUpdatesAsync(result.TrackingNumber);
            }

            return result.Success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create postal shipment");
            return false;
        }
    }

    private async Task ScheduleTrackingUpdatesAsync(string trackingNumber)
    {
        var trackingMessage = new PostalMessage
        {
            Type = PostalMessageType.UpdateTracking,
            Data = JsonSerializer.Serialize(new { TrackingNumber = trackingNumber }),
            ScheduledFor = DateTime.UtcNow.AddHours(1) // Check every hour
        };

        await _consumer.PublishAsync("postal.tracking.queue", trackingMessage);
    }
}
```

#### 8.3.2 Postal Webhook Handler
```csharp
[ApiController]
[Route("api/postal/webhooks")]
public class PostalWebhookController : ControllerBase
{
    private readonly IMessagePublisher _publisher;

    [HttpPost("vietnampost")]
    public async Task<IActionResult> HandleVietnamPostWebhook([FromBody] VietnamPostWebhook webhook)
    {
        var message = new PostalMessage
        {
            Type = PostalMessageType.UpdateTracking,
            Data = JsonSerializer.Serialize(webhook),
            Priority = webhook.Status == "DELIVERED" ? 1 : 3
        };

        await _publisher.PublishAsync("postal.tracking.queue", message);

        return Ok();
    }
}
```

### 8.4 LGSP Sync Worker Service

#### 8.4.1 LGSP Background Synchronization
```csharp
public class LgspSyncWorkerService : BaseWorkerService<LgspMessage>
{
    private readonly ILgspService _lgspService;
    private readonly ICacheService _cacheService;

    protected override async Task<bool> ProcessMessageAsync(LgspMessage message)
    {
        switch (message.Type)
        {
            case LgspMessageType.SyncProcedures:
                return await SyncProceduresAsync();

            case LgspMessageType.SubmitDocument:
                return await SubmitDocumentAsync(message);

            case LgspMessageType.CheckStatus:
                return await CheckSubmissionStatusAsync(message);

            default:
                return false;
        }
    }

    private async Task<bool> SyncProceduresAsync()
    {
        try
        {
            var procedures = await _lgspService.GetProceduresAsync();

            // Cache procedures for fallback
            await _cacheService.SetAsync("lgsp:procedures", procedures, TimeSpan.FromHours(24));

            // Update local database
            await UpdateLocalProceduresAsync(procedures);

            return true;
        }
        catch (LgspUnavailableException ex)
        {
            _logger.LogWarning("LGSP unavailable, using cached data: {Error}", ex.Message);
            return true; // Not a failure, fallback to cache
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync LGSP procedures");
            return false;
        }
    }

    private async Task<bool> SubmitDocumentAsync(LgspMessage message)
    {
        var submission = JsonSerializer.Deserialize<LgspSubmission>(message.Data);

        try
        {
            var result = await _lgspService.SubmitDocumentAsync(submission);

            if (result.Success)
            {
                // Schedule status checks
                await ScheduleStatusChecksAsync(result.SubmissionId);
            }

            return result.Success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to submit document to LGSP");
            return false;
        }
    }
}
```

### 8.5 Worker Service Registration

#### 8.5.1 Service Configuration
```csharp
public static class WorkerServiceExtensions
{
    public static IServiceCollection AddWorkerServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // Configure worker options
        services.Configure<WorkerOptions>("EmailWorker",
            configuration.GetSection("Workers:Email"));
        services.Configure<WorkerOptions>("SmsWorker",
            configuration.GetSection("Workers:Sms"));
        services.Configure<WorkerOptions>("PostalWorker",
            configuration.GetSection("Workers:Postal"));
        services.Configure<WorkerOptions>("LgspWorker",
            configuration.GetSection("Workers:Lgsp"));

        // Register worker services
        services.AddHostedService<EmailWorkerService>();
        services.AddHostedService<SmsWorkerService>();
        services.AddHostedService<PostalWorkerService>();
        services.AddHostedService<LgspSyncWorkerService>();

        // Register dependencies
        services.AddScoped<ITemplateEngine, RazorTemplateEngine>();
        services.AddScoped<ISmsProviderFactory, SmsProviderFactory>();
        services.AddScoped<IMessagePublisher, RabbitMqPublisher>();
        services.AddScoped<IMessageConsumer, RabbitMqConsumer>();

        return services;
    }
}
```

#### 8.5.2 Health Checks for Workers
```csharp
public class WorkerHealthCheck : IHealthCheck
{
    private readonly IMessageConsumer _consumer;
    private readonly string _queueName;

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var queueInfo = await _consumer.GetQueueInfoAsync(_queueName);

            if (queueInfo.MessageCount > 1000)
            {
                return HealthCheckResult.Degraded(
                    $"Queue {_queueName} has {queueInfo.MessageCount} pending messages");
            }

            return HealthCheckResult.Healthy($"Queue {_queueName} is healthy");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy(
                $"Queue {_queueName} health check failed", ex);
        }
    }
}
```

### 8.6 Monitoring và Metrics

#### 8.6.1 Worker Performance Metrics
```csharp
public class WorkerMetrics
{
    private readonly IMetricsRegistry _metrics;

    public void RecordMessageProcessed(string workerName, bool success, TimeSpan duration)
    {
        _metrics.Counter($"worker.{workerName}.messages.processed")
            .WithTag("success", success.ToString())
            .Increment();

        _metrics.Timer($"worker.{workerName}.processing.duration")
            .Record(duration);
    }

    public void RecordQueueDepth(string queueName, int messageCount)
    {
        _metrics.Gauge($"queue.{queueName}.depth")
            .SetValue(messageCount);
    }

    public void RecordRetry(string workerName, int retryCount)
    {
        _metrics.Counter($"worker.{workerName}.retries")
            .WithTag("retry_count", retryCount.ToString())
            .Increment();
    }
}
```

---

## 9. Design Patterns Architecture

### 9.1 Essential Design Patterns

The DVC v2 backend microservices implement a carefully selected set of design patterns to ensure maintainability, scalability, and performance while avoiding over-engineering.

#### 9.1.1 Core Patterns (Must Use)
1. **Repository Pattern** - Data access abstraction for all entities
2. **Dependency Injection** - Built-in .NET Core DI container
3. **Event-Driven Architecture** - RabbitMQ for external service decoupling
4. **API Gateway Pattern** - YARP for centralized routing and security
5. **Circuit Breaker Pattern** - Polly for external service resilience

#### 9.1.2 Recommended Patterns (Use When Needed)
1. **Unit of Work Pattern** - Multi-entity transactions
2. **Cache-Aside Pattern** - Redis for performance optimization
3. **Retry Pattern** - Exponential backoff for transient failures
4. **Strategy Pattern** - SMS/Email provider rotation
5. **Observer Pattern** - SignalR for real-time notifications
6. **Outbox Pattern** - Reliable message publishing

#### 9.1.3 Simplified Patterns (Avoid Unnecessary Complexity)
1. **Selective CQRS** - Use materialized views instead of full separation (see Database PRD)
2. **Saga Pattern** - Only for complex distributed transactions via Elsa (rare use cases)
3. **Factory Pattern** - Usually DI container is sufficient (prefer direct injection)

### 9.2 Pattern Implementation Guidelines

#### 9.2.1 Repository Pattern Implementation
```csharp
// All services must use repository pattern
public interface IDocumentRepository : IRepository<Document>
{
    Task<List<Document>> GetByUserIdAsync(int userId);
    Task<List<Document>> GetByStatusAsync(DocumentStatus status);
}

public class DocumentRepository : Repository<Document>, IDocumentRepository
{
    public DocumentRepository(DvcDbContext context) : base(context) { }
    // Implementation follows database coding rules
}
```

#### 9.2.2 Event-Driven Architecture
```csharp
// All external integrations use message queues
public class DocumentService
{
    public async Task CreateDocumentAsync(CreateDocumentRequest request)
    {
        var document = await _repository.AddAsync(new Document(request));

        // Publish event for external processing
        await _eventBus.PublishAsync(new DocumentCreatedEvent(document));

        return document;
    }
}
```

#### 9.2.3 Circuit Breaker for External Services
```csharp
// All external API calls must use circuit breaker
public class LgspService
{
    private readonly IAsyncPolicy<HttpResponseMessage> _circuitBreakerPolicy;

    public async Task<CitizenInfo> GetCitizenInfoAsync(string citizenId)
    {
        return await _circuitBreakerPolicy.ExecuteAsync(async () =>
        {
            var response = await _httpClient.GetAsync($"/api/citizens/{citizenId}");
            // Process response
        });
    }
}
```

### 9.3 Pattern Usage Matrix

| Service | Repository | Unit of Work | Event-Driven | Circuit Breaker | Cache-Aside | Strategy |
|---------|------------|--------------|--------------|-----------------|-------------|----------|
| User Service | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Document Service | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Workflow Service | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Notification Service | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Email Worker | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| SMS Worker | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Postal Worker | ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| LGSP Worker | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |

### 9.4 Anti-Patterns to Avoid

1. **Over-Engineering**: Don't implement patterns without clear need
2. **God Objects**: Keep services focused on single responsibility
3. **Anemic Domain Model**: Put business logic in domain entities
4. **Big Ball of Mud**: Maintain clean architecture boundaries
5. **Golden Hammer**: Don't force patterns where they don't fit

### 9.5 Pattern Selection Principles

1. **KISS (Keep It Simple, Stupid)** - Start with simplest solution
2. **YAGNI (You Aren't Gonna Need It)** - Don't implement for future needs
3. **Measure First** - Add patterns to solve real performance/maintainability issues
4. **Team Knowledge** - Only use patterns the team understands
5. **Start Simple, Evolve Complex** - Begin basic, add complexity when needed

### 9.6 Detailed Pattern Documentation

For comprehensive implementation details, examples, and guidelines for each pattern, refer to:
- **[Design Patterns PRD](design-patterns-prd.md)** - Complete pattern documentation
- **[Backend Coding Rules](../rules/backend-rules.md)** - Implementation standards
- **[Database Rules](../rules/database-rules.md)** - Data access patterns

---

## 10. References

- **Parent Document:** [Main PRD](../PRD.MD) - Sections 2, 3, 4
- **Pattern Documentation:** [Design Patterns PRD](design-patterns-prd.md)
- **API Standards:** OpenAPI 3.0, RESTful design principles
- **Security Standards:** OWASP Top 10, ISO 27001
- **Message Standards:** AMQP 0.9.1, CloudEvents specification
- **Workflow Standards:** BPMN 2.0, DMN 1.3

---

**Document Control:**
- **Version:** 1.0
- **Last Updated:** 20/12/2024
- **Next Review:** 27/12/2024
- **Approval Required:** Technical Lead, Security Officer