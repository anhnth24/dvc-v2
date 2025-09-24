# Suggested Development Commands

## Build and Test Commands

### Solution-wide Operations
```bash
# Build entire solution
dotnet build DVC.sln

# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Clean solution
dotnet clean DVC.sln

# Restore packages
dotnet restore DVC.sln
```

### Service-specific Operations  
```bash
# Run API Gateway
dotnet run --project src/ApiGateway/DVC.ApiGateway

# Run User Service
dotnet run --project src/Services/UserService/DVC.UserService.Api

# Run Workflow Service
dotnet run --project src/Services/WorkflowService/DVC.WorkflowService.Api

# Run Document Service  
dotnet run --project src/Services/DocumentService/DVC.DocumentService.Api

# Run Notification Service
dotnet run --project src/Services/NotificationService/DVC.NotificationService.Api

# Run Postal Service
dotnet run --project src/Services/PostalService/DVC.PostalService.Api
```

### Background Workers
```bash
# Run Notification Worker
dotnet run --project src/Services/Workers/DVC.Workers.Notification

# Run Postal Worker
dotnet run --project src/Services/Workers/DVC.Workers.Postal

# Run LGSP Worker
dotnet run --project src/Services/Workers/DVC.Workers.Lgsp
```

## Docker Commands

### Development Environment
```bash
# Build and run all services
docker-compose up -d

# Run only core services (excluding workers)
docker-compose up -d gateway users workflow documents notifications postal

# Run workers separately
docker-compose -f docker-compose.workers.yml up -d

# Stop all services
docker-compose down

# View service logs
docker-compose logs -f [service-name]

# Rebuild specific service
docker-compose build [service-name]
```

## Database Operations

### Entity Framework Migrations
```bash
# Add migration for User Service
dotnet ef migrations add InitialCreate --project src/Services/UserService/DVC.UserService.Infrastructure --startup-project src/Services/UserService/DVC.UserService.Api

# Update database
dotnet ef database update --project src/Services/UserService/DVC.UserService.Infrastructure --startup-project src/Services/UserService/DVC.UserService.Api

# Remove last migration
dotnet ef migrations remove --project src/Services/UserService/DVC.UserService.Infrastructure --startup-project src/Services/UserService/DVC.UserService.Api
```

### Test Data and Seeding
```bash
# Run database seeder
dotnet run --project tools/TestDataSeeder

# Run database migration tool
dotnet run --project tools/DatabaseMigration

# Run code generation tool
dotnet run --project tools/CodeGeneration
```

## Testing Commands

### Unit Tests
```bash
# Run unit tests only
dotnet test tests/Unit/

# Run specific service unit tests
dotnet test tests/Unit/DVC.UserService.UnitTests/

# Run unit tests with detailed output
dotnet test tests/Unit/ --logger "console;verbosity=detailed"
```

### Integration Tests
```bash
# Run integration tests
dotnet test tests/Integration/

# Run specific integration test
dotnet test tests/Integration/DVC.Integration.Tests/
```

### Performance Tests
```bash
# Run load tests
dotnet test tests/Performance/

# Run specific load test
dotnet run --project tests/Performance/DVC.LoadTests/
```

## Windows-specific Utility Commands

### File Operations
```cmd
# List files in directory
dir

# Change directory  
cd [path]

# Find files
where [filename]

# Search file content
findstr "pattern" [files]

# Copy files
copy [source] [destination]

# Create directory
mkdir [directory-name]
```

### Process Management
```cmd
# List running processes
tasklist

# Kill process by name
taskkill /im [process-name] /f

# Kill process by PID
taskkill /pid [process-id] /f
```

### Network Operations
```cmd
# Check port usage
netstat -an | findstr [port]

# Check network connectivity
ping [host]

# Trace network route
tracert [host]
```

## Git Operations
```bash
# Check status
git status

# Add changes
git add .

# Commit changes
git commit -m "message"

# Push changes
git push

# Pull latest changes
git pull

# Check branches
git branch

# Switch branch
git checkout [branch-name]
```