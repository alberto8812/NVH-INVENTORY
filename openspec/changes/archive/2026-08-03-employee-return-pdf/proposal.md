# Proposal: Acta de Devolución de Equipos (Employee Return PDF)

## Intent

`returnAssignmentAction` already performs the real return (status flip, bodega restore,
movement, audit), but there is no signable legal document for the return side. HR/IT
currently close returns with no printable record of what came back, in what condition, or
which liability limits apply. This change adds the return-side counterpart of the shipped
"Acta de Asignación de Equipos": an on-demand PDF listing the employee's ACTIVE assigned
assets plus 9 fixed Spanish legal sections and manual signature blocks.

## Scope

### In Scope
- `EmployeeReturnPDF.tsx` — new PDF document: same `@react-pdf/renderer` stack, Poppins
  (`src/shared/pdf/fonts.ts`), navy `#00365f` / teal `#17af95` palette, header band,
  employee data grid, asset table (same columns as the assignment acta), 9 clause cards
  each `wrap={false}`, two-column signature blocks.
- `getEmployeeReturnReportAction(employeeId)` in `employees/actions.ts` — new action,
  `employees:read` guard, same ACTIVE-assignment query + zero-assignment empty behavior.
- `EmployeeReturnActaDownload.tsx` — mirrors `EmployeeActaDownload.tsx` (mount effect,
  `useRef` double-fire guard, `pdf().toBlob()`, `acta-devolucion-{employeeId[:8]}.pdf`).
- New "Descargar acta de devolución" button in `EmployeesTablePage.tsx`, same
  `assignmentsCount > 0` + permission gate as the existing acta button.
- `EmployeeReturnPDF.test.tsx` smoke tests mirroring the existing PDF test pattern.

### Out of Scope
- Any Prisma schema change (no new fields; no C.C./documentId field is introduced).
- Any change to `assignments/**`, `returnAssignmentAction`, or the return dialog.
- Capturing verification state, observations, or shortfalls as data (blank print fields only).
- Refactoring `getEmployeeAssignmentReportAction` into a shared fetcher.
- E-signature, storage/persistence of the generated PDF, batch or email delivery.

## Capabilities

### New Capabilities
- `employee-return-pdf`: on-demand per-employee return acta PDF with the employee's ACTIVE
  assets, 9 fixed legal sections, and manual signature/verification fields.

### Modified Capabilities
- None. `assignments` requirements are unchanged; this is a read-only consumer.

## Approach

Clone-and-adapt: mirror the assignment-acta stack 1:1 as new, separate files. New action,
new PDF component, new download trigger, new test — nothing existing is refactored.

Deliberate constraints:
- **No schema changes.** All needed fields exist on `Assignment` / `Employee`.
- **No change to existing return business logic.** This is document generation only, over
  the pre-return (still ACTIVE) snapshot.
- **C.C. blank-line pattern reused as-is.** Both signature lines carry a static
  `C.C. ___________________________`, exactly as `EmployeeAssignmentPDF.tsx` already ships.
  No dynamic cedula exists in the model; this is not a data gap to close here.
- **The 9 legal sections are user-supplied verbatim Spanish text and MUST be transcribed
  faithfully, not paraphrased, summarized, reordered, or "improved"** when rendered into
  clause-card Views. Sections 2 and 7 include blank checkboxes / free-text space for
  manual fill-in.

### Rejected alternative — shared data layer
Extract one `getActiveAssignmentsForEmployee` fetcher used by both actas.
Tradeoff: DRY and one place to fix future include bugs, but it edits a shipped, tested,
reviewed action, adding regression surface to a working feature for a purely additive
request. Duplication of one query shape is the accepted cost; de-duplication stays a
separate optional follow-up.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/shared/ui/components/EmployeeReturnPDF.tsx` | New | Return acta PDF document |
| `src/shared/ui/components/__tests__/EmployeeReturnPDF.test.tsx` | New | Smoke tests |
| `.../employees/presentation/components/EmployeeReturnActaDownload.tsx` | New | Download trigger |
| `src/app/(dashboard)/employees/actions.ts` | Modified | `getEmployeeReturnReportAction` |
| `.../employees/presentation/components/EmployeesTablePage.tsx` | Modified | Second acta button + state |
| `src/app/(dashboard)/assignments/**` | Untouched | Return logic explicitly out of scope |
| `prisma/schema.prisma` | Untouched | No migrations |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Legal text paraphrased or truncated in transcription | Med | Treat text as verbatim fixture; spec pins section titles/count; review diff against source |
| Long clauses + `wrap={false}` overflow a page | Med | Split oversized clauses into multiple cards, never remove `wrap={false}` |
| Reviewer flags duplicated action/query as oversight | Med | Documented as an accepted tradeoff here and in design |
| Users confuse the two acta buttons | Low | Distinct titles/icons; filename prefix `acta-devolucion-` |
| Employee with zero ACTIVE assignments | Low | Same guard/empty behavior as assignment acta |

## Rollback Plan

Purely additive. Revert by deleting the three new files plus the test, and removing
`getEmployeeReturnReportAction` from `employees/actions.ts` and the button + state from
`EmployeesTablePage.tsx`. No migrations, no data impact, no effect on the assignment acta
or on return processing.

## Dependencies

- `@react-pdf/renderer` (installed), `src/shared/pdf/fonts.ts` Poppins registration.
- Final verbatim Spanish text for the 9 sections (supplied by the user).

## Success Criteria

- [ ] Row action downloads `acta-devolucion-{id}.pdf` for an employee with ACTIVE assets.
- [ ] Asset table shows the employee's real ACTIVE assignment data, same columns as assignment acta.
- [ ] All 9 legal sections present, in order, transcribed verbatim; each card `wrap={false}`.
- [ ] Sections 2 and 7 render blank checkboxes / observation space; both signature blocks show the blank C.C. line.
- [ ] `assignments/**`, `returnAssignmentAction`, and `schema.prisma` show zero diff.
- [ ] `EmployeeReturnPDF.test.tsx` passes; assignment acta behavior unchanged.
