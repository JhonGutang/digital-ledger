---
name: mvc-conventions
description: Architectural guidelines and clean architecture rules for building and structuring backend MVC applications. Use this whenever writing backend code, controllers, services, or repositories.
---

## Required MVC Architecture Rules
When building or modifying the backend, you MUST follow these conventions strictly:
1. **Clean Architecture:** Maintain a strict separation of concerns (Controller -> Service -> Repository -> Model).
2. **Controllers:** Only handle HTTP requests and return HTTP responses. Do NOT place business logic here.
3. **Services:** Contain 100% of the core business logic.
4. **Repositories:** Dedicated strictly for database and data access operations.
5. **Interfaces:** Every Service and Repository MUST implement an interface.
6. **Dependency Injection:** Always inject dependencies via constructors.
7. **Strong Typing:** Ensure all data transfers use heavily typed Models/DTOs.
