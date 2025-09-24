# Suggested Commands for Development

## Essential Development Commands
```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Code Quality Commands
```bash
# Lint code with ESLint
npm run lint

# Format code with Prettier
npm run format
```

## Testing Commands
```bash
# Run E2E tests with Playwright
npm run test:e2e

# Run E2E tests in interactive UI mode
npm run test:e2e:ui

# Show test reports
npm run test:e2e:report
```

## Windows System Commands
```cmd
# List directory contents
dir
# or use PowerShell
ls

# Change directory
cd path\to\directory

# Find files (PowerShell)
Get-ChildItem -Recurse -Filter "*.tsx"

# Search in files (PowerShell)
Select-String -Path "*.ts" -Pattern "searchterm"

# Git commands (same as Unix)
git status
git add .
git commit -m "message"
git push
```

## Project-Specific Workflows
```bash
# Complete development workflow
npm run lint && npm run format && npm run build

# Quick development check
npm run dev

# Pre-commit checks
npm run lint && npm run test:e2e

# Production deployment preparation
npm run build && npm start
```

## Environment Setup
```bash
# Copy environment template
copy .env.local.example .env.local

# Edit environment file (Windows)
notepad .env.local
```

## File Structure Navigation
- **Pages**: `src/app/` (App Router structure)
- **Components**: `src/components/[domain]/`
- **Hooks**: `src/hooks/`
- **Stores**: `src/store/`
- **Types**: `src/types/`
- **Styles**: `src/styles/`