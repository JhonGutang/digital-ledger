# Authentication & Authorization System

This document describes the technical implementation of the Authentication and Role-Based Access Control (RBAC) system in the Digital Ledger application.

## 1. Backend Implementation (ASP.NET Core)

### Technology Stack
- **ASP.NET Core Identity**: Used for user management, password hashing, and role storage.
- **JWT (JSON Web Tokens)**: Used for stateless authentication between the frontend and backend.
- **Entity Framework Core**: Manages the database schema and migrations for Identity.

### Core Components
- **`AuthService`**: Contains the business logic for creating users, validating credentials, and generating signed JWT tokens.
- **`AuthController`**: Exposes endpoints for `Login` and `Register`.
- **`JwtSettings`**: Configuration object (read from `appsettings.json`) that defines the Issuer, Audience, Secret Key, and Expiration.

### Role Seeding
The application automatically seeds the following roles and a default admin user on startup:
- **Roles**: `Admin`, `Accountant`, `Auditor`
- **Default Admin**: `admin@digital-ledger.com` / `Admin123!`

---

## 2. Frontend Implementation (React)

### Technology Stack
- **`AuthContext`**: A React Context provider that manages the `token` and `user` state globally.
- **`TanStack Query`**: Used for executing authentication mutations (`useLogin`, `useRegister`).
- **`shadcn/ui`**: Provides the UI components for the login and registration forms.

### Route Protection
- **`ProtectedRoute`**: A higher-order component that wraps secure routes. It checks for:
  1. A valid authentication token.
  2. (Optional) Required roles to access specific administrative pages.

### Client-Side Security
- Tokens and user profiles are stored in `localStorage` for session persistence.
- The `AuthContext` provides a `logout` function that clears all locally stored credentials.

---

## 3. Security Rules
1. **Admin Only Registration**: Only users with the `Admin` role can register new users via the `POST /api/auth/register` endpoint.
2. **Password Standards**: Identity is configured to require uppercase, lowercase, numbers, and special characters.
3. **Stateless Compliance**: The API does not use cookies for authentication; all requests must include the `Authorization: Bearer <token>` header.

---

## 4. RBAC Permission Matrix

This matrix defines which roles can perform which actions. Use this to apply `[Authorize(Roles = "...")]` attributes correctly.

| Action                              | Admin | Accountant | Auditor |
|-------------------------------------|-------|------------|---------|
| Register new users                  | ✅    | ❌         | ❌      |
| Manage user accounts (activate/deactivate) | ✅ | ❌      | ❌      |
| Manage Chart of Accounts (CRUD)     | ✅    | ✅         | ❌      |
| Create/Edit Draft transactions      | ✅    | ✅         | ❌      |
| Submit transactions for approval    | ✅    | ✅         | ❌      |
| Approve/Post transactions           | ❌    | ❌         | ✅      |
| Void/Reverse posted transactions    | ❌    | ❌         | ✅      |
| View General Ledger                 | ✅    | ✅         | ✅      |
| View Trial Balance                  | ✅    | ✅         | ✅      |
| Upload CSV for ingestion            | ✅    | ✅         | ❌      |
| View audit trail                    | ✅    | ❌         | ✅      |
