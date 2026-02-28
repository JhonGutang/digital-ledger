# Digital Ledger: Minimum Viable Product (MVP)

This document outlines the core features required to build a functional MVP for the Digital Ledger. The MVP strictly enforces the project's accounting principles: double-entry validation, ledger immutability, and the maker-checker workflow.

## Feature Status Tracking
- 🔴 **Not Implemented**: Core feature has not been started.
- 🟡 **In Progress**: Active development is ongoing.
- 🟢 **Implemented**: Feature is complete, tested, and adheres to core pillars.

---

### 1. Authentication & Role-Based Access Control (RBAC)
*Secure entry and strict role enforcement for Admins, Accountants, and Auditors.*
- [x] **User Login/Registration** (Status: 🟢 Implemented)
- [x] **Role Enforcement Middleware** (Status: 🟢 Implemented)

### 2. Chart of Accounts (CoA) Management
*Standardized categories used to classify and record financial data.*
- [x] **Account CRUD Operations** (Status: � Implemented)
- [x] **Account Categorization Enforcement** (e.g., Asset, Liability, Normal Balance) (Status: � Implemented)

### 3. Manual Journal Entry System
*The core engine for recording financial events.*
- [x] **Transaction Creation UI/API** (Status: 🟢 Implemented)
- [x] **Strict Double-Entry Validation** (Total Debits = Total Credits) (Status: 🟢 Implemented)
- [x] **Drafting System** (Save as `DRAFT` or submit as `PENDING_APPROVAL`) (Status: 🟢 Implemented)

### 4. The Maker-Checker Workflow & Immutability
*Enforcing oversight and a pristine audit trail.*
- [ ] **Approval Dashboard** (Auditors review and mark `POSTED`) (Status: 🔴 Not Implemented)
- [x] **Immutability Lock** (Prevent editing/deleting of `POSTED` transactions) (Status: 🟢 Implemented)
- [ ] **Reversing Entries System** (Create inverse transactions for corrections) (Status: 🔴 Not Implemented)

### 5. CSV Tools (Phased)

#### Phase 1: Balance Checker (MVP)
*A standalone utility to instantly validate whether a CSV T-table of debits and credits is balanced. No database required.*
- [ ] **CSV File Upload UI** (Status: 🔴 Not Implemented)
- [ ] **CSV Parsing & Validation** (Status: 🔴 Not Implemented)
- [ ] **Balance Result Display** (totals, difference, balanced/unbalanced) (Status: 🔴 Not Implemented)

#### Phase 2: Automated CSV Ingestion (Future)
*Full bulk ingestion that maps CSV data to the Chart of Accounts and generates journal entries.*
- [ ] **Account Mapping Logic** (Status: 🔴 Not Implemented)
- [ ] **Journal Entry Generation** (Status: 🔴 Not Implemented)
- [ ] **Auto-Balancing & Posting** (Status: 🔴 Not Implemented)

### 6. Essential Reporting
*Visibility into the financial state and audit trail.*
- [ ] **The General Ledger View** (List of all transactions and statuses) (Status: 🔴 Not Implemented)
- [ ] **Trial Balance Calculation** (Running balances for all active accounts) (Status: 🔴 Not Implemented)
