# Task Completion Workflow

## What to Do When a Task is Completed

### 1. Code Quality Checks
After implementing any code changes, always run these commands to ensure code quality:

```bash
# Build the entire solution to check for compilation errors
dotnet build DVC.sln

# Run all tests to ensure nothing is broken
dotnet test

# Run tests with coverage if significant changes were made
dotnet test --collect:"XPlat Code Coverage"
```

### 2. Service-Specific Validation
If you worked on a specific service, test it individually:

```bash
# Test the specific service you modified
dotnet test tests/Unit/DVC.[ServiceName].UnitTests/

# Run the service locally to verify it starts correctly
dotnet run --project src/Services/[ServiceName]/DVC.[ServiceName].Api
```

### 3. Database Operations (if applicable)
If you made database changes:

```bash
# Add Entity Framework migration
dotnet ef migrations add [MigrationName] --project src/Services/[ServiceName]/DVC.[ServiceName].Infrastructure --startup-project src/Services/[ServiceName]/DVC.[ServiceName].Api

# Update the database
dotnet ef database update --project src/Services/[ServiceName]/DVC.[ServiceName].Infrastructure --startup-project src/Services/[ServiceName]/DVC.[ServiceName].Api
```

### 4. Integration Testing (for major changes)
For significant changes, run integration tests:

```bash
# Run integration tests
dotnet test tests/Integration/

# Test Docker composition if containerization was affected
docker-compose up -d --build
docker-compose logs -f [affected-service]
```

### 5. Documentation Updates
If you added new features or changed APIs:

- Update relevant controller XML documentation
- Update any README files if commands changed
- Ensure CLAUDE.md reflects any new patterns or conventions

### 6. Performance Validation (for critical paths)
For authentication, authorization, or high-traffic endpoints:

```bash
# Run performance tests
dotnet test tests/Performance/

# Monitor resource usage during local testing
# Check response times for affected endpoints
```

### 7. Security Validation
For security-related changes:

- Ensure input validation is in place
- Verify authorization policies are correctly applied
- Test with invalid/malicious input
- Check that sensitive data is not logged

### 8. Code Review Checklist
Before considering the task complete:

- [ ] Code follows established conventions
- [ ] Error handling is implemented
- [ ] Logging is appropriate (no sensitive data)
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Performance impact is considered
- [ ] Security implications are addressed

### 9. Windows-Specific Considerations
Since this is a Windows development environment:

```cmd
# Check if any Windows-specific paths need attention
# Verify file path separators are handled correctly
# Test with Windows authentication if applicable
```

### 10. Final Verification Commands
Always run these before considering a task complete:

```bash
# Final build verification
dotnet clean DVC.sln
dotnet restore DVC.sln
dotnet build DVC.sln

# Final test verification
dotnet test --no-build

# Verify Docker composition (if using Docker)
docker-compose config --quiet
```

## When NOT to Commit
- If any tests are failing
- If the build is broken
- If you haven't tested the changes locally
- If documentation is incomplete for significant changes
- If security review is needed but not completed

## Git Workflow
Only commit when all checks pass:

```bash
git status
git add .
git commit -m "descriptive message following conventional commits"
# Only push after local verification is complete
git push
```

## Environment-Specific Notes
- **Development**: Can be more lenient with experimental code
- **Staging**: Requires all tests to pass
- **Production**: Requires full validation including performance tests

## Emergency Procedures
If you need to rollback changes:

```bash
# Rollback last commit (if not pushed)
git reset --hard HEAD~1

# Rollback specific files
git checkout HEAD -- [file-path]

# Database rollback (if migration was applied)
dotnet ef database update [previous-migration-name] --project [infrastructure-project] --startup-project [api-project]
```