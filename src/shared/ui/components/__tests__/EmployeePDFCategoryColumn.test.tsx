import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import type { EmployeeAssignmentReportData } from '@/app/(dashboard)/employees/actions';

// Local override of the global no-op mock so rendered text is queryable.
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  View: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
  Image: () => null,
  StyleSheet: { create: (styles: Record<string, unknown>) => styles },
  Font: { register: vi.fn() },
}));

import { EmployeeAssignmentPDF } from '../EmployeeAssignmentPDF';
import { EmployeeReturnPDF } from '../EmployeeReturnPDF';

const data: EmployeeAssignmentReportData = {
  employee: {
    id: 'emp-abc12345',
    fullName: 'Laura Gómez',
    email: 'laura@novahold.com',
    phone: null,
    position: null,
    departmentName: null,
    locationName: null,
    cityName: null,
  },
  assignments: [
    {
      id: 'asgn-1',
      assetCode: 'NVH-LAP-00008',
      categoryName: 'Portátil',
      brand: 'Apple',
      model: 'MacBook Air',
      serialNumber: 'SN-APL-002',
      generalStatus: 'GOOD',
      assignedAt: '2026-09-20T00:00:00.000Z',
      deliveredByName: null,
      notes: null,
    },
  ],
  generatedAt: '2026-10-20T10:00:00.000Z',
};

describe.each([
  ['EmployeeAssignmentPDF', EmployeeAssignmentPDF],
  ['EmployeeReturnPDF', EmployeeReturnPDF],
])('%s assets table', (_name, Pdf) => {
  it('shows a "Categoría" column with each asset category', () => {
    render(<Pdf data={data} />);
    expect(screen.getByText('Categoría')).toBeInTheDocument();
    const row = screen.getByText('NVH-LAP-00008').parentElement!;
    expect(within(row).getByText('Portátil')).toBeInTheDocument();
  });
});
