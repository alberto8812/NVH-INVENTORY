import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import { TablePageToolbar } from '../TablePageToolbar';

const categorySelect = (onChange = vi.fn(), value = 'all') => ({
  label: 'Categoría',
  value,
  onChange,
  options: [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Monitor', value: 'c1' },
    { label: 'Portátil', value: 'c2' },
  ],
});

describe('TablePageToolbar selects', () => {
  it('shows the label of the selected option', () => {
    render(<TablePageToolbar config={{ selects: [categorySelect(vi.fn(), 'c2')] }} />);
    expect(screen.getByRole('combobox', { name: 'Categoría' })).toHaveTextContent('Portátil');
  });

  it('calls onChange with the picked option value', async () => {
    const onChange = vi.fn();
    render(<TablePageToolbar config={{ selects: [categorySelect(onChange)] }} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('combobox', { name: 'Categoría' }));
    await user.click(await screen.findByRole('option', { name: 'Monitor' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('c1'));
  });
});
