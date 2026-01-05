# Admin Panel Status + Plan

Date: 2026-01-05

## Scope confirmed
- Quotas are credit-based (balance/credits), not request-count based.
- Premium/standard will be quota profiles (not system roles).
- First user to connect becomes admin, including SSO (OpenID/SAML/social).

## Key findings (current codebase)

### Admin UI
- Admin panel route exists at `/admin` with placeholder cards.
  - `client/src/components/Admin/AdminDashboard.tsx`
  - `client/src/routes/index.tsx`
- Admin menu item appears only for admin users:
  - `client/src/components/Nav/AccountSettings.tsx`
- Existing admin settings dialogs for prompts/agents/memories/marketplace/MCP/people picker:
  - `client/src/components/ui/AdminSettingsDialog.tsx`

### First user = admin logic
- Centralized in createUser (applies to local, LDAP, OpenID/SAML, and social flows).
  - `packages/data-schemas/src/methods/user.ts`

### Credits & usage tracking
- Balance & Transaction models exist; spendTokens updates balance:
  - `packages/data-schemas/src/schema/balance.ts`
  - `packages/data-schemas/src/schema/transaction.ts`
  - `api/models/spendTokens.js`
  - `api/models/balanceMethods.js`
- Balance check enforced pre-request in BaseClient:
  - `api/app/clients/BaseClient.js`
- Transactions now store endpoint and include a compound index for usage queries.
- spendTokens paths now pass endpoint for agents, assistants threads, and image generation.

### Configuration
- Balance/transactions toggles are in `librechat.yaml`.
  - `librechat.example.yaml`

## Completed (this iteration)

1) First-login admin for all auth flows
- Centralized role assignment in `createUser`.
- Removed per-flow first-user role assignment in local/LDAP handlers.
- Test added in `packages/data-schemas/src/methods/user.methods.spec.ts`.

2) Transaction endpoint tracking
- Added `endpoint` to Transaction schema and index on (user, endpoint, model, createdAt).
- Propagated endpoint through spendTokens calls (agents, assistants threads, image generation/tools).
- Test updated in `api/models/Transaction.spec.js`.

## Remaining gaps

1) Quota model (credit-based) + profiles
- QuotaProfile: name, period (day/week/month), credit limit, optional scope filters.
- Assignments: role -> profile, group -> profile, user -> profile.
- Priority: user override > group override > role default > global default.

2) Usage tracking improvements
- Optional backfill for existing transactions (endpoint is null for historic rows).

3) Admin endpoints (API)
- Usage dashboard (global stats, period filters).
- User usage detail (transactions list).
- Quota CRUD (profiles + assignments).
- Credit management (balance/auto-refill).
- Export (CSV/JSON).
- Admin audit log (who changed what).
- Notifications for threshold and hard/soft cap.

4) Admin UI build-out
- Replace placeholders with real views and data hooks.
- Dashboard cards + charts.
- Quota management (profiles, assignments).
- User list + credits + usage drilldown.
- Model/endpoint access toggles.
- Audit log & exports.

## Proposed implementation order

1) First-login admin for all auth flows (DONE)

2) Transaction endpoint tracking (DONE)

3) Quota engine (DONE)
- Add QuotaProfile, QuotaAssignment, UsageRollup, AdminAudit schemas. (DONE)
- Implement quota resolution with priority (user > group > role > default). (DONE)
- Enforcement: check credits per period before request (alongside balance check). (DONE)
- Log violations and trigger notifications when thresholds crossed. (DONE)

4) Admin API (DONE)
- CRUD for profiles/assignments. (DONE)
- Usage endpoints: global + per-user (top users). (DONE)
- System status overview (users, messages, convos, sessions). (DONE)
- Admin audit logging for quota changes. (DONE)

5) Admin UI (DONE)
- Pages: overview, quotas, users, credits, logs, exports. (DONE: Dashboard overview integrated)
- Data-provider hooks for new endpoints. (DONE)
- Overview cards with real metrics. (DONE)
- Quota profiles listing and management UI. (DONE)

