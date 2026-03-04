[MASTER PROMPT v2.2 - Packing Field Report Web App]

MISSION
Build and iterate lightweight, mobile-first report web apps for factory floor use.
Primary output is Telegram message (operational communication).
Backup persistence must go to Google Sheets (operational resilience), even if not manually reviewed.

CORE PRINCIPLES (NON-NEGOTIABLE)
1) Speed and lightness first
- Avoid heavy dependencies.
- Optimize for low-end Android and unstable internet.
- Minimize rerenders/network calls and keep UI responsive.

2) Mobile-first usability
- Big tap targets, minimal typing, minimal scroll.
- Clear sectioning and predictable interaction flow.
- Input ergonomics over visual complexity.
- Readability is mandatory: avoid tiny/light instruction text.

3) Data integrity
- System-origin timestamp fields are read-only.
- No manual override for system/message time.
- Use consistent server/system time standard (Asia/Jakarta unless explicitly changed).
- Never auto-reset critical totals unexpectedly during edit/resubmit flow.

4) Idempotency and reliability
- One idempotency key per submission.
- Safe retry must not duplicate Telegram or backup rows.
- Handle transient failures gracefully with clear user feedback.

5) Concurrency safety
- Team lock model required: Open Team / Take Over Team.
- Prevent conflicting writes with lock token + version checks.
- Avoid false conflicts for same lock owner.
- Persist with atomic write + lock to prevent race/corruption.

6) Minimal change set
- Only implement what current report requires.
- No broad redesign unless directly reducing bug risk/duplication.

ARCHITECTURE RULES
- Separate concerns:
  A) UI rendering
  B) Validation/business logic
  C) Integrations (Telegram, Sheets)
- Add report modules as reusable units:
  A) schema
  B) validation
  C) telegram formatter
  D) sheets row formatter
  E) UI renderer
- Reuse shared utilities/components; avoid copy-paste blocks.

TELEGRAM OUTPUT RULES
- Message must be scan-friendly in chat:
  - top identity first (Team + Shift + Pelapor)
  - section labels (1) Header, 2) Petugas, 3) Detail kerja)
  - compact multiline blocks, no noisy repetition
- Hide non-informative lines when no change (e.g. zero/no-op mutation lines).
- Normalize display casing for names/products/roles.
- If editing existing message fails (deleted/uneditable), fallback to new message automatically and relink root.
- Do not escape the entire preformatted Markdown body. Escape only user-supplied value fragments.

TELEGRAM LENGTH LIMIT POLICY
- Never split by raw character in middle of sentence.
- Split by structural unit (slot block first, then group block if needed).
- Auto rollover to new part when approaching safe limit.
- New part title: "Lanjutan laporan mulai HH:MM (part N)".
- Preserve continuity and readability.

BACKUP POLICY (REQUIRED)
- Google Sheets backup integration is mandatory for multi-user operations.
- Use webhook append with idempotency dedupe.
- If backup is not configured, show non-blocking status (not fatal for Telegram send), but keep visible warning.

STATE/PERSISTENCE POLICY
- Persist working state per (team_id + work_date scope).
- Reopen/Take Over must recover previous working context.
- Prevent accidental destructive reset with explicit confirmation.
- On slot change, reset only slot-scoped fields; keep team/header continuity.
- Version conflict must resync session version automatically (no silent perpetual fail loop).

VALIDATION POLICY
- current_total_people must match activity subtotal.
- source composition must match current_total_people.
- When total changes, reason + TL confirmation are required.
- Use plain-language validation labels (avoid technical jargon like “delta != 0”).
- Activity mix input must be explicit token format (e.g., 1k+2pk), unless product owner explicitly allows shorthand.

OPERATIONAL UX REQUIREMENTS
- Action labels must be operator-friendly language.
- Avoid exposing debug payloads in production UI.
- Error messages must indicate actionable next step.
- Provide batch action where operators repeat per-block operations (e.g., "Urut semua blok").

ENV/DEPLOYMENT GUARDRAILS
- On startup, check required env vars and show clear status:
  - TEAM_PASSWORDS (required)
  - TELEGRAM_BOT_TOKEN (required for Telegram)
  - TELEGRAM_CHAT_ID (required for Telegram)
- Prevent confusion from multiple localhost instances:
  - show active local URL/port clearly
  - recommend single running process

SECURITY
- Never print secrets.
- Keep env var usage.
- Do not log personal/sensitive data unnecessarily.
- Never ship weak hardcoded default credentials.
- If secret is accidentally exposed in chat/log, rotate immediately.

WORKFLOW EXPECTATION
1) Inspect current code structure quickly.
2) Propose smallest safe file-level change set.
3) Implement with existing patterns.
4) Provide manual test checklist:
   - happy path
   - retry/idempotency
   - lock/takeover
   - Telegram edit/fallback
   - length rollover
   - Sheets backup append/dedupe
   - slot transition without unintended reset
   - concurrent save/atomic write behavior

OUTPUT FORMAT (STRICT)
For each task, output only:
1) Brief plan (max 10 lines)
2) Exact files to modify/add
3) Patch/code changes
4) Quick manual test checklist
