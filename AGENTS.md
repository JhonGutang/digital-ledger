# Agent Instructions for Digital Ledger

These instructions MUST be followed by any AI agent working on this project. 

## 1. Project Overview & Tech Stack
- **Backend**: ASP.NET Core (MVC architecture)
- **Frontend**: React.js, TanStack Query, shadcn/ui
- **Database**: SQLite
- **Testing**: xUnit (Backend), Jest (Frontend)

## 2. Simplicity Principle
- **Proportional Complexity**: Every feature MUST use the full layered architecture (Controller → Service → Repository), but the implementation within each layer should be proportional to the feature's actual complexity. A service that only delegates to a repository is perfectly acceptable for simple features.
- **Do NOT Invent Complexity**: Never add unnecessary validation, abstraction, or patterns that the feature does not require. If a feature is a straightforward CRUD operation, implement it as one.
- **Earn Your Complexity**: Additional patterns (e.g., custom exceptions, event-driven logic, complex DTOs) should only be introduced when the business rules genuinely demand them.

## 3. Skills (Detailed Rules)
The following skills contain the detailed, authoritative rules for their respective domains. Read the relevant skill before writing any code:
- **Coding Style** → `.agent/skills/coding-style/SKILL.md` — Naming conventions, typing rules, formatting standards.
- **MVC Conventions** → `.agent/skills/mvc-conventions/SKILL.md` — Layered architecture, controller/service/repository rules, DTO conventions.
- **Implementation Workflow** → `.agent/skills/implementation-skill/SKILL.md` — Step-by-step process for implementing any feature.

## 4. Frontend Architecture
- **Directory Structure**: The frontend code should be organized primarily by functional type: `components`, `hooks`, `services`, `utils`, and `libs`.
- **Feature-Based Organization**: Inside those primary directories, code MUST be categorized based on feature.
  - Example: `components/auth/Login.tsx`, `hooks/auth/useLogin.ts`, `services/auth/authService.ts`
- **State & UI**: Utilize TanStack Query for data fetching, caching, and state management. Rely on shadcn/ui components for UI consistency.

## 5. Critical Business Rules (DO NOT VIOLATE)
- **Double-Entry Accounting Verification**: Any transaction created MUST have matching total Debit and Credit column amounts before it can be marked as `POSTED`. Validate this at the Service level.
- **Immutability of Ledger**: Transactions categorized as `POSTED` CANNOT be modified or deleted. Corrections must be made by creating a new reversing transaction to maintain a flawless audit trail.
- **Soft Deletes**: Never permanently delete accounts or users that are tied to existing transactions. Always use soft deletion (e.g., `is_active = false`).

## 6. Database Migrations Workflow
- Changes to the database schema MUST be done utilizing **Entity Framework Core Code-First Migrations**.
- See `.agent/workflows/add-migration.md` for the exact step-by-step process.

## 7. Testing Requirements
- **Backend**: Implement **xUnit** tests for business logic, prioritizing the Service layer. Use Moq for mocking dependencies.
- **Frontend**: Implement **Jest** tests for React components and critical utility functions.
- See `.agent/workflows/run-tests.md` for the exact commands.

## 8. Key Documentation
Read these docs as needed for domain context and implementation patterns:
- `docs/PURPOSE.md` — System vision and business context.
- `docs/SCHEMA.md` — Data model and entity relationships.
- `docs/AUTH_SYSTEM.md` — Authentication, JWT, and RBAC permission matrix.
- `docs/BACKEND_STRUCTURE.md` — Backend directory conventions.
- `docs/REFERENCE_IMPLEMENTATION.md` — Golden example of a complete feature implementation.
- `docs/ERROR_HANDLING_GUIDELINES.md` — Exception handling strategy and middleware rules.
- `docs/GLOSSARY.md` — Domain terminology and naming standards.
- `docs/MVP.md` — Feature status tracker.
- `docs/UI_GUIDE.md` — Frontend styling and component guidelines.
