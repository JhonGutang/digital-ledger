# Agent Instructions for Digital Ledger

These instructions MUST be followed by any AI agent working on this project. 

## 1. Project Overview & Tech Stack
- **Backend**: ASP.NET Core (MVC architecture)
- **Frontend**: React.js, TanStack Query, shadcn/ui
- **Database**: SQLite
- **Testing**: xUnit (Backend), Jest (Frontend)

## 2. Backend Architecture & Design Patterns
- **Strict Layered Architecture**: All backend features MUST follow the `Controller -> Service -> Repository -> Model` flow. Controllers handle HTTP requests, Services handle business logic, and Repositories handle data access.
- **Dependency Injection (DI)**: Always use DI for services and repositories in ASP.NET Core. 
- **Interfaces**: Every Service and Repository MUST implement an interface.
- **Strong Typing**: Ensure all data transfers use heavily typed Models/DTOs.

## 3. Frontend Architecture
- **Directory Structure**: The frontend code should be organized primarily by functional type: `components`, `hooks`, `services`, `utils`, and `libs`.
- **Feature-Based Organization**: Inside those primary directories, code MUST be categorized based on feature.
  - Example: `components/auth/Login.tsx`, `hooks/auth/useLogin.ts`, `services/auth/authService.ts`
- **State & UI**: Utilize TanStack Query for data fetching, caching, and state management. Rely on shadcn/ui components for UI consistency.

## 4. Critical Business Rules (DO NOT VIOLATE)
- **Double-Entry Accounting Verification**: Any transaction created MUST have matching total Debit and Credit column amounts before it can be marked as `POSTED`. Validate this at the Service level.
- **Immutability of Ledger**: Transactions categorized as `POSTED` CANNOT be modified or deleted. Corrections must be made by creating a new reversing transaction to maintain a flawless audit trail.
- **Soft Deletes**: Never permanently delete accounts or users that are tied to existing transactions. Always use soft deletion (e.g., `is_active = false`).

## 5. Database Migrations Workflow
- Changes to the database schema MUST be done utilizing **Entity Framework Core Code-First Migrations**.
- To change the schema, the agent must update the C# Entity models first, generate a migration (e.g., `dotnet ef migrations add <MigrationName>`), and apply it (`dotnet ef database update`). Never alter the SQLite database directly with raw SQL declarations.

## 6. Testing Requirements
- **Backend**: Implement **xUnit** tests for business logic, prioritizing the Service layer. Use Moq for mocking dependencies.
- **Frontend**: Implement **Jest** tests for React components and critical utility functions.

## 7. General Coding Styles
- **Top-level Imports**: Do not use inline imports within functions; always place imports at the top of the file.
- **Strong Typing**: Ensure all code is strictly typed leveraging the full capabilities of the language.
- **Constant Variables**: Use `UPPERCASE_SNAKE_CASE` for all constant variables.
- **Environment Variables**: Never hardcode configuration or sensitive data. Always read from environment variables (e.g., `process.env` or `IConfiguration`).
- **Self-Documenting Code**: Strictly avoid adding unnecessary comments. Write simple, readable code that explains itself. Only comment on unusually complex logic.

## 8. Agent Implementation Workflow
When implementing a new feature or task, the AI MUST follow these steps:
1. **Read Documentations**: Review available context and coding styles.
2. **Clarify Requirements**: Ask YES or NO questions for clarification before starting. Wait for approval.
3. **Implement**: Execute the task ONLY when approved by the user.
4. **Testing**: Create test cases and proactively fix issues.
5. **Documentation**: Ask for approval on the implemented code, and once approved, create or update relevant documentation.
