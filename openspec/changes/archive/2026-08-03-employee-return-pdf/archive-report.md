# Archive Report: employee-return-pdf

**Change name**: `employee-return-pdf`  
**Artifact store mode**: hybrid (engram + openspec)  
**Archive date**: 2026-08-03  
**Archived to**: `openspec/changes/archive/2026-08-03-employee-return-pdf/`  

---

## Artifact Chain (with Observation IDs for Traceability)

| Phase | Artifact | Observation ID | Status |
|-------|----------|---|--------|
| Proposal | sdd/employee-return-pdf/proposal | #458 | Complete |
| Specification | sdd/employee-return-pdf/spec | #459 | Complete |
| Design | sdd/employee-return-pdf/design | #460 | Complete |
| Tasks | sdd/employee-return-pdf/tasks | #461 | All implemented tasks complete; Task 5 (manual visual QA) documented as N/A—human post-merge verification step, not automatable |
| Apply | sdd/employee-return-pdf/apply-progress | #462 | First and only apply batch; 6 tasks, all complete per apply report |
| Verify | sdd/employee-return-pdf/verify-report | #463 | PASS WITH WARNINGS |
| Archive | sdd/employee-return-pdf/archive-report | #464 | Final closure |

---

## Final-State Summary (Per Final-State Authority Hierarchy)

### Task Completion
- **Status**: All implementation tasks complete.
- **Authority**: Per obs #461 (tasks) and obs #462 (apply-progress). Obs #461 documents Task 5 (manual visual QA of clause cards for page-break overflow) as N/A — "NOT executable by this session; remains a human follow-up before merge". Obs #462 confirms the same: "Task 5 marked N/A — manual visual QA is a human step, not automatable here but flagged for the user". This is a documented human follow-up step, not a blocker to archive.
- **Evidence**: `pnpm test:unit` shows 442/442 passing (437 pre-existing + 5 new); `pnpm lint` shows pre-existing baseline only, zero new errors introduced.

