# API & Design Patterns Quick Reference - DVC v2

## API Versioning

### Quick Setup
```csharp
// Program.cs
builder.Services.AddApiVersioning(opt =>
{
    opt.DefaultApiVersion = new ApiVersion(2, 0);
    opt.AssumeDefaultVersionWhenUnspecified = true;
    opt.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Version")
    );
});
```

### Controller Implementation
```csharp
[ApiController]
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class DocumentController : ControllerBase
{
    [HttpGet("{id}")]
    [MapToApiVersion("1.0")]
    public async Task<ApiResponse<DocumentDtoV1>> GetDocumentV1(int id) { }

    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public async Task<ApiResponse<DocumentDtoV2>> GetDocumentV2(int id) { }
}
```

## Distributed Tracing

### OpenTelemetry Setup
```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(builder =>
    {
        builder
            .AddSource("DVC.DocumentService")
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddJaegerExporter();
    });
```

### Activity Tracing
```csharp
using var activity = DvcActivitySources.DocumentService.StartActivity("ProcessDocument");
activity?.SetTag("document.id", documentId);
activity?.SetTag("user.id", userId);
```

## Design Patterns

### Repository Pattern
```csharp
public interface IDocumentRepository : IRepository<Document>
{
    Task<List<Document>> GetByUserIdAsync(int userId);
    Task<List<Document>> GetByStatusAsync(DocumentStatus status);
}
```

### Unit of Work
```csharp
public interface IUnitOfWork : IDisposable
{
    IDocumentRepository Documents { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
}
```

### CQRS Pattern
```csharp
public class CreateDocumentCommand : ICommand
{
    public string Title { get; set; }
    public string Content { get; set; }
}

public class GetDocumentsByUserQuery : IQuery<List<DocumentDto>>
{
    public int UserId { get; set; }
}
```

## Code Examples
- **API Versioning**: [api-versioning-complete.md](../api-versioning-complete.md)
- **Distributed Tracing**: [distributed-tracing-complete.md](../distributed-tracing-complete.md)
- **Design Patterns**: [design-patterns-examples.cs](../code-examples/backend/design-patterns-examples.cs)

## Full Documentation
- **Design Patterns**: [Design Patterns PRD](../prd/sub-prd/design-patterns-prd.md)