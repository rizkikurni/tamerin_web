---
paths:
  - 'app/{Actions,Policies,Http/Controllers}/**/*.php'
---

# Controllers

## Settlement transactions require a reversal workflow
Transactions linked to obligation_settlements must not be voided directly. Until a dedicated reversal workflow and schema are approved, settlement history is immutable, settlement transactions stay posted, and only settled obligations may be archived.
