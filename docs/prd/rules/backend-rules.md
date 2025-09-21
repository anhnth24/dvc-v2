# Backend Coding Rules - DVC v2
## .NET 8 Microservices Development Standards

**Version:** 1.0
**Ngày tạo:** 21/09/2025
**Áp dụng cho:** All .NET 8 microservices

---

## 1. Function & Method Rules

### 1.1 Max 100 Lines Per Function
```csharp
// ❌ BAD: Long function (120+ lines)
public async Task<ApiResponse<DocumentDto>> ProcessDocumentAsync(ProcessDocumentRequest request)
{
    // 120+ lines of code here...
}

// ✅ GOOD: Split into smaller functions
public async Task<ApiResponse<DocumentDto>> ProcessDocumentAsync(ProcessDocumentRequest request)
{
    var validationResult = await ValidateDocumentAsync(request);
    if (!validationResult.IsValid) return validationResult.ToErrorResponse();

    var document = await CreateDocumentAsync(request);
    await StartWorkflowAsync(document);
    await SendNotificationAsync(document);

    return ApiResponse<DocumentDto>.Success(document.ToDto());
}

private async Task<ValidationResult> ValidateDocumentAsync(ProcessDocumentRequest request)
{
    // Max 100 lines validation logic
}

private async Task<Document> CreateDocumentAsync(ProcessDocumentRequest request)
{
    // Max 100 lines creation logic
}
```

### 1.2 Single Responsibility Principle
```csharp
// ❌ BAD: Multiple responsibilities
public class DocumentService
{
    public async Task ProcessDocument() { /* document logic */ }
    public async Task SendEmail() { /* email logic */ }
    public async Task ValidateUser() { /* user logic */ }
}

// ✅ GOOD: Single responsibility
public class DocumentService
{
    private readonly IEmailService _emailService;
    private readonly IUserService _userService;

    public async Task<Document> ProcessDocumentAsync(ProcessDocumentRequest request)
    {
        // Only document processing logic
    }
}
```

---

## 2. Naming Conventions

### 2.1 Clear, Descriptive Names
```csharp
// ❌ BAD
public async Task<List<Doc>> GetDocs(int id)
{
    var docs = await _repo.Get(id);
    return docs;
}

// ✅ GOOD
public async Task<List<DocumentDto>> GetDocumentsByUserIdAsync(int userId)
{
    var documents = await _documentRepository.GetByUserIdAsync(userId);
    return documents.Select(doc => doc.ToDto()).ToList();
}
```

### 2.2 Async Method Naming
```csharp
// ❌ BAD
public async Task<Document> CreateDocument() { }
public Task<List<Document>> GetDocuments() { }

// ✅ GOOD
public async Task<Document> CreateDocumentAsync() { }
public async Task<List<Document>> GetDocumentsAsync() { }
```

---

## 3. Error Handling & Logging

### 3.1 Structured Exception Handling
```csharp
// ✅ GOOD: Centralized error handling
public async Task<ApiResponse<DocumentDto>> CreateDocumentAsync(CreateDocumentRequest request)
{
    try
    {
        _logger.LogInformation("Creating document for user {UserId}", request.UserId);

        var document = await _documentService.CreateAsync(request);

        _logger.LogInformation("Document created successfully {DocumentId}", document.Id);
        return ApiResponse<DocumentDto>.Success(document.ToDto());
    }
    catch (ValidationException ex)
    {
        _logger.LogWarning("Document validation failed: {Error}", ex.Message);
        return ApiResponse<DocumentDto>.Error(ex.Message, 400);
    }
    catch (BusinessException ex)
    {
        _logger.LogError(ex, "Business rule violation during document creation");
        return ApiResponse<DocumentDto>.Error(ex.Message, 422);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error creating document");
        return ApiResponse<DocumentDto>.Error("Internal server error", 500);
    }
}
```

### 3.2 Custom Exceptions
```csharp
// ✅ GOOD: Domain-specific exceptions
public class DocumentValidationException : Exception
{
    public List<string> ValidationErrors { get; }

    public DocumentValidationException(List<string> errors)
        : base($"Document validation failed: {string.Join(", ", errors)}")
    {
        ValidationErrors = errors;
    }
}

public class DocumentNotFoundException : Exception
{
    public int DocumentId { get; }

    public DocumentNotFoundException(int documentId)
        : base($"Document with ID {documentId} not found")
    {
        DocumentId = documentId;
    }
}
```

---

## 4. Repository Pattern