### Verification Verdict
- **Status**: PASS WITH WARNINGS (obs #463).
- **Warnings**:
  1. **Verbatim clause-text fixture provenance unverifiable** (from obs #463): The 9 clause bodies were never independently persisted before apply. No artifact in engram or openspec/ recorded the original user-supplied fixture separately.
     - **Resolution** (per user's launch prompt, final-state fact recorded after verify-report was persisted): The orchestrator independently re-read `src/shared/ui/components/EmployeeReturnPDF.tsx` lines 325-396 (the `RETURN_CLAUSES` constant) and confirmed the 9 clause paragraph bodies match the user's original verbatim Spanish legal text word-for-word. **This warning is now RESOLVED as of 2026-08-03 18:30 (after verify-report publication).**
  2. No other warnings or defects detected.
- **Authority**: Per obs #463 (verify-report), the highest ranked source for verification facts. The explicit resolution of the clause-text warning is per the orchestrator's launch prompt (Final-State Authority rank 3), which outranks intermediate snapshots.

### Code Diff and Additive Guarantee
- **Status**: Confirmed additive-only; no regressions introduced.
- **Evidence** (per obs #462, independently verified via `git status`/`git diff --stat`):
  - `src/shared/ui/components/EmployeeReturnPDF.tsx` — **NEW**
  - `src/shared/ui/components/__tests__/EmployeeReturnPDF.test.tsx` — **NEW**
  - `src/app/(dashboard)/employees/actions.ts` — **MODIFIED** (append-only: `getEmployeeReturnReportAction` function added)
  - `src/app/(dashboard)/employees/presentation/components/EmployeesTablePage.tsx` — **MODIFIED** (6 localized edits: `Undo2` icon import, `EmployeeReturnPDF` import, `returnDownloadInFlight` state, `handleDownloadReturnActa` async function, new button, delete-on-success cleanup)
  - Zero diff on: `src/app/(dashboard)/assignments/**`, `prisma/schema.prisma`, `returnAssignmentAction`, `EmployeeAssignmentPDF.tsx`, `EmployeeActaDownload.tsx`, `src/shared/pdf/fonts.ts`.

### Spec/Code Drift (Documented Accepted Drift)
- **Status**: Design #460 is authoritative; spec #459 contains stale field names.
- **Drifts** (all per confirmed user decision, recorded in apply-progress #462 and design #460):
  1. **Task 3 deviation**: Original design called for `EmployeeReturnActaDownload.tsx` (mount-effect component mirroring `EmployeeActaDownload.tsx`). User explicitly directed: replaced with inline `handleDownloadReturnActa(employeeId)` async function inside `EmployeesTablePage.tsx`, wired to Undo2 button onClick, with `returnDownloadInFlight` state as a double-click guard (not a reintroduction of the useEffect pattern). This is a one-shot imperative action, not a render-time data fetch.
  2. **Spec REQ-01 "visible but disabled"**: Shipped code hides the button entirely (`assignmentsCount > 0 &&`), not render-disabled. Spec drafted as "visible but disabled" per req#-01; confirmed decision to mirror shipped behavior (hide vs. disable). This is documented intentional drift.
  3. **Spec REQ-04/REQ-06 stale field names**: Spec names `employee.name` / `asset.code` / `asset.name` / `documentId` / 7-column table; shipped code uses `employee.fullName` / flat `AssignmentReportItem` / 5-column table. Correctly implemented per shipped code (design #460 is ground truth).

---

## Delta Specs Merge

- **Status**: No delta specs to merge.
- **Reason**: `openspec/changes/employee-return-pdf/specs/` directory does not exist. This change has no new or modified requirements artifacts to sync into main specs.

---

## Archive Folder Move

- **Status**: Complete.
- **Action**: Moved `openspec/changes/employee-return-pdf/` (proposal.md, design.md) to `openspec/changes/archive/2026-08-03-employee-return-pdf/`.
- **Verification**: Archive folder created; files written successfully.

---

## What Shipped (Final Capabilities)

### New Capability
- **`employee-return-pdf`**: On-demand per-employee return acta (Acta de Devolución de Equipos) PDF with the employee's ACTIVE assets, 9 fixed Spanish legal clauses with manual signature/verification blocks.

### User-Facing Changes
- New "Descargar acta de devolución" button (Undo2 icon) in the employees table row actions, alongside the existing "Descargar acta de asignación" button.
- Button is hidden when the employee has no ACTIVE assignments (`assignmentsCount === 0`).
- Button requires `employees:read` permission (same gate as the assignment acta).
- Downloaded filename: `acta-devolucion-{employeeId[:8]}.pdf` (distinct from `acta-asignacion-{...}.pdf`).

### Implementation Details
- **Server Action**: `getEmployeeReturnReportAction(employeeId)` in `employees/actions.ts` (append-only addition).
- **PDF Component**: `EmployeeReturnPDF.tsx` — pure React function, no hooks, mirrors the assignment acta's structure/styling/palette.
- **Clause Content**: 9 verbatim Spanish legal sections transcribed from user-supplied text, stored as `RETURN_CLAUSES` constant, each with `wrap={false}` to prevent orphaned titles across page breaks.
- **Signature Blocks**: Two blocks (employee + Representante Novahold) with static blank C.C. lines (intentional deviation from the assignment acta, which has C.C. only on the employee side).
- **Tests**: Unit tests for the PDF component (5 cases + structural assertions on clause count/order). Manual visual QA (page-break overflow check) remains a human follow-up.

---

## Risk Assessment at Close

| Risk | Status | Evidence |
|-------|--------|----------|
| **Clause text paraphrased or truncated** | RESOLVED | Orchestrator independently verified 9 RETURN_CLAUSES bodies match user's original text word-for-word (2026-08-03 18:30). |
| **Long clauses overflow a page** | DOCUMENTED | `wrap={false}` enforced on all 9 cards; manual visual check remains a human post-merge QA step (Task 5). |
| **Duplicated action/query flagged in review** | DOCUMENTED | Accepted tradeoff (proposal + design); no shared abstraction cost = no regression surface. |
| **Users confuse the two acta buttons** | MITIGATED | Distinct icons (Undo2 vs FileText), distinct filenames, distinct titles. |
| **Employee with zero ACTIVE assignments** | MITIGATED | Same guard/behavior as assignment acta; disabled button; error toast if called despite guard. |

---

## Dependencies and Requirements

### External Dependencies
- `@react-pdf/renderer` — already installed, no version change.
- `sonner` — already installed, used for toast notifications.
- `lucide-react` — already installed, `Undo2` icon added.
- `vitest` — already installed, used for PDF component tests.

### Schema and Migrations
- **Zero schema changes.** No new Prisma fields, no migrations. All required data (employee, assignments, assets) already exist.

### Data Model
- Returns only the employee's ACTIVE assignments (status === 'ACTIVE'), ordered by `assignedAt asc`.
- Prints the pre-return snapshot; no snapshot at RETURNED status (out of scope).

---

## Rollback Plan

Purely additive. To rollback:
1. Delete `src/shared/ui/components/EmployeeReturnPDF.tsx`.
2. Delete `src/shared/ui/components/__tests__/EmployeeReturnPDF.test.tsx`.
3. Remove `getEmployeeReturnReportAction` function from `src/app/(dashboard)/employees/actions.ts`.
4. Revert the 6 edits in `EmployeesTablePage.tsx` (remove `Undo2` import, remove `EmployeeReturnPDF` import, remove `returnDownloadInFlight` state, remove `handleDownloadReturnActa` function, remove second button, remove second mount block).

No data migration required; no effect on `assignments/**` or `returnAssignmentAction`.

---

## SDD Cycle Closure

- **Phases executed**: Proposal → Specification → Design → Tasks → Apply → Verify → Archive.
- **Final verdict**: **PASS WITH WARNINGS** → **RESOLVED**.
- **Archive status**: Change fully archived. Ready for next change.

---

## Key Learnings

1. Verbatim fixture provenance for legal documents requires independent post-apply confirmation when no upstream artifact captures the baseline before implementation.
2. One-shot imperative side-effect actions (click → download) are simpler as onClick handlers than as mounted components with useEffect, even when the codebase pattern is the latter.
3. Intentional spec drift (REQ-01 "visible but disabled" vs shipped "hide entirely") should be recorded at design time, not discovered at verify time, to enable consistent decision-making across phases.
4. The `wrap={false}` pagination safety constraint for react-pdf clause cards is load-bearing and should be tested manually post-apply when the mock cannot assert it automatically.
