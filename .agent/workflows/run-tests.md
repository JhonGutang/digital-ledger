---
description: How to run all backend and frontend tests
---

## Backend Tests (xUnit)

// turbo-all

1. Run all backend tests:
```bash
dotnet test apps/backend.tests/
```

2. Run a specific test class:
```bash
dotnet test apps/backend.tests/ --filter "FullyQualifiedName~ClassName"
```

3. Run with verbose output:
```bash
dotnet test apps/backend.tests/ --verbosity normal
```

## Frontend Tests (Jest)

1. Run all frontend tests:
```bash
cd apps/frontend && npm test
```

2. Run tests in watch mode:
```bash
cd apps/frontend && npm test -- --watch
```

## Notes
- Always run tests BEFORE marking a task as complete.
- If tests fail, fix the issue and re-run. Do not ask the user to fix test failures.
- Backend tests should primarily target the Service layer using Moq for mocking.