### 4.1 Generic Repository Base
```csharp
// ✅ GOOD: Generic repository interface
public interface IRepository<T> where T : BaseEntity
{
    Task<T> GetByIdAsync(int id);
    Task<List<T>> GetAllAsync();
    Task<T> AddAsync(T entity);
    Task<T> UpdateAsync(T entity);
    Task DeleteAsync(int id);
    Task<bool> ExistsAsync(int id);
}

// ✅ GOOD: Specific repository interface
public interface IDocumentRepository : IRepository<Document>
{
    Task<List<Document>> GetByUserIdAsync(int userId);
    Task<List<Document>> GetByStatusAsync(DocumentStatus status);
    Task<List<Document>> GetPendingDocumentsAsync();
}
```

### 4.2 Repository Implementation
```csharp
public class DocumentRepository : Repository<Document>, IDocumentRepository
{
    public DocumentRepository(AppDbContext context) : base(context) { }

    public async Task<List<Document>> GetByUserIdAsync(int userId)
    {
        return await _context.Documents
            .Where(d => d.UserId == userId)
            .Include(d => d.Attachments)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();
    }

    public async Task<List<Document>> GetPendingDocumentsAsync()
    {
        return await _context.Documents
            .Where(d => d.Status == DocumentStatus.Pending)
            .Where(d => d.AssignedAt == null || d.AssignedAt < DateTime.UtcNow.AddDays(-1))
            .ToListAsync();
    }
}
```

---

## 5. Service Layer Patterns

### 5.1 Service Interface Design
```csharp
public interface IDocumentService
{
    Task<DocumentDto> CreateAsync(CreateDocumentRequest request);
    Task<DocumentDto> UpdateAsync(int id, UpdateDocumentRequest request);
    Task<DocumentDto> GetByIdAsync(int id);
    Task<PagedResult<DocumentDto>> GetPagedAsync(DocumentSearchCriteria criteria);
    Task DeleteAsync(int id);
    Task<DocumentDto> AssignToUserAsync(int documentId, int userId);
}
```

### 5.2 Service Implementation
```csharp
public class DocumentService : IDocumentService
{
    private readonly IDocumentRepository _repository;
    private readonly IMapper _mapper;
    private readonly IValidator<CreateDocumentRequest> _validator;
    private readonly ILogger<DocumentService> _logger;

    public DocumentService(
        IDocumentRepository repository,
        IMapper mapper,
        IValidator<CreateDocumentRequest> validator,
        ILogger<DocumentService> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _validator = validator;
        _logger = logger;
    }

    public async Task<DocumentDto> CreateAsync(CreateDocumentRequest request)
    {
        await ValidateRequestAsync(request);

        var document = _mapper.Map<Document>(request);
        document.CreatedAt = DateTime.UtcNow;
        document.Status = DocumentStatus.Draft;

        var createdDocument = await _repository.AddAsync(document);

        _logger.LogInformation("Document created: {DocumentId}", createdDocument.Id);

        return _mapper.Map<DocumentDto>(createdDocument);
    }

    private async Task ValidateRequestAsync(CreateDocumentRequest request)
    {
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            var errors = validationResult.Errors.Select(e => e.ErrorMessage).ToList();
            throw new DocumentValidationException(errors);
        }
    }
}
```

---

## 6. API Controller Standards

### 6.1 RESTful Controller Design
```csharp
[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IDocumentService _documentService;
    private readonly ILogger<DocumentsController> _logger;

    public DocumentsController(IDocumentService documentService, ILogger<DocumentsController> logger)
    {
        _documentService = documentService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<DocumentDto>), 200)]
    public async Task<ActionResult<PagedResult<DocumentDto>>> GetDocuments([FromQuery] DocumentSearchCriteria criteria)
    {
        var result = await _documentService.GetPagedAsync(criteria);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(DocumentDto), 200)]
    [ProducesResponseType(404)]
    public async Task<ActionResult<DocumentDto>> GetDocument(int id)
    {
        var document = await _documentService.GetByIdAsync(id);
        return Ok(document);
    }

    [HttpPost]
    [ProducesResponseType(typeof(DocumentDto), 201)]
    [ProducesResponseType(typeof(ValidationProblemDetails), 400)]
    public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentRequest request)
    {
        var document = await _documentService.CreateAsync(request);
        return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
    }
}
```

---

## 7. Validation Rules

