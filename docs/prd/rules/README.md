# Coding Rules - DVC v2
## Development Standards & Best Practices

**Version:** 1.0
**Ngày tạo:** 21/09/2025

---

## 📋 Overview

This folder contains comprehensive coding standards for the DVC v2 project, ensuring consistency, maintainability, and quality across all development teams.

## 📁 Files Structure

```
docs/prd/rules/
├── README.md                  # This overview document
├── backend-rules.md           # .NET 8 microservices standards
├── frontend-rules.md          # NextJS 14 React standards
└── database-rules.md          # SQL Server & EF Core standards
```

---

## 🎯 Key Principles

### 1. **Function/Component Size Limit**
- **Max 100 lines per function/component**
- Split larger functions into smaller, focused units
- Single responsibility principle

### 2. **No Over-Engineering**
- Simple, readable solutions preferred
- Avoid unnecessary complexity
- Focus on solving actual problems

### 3. **Type Safety**
- Strict TypeScript typing (frontend)
- Proper C# typing (backend)
- Comprehensive validation

### 4. **Performance First**
- Efficient database queries
- Optimized API responses
- Frontend performance monitoring

### 5. **Security by Default**
- Input validation and sanitization
- Proper authentication/authorization
- Data encryption for sensitive information

---

## 🛠 Technology Stack Standards

### Backend (.NET 8)
- **Architecture:** Microservices with Clean Architecture
- **API:** RESTful APIs with OpenAPI documentation
- **Data:** Entity Framework Core 8 with Repository pattern
- **Testing:** Unit, Integration, and Performance tests
- **Security:** JWT authentication, authorization policies

### Frontend (NextJS 14)
- **Framework:** React 18 with NextJS 14 App Router
- **Language:** TypeScript with strict mode
- **State:** Zustand for global state, React Query for server state
- **UI:** Tailwind CSS with accessible components
- **Testing:** Jest, React Testing Library, Playwright E2E

### Database (SQL Server 2022)
- **Pattern:** CQRS with read/write separation
- **ORM:** Entity Framework Core 8
- **Performance:** Optimized indexes and query patterns
- **Security:** Row-level security, encryption
- **Maintenance:** Automated backups and monitoring

---

## 📖 Quick Reference

### Backend Rules Summary
- Max 100 lines per method ✅
- Repository + Service layer pattern ✅
- Comprehensive error handling ✅
- Async/await best practices ✅
- Dependency injection ✅

### Frontend Rules Summary
- Max 100 lines per component ✅
- TypeScript strict mode ✅
- Custom hooks for logic ✅
- Memoization for performance ✅
- Accessibility (WCAG 2.1 AA) ✅

### Database Rules Summary
- Proper indexing strategy ✅
- Entity Framework configurations ✅
- Migration best practices ✅
- Query optimization ✅
- Security implementations ✅

---

## 🔥 Must-Follow Rules

### For ALL Developers

1. **Read the relevant rules file before starting work**
2. **100-line limit strictly enforced** - refactor if exceeded
3. **No commits without proper validation** - tests must pass
4. **Security-first mindset** - validate all inputs
5. **Performance considerations** - optimize from the start

### Code Review Checklist

- [ ] Function/component size under 100 lines
- [ ] Proper error handling implemented
- [ ] Security considerations addressed
- [ ] Performance optimizations applied
- [ ] Tests written and passing
- [ ] Documentation updated if needed

---

## 🚀 Getting Started

### For Backend Developers
1. Read [backend-rules.md](./backend-rules.md)
2. Set up development environment with .NET 8
3. Follow Repository + Service pattern
4. Implement comprehensive logging
5. Write unit and integration tests

### For Frontend Developers
1. Read [frontend-rules.md](./frontend-rules.md)
2. Set up NextJS 14 development environment
3. Configure TypeScript strict mode
4. Implement component composition patterns
5. Write component and hook tests

### For Database Developers
1. Read [database-rules.md](./database-rules.md)
2. Follow Entity Framework conventions
3. Implement proper indexing strategies
4. Write migration scripts properly
5. Set up monitoring and maintenance

---

## 🎯 Enforcement

### Automated Checks
- **ESLint/Prettier** for frontend code formatting
- **EditorConfig** for consistent formatting
- **SonarQube** for code quality analysis
- **Unit test coverage** minimum 80%
- **Pre-commit hooks** for validation

### Manual Reviews
- All pull requests require review
- Code review checklist must be completed
- Security review for sensitive changes
- Performance review for critical paths

---

## 📞 Support

For questions about these coding standards:

1. **Backend Issues:** Contact Backend Team Lead
2. **Frontend Issues:** Contact Frontend Team Lead
3. **Database Issues:** Contact Database Team Lead
4. **General Questions:** Create issue in project repository

---

## 🔄 Updates

This document and associated rules are living documents that will be updated as the project evolves. Check back regularly for updates.

**Last Updated:** 21/09/2025
**Next Review:** 21/12/2025