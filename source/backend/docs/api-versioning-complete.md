# API Versioning Complete Guide - DVC v2
## Strategy + Implementation for Government Document System

**Version:** 1.0
**Ngày tạo:** 21/09/2025
**Áp dụng cho:** All DVC v2 Microservices

---

## 1. Executive Summary

This document provides complete API versioning guidance for the DVC v2 system, ensuring backward compatibility and smooth client transitions across all microservices. The strategy balances government system stability with continuous improvement needs.

### 1.1 Key Principles

- **Never Break Existing Clients**: Government systems require exceptional stability
- **Predictable Evolution**: Clear versioning timeline with advance notice
- **Minimal Client Impact**: Smooth migration paths with overlap periods
- **Documentation-First**: Every version change is thoroughly documented

---

## 2. Versioning Strategy

### 2.1 Versioning Scheme

**Format:** Semantic Versioning with API-specific rules
```
v{MAJOR}.{MINOR}
Examples: v1.0, v1.1, v2.0
```

**Version Types:**
- **MAJOR (v1.0 → v2.0)**: Breaking changes, incompatible API modifications
- **MINOR (v1.0 → v1.1)**: New features, backward-compatible additions
- **Patch**: Bug fixes, no API changes (handled without versioning)

### 2.2 Supported Versions Policy

```yaml
Version Support Timeline:
  Current Version (v2.0):     Full support, active development
  Previous Version (v1.0):    Maintenance mode, security fixes only
  Deprecated Version (v0.x):  6-month grace period, then removed

Support Duration:
  - Major Version: 24 months minimum
  - Minor Version: 12 months minimum
  - Grace Period: 6 months after deprecation notice
```

---

## 3. Quick Implementation Setup

### 3.1 Required Packages

```xml
<PackageReference Include="Microsoft.AspNetCore.Mvc.Versioning" Version="5.1.0" />
<PackageReference Include="Microsoft.AspNetCore.Mvc.Versioning.ApiExplorer" Version="5.1.0" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
```

### 3.2 Program.cs Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add API versioning
builder.Services.AddApiVersioning(opt =>
{
    opt.DefaultApiVersion = new ApiVersion(2, 0);
    opt.AssumeDefaultVersionWhenUnspecified = true;
    opt.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Version"),
        new QueryStringApiVersionReader("version")
    );
});

builder.Services.AddVersionedApiExplorer(setup =>
{
    setup.GroupNameFormat = "'v'VVV";
    setup.SubstituteApiVersionInUrl = true;
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1.0/swagger.json", "DVC API v1.0");
        c.SwaggerEndpoint("/swagger/v2.0/swagger.json", "DVC API v2.0");
    });
}

app.Run();
```

---

## 4. Controller Implementation

### 4.1 Versioned Controller Pattern

```csharp
[ApiController]
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class DocumentController : ControllerBase
{
    [HttpGet("{id}")]
    [MapToApiVersion("1.0")]
    public async Task<ApiResponse<DocumentDtoV1>> GetDocumentV1(int id)
    {
        return new ApiResponse<DocumentDtoV1>
        {
            Data = await _documentService.GetDocumentV1Async(id),
            Version = "1.0",
            DeprecationNotice = "This version will be deprecated on 2026-01-01"
        };
    }

    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public async Task<ApiResponse<DocumentDtoV2>> GetDocumentV2(int id)
    {
        return new ApiResponse<DocumentDtoV2>
        {
            Data = await _documentService.GetDocumentV2Async(id),
            Version = "2.0"
        };
    }
}
```

### 4.2 Service Layer Versioning

```csharp
public interface IDocumentService
{
    Task<DocumentDtoV1> GetDocumentV1Async(int id);
    Task<DocumentDtoV2> GetDocumentV2Async(int id);
}

public class DocumentService : IDocumentService
{
    public async Task<DocumentDtoV1> GetDocumentV1Async(int id)
    {
        var document = await _repository.GetByIdAsync(id);
        return _mapper.Map<DocumentDtoV1>(document);
    }

    public async Task<DocumentDtoV2> GetDocumentV2Async(int id)
    {
        var document = await _repository.GetByIdAsync(id);
        return _mapper.Map<DocumentDtoV2>(document);
    }
}
```

---

## 5. Version-Specific DTOs

### 5.1 V1.0 Document DTO (Legacy)

```csharp
public class DocumentDtoV1
{
    public int Id { get; set; }
    public string Title { get; set; }
    public string Status { get; set; } // String for compatibility
    public DateTime CreatedDate { get; set; }
    public string CreatedBy { get; set; } // Simple string
    public int AttachmentCount { get; set; }
}
```

### 5.2 V2.0 Document DTO (Enhanced)

```csharp
public class DocumentDtoV2
{
    public int Id { get; set; }
    public string Title { get; set; }
    public DocumentStatus Status { get; set; } // Enum instead of string
    public DateTime CreatedDate { get; set; }
    public DateTime LastModified { get; set; } // New field
    public UserDto CreatedBy { get; set; } // Object instead of string
    public List<AttachmentDto> Attachments { get; set; } // New field
    public WorkflowStatusDto WorkflowStatus { get; set; } // New field
}
```

### 5.3 AutoMapper Configuration

```csharp
public class DocumentMappingProfile : Profile
{
    public DocumentMappingProfile()
    {
        CreateMap<Document, DocumentDtoV1>()
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy.FullName))
            .ForMember(dest => dest.AttachmentCount, opt => opt.MapFrom(src => src.Attachments.Count));

        CreateMap<Document, DocumentDtoV2>()
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy))
            .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => src.Attachments));
    }
}
```

---

## 6. API Gateway Configuration

### 6.1 YARP Route Configuration

```json
{
  "Routes": {
    "documents-v1": {
      "ClusterId": "document-service",
      "Match": {
        "Path": "/api/v1.0/documents/{**catch-all}"
      },
      "Transforms": [
        {
          "RequestHeader": "API-Version",
          "Set": "1.0"
        }
      ]
    },
    "documents-v2": {
      "ClusterId": "document-service",
      "Match": {
        "Path": "/api/v2.0/documents/{**catch-all}"
      },
      "Transforms": [
        {
          "RequestHeader": "API-Version",
          "Set": "2.0"
        }
      ]
    }
  }
}
```

### 6.2 Version Negotiation Middleware

```csharp
public class ApiVersionNegotiationMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        if (!context.Request.Path.Value.Contains("/v"))
        {
            var newPath = context.Request.Path.Value.Replace("/api/", "/api/v2.0/");
            context.Request.Path = newPath;

            context.Response.Headers.Add("X-API-Deprecation-Warning",
                "Unversioned endpoints deprecated. Use /api/v2.0/ format.");
        }

        await next(context);
    }
}
```

---

## 7. Client SDK & Migration

### 7.1 TypeScript Client Generation

```typescript
// Legacy client (v1.0)
import { DocumentApiV1 } from '@dvc/api-client-v1';
const clientV1 = new DocumentApiV1();
const doc = await clientV1.getDocument(123);

