# UI Styling & Component Guidelines

The Digital Ledger frontend utilizes a modern, premium design system built on **Tailwind CSS** and **shadcn/ui**.

## 1. Design Principles
- **Aesthetic**: Dark-themed, high-contrast, enterprise-grade interface.
- **Visual Cues**: Use smooth gradients, backdrop blurs (glassmorphism), and subtle micro-animations for interactivity.
- **Consistency**: All UI elements MUST be derived from the project's shadcn/ui configuration. Avoid ad-hoc utility classes for core component styling.

## 2. Technology Stack
- **Tailwind CSS v4**: Utility-first CSS framework.
- **shadcn/ui**: Reusable components built using Radix UI primitives.
- **Lucide React**: Primary icon library.

## 3. Directory Structure
```
apps/frontend/src/
├── components/
│   ├── ui/              # Generic shadcn components (Card, Button, Table, etc.)
│   ├── auth/            # Auth-specific components (ProtectedRoute, LogoutConfirmModal)
│   └── layout/          # Layout components (Layout, Sidebar)
├── context/
│   └── AuthContext.tsx   # Global auth state provider
├── hooks/
│   ├── auth/            # Auth hooks (useAuth)
│   └── accounts/        # Account hooks (useAccounts)
├── pages/
│   ├── auth/            # Auth pages (Login, Register)
│   └── accounts/        # Account pages (AccountsPage)
├── services/
│   ├── api.ts           # Axios instance configuration
│   ├── auth/            # Auth API services
│   └── accounts/        # Account API services
├── types/               # TypeScript type definitions
├── lib/
│   └── utils.ts         # shadcn styling utilities (cn helper)
└── styles/
    └── index.css        # Global Tailwind and font configurations
```

## 4. Path Aliases
The project is configured to use path aliases for cleaner imports. Always use `@/` to refer to the `src` directory.
- `import { Button } from "@/components/ui/button"`
- `import { cn } from "@/lib/utils"`

## 5. Adding New Components
To add a new shadcn component, use the CLI in the `apps/frontend` directory:
```bash
npx shadcn@latest add <component-name>
```

## 6. Iconography
Use **Lucide React** for all system icons. Prefer consistent sizes (e.g., `h-4 w-4` for button icons, `h-8 w-8` for headers).
