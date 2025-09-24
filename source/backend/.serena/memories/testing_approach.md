# Testing Approach and Commands

## Testing Framework
- **Primary Framework**: xUnit
- **Mocking**: Moq
- **Assertions**: FluentAssertions  
- **Integration Testing**: Microsoft.AspNetCore.Mvc.Testing
- **Code Coverage**: coverlet.collector

## Test Project Structure
```
tests/
├── Unit/                   # Unit tests per service
│   └── DVC.UserService.UnitTests/
├── Integration/            # Cross-service integration tests
│   └── DVC.Integration.Tests/
└── Performance/            # Load and stress tests
    └── DVC.LoadTests/
```

## Test Naming Conventions
- **Test Classes**: `[ClassUnderTest]Tests` (e.g., `AuthControllerTests`)
- **Test Methods**: `[MethodUnderTest]_[Scenario]_[ExpectedBehavior]`
- **Test Data**: Use `[Theory]` and `[InlineData]` for parameterized tests

## Unit Testing Patterns

### Test Structure
```csharp
// Arrange - Set up test data and mocks
// Act - Execute the method under test  
// Assert - Verify the expected outcome
```

### Common Test Types
- **Controller Tests**: Test API endpoints and HTTP responses
- **Service Tests**: Test business logic and service methods
- **Repository Tests**: Test data access operations
- **Validation Tests**: Test FluentValidation rules
- **Mapping Tests**: Test AutoMapper configurations

## Integration Testing

### Test Configuration
- **WebApplicationFactory**: For testing entire API applications
- **Test Database**: In-memory or test-specific database
- **Test Data**: Seeded test data for consistent tests
- **Authentication**: Mock authentication for secured endpoints

### Test Categories
- **API Tests**: End-to-end API functionality
- **Database Tests**: Database integration and migrations
- **External Service Tests**: Integration with external services
- **Message Queue Tests**: RabbitMQ integration tests

## Performance Testing

### Load Testing Framework
- **Tool**: Custom load tests using .NET
- **Metrics**: Response time, throughput, error rate
- **Scenarios**: High load scenarios for 21,000 concurrent users
- **Targets**: API endpoints under typical and peak loads

## Test Commands

### Running Tests
```bash
# Run all tests
dotnet test

# Run specific test project
dotnet test tests/Unit/DVC.UserService.UnitTests/

# Run tests by category
dotnet test --filter Category=Unit
dotnet test --filter Category=Integration

# Run tests with detailed output
dotnet test --logger "console;verbosity=detailed"

# Run tests with code coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Test Filtering
```bash
# Run tests matching pattern
dotnet test --filter "FullyQualifiedName~AuthController"

# Run tests by trait
dotnet test --filter "Priority=1"

# Run specific test method
dotnet test --filter "Name~LoginAsync_ValidCredentials_ReturnsSuccessResponse"
```

### Coverage Reports
```bash
# Generate coverage report
dotnet test --collect:"XPlat Code Coverage" --results-directory TestResults

# View coverage results (requires additional tools)
reportgenerator -reports:"TestResults/**/coverage.cobertura.xml" -targetdir:"coveragereport"
```

## Test Data Management

### Test Database
- **Strategy**: Each test gets clean database state
- **Seeding**: Consistent test data setup
- **Cleanup**: Automatic cleanup after tests
- **Isolation**: Tests don't interfere with each other

### Mocking Strategy
- **External Services**: Mock all external dependencies
- **Database**: Use in-memory database for unit tests
- **Authentication**: Mock identity and claims
- **Time**: Mock DateTime for predictable tests

## Test Quality Standards

### Coverage Targets
- **Unit Tests**: Aim for 80%+ code coverage
- **Critical Paths**: 100% coverage for authentication and authorization
- **Business Logic**: High coverage for service layer
- **Controllers**: Test all HTTP status codes and error paths

### Test Reliability
- **Deterministic**: Tests produce same results every run
- **Independent**: Tests don't depend on other tests
- **Fast**: Unit tests complete quickly
- **Clear**: Test intent is obvious from name and structure

## Continuous Integration

### Automated Testing
- **Build Pipeline**: Run tests on every commit
- **Pull Requests**: Require passing tests
- **Test Reports**: Generate and publish test results
- **Coverage Reports**: Track coverage trends

### Test Environment
- **Dependencies**: Isolated test environment
- **Configuration**: Test-specific settings
- **Data**: Fresh test data for each run
- **Cleanup**: Automatic resource cleanup