### 7.1 FluentValidation Implementation
```csharp
public class CreateDocumentRequestValidator : AbstractValidator<CreateDocumentRequest>
{
    public CreateDocumentRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .Length(3, 200).WithMessage("Title must be between 3 and 200 characters");

        RuleFor(x => x.ProcedureId)
            .GreaterThan(0).WithMessage("Valid procedure must be selected");

        RuleFor(x => x.SubmitterInfo)
            .NotNull().WithMessage("Submitter information is required")
            .SetValidator(new SubmitterInfoValidator());

        RuleFor(x => x.Attachments)
            .NotEmpty().WithMessage("At least one attachment is required")
            .Must(attachments => attachments.Count <= 10)
            .WithMessage("Maximum 10 attachments allowed");
    }
}

public class SubmitterInfoValidator : AbstractValidator<SubmitterInfo>
{
    public SubmitterInfoValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required")
            .Length(2, 100).WithMessage("Full name must be between 2 and 100 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Valid email address is required");

        RuleFor(x => x.Phone)
            .NotEmpty().WithMessage("Phone number is required")
            .Matches(@"^[0-9]{10,11}$").WithMessage("Phone number must be 10-11 digits");
    }
}
```

---

## 8. Configuration & DI

### 8.1 Service Registration
```csharp
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDocumentServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Repositories
        services.AddScoped<IDocumentRepository, DocumentRepository>();
        services.AddScoped<IAttachmentRepository, AttachmentRepository>();

        // Services
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<IFileUploadService, FileUploadService>();
        services.AddScoped<IValidationService, ValidationService>();

        // Validators
        services.AddScoped<IValidator<CreateDocumentRequest>, CreateDocumentRequestValidator>();

        // External services
        services.AddScoped<IMinIOService, MinIOService>();
        services.Configure<MinIOConfiguration>(configuration.GetSection("MinIO"));

        return services;
    }
}
```

### 8.2 Configuration Patterns
```csharp
// ✅ GOOD: Strongly typed configuration
public class DocumentConfiguration
{
    public int MaxAttachmentSize { get; set; } = 100 * 1024 * 1024; // 100MB
    public int MaxAttachmentsPerDocument { get; set; } = 10;
    public List<string> AllowedFileTypes { get; set; } = new();
    public string StoragePath { get; set; } = "documents";
    public bool EnableOcr { get; set; } = true;
}

// Usage in service
public class DocumentService : IDocumentService
{
    private readonly DocumentConfiguration _config;

    public DocumentService(IOptions<DocumentConfiguration> config)
    {
        _config = config.Value;
    }
}
```

---

## 9. Testing Standards

### 9.1 Unit Test Structure
```csharp
[TestClass]
public class DocumentServiceTests
{
    private Mock<IDocumentRepository> _mockRepository;
    private Mock<IMapper> _mockMapper;
    private Mock<IValidator<CreateDocumentRequest>> _mockValidator;
    private Mock<ILogger<DocumentService>> _mockLogger;
    private DocumentService _service;

    [TestInitialize]
    public void Setup()
    {
        _mockRepository = new Mock<IDocumentRepository>();
        _mockMapper = new Mock<IMapper>();
        _mockValidator = new Mock<IValidator<CreateDocumentRequest>>();
        _mockLogger = new Mock<ILogger<DocumentService>>();

        _service = new DocumentService(
            _mockRepository.Object,
            _mockMapper.Object,
            _mockValidator.Object,
            _mockLogger.Object);
    }

    [TestMethod]
    public async Task CreateAsync_ValidRequest_ReturnsDocumentDto()
    {
        // Arrange
        var request = new CreateDocumentRequest { Title = "Test Document" };
        var document = new Document { Id = 1, Title = "Test Document" };
        var documentDto = new DocumentDto { Id = 1, Title = "Test Document" };

        _mockValidator.Setup(v => v.ValidateAsync(request, default))
            .ReturnsAsync(new ValidationResult());
        _mockMapper.Setup(m => m.Map<Document>(request)).Returns(document);
        _mockRepository.Setup(r => r.AddAsync(document)).ReturnsAsync(document);
        _mockMapper.Setup(m => m.Map<DocumentDto>(document)).Returns(documentDto);

        // Act
        var result = await _service.CreateAsync(request);

        // Assert
        Assert.AreEqual(documentDto.Id, result.Id);
        Assert.AreEqual(documentDto.Title, result.Title);
        _mockRepository.Verify(r => r.AddAsync(It.IsAny<Document>()), Times.Once);
    }

    [TestMethod]
    public async Task CreateAsync_InvalidRequest_ThrowsValidationException()
    {
        // Arrange
        var request = new CreateDocumentRequest();
        var validationFailures = new List<ValidationFailure>
        {
            new ValidationFailure("Title", "Title is required")
        };
        var validationResult = new ValidationResult(validationFailures);

        _mockValidator.Setup(v => v.ValidateAsync(request, default))
            .ReturnsAsync(validationResult);

        // Act & Assert
        await Assert.ThrowsExceptionAsync<DocumentValidationException>(
            () => _service.CreateAsync(request));
    }
}
```

