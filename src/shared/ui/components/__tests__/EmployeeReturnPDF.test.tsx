import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import { EmployeeReturnPDF, RETURN_CLAUSES } from '../EmployeeReturnPDF';
import type { EmployeeAssignmentReportData } from '@/app/(dashboard)/employees/actions';

function makeData(
  overrides: Partial<EmployeeAssignmentReportData> = {},
): EmployeeAssignmentReportData {
  return {
    employee: {
      id: 'emp-abc12345',
      fullName: 'Laura Gómez',
      email: 'laura@novahold.com',
      phone: '3001234567',
      position: 'Analista TI',
      departmentName: 'Tecnología',
      locationName: 'Sede Norte',
      cityName: 'Bogotá',
    },
    assignments: [
      {
        id: 'asgn-1',
        assetCode: 'NVH-LAP-00001',
        categoryName: 'Laptop',
        brand: 'Dell',
        model: 'Latitude 5420',
        serialNumber: 'SN123',
        generalStatus: 'GOOD',
        assignedAt: '2024-03-01T00:00:00.000Z',
        deliveredByName: 'Carlos Admin',
        notes: null,
      },
    ],
    generatedAt: '2024-06-01T10:00:00.000Z',
    ...overrides,
  };
}

const EXPECTED_TITLES = [
  '1. Devolución de bienes',
  '2. Verificación de estado',
  '3. Entrega de información y accesos',
  '4. Confidencialidad y protección de la información',
  '5. Responsabilidad por daños, pérdidas o deterioros',
  '6. Hallazgos posteriores a la devolución',
  '7. Pendientes y faltantes',
  '8. Paz y salvo respecto de bienes corporativos',
  '9. Firma y aceptación',
];

describe('EmployeeReturnPDF', () => {
  it('renders without crashing with full data', () => {
    expect(() => render(<EmployeeReturnPDF data={makeData()} />)).not.toThrow();
  });

  it('renders without crashing with empty assignments', () => {
    const data = makeData({ assignments: [] });
    expect(() => render(<EmployeeReturnPDF data={data} />)).not.toThrow();
  });

  it('does not throw for null serialNumber / brand / model', () => {
    const data = makeData({
      assignments: [
        {
          id: 'asgn-2',
          assetCode: 'NVH-MON-00002',
          categoryName: 'Monitor',
          brand: null,
          model: null,
          serialNumber: null,
          generalStatus: 'REGULAR',
          assignedAt: '2024-04-01T00:00:00.000Z',
          deliveredByName: null,
          notes: null,
        },
      ],
    });
    expect(() => render(<EmployeeReturnPDF data={data} />)).not.toThrow();
  });

  it('exercises STATUS_LABELS for all 5 condition enum values without throwing', () => {
    const statuses = ['GOOD', 'REGULAR', 'BAD', 'DAMAGED', 'RETIRED'];
    const data = makeData({
      assignments: statuses.map((s, i) => ({
        id: `asgn-${i}`,
        assetCode: `NVH-LAP-0000${i}`,
        categoryName: 'Laptop',
        brand: 'Dell',
        model: 'Latitude',
        serialNumber: `SN${i}`,
        generalStatus: s,
        assignedAt: '2024-03-01T00:00:00.000Z',
        deliveredByName: 'Carlos Admin',
        notes: null,
      })),
    });
    expect(() => render(<EmployeeReturnPDF data={data} />)).not.toThrow();
  });

  it('RETURN_CLAUSES has exactly 9 entries with expected titles in order', () => {
    expect(RETURN_CLAUSES.length).toBe(9);
    expect(RETURN_CLAUSES.map((c) => c.title)).toEqual(EXPECTED_TITLES);
    for (const clause of RETURN_CLAUSES) {
      expect(clause.paragraphs.length).toBeGreaterThanOrEqual(1);
      for (const p of clause.paragraphs) {
        expect(typeof p).toBe('string');
        expect(p.length).toBeGreaterThan(0);
      }
    }
  });

  // Note: wrap={false} is set on every clause card View in the implementation
  // (non-negotiable per design/REQ-05), but the @react-pdf/renderer test mock
  // does not preserve arbitrary props on the rendered DOM tree (verified: the
  // sibling EmployeeAssignmentPDF.test.tsx has no wrap assertion either, for
  // the same reason), so it is not assertable here. This is a documented
  // manual-review item (design.md Risks / tasks.md Task 5), not a test gap.
});
