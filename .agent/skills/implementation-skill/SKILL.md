---
name: implementation-skill
description: Standard workflow and step-by-step process for implementing any new feature, task, or code modification.
---

## Implementation Flow
When implementing a new feature, task, or code modification, you MUST follow these steps in order:

### 1. Read Documentations
Review available context: `AGENTS.md`, relevant skills, and any related docs in the `docs/` folder.

### 2. Clarify Requirements
Ask yes or no questions for clarification and recommendations before starting. Wait for the user's explicit approval before writing any code.

### 3. Structural Approval
Before creating new files or directories that do not already exist in the project, ask the user for approval first. Describe what you plan to create and where. Refer to `docs/BACKEND_STRUCTURE.md` and `docs/UI_GUIDE.md` for the established directory conventions.

### 4. Implement
Execute the task ONLY when approved by the user. Follow the layered architecture and coding styles defined in the project skills.

### 5. Testing
Create test cases for the implemented code. Prioritize service-layer tests for backend and component tests for frontend.

### 6. Run Tests
Execute tests and proactively fix any resulting issues. Do not consider the task complete until all tests pass.

### 7. Documentation
Ask for approval on the implemented code, and once approved, create or update relevant documentation (e.g., `MVP.md` status, `AUTH_SYSTEM.md`, `SCHEMA.md`).