---

## 10. Performance Rules

### 10.1 Async/Await Best Practices
```csharp
// ❌ BAD: Blocking async calls
public ActionResult<DocumentDto> GetDocument(int id)
{
    var document = _service.GetByIdAsync(id).Result; // Don't do this!
    return Ok(document);
}

// ✅ GOOD: Proper async implementation
public async Task<ActionResult<DocumentDto>> GetDocument(int id)
{
    var document = await _service.GetByIdAsync(id);
    return Ok(document);
}

// ✅ GOOD: Parallel execution when possible
public async Task<DashboardData> GetDashboardDataAsync(int userId)
{
    var documentsTask = _documentService.GetByUserIdAsync(userId);
    var notificationsTask = _notificationService.GetUnreadAsync(userId);
    var workflowsTask = _workflowService.GetActiveAsync(userId);

    await Task.WhenAll(documentsTask, notificationsTask, workflowsTask);

    return new DashboardData
    {
        Documents = documentsTask.Result,
        Notifications = notificationsTask.Result,
        Workflows = workflowsTask.Result
    };
}
```

### 10.2 Database Query Optimization
```csharp
// ✅ GOOD: Include related data efficiently
public async Task<List<DocumentDto>> GetDocumentsWithDetailsAsync(int userId)
{
    var documents = await _context.Documents
        .Include(d => d.Attachments)
        .Include(d => d.WorkflowInstance)
            .ThenInclude(w => w.CurrentStep)
        .Where(d => d.UserId == userId)
        .OrderByDescending(d => d.CreatedAt)
        .Take(50) // Limit results
        .AsNoTracking() // Read-only queries
        .ToListAsync();

    return _mapper.Map<List<DocumentDto>>(documents);
}

// ✅ GOOD: Pagination for large datasets
public async Task<PagedResult<DocumentDto>> GetPagedDocumentsAsync(DocumentSearchCriteria criteria)
{
    var query = _context.Documents.AsQueryable();

    if (!string.IsNullOrEmpty(criteria.Title))
        query = query.Where(d => d.Title.Contains(criteria.Title));

    if (criteria.Status.HasValue)
        query = query.Where(d => d.Status == criteria.Status);

    var totalCount = await query.CountAsync();

    var documents = await query
        .OrderByDescending(d => d.CreatedAt)
        .Skip((criteria.Page - 1) * criteria.PageSize)
        .Take(criteria.PageSize)
        .AsNoTracking()
        .ToListAsync();

    return new PagedResult<DocumentDto>
    {
        Items = _mapper.Map<List<DocumentDto>>(documents),
        TotalCount = totalCount,
        Page = criteria.Page,
        PageSize = criteria.PageSize
    };
}
```

---

## 11. Security Rules

### 11.1 Input Validation & Sanitization
```csharp
// ✅ GOOD: Always validate and sanitize input
[HttpPost]
public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentRequest request)
{
    // Sanitize string inputs
    request.Title = request.Title?.Trim();
    request.Description = HtmlSanitizer.Sanitize(request.Description);

    // Validate file uploads
    if (request.Attachments?.Any() == true)
    {
        foreach (var attachment in request.Attachments)
        {
            ValidateFileUpload(attachment);
        }
    }

    var document = await _documentService.CreateAsync(request);
    return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
}

private void ValidateFileUpload(IFormFile file)
{
    var allowedTypes = new[] { ".pdf", ".docx", ".jpg", ".png" };
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

    if (!allowedTypes.Contains(extension))
        throw new ValidationException($"File type {extension} is not allowed");

    if (file.Length > 100 * 1024 * 1024) // 100MB
        throw new ValidationException("File size exceeds maximum limit");
}
```

### 11.2 Authorization Patterns
```csharp
// ✅ GOOD: Resource-based authorization
[HttpGet("{id}")]
[Authorize]
public async Task<ActionResult<DocumentDto>> GetDocument(int id)
{
    var document = await _documentService.GetByIdAsync(id);

    // Check if user has access to this document
    var hasAccess = await _authorizationService.AuthorizeAsync(
        User, document, "CanViewDocument");

    if (!hasAccess.Succeeded)
        return Forbid();

    return Ok(document);
}

// ✅ GOOD: Role-based authorization
[HttpDelete("{id}")]
[Authorize(Roles = "Admin,DocumentManager")]
public async Task<ActionResult> DeleteDocument(int id)
{
    await _documentService.DeleteAsync(id);
    return NoContent();
}
```

---

This backend coding standard ensures maintainable, secure, and performant .NET 8 microservices for the DVC v2 system.