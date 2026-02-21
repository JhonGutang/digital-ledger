# Domain Glossary

Standardized terminology for the Digital Ledger project. Use these terms consistently in code naming, documentation, and user-facing content.

## Accounting Terms

| Term | Definition | Usage in Code |
|------|-----------|---------------|
| **Journal Entry** | A single financial event recorded in the ledger, containing one or more debit/credit lines. | `Transaction` model, `TransactionController` |
| **Journal Line** | An individual debit or credit line item within a journal entry. | `TransactionEntry` model |
| **Chart of Accounts (CoA)** | The standardized list of account categories used to classify financial data. | `Account` model, `AccountController` |
| **Double-Entry** | The accounting rule that total debits must equal total credits for every journal entry. | Validated in `TransactionService` |
| **Debit** | An entry that increases asset/expense accounts or decreases liability/equity/revenue accounts. | `EntryType.DEBIT` |
| **Credit** | An entry that increases liability/equity/revenue accounts or decreases asset/expense accounts. | `EntryType.CREDIT` |
| **Normal Balance** | The side (Debit or Credit) that increases a given account type. | `NormalBalance` property on `Account` |
| **Posted** | A finalized, immutable transaction. Cannot be edited or deleted. | `TransactionStatus.POSTED` |
| **Voided** | A posted transaction that has been reversed via a new correcting entry. | `TransactionStatus.VOIDED` |
| **Draft** | A transaction in progress, not yet submitted for review. Editable and deletable. | `TransactionStatus.DRAFT` |
| **Pending Approval** | A transaction submitted by an accountant, awaiting auditor approval. | `TransactionStatus.PENDING_APPROVAL` |
| **Reversing Entry** | A new journal entry created to negate the effect of an incorrect posted transaction. | Created via `TransactionService` |
| **Trial Balance** | A report listing running balances for all active accounts. Used to verify double-entry integrity. | Reporting feature |
| **General Ledger** | The complete record of all transactions and their statuses. | Reporting feature |
| **Soft Delete** | Marking a record as inactive (`IsActive = false`) instead of permanently removing it. | Standard for all entities with transaction history |

## System Terms

| Term | Definition | Usage in Code |
|------|-----------|---------------|
| **Maker-Checker** | A workflow requiring one user to create (maker) and a different user to approve (checker). | Accountant creates → Auditor approves |
| **RBAC** | Role-Based Access Control. Users have one role: Admin, Accountant, or Auditor. | `Roles` constants, `[Authorize]` attributes |
| **CSV Ingestion** | Bulk import of external data (e.g., bank statements) that auto-generates balanced journal entries. | Future feature |

## Naming Rules

- Use **Account** (not "Ledger Account" or "CoA Item") for the chart of accounts entity.
- Use **Transaction** (not "Journal Entry") for the code model name, but "Journal Entry" in user-facing labels/docs.
- Use **TransactionEntry** (not "Line Item" or "Journal Line") for the code model name.
- Use **enum string values in UPPER_SNAKE_CASE**: `ASSET`, `LIABILITY`, `DEBIT`, `CREDIT`, `DRAFT`, `POSTED`.
