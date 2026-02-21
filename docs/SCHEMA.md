# Digital Ledger Data Model Schema

This schema defines the foundational data model for the Digital Ledger application, thoughtfully designed to help accountants manage transactions, reduce errors, guarantee auditability, and prevent fraud.

## Entities

### `users` (Implementation of `ApplicationUser`)
Represents the users (accountants, auditors, admins) of the system using ASP.NET Core Identity.
- `id` (String, Primary Key)
- `email` (String, Unique, Not Null)
- `password_hash` (String, Not Null)
- `first_name` (String, Not Null)
- `last_name` (String, Not Null)
- `role` (Managed via `AspNetUserRoles` and `AspNetRoles`)
- `is_active` (Boolean, Default: `true`)
- `security_stamp`, `concurrency_stamp` (Identity Internals)

### `accounts` (Chart of Accounts)
Represents the standardized categories used to classify and record financial data.
- `id` (UUID, Primary Key)
- `code` (String, Unique, Not Null) - *e.g., "1000" for Cash, allows for structured sorting and indexing.*
- `name` (String, Not Null) - *e.g., "Cash", "Accounts Receivable".*
- `category` (Enum: `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE`) — *Implemented as `AccountCategory` C# enum. Crucial for generating financial statements like Balance Sheets and Income Statements.*
- `normal_balance` (Enum: `DEBIT`, `CREDIT`) — *Implemented as `NormalBalance` C# enum. Auto-derived from `category` by the service layer.*
- `description` (Text, Nullable)
- `is_active` (Boolean, Default: `true`) - *Soft delete capability to preserve history and prevent data loss.*
- `created_at` (Timestamp, Default: `now()`)
- `updated_at` (Timestamp, Default: `now()`)

### `transactions` (Journal Entries)
Represents a financial event that affects the accounts.
- `id` (UUID, Primary Key)
- `reference_number` (String, Unique, Nullable) - *Links to paper records, invoices, or receipts to bridge the physical-digital gap efficiently.*
- `description` (Text, Not Null) - *Reason or details of the transaction.*
- `date` (Date, Not Null) - *The effective date of the transaction.*
- `status` (Enum: `DRAFT`, `PENDING_APPROVAL`, `POSTED`, `VOIDED`) - *Workflow statuses to reduce errors, enforce review processes, and limit unapproved alterations.*
- `created_by` (UUID, Foreign Key to `users.id`) - *Audit trail to track who initiated the transaction.*
- `approved_by` (UUID, Foreign Key to `users.id`, Nullable) - *Tracks who verified/approved the transaction.*
- `created_at` (Timestamp, Default: `now()`)
- `updated_at` (Timestamp, Default: `now()`)

### `transaction_entries` (Journal Lines)
Represents the individual debit or credit line items of a transaction.
- `id` (UUID, Primary Key)
- `transaction_id` (UUID, Foreign Key to `transactions.id`, Indexed)
- `account_id` (UUID, Foreign Key to `accounts.id`, Indexed)
- `amount` (Decimal(19, 4), Not Null) - *High precision for monetary values to prevent rounding errors and ensure exact accuracy.*
- `entry_type` (Enum: `DEBIT`, `CREDIT`)
- `description` (Text, Nullable) - *Optional specific description for this line item.*

## Key Relationships and Business Rules
- **Double-Entry Accounting Verification**: At the application or database level, the system MUST ensure that for any given `transaction_id`, the total `amount` where `entry_type = 'DEBIT'` exactly equals the total `amount` where `entry_type = 'CREDIT'` before it can be POSTED.
- **Referential Integrity**: Deleting an `account` should be restricted if it has tied `transaction_entries`. Use `is_active = false` instead.
- **Immutability of Ledger**: `transactions` that are mapped as `POSTED` cannot be modified or deleted. They can only be corrected by creating a new reversing transaction, maintaining a flawless trace for auditors.