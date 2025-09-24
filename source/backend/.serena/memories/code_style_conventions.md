# Code Style and Conventions

## Language Settings
- **Target Framework**: .NET 8.0
- **Language Version**: Latest C#
- **Nullable Reference Types**: Enabled
- **Implicit Usings**: Enabled
- **Treat Warnings as Errors**: False
- **Generate Documentation File**: False
- **Deterministic Builds**: True

## Naming Conventions
- **Classes**: PascalCase (e.g., `AuthController`, `UserService`)
- **Interfaces**: PascalCase with 'I' prefix (e.g., `IAuthService`, `IUserService`)
- **Methods**: PascalCase with `Async` suffix for async methods
- **Properties**: PascalCase (e.g., `Username`, `Email`)
- **Fields**: camelCase with underscore prefix for private fields (e.g., `_authService`, `_logger`)
- **Parameters**: camelCase (e.g., `loginDto`, `userId`)
- **Local Variables**: camelCase (e.g., `authResult`, `userDto`)

## File Organization
- **Namespace Style**: File-scoped namespaces (C# 10 style)
- **Using Statements**: At the top, organized alphabetically
- **Project Structure**: Clean Architecture with Api/Core/Infrastructure layers

## Code Structure Patterns
- **Clean Architecture**: Separation of concerns across layers
- **Repository Pattern**: Data access abstraction
- **Unit of Work**: Transaction management
- **CQRS**: Using MediatR for command/query separation
- **Dependency Injection**: Constructor injection throughout

## API Controller Conventions
- **Base Class**: Inherit from `ControllerBase`
- **Route Pattern**: `[Route("api/v1/[controller]")]`
- **HTTP Methods**: Explicit HTTP verb attributes
- **Response Types**: Use `ProducesResponseType` attributes
- **Async Suffix**: All async methods end with `Async`
- **Return Types**: `ActionResult<ApiResponse<T>>` for consistent responses

## Error Handling
- **Exception Handling**: Try-catch blocks in controllers
- **Logging**: Structured logging with Serilog
- **API Responses**: Standardized `ApiResponse<T>` format
- **Validation**: FluentValidation for input validation
- **Circuit Breakers**: Polly for external service resilience

## Comments and Documentation
- **XML Documentation**: For public APIs using /// comments
- **Vietnamese Comments**: Business logic comments in Vietnamese
- **Summary Tags**: Describe purpose and parameters for API methods

## Performance Guidelines  
- **Async/Await**: All I/O operations are asynchronous
- **Entity Framework**: Use `AsNoTracking()` for read-only queries
- **Connection Pooling**: Enabled for database connections
- **Parallel Execution**: Use `Task.WhenAll()` for parallel operations
- **Caching**: Redis for distributed caching
- **Pagination**: For large datasets

## Security Practices
- **Input Validation**: FluentValidation for all inputs
- **Resource-based Authorization**: Fine-grained access control
- **JWT Authentication**: Stateless authentication
- **Input Sanitization**: For all user-provided data
- **Password Hashing**: Secure password storage with salt