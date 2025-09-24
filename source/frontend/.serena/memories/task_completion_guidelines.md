# Task Completion Guidelines

## Required Steps After Code Changes

### 1. Code Quality Checks (Always Required)
```bash
# Run linting to check code style and potential issues
npm run lint

# Format code to ensure consistent styling
npm run format
```

### 2. Build Verification
```bash
# Verify the code builds successfully
npm run build
```

### 3. Testing (When Applicable)
```bash
# Run E2E tests for critical user flows
npm run test:e2e

# For UI changes, consider running in interactive mode
npm run test:e2e:ui
```

## Code Review Checklist

### Before Submitting Changes
- [ ] **Component size**: No component exceeds 100 lines
- [ ] **TypeScript**: All types properly defined, no `any` types
- [ ] **CSS**: No inline styles, separate CSS files used
- [ ] **Imports**: Proper import order maintained
- [ ] **Security**: Input validation and sanitization in place
- [ ] **Performance**: Proper use of React patterns (memoization, etc.)

### Architecture Compliance
- [ ] **Feature organization**: Components in correct domain folders
- [ ] **Single responsibility**: Each component has one clear purpose
- [ ] **State management**: Appropriate use of Zustand/TanStack Query
- [ ] **Custom hooks**: Business logic extracted into hooks
- [ ] **Type definitions**: Proper interfaces in `src/types/`

### Security Requirements
- [ ] **Input validation**: Zod schemas for all forms
- [ ] **File uploads**: Proper type and size validation
- [ ] **HTML content**: DOMPurify sanitization applied
- [ ] **Permissions**: Proper permission checks implemented
- [ ] **Environment**: No secrets in source code

## Error Resolution Process

### Linting Errors
1. Run `npm run lint` to identify issues
2. Fix manually or run `npm run format` for style issues
3. Address TypeScript errors in strict mode
4. Re-run until clean

### Build Errors
1. Check TypeScript compilation errors
2. Verify all imports and exports
3. Ensure proper type definitions
4. Test with `npm run build`

### Test Failures
1. Run `npm run test:e2e:ui` for debugging
2. Update tests if functionality changed
3. Ensure all critical user flows work
4. Check for proper component rendering

## Documentation Updates
- Update component documentation if public API changed
- Update type definitions for new data structures
- Consider updating CLAUDE.md if new patterns introduced

## Git Workflow
- Commit only after all checks pass
- Use meaningful commit messages
- Follow project's branching strategy
- Ensure no sensitive data in commits