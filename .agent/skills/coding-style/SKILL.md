---
name: coding-style
description: General coding style guidelines, naming conventions, and best practices. Use this skill whenever writing, modifying, or refactoring any code.
---

## Required Coding Styles and Conventions
When writing or reviewing code, you MUST strictly adhere to the following rules:
1. **Top-level Imports:** Do not use inline imports within functions; always place imports at the top of the file.
2. **Strong Typing:** Ensure all code is strictly typed leveraging the full capabilities of the language (e.g., interfaces, types, explicit return types).
3. **Constant Variables:** Use `UPPERCASE_SNAKE_CASE` for all constant variables.
4. **Descriptive Naming:** Ensure variable, function, and class names are highly descriptive, clearly explaining their intent and how they work. Avoid vague naming.
5. **Environment Variables:** Never hardcode configuration or sensitive data. Always read from environment variables (e.g., `process.env`).
6. **Self-Documenting Code:** Strictly avoid adding unnecessary comments during implementation. Write simple, readable code that explains itself. Only add comments for unusually complex logic, and always strive to simplify the code first before falling back to commenting.
