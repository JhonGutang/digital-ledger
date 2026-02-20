# Digital Ledger

Digital Ledger is a specialized financial application designed to modernize and secure accounting operations by replacing error-prone manual records with an immutable digital single source of truth. It strictly enforces core accounting principles, notably double-entry validation (total debits must always equal total credits) and ledger immutability (transactions cannot be deleted, requiring reversing entries for corrections).

## Project Architecture

This repository adopts a multi-root application structure, decoupled into two primary distinct environments situated in the `apps/` directory:

### Backend: ASP.NET Core Web API
Located in `apps/backend/`, this acts as the resilient data engine managing the immutable ledger and business logic.
- **Architecture**: Strict N-Tier architecture enforcing separation of concerns: `Controllers` -> `Services` -> `Repositories` -> `Models`.
- **Database**: SQLite utilizing **Entity Framework Core** for schema mapping and migrations.
- **Testing**: Dedicated xUnit framework pipeline located in `apps/backend.tests/`.

### Frontend: React Single Page Application
Located in `apps/frontend/`, this provides the UI to visually interact with the financial events (e.g. Maker-Checker approval dashboards, journal entry interfaces).
- **Framework**: React functioning atop the high-performance Vite builder (`react-ts-swc`).
- **State & Data Fetching**: TanStack Query (React Query) bridging API interactions.
- **Styling**: Tailwind CSS v4 coupled tightly with `shadcn/ui` for premium, standardized interface components.
- **Routing**: React Router orchestrating application views.

## How to Run Local Development

You will require the [.NET 8.0 SDK](https://dotnet.microsoft.com/en-us/download) along with [Node.js](https://nodejs.org/en) installed on your system.

### Option 1: VS Code Workspace (Recommended)
You can open this entire repository simultaneously by opening the `digital-ledger.code-workspace` configuration file in Visual Studio Code. This will split the frontend and backend into clean contextual views.

### Option 2: Running via Terminal

**1. Start the Backend API:**
Open a terminal, navigate to the backend directory, and run the API.
```bash
cd apps/backend
dotnet run
```
*The backend will boot up locally (typically on http://localhost:5148) and will generate the `digital_ledger.db` SQLite file locally.*

**2. Start the Frontend Application:**
Open a separate terminal window, navigate to the frontend directory, install dependencies, and start the development server.
```bash
cd apps/frontend
npm install
npm run dev
```
*The frontend web application will spin up at http://localhost:5173 and automatically connect to the backend.*
