# Design: Acta de Devolución de Equipos (Employee Return PDF)

**Change**: `employee-return-pdf` · **Phase**: sdd-design · **Depends on**: proposal (#458), spec (#459)
**Ground truth**: shipped code read on 2026-08-03 (`EmployeeAssignmentPDF.tsx` 589 lines,
`actions.ts` L486-569, `EmployeesTablePage.tsx` L1-268, `EmployeeActaDownload.tsx` 46 lines).
`openspec/changes/employee-assignment-pdf/design.md` was used as a **structural template only**;
none of its stale details (`getEmployeeAssignmentsAction`, `employeeName` prop, gray/Helvetica
palette) apply here.

---

## 1. Architectural Approach

**Clone-and-adapt, additive-only.** The return acta is a fourth parallel slice over the same
read-only data shape, not a generalization of the assignment acta. No shared abstraction is
introduced, no shipped file is refactored.

Layering is unchanged from the shipped assignment-acta slice:

```
page.tsx (Server, RBAC redirect)                     ← untouched
  └─ EmployeesTablePage.tsx ("use client")           ← MODIFIED: +1 button, +1 state, +1 mount
       └─ EmployeeReturnActaDownload.tsx (new)       ← client-only side-effect component
            ├─ getEmployeeReturnReportAction (new)   ← Server Action in employees/actions.ts
            └─ EmployeeReturnPDF (new)               ← pure @react-pdf/renderer Document
```

Boundaries:
- **Domain/infrastructure**: none touched. No entity, repository, mapper, or use-case is added.
  This capability is presentation + one read-only Server Action, exactly like the shipped acta.
- **Data direction**: strictly read. The action performs two `findUnique`/`findMany` reads inside
  one `Promise.all`. No writes, no `$transaction`, no audit event, no `revalidatePath`.
- **PDF component purity**: `EmployeeReturnPDF` is a pure function of its `data` prop. All legal
  text is a module-level constant. It imports nothing from Prisma, no hooks, no client state — that
  is what makes it renderable both in `pdf().toBlob()` and in a jsdom smoke test.

### Rejected alternatives

| Alternative | Why rejected |
|---|---|
| Extract `getActiveAssignmentsForEmployee` shared fetcher | Edits a shipped, tested, reviewed action; adds regression surface to a working feature for a purely additive request. Duplicating one query shape is the accepted cost. De-dup stays an optional follow-up. |
| Parameterize `EmployeeAssignmentPDF` with `variant: 'assignment' \| 'return'` | The two documents diverge in title, clause set, clause count, and section-2/7 fill-in blocks. A variant flag would put two legal documents behind one branchy component and make every future edit to one a regression risk for the other. Two files, zero shared state. |
| Extract shared `styles`/palette module from the assignment PDF | Requires editing the shipped PDF file (turning constants into exports), i.e. a non-zero diff on a file the success criteria want stable. Copy the `StyleSheet` block instead. |
| One `actaKind` state in `EmployeesTablePage` instead of a second `useState` | Couples the two triggers; a bug in one filename/mount path can break both. Two independent `string \| null` states mirror the shipped pattern literally. |
| Snapshot assignments at RETURNED status for reprint | Explicitly out of scope (proposal + spec). The acta is printed *before* the return is processed; it reads ACTIVE only. |

---

## 2. File-by-File Plan

### 2.1 NEW — `src/app/(dashboard)/employees/actions.ts` addition (MODIFIED file)

Append after the existing `getEmployeeAssignmentReportAction` (currently ends L569). **Reuse the
existing exported types** — no new `interface` is declared:

```ts
// ─── Return Report (PDF) ───────────────────────────────────────────────────
// Reuses AssignmentReportItem / EmployeeAssignmentReportData: the return acta's
// asset table is the employee's current ACTIVE assignments, printed before the
// return is processed, so the payload shape is identical.

export async function getEmployeeReturnReportAction(
  employeeId: string,
): Promise<ActionResult<EmployeeAssignmentReportData>> { /* ... */ }
```

Body mirrors `getEmployeeAssignmentReportAction` **line for line**:

| Step | Exact shipped behavior to replicate |
|---|---|
| Guard | `const session = await auth();` then `if (!session?.user || !hasPermission(session.user.role as Role, 'employees', 'read')) return err('FORBIDDEN', 'Sin permiso');` |
| Reads | `Promise.all([...])` of the two queries below |
| Employee query | `prisma.employee.findUnique({ where: { id: employeeId }, include: { department: { select: { name: true } }, city: { select: { name: true } }, location: { select: { name: true } } } })` |
| Assignments query | `prisma.assignment.findMany({ where: { employeeId, status: 'ACTIVE' }, orderBy: { assignedAt: 'asc' }, include: { asset: { include: { category: { select: { name: true } } } }, deliveredBy: { select: { name: true } } } })` |
| Not-found | `if (!employee) return err('NOT_FOUND', 'Empleado no encontrado');` |
| Empty | **No empty-list error.** Zero ACTIVE assignments returns `ok()` with `assignments: []`; the client renders the Spanish toast. This is the shipped behavior and REQ-03's server half. |
| Mapping | Identical field-by-field mapping, `?? null` on every optional, `assignedAt.toISOString()`, `generatedAt: new Date().toISOString()` |

`status: 'ACTIVE'` in the `where` is load-bearing and must not be widened.

### 2.2 NEW — `src/shared/ui/components/EmployeeReturnPDF.tsx`

Signature:

```ts
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import '@/shared/pdf/fonts';                                    // side-effect Poppins registration
import type { EmployeeAssignmentReportData } from '@/app/(dashboard)/employees/actions';

interface EmployeeReturnPDFProps { data: EmployeeAssignmentReportData }

export function EmployeeReturnPDF({ data }: EmployeeReturnPDFProps): React.ReactElement
```

Prop shape is the single `data` object — **not** flattened props. `const { employee, assignments,
generatedAt } = data;` then `generatedDate` via `toLocaleDateString('es-CO', { day: '2-digit',
month: '2-digit', year: 'numeric' })`, exactly as shipped.

Copied verbatim from `EmployeeAssignmentPDF.tsx`:
- Palette constants `NAVY #00365f`, `TEAL #17af95`, `NAVY_LIGHT`, `TEAL_LIGHT`, `INK`,
  `INK_SECONDARY`, `INK_MUTED`, `BORDER`, `WHITE`.
- `STATUS_LABELS` map (`GOOD→Bueno`, `REGULAR→Regular`, `BAD→Malo`, `DAMAGED→Dañado`,
  `RETIRED→Dado de baja`).
- The entire `StyleSheet.create({...})` block including the `page` padding + `headerBand`
  `marginTop: -36` negative-offset trick (that comment explains why page-level padding, not View
  padding, guarantees consistent margins after a page break — keep the comment).
- Column widths `cCode 22% / cDesc 30% / cSerial 20% / cStatus 14% / cDate 14%`.

Document body, in order:

| Block | Content |
|---|---|
| `headerBand` | `headerOrg` = `Novahold · Gestión de Activos`; `headerTitle` = **`Acta de Devolución de Equipos`**; three `headerMetaChip`s: `employee.fullName`, `Generado {generatedDate}`, `{n} equipo(s) a devolver` (pluralized with the same `!== 1` ternary) |
| `accentLine` | unchanged teal 3px bar |
| Section `Datos del empleado` | same 7 rows, same order: Nombre, Cargo, Email, Teléfono (conditional on `employee.phone`), Departamento, Sede, Ciudad — last row uses `dataRowLast` |
| Section `Equipos a devolver ({assignments.length})` | table below |
| Section `Declaración de devolución` | 9 clause cards from `RETURN_CLAUSES` |
| `signRow` | two `signBox`es (see 2.2.2) |
| `footer` | `Documento generado el {generatedDate} · Sistema de Gestión de Inventario` + `NOVAHOLD` brand |

**Asset table — mirror the shipped 5 columns exactly** (`Código`, `Marca / Modelo`, `Serial`,
`Estado`, `Asignado`), same `statusBadge` View for Estado, same `[a.brand, a.model].filter(Boolean)
.join(' ') || '—'`, same `a.serialNumber ?? '—'`, same zebra `tableRowOdd`/`tableRowEven` + trailing
`tableRowBorder` logic, same `assignments.length === 0 ? <Text style={styles.empty}>` fallback (text:
`Sin equipos asignados`). Row order comes from the action's `orderBy: assignedAt asc`.

#### 2.2.1 The 9 clauses map onto the existing CLAUSES pattern — no new abstraction

The shipped pattern is a module-level array of `{ title, paragraphs }` rendered by one `.map`. Reuse
it verbatim, renamed:

```ts
const RETURN_CLAUSES: { title: string; paragraphs: string[] }[] = [
  { title: '1. Devolución de bienes',                             paragraphs: [/* verbatim */] },
  { title: '2. Verificación de estado',                           paragraphs: [/* verbatim, incl. checkbox + observation lines */] },
  { title: '3. Entrega de información y accesos',                 paragraphs: [/* verbatim */] },
  { title: '4. Confidencialidad y protección de la información',  paragraphs: [/* verbatim */] },
  { title: '5. Responsabilidad por daños, pérdidas o deterioros', paragraphs: [/* verbatim */] },
  { title: '6. Hallazgos posteriores a la devolución',            paragraphs: [/* verbatim */] },
  { title: '7. Pendientes y faltantes',                           paragraphs: [/* verbatim + blank note space */] },
  { title: '8. Paz y salvo respecto de bienes corporativos',      paragraphs: [/* verbatim */] },
  { title: '9. Firma y aceptación',                               paragraphs: [/* verbatim */] },
];
```

Renderer — identical to the shipped block (L536-556), only the array name changes:

```tsx
{RETURN_CLAUSES.map((clause, ci) => (
  <View key={ci} wrap={false}
    style={ci < RETURN_CLAUSES.length - 1 ? styles.clauseCard : styles.clauseCardLast}>
    <Text style={styles.clauseTitle}>{clause.title}</Text>
    {clause.paragraphs.map((p, pi) => (
      <Text key={pi} style={pi < clause.paragraphs.length - 1
        ? styles.clauseParagraph : styles.clauseParagraphLast}>{p}</Text>
    ))}
  </View>
))}
```

Design decisions on the clause data:
- **`wrap={false}` on every card is non-negotiable** (fixes the orphaned-title bug recorded in
  memory #427). If a clause is too tall for one page, split it into two adjacent `RETURN_CLAUSES`
  entries (e.g. `7. Pendientes y faltantes` + `7. Pendientes y faltantes (cont.)`); never drop
  `wrap={false}` and never merge cards to compensate.
- **Sections 2 and 7 need no new component.** Blank checkboxes and observation space are just
  additional `paragraphs` strings using the existing `clauseParagraph` style, e.g.
  `'[  ] Se recibe en condiciones normales de uso'`, `'[  ] Se recibe con observaciones'`,
  `'Observaciones: ______________________________________________'` (repeated blank lines give
  writing space). Character-based blanks match the shipped `signField` convention and keep the
  clause array a pure `string[]` — no `checkbox: true` field, no bespoke View.
- The clause `paragraphs` array is a **verbatim fixture**. The apply phase transcribes the
  user-supplied Spanish text with no paraphrase, no reordering, no truncation, no invented filler.
  If the final text for a section is not available at apply time, the task is **blocked** — a
  placeholder or LLM-drafted stand-in must not be committed (see Risks).
- Title numbering: the shipped assignment array's first entry has no `1.` prefix (a known cosmetic
  inconsistency, clauses 2-9 are numbered). The return array numbers **all nine**, `1.` through
  `9.`, matching the spec's ordered table.

#### 2.2.2 Signature block

Two `signBox`es in one `signRow`, mirroring shipped L560-575, with the **static blank C.C. line
preserved in both** (the shipped file has it only on the employee side, L564; the return acta adds
it to the second box too, per spec REQ-07):

| Box | signName | signMeta | signField lines |
|---|---|---|---|
| 1 | `{employee.fullName}` | `Empleado` | `C.C. ___________________________`, `Firma ___________________________`, `Fecha ___________________________` |
| 2 | `Representante Novahold` | `Área de Tecnología` | `Nombre ___________________________`, `C.C. ___________________________`, `Firma ___________________________`, `Fecha ___________________________` |

No dynamic cedula is substituted — no such field exists on `Employee`, and adding one is out of
scope. Both C.C. lines are literal static text.

### 2.3 NEW — `.../employees/presentation/components/EmployeeReturnActaDownload.tsx`

Mirrors `EmployeeActaDownload.tsx` exactly (same 46-line shape):

```tsx
'use client';
import { useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { EmployeeReturnPDF } from '@/shared/ui/components/EmployeeReturnPDF';
import { getEmployeeReturnReportAction } from '../../actions';

interface Props { employeeId: string; onDone: () => void }

export function EmployeeReturnActaDownload({ employeeId, onDone }: Props): null
```

Behavioral contract, point-for-point:
- `const triggered = useRef(false)` + early `return` guard inside the effect → double-fire safe
  under React 18/19 StrictMode remount.
- `useEffect(..., [])` with the same `// eslint-disable-next-line react-hooks/exhaustive-deps`.
- `!result.ok` → `toast.error('Error al generar el acta de devolución')`, `onDone()`, return.
- `result.data.assignments.length === 0` → `toast.error('Este empleado no tiene asignaciones activas')`,
  `onDone()`, return.
- Success → `await pdf(<EmployeeReturnPDF data={result.data} />).toBlob()`, `URL.createObjectURL`,
  synthetic `<a>` with `download = \`acta-devolucion-${employeeId.slice(0, 8)}.pdf\``, `a.click()`,
  `URL.revokeObjectURL(url)`, `onDone()`.
- Returns `null` — it is a side-effect-only component, mounted conditionally as the trigger. This is
  the shipped mechanism and the reason no imperative `onClick` handler does the async work.

### 2.4 MODIFIED — `.../employees/presentation/components/EmployeesTablePage.tsx`

Four surgical edits, current line numbers:

| # | Line | Edit |
|---|---|---|
| 1 | **L6** | `import { Pencil, PowerOff, Trash2, Plus, FileSpreadsheet, Users, FileText, Undo2 } from 'lucide-react';` |
| 2 | **L18** (after `EmployeeActaDownload` import) | `import { EmployeeReturnActaDownload } from './EmployeeReturnActaDownload';` |
| 3 | **L49** (after `downloadId`) | `const [returnDownloadId, setReturnDownloadId] = useState<string | null>(null);` |
| 4 | **L115-125** (inside the `actions` cell, the existing `assignmentsCount > 0` block) | wrap both buttons in one fragment under the same guard (below) |
| 5 | **L130** | deps → `[canWrite, deactivate, remove, downloadId, returnDownloadId]` |
| 6 | **L247-252** (after the existing `{downloadId && ...}` mount) | second conditional mount (below) |

Edit 4 — row actions cell:

```tsx
{row.original.assignmentsCount > 0 && (
  <>
    <Button size="icon" variant="ghost" className="h-8 w-8"
      title="Descargar acta de asignación"
      onClick={() => setDownloadId(row.original.id)}>
      <FileText className="h-4 w-4" />
    </Button>
    <Button size="icon" variant="ghost" className="h-8 w-8"
      title="Descargar acta de devolución"
      onClick={() => setReturnDownloadId(row.original.id)}>
      <Undo2 className="h-4 w-4" />
    </Button>
  </>
)}
```

Edit 6 — mount:

```tsx
{returnDownloadId && (
  <EmployeeReturnActaDownload
    employeeId={returnDownloadId}
    onDone={() => setReturnDownloadId(null)}
  />
)}
```

**Icon choice: `Undo2`.** Already imported in this file: `Pencil, PowerOff, Trash2, Plus,
FileSpreadsheet, Users, FileText` — so `Undo2` is unused and collision-free. `FileMinus` was
considered and rejected: at `h-4 w-4`, sitting immediately beside `FileText`, two page-outline
glyphs are near-indistinguishable, which directly re-creates the proposal's "users confuse the two
acta buttons" risk. `Undo2`'s curved return arrow reads as "devolución" at 16px and is
silhouette-distinct. The `title` attributes remain the primary affordance (no tooltip component is
introduced — shipped convention is the native `title`).

**Placement rationale**: the block stays *outside* the `canWrite &&` fragment (L74-114). Read
permission is enforced at `page.tsx` L26-31 (`employees:read` or redirect), so any user who can see
this table already satisfies REQ-01/REQ-02's gate. Putting the acta buttons behind `canWrite` would
wrongly require `employees:create`.

**Enablement**: conditional render on `assignmentsCount > 0`, matching the shipped acta button.
Spec REQ-01 phrases this as "visible but disabled"; the shipped precedent hides the button entirely
and the confirmed decision is to mirror it. Recorded as intentional spec drift, not a defect.

### 2.5 NEW — `src/shared/ui/components/__tests__/EmployeeReturnPDF.test.tsx`

Mirrors `EmployeeAssignmentPDF.test.tsx`: `vitest` + `@testing-library/react` `render`, a local
`makeData(overrides: Partial<EmployeeAssignmentReportData> = {}): EmployeeAssignmentReportData`
factory with the same fixture values (Laura Gómez / NVH-LAP-00001 / `GOOD`). `@react-pdf/renderer`
is mocked by the existing vitest setup, so assertions are structural/does-not-throw, not text
queries against real PDF output.

Cases:
1. renders without crashing with full data
2. renders without crashing with empty `assignments`
3. does not throw for `null` `serialNumber` / `brand` / `model`
4. exercises `STATUS_LABELS` for each of the 5 enum values without throwing
5. `RETURN_CLAUSES` structural assertions that need no PDF text: array length is exactly 9, titles
   match the 9 spec titles in order, every entry has ≥1 non-empty paragraph. Requires exporting
   `RETURN_CLAUSES` from `EmployeeReturnPDF.tsx` (a named export alongside the component — the only
   deliberate deviation from the shipped file, and the only way to assert clause count/order/verbatim
   text without a real PDF render).
6. `wrap={false}` presence: assert via the exported array length + a snapshot-free check that the
   rendered tree does not throw; deep `wrap` prop assertion is only possible if the mock preserves
   props — if it does not, this stays a manual review item rather than a fake passing test.

---

## 3. Data Flow

```
click Undo2 button
  → setReturnDownloadId(employee.id)
  → <EmployeeReturnActaDownload> mounts (returns null, no UI)
  → useEffect (ref-guarded, once)
  → getEmployeeReturnReportAction(employeeId)          [server]
       auth() → hasPermission('employees','read') → err FORBIDDEN
       Promise.all(employee.findUnique, assignment.findMany where status ACTIVE order assignedAt asc)
       !employee → err NOT_FOUND
       → ok(EmployeeAssignmentReportData)
  → !ok            → toast.error('Error al generar el acta de devolución') → onDone()
  → assignments[]  → toast.error('Este empleado no tiene asignaciones activas') → onDone()
  → ok+nonempty    → pdf(<EmployeeReturnPDF data/>).toBlob() → anchor download
                     acta-devolucion-{id[:8]}.pdf → revokeObjectURL → onDone()
  → onDone() sets returnDownloadId = null → component unmounts (ready for next click)
```

Integration points: exactly three — the new export in `actions.ts`, the two new imports in
`EmployeesTablePage.tsx`, and the `import '@/shared/pdf/fonts'` side effect in the PDF component.

---

## 4. Additive-Only Guarantee

Expected diff, by path:

| Path | Expected diff |
|---|---|
| `src/shared/ui/components/EmployeeReturnPDF.tsx` | new file |
| `src/shared/ui/components/__tests__/EmployeeReturnPDF.test.tsx` | new file |
| `.../employees/presentation/components/EmployeeReturnActaDownload.tsx` | new file |
| `src/app/(dashboard)/employees/actions.ts` | append-only (one new exported function; no edit to existing types or `getEmployeeAssignmentReportAction`) |
| `.../employees/presentation/components/EmployeesTablePage.tsx` | 6 localized edits listed in §2.4 |
| **`src/app/(dashboard)/assignments/**`** | **zero diff** |
| **`returnAssignmentAction`** | **zero diff** |
| **`prisma/schema.prisma`** + `prisma/migrations/**` | **zero diff** |
| `src/shared/ui/components/EmployeeAssignmentPDF.tsx` | **zero diff** |
| `.../employees/presentation/components/EmployeeActaDownload.tsx` | **zero diff** |
| `src/shared/pdf/fonts.ts` | **zero diff** (consumed as-is) |

No migration, no seed change, no dependency added (`@react-pdf/renderer`, `sonner`,
`lucide-react`, `vitest` all installed). Rollback = delete 3 files, revert 2 diffs.

---

## 5. Risks and Open Items

| Risk | Severity | Handling |
|---|---|---|
| **The 9 verbatim Spanish clause texts are not present in any persisted artifact.** Proposal #458 and spec #459 pin only the 9 *titles*; no body text was captured. | **Blocking for apply** | Apply must obtain the final text from the user before writing `RETURN_CLAUSES`. Committing placeholder or model-drafted legal text is forbidden — this is a legal document. Tasks phase should carry an explicit "obtain verbatim text" precondition task. |
| Spec REQ-04/REQ-06 field paths (`employee.name`, `asset.code`, `asset.name`, `documentId`, 7 columns incl. `Categoría`/`Entregado por`) do not match shipped code (`employee.fullName`, `assetCode`, flat `AssignmentReportItem`, 5 columns). | Medium | Design follows **shipped code + the confirmed decision to mirror existing columns exactly**. Spec REQ-04/REQ-06 are stale descriptive drift; verify phase should judge against this design, or the spec should be amended to the real shape. |
| Spec REQ-01 "visible but disabled" vs shipped conditional render | Low | Mirror shipped (`assignmentsCount > 0 &&`), per confirmed decision. Documented drift. |
| Spec REQ-02 says UNAUTHORIZED for no session; shipped returns `err('FORBIDDEN', 'Sin permiso')` for both cases | Low | Mirror shipped `FORBIDDEN`. Intent (no data leaves the server) is satisfied. |
| Long clause + `wrap={false}` overflows a single A4 page → react-pdf drops/clips the card | Medium | Split into consecutive array entries; never remove `wrap={false}`. Needs one manual visual check of the generated PDF at apply time (mocked unit tests cannot catch this). |
| Duplicated action/query flagged as an oversight in review | Medium | Documented accepted tradeoff in proposal §Rejected alternative and §1 here. |
| Test case 6 (`wrap={false}` assertion) may be unassertable under the existing `@react-pdf/renderer` mock | Low | If the mock strips props, keep the structural clause-array assertions and record `wrap={false}` as a manual review item; do not write a test that passes vacuously. |
| Exporting `RETURN_CLAUSES` widens the module's public surface vs the shipped file | Low | Accepted: it is the only mechanism to make clause count/order/verbatim-text a real automated assertion, which the spec weights as an acceptance criterion. |
