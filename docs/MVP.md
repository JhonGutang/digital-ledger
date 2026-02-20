# Digital Ledger: Minimum Viable Product (MVP)

This document outlines the core features required to build a functional MVP for the Digital Ledger. The MVP strictly enforces the project's accounting principles: double-entry validation, ledger immutability, and the maker-checker workflow.

## Feature Status Tracking
- 🔴 **Not Implemented**: Core feature has not been started.
- 🟡 **In Progress**: Active development is ongoing.
- 🟢 **Implemented**: Feature is complete, tested, and adheres to core pillars.

---

### 1. Authentication & Role-Based Access Control (RBAC)
*Secure entry and strict role enforcement for Admins, Accountants, and Auditors.*
- [ ] **User Login/Registration** (Status: 🔴 Not Implemented)
- [ ] **Role Enforcement Middleware** (Status: 🔴 Not Implemented)

### 2. Chart of Accounts (CoA) Management
*Standardized categories used to classify and record financial data.*
- [ ] **Account CRUD Operations** (Status: 🔴 Not Implemented)
- [ ] **Account Categorization Enforcement** (e.g., Asset, Liability, Normal Balance) (Status: 🔴 Not Implemented)

### 3. Manual Journal Entry System
*The core engine for recording financial events.*
- [ ] **Transaction Creation UI/API** (Status: 🔴 Not Implemented)
- [ ] **Strict Double-Entry Validation** (Total Debits = Total Credits) (Status: 🔴 Not Implemented)
- [ ] **Drafting System** (Save as `DRAFT` or submit as `PENDING_APPROVAL`) (Status: 🔴 Not Implemented)

### 4. The Maker-Checker Workflow & Immutability
*Enforcing oversight and a pristine audit trail.*
- [ ] **Approval Dashboard** (Auditors review and mark `POSTED`) (Status: 🔴 Not Implemented)
- [ ] **Immutability Lock** (Prevent editing/deleting of `POSTED` transactions) (Status: 🔴 Not Implemented)
- [ ] **Reversing Entries System** (Create inverse transactions for corrections) (Status: 🔴 Not Implemented)

### 5. Automated CSV Ingestion (Standalone Feature)
*Automated bulk data ingestion bypassing manual workflows.*
- [ ] **File Upload Utility** (Status: 🔴 Not Implemented)
- [ ] **Automated Parsing & Mapping Logic** (Status: 🔴 Not Implemented)
- [ ] **Auto-Balancing & Instant Posting validation** (Status: 🔴 Not Implemented)

### 6. Essential Reporting
*Visibility into the financial state and audit trail.*
- [ ] **The General Ledger View** (List of all transactions and statuses) (Status: 🔴 Not Implemented)
- [ ] **Trial Balance Calculation** (Running balances for all active accounts) (Status: 🔴 Not Implemented)
