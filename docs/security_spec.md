# SutraSparsh Security Specification & Hardening Blueprint

## 1. Zero-Trust Attribute-Based Access Control (ABAC) Invariants

1. **Default-Deny Catch-All**: All paths without an explicit `allow` block are categorically rejected.
2. **Canonical Content Integrity**: Canonical scripture documents (`/content/{contentId}`) can only be written, updated, or deleted by verified administrative identities (`isAdmin()`). Seeker accounts have read-only access to active canonical verses.
3. **Split Collection User Data Isolation**: User profiles, bookmarks, reading history, and UI preferences are segmented into user-owned subcollections (`/users/{userId}/*`). Cross-user read or write access is mathematically denied.
4. **Identity & Ownership Spoofing Guard**: Incoming payloads for user subcollections must strictly match `request.auth.uid`. No user can set or overwrite another user's UID or owner fields.
5. **Path Variable Hardening (Anti-Poisoning)**: All document IDs must satisfy `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, length <= 128) to reject payload injection and DoS resource exhaustion.
6. **Temporal & Audit Immutability**:
   - `audit_logs` are append-only. Updates and deletions are blocked (`allow update, delete: if false`).
   - `history` logs are append-only.
   - Timestamps must be validated against `request.time` on mutations.
7. **Action-Based Update Restriction**: Updates must declare explicit allowed field diffs using `.affectedKeys().hasOnly([...])` to prevent shadow field injection.
8. **Verified Admin Mandate**: Admin operations require verified email token status (`request.auth.token.email_verified == true`) or registration in the trusted `/admins` directory.

---

## 2. The "Dirty Dozen" Penetration Test Payloads

| ID | Attack Vector / Scenario | Invariant Tested | Expected Result |
|---|---|---|---|
| **D1** | **Ghost Field Injection**: Adding `{ "isAdmin": true }` to `/users/{userId}/profile` update payload | Action-based key restriction (`affectedKeys().hasOnly`) | **403 PERMISSION_DENIED** |
| **D2** | **Cross-User IDOR Write**: User `auth_A` writes to `/users/auth_B/bookmarks/bm-1` | Relational ownership check (`request.auth.uid == userId`) | **403 PERMISSION_DENIED** |
| **D3** | **Unauthenticated Content Tampering**: Anonymous `POST /api/admin/content` without API key | Admin API authentication (`adminAuthMiddleware`) | **401 UNAUTHORIZED** |
| **D4** | **Document ID Poisoning**: Path ID containing `../../etc/passwd` or null bytes `%00` | Regex identifier boundary (`isValidId`) | **400 / 403 REJECTED** |
| **D5** | **Audit Log Mutation / Tampering**: `UPDATE /audit_logs/log-123` attempt | Immutable audit rule (`allow update: if false`) | **403 PERMISSION_DENIED** |
| **D6** | **XSS & Script Injection**: Submitting `<script>alert(1)</script>` or `onload=` in note/verse body | Automated payload sanitization (`Sanitizer.sanitize`) | **HTML Stripped & Sanitized** |
| **D7** | **Rate Limiting Exhaustion**: Sending 200 rapid search queries in 10 seconds | Sliding-window rate limiter (`rateLimiterMiddleware`) | **429 TOO MANY REQUESTS** |
| **D8** | **Oversized Payload Flooding**: Sending a 20MB JSON body to `/api/*` | Bounded body parser limit (10MB) | **413 PAYLOAD TOO LARGE** |
| **D9** | **Unverified Email Spoofing**: Admin action with `email_verified: false` | Verified token constraint (`email_verified == true`) | **403 PERMISSION_DENIED** |
| **D10** | **Timing Attack on Admin Key**: Side-channel measurement on API keys | Constant-time string comparison (`crypto.timingSafeEqual`) | **Timing Resistance Verified** |
| **D11** | **History Mutation**: Attempting to alter timestamp or duration on past reading history | History immutability gate (`allow update: if false`) | **403 PERMISSION_DENIED** |
| **D12** | **Error Stack Trace Leakage**: Triggering unexpected server exceptions | Masked API error response (`errorMiddleware`) | **Safe Error Code / Zero Leakage** |