6) Tests + migration (In Progress)
- Backfill endpoint in Transaction (optional best-effort).
- Add tests for quota resolution and enforcement. (DONE)
- E2E for admin workflows.

## Open questions / decisions
- Confirm whether periods are fixed UTC day/week/month or rolling window.
- Decide if hard caps block requests or soft caps only warn (or both).
- Decide whether endpoint/model restrictions live in quotas or as separate access rules.

## Suggested continuation prompt

Continue from `ADMIN_PANEL_STATUS.md`.
Implement step 3 (quota engine: profiles, assignments, and enforcement).
Keep it minimal and tested. Provide diffs and any migration notes.

## Migration Notes

### 2026-01-05: Quota Engine (Step 3)
- **Schemas added**: `QuotaProfile`, `QuotaAssignment`, `UsageRollup`, `AdminAudit`.
- **Enforcement**: Integrated `checkQuota` into `checkBalance` (pre-request) and `updateUsageRollup` into `spendTokens` (post-request).
- **Resolution Priority**: User > Group > Role > Global Default.
- **Indices**:
  - `QuotaProfile`: `name` (unique).
  - `QuotaAssignment`: `profileId`, `user`, `role`, `group`.
  - `UsageRollup`: `(user, profileId, periodStart)` (unique).
  - `AdminAudit`: `user`, `action`.
- **Note**: Ensure `librechat.yaml` has `balance.enabled` and `transactions.enabled` set to `true` for enforcement to trigger.

### 2026-01-05: Admin API (Step 4)
- **New Routes**:
  - `GET /api/admin/quotas/profiles`: List profiles.
  - `POST /api/admin/quotas/profiles`: Create profile.
  - `PUT /api/admin/quotas/profiles/:id`: Update profile.
  - `DELETE /api/admin/quotas/profiles/:id`: Delete profile.
  - `GET /api/admin/quotas/assignments`: List assignments.
  - `POST /api/admin/quotas/assignments`: Create assignment.
  - `DELETE /api/admin/quotas/assignments/:id`: Delete assignment.
  - `GET /api/admin/status/overview`: System stats (users, messages, convos, sessions, total credits).
  - `GET /api/admin/status/usage`: Top users by credit usage.
- **Auditing**: Admin actions on quota profiles and assignments are logged to `AdminAudit` collection via `logAdminAction`.
- **Middleware**: All `/api/admin/*` routes require JWT authentication and the `ADMIN` role (`checkAdmin`).

### 2026-01-05: Admin UI (Step 5)
- **Hooks**: Added `useGetAdminOverview`, `useGetAdminUsage`, `useGetQuotaProfiles`, `useGetAdminUsers`, `useGetAdminAuditLogs`, etc. in `client/src/data-provider/admin.ts`.
- **Components**:
  - `UsageOverview`: Displays total users, messages, sessions, and credits.
  - `QuotaManagement`: Lists available quota profiles + CRUD (ProfileModal).
  - `QuotaAssignments`: Displays role/user/group associations + AddAssignmentModal.
  - `UserManagement`: Searchable user list with manual credit adjustment (Coins action).
  - `AuditLogs`: Displays recent admin actions and metadata.
  - `TopSpenders`: Displays users with highest consumption.
- **Dashboard**: Redesigned `AdminDashboard.tsx` as a grid of interactive cards.
- **Query Keys**: Added `adminOverview`, `adminUsage`, `adminUsers`, `adminAudit`, `quotaProfiles`, `quotaAssignments` to `QueryKeys`.

### 2026-01-05: Tests & Refinement (Step 6)
- **Tests**: Resolved `Cannot find module '@librechat/api'` during tests by rebuilding packages. Fixed `Transaction.spec.js` and confirmed `quotaMethods.spec.js` passes.
- **Backfill**: Created `api/scripts/backfillTransactions.js` and `npm run backfill-tx` to populate endpoints for historic records.
- **Cleanup**: Removed redundant index definitions in `quotaAssignment.ts`.