// New client (v2.0)
import { DocumentApiV2 } from '@dvc/api-client-v2';
const clientV2 = new DocumentApiV2();
const doc = await clientV2.getDocument(123);
```

### 7.2 Migration Checklist

**Breaking Changes v1.0 → v2.0:**
1. **Status Field**: String → Enum
   - Old: `status: "active"`
   - New: `status: DocumentStatus.Active`

2. **CreatedBy Field**: String → Object
   - Old: `createdBy: "John Doe"`
   - New: `createdBy: { id: 123, fullName: "John Doe" }`

3. **New Required Fields**:
   - `lastModified: DateTime`
   - `workflowStatus: WorkflowStatusDto`

---

## 8. Testing Strategy

### 8.1 Cross-Version Testing

```csharp
[TestClass]
public class DocumentApiVersionTests
{
    [TestMethod]
    public async Task GetDocument_V1_ReturnsLegacyFormat()
    {
        var response = await _clientV1.GetDocumentAsync(123);
        Assert.IsInstanceOfType(response.Data, typeof(DocumentDtoV1));
        Assert.IsInstanceOfType(response.Data.Status, typeof(string));
    }

    [TestMethod]
    public async Task GetDocument_V2_ReturnsEnhancedFormat()
    {
        var response = await _clientV2.GetDocumentAsync(123);
        Assert.IsInstanceOfType(response.Data, typeof(DocumentDtoV2));
        Assert.IsInstanceOfType(response.Data.Status, typeof(DocumentStatus));
        Assert.IsNotNull(response.Data.WorkflowStatus);
    }

    [TestMethod]
    public async Task CrossVersion_SameData_DifferentFormat()
    {
        var v1Response = await _clientV1.GetDocumentAsync(123);
        var v2Response = await _clientV2.GetDocumentAsync(123);

        Assert.AreEqual(v1Response.Data.Id, v2Response.Data.Id);
        Assert.AreEqual(v1Response.Data.Title, v2Response.Data.Title);
    }
}
```

---

## 9. Monitoring & Metrics

### 9.1 Version Usage Tracking

```csharp
public class ApiVersionMetrics
{
    private readonly IMetricsCollector _metrics;

    public async Task TrackApiUsage(string version, string endpoint, TimeSpan duration)
    {
        _metrics.Counter("api.requests.total")
            .WithTag("version", version)
            .WithTag("endpoint", endpoint)
            .Increment();

        _metrics.Histogram("api.request.duration")
            .WithTag("version", version)
            .WithTag("endpoint", endpoint)
            .Record(duration.TotalMilliseconds);
    }
}
```

### 9.2 Dashboard Metrics

- Version adoption rates
- Deprecated version usage
- Migration progress tracking
- Performance comparison across versions

---

## 10. Security & Deployment

### 10.1 Version-Specific Security

```csharp
public class VersionSecurityMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var version = ExtractApiVersion(context.Request);

        if (IsVersionDeprecated(version))
        {
            _auditLogger.LogDeprecatedApiUsage(context.User.Identity.Name, version);
            context.Response.Headers.Add("X-API-Deprecated", "true");
            context.Response.Headers.Add("X-API-Sunset", GetDeprecationDate(version));
        }

        await next(context);
    }
}
```

### 10.2 Blue-Green Deployment

```yaml
Deployment Strategy:
  1. Deploy new version alongside existing
  2. Route percentage of traffic to new version
  3. Monitor metrics and error rates
  4. Gradually increase traffic to new version
  5. Maintain old version during grace period
  6. Remove old version after deprecation period
```

---

## 11. Implementation Timeline

**Phase 1 (Week 1-2)**: Infrastructure Setup
- Install versioning packages
- Configure API Gateway routing
- Set up version-specific documentation

**Phase 2 (Week 3-4)**: Service Implementation
- Implement versioning in microservices
- Create version-specific DTOs
- Set up automated testing

**Phase 3 (Week 5-6)**: Client & Documentation
- Generate client SDKs
- Complete migration guides
- Set up monitoring

**Phase 4 (Week 7-8)**: Testing & Deployment
- Cross-version testing
- Deploy to staging
- Train development teams

---

## 12. Success Metrics

- Zero breaking changes to existing clients
- <100ms additional latency for version negotiation
- 95% client migration rate within 6 months
- Complete API documentation coverage

---

**Document Status:** Ready for Implementation
**Last Updated:** 21/09/2025
**Next Review:** 21/12/2025