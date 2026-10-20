import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Autocomplete } from '../AssignmentDetailDialog';

const options = [1, 2, 3, 4, 5].map((n) => ({ code: String(n), value: `opt-${n}` }));

describe('AssignmentDetailDialog Autocomplete', () => {
  it('shows default options on focus when the field is empty', async () => {
    const searchFn = vi.fn(async () => ({ ok: true, data: options }));
    render(<Autocomplete onSelect={vi.fn()} searchFn={searchFn} placeholder="Buscar empleado" />);
    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByPlaceholderText('Buscar empleado'));
    });

    expect(searchFn).toHaveBeenCalledWith('');
    await waitFor(() => {
      expect(screen.getAllByText(/^opt-\d$/)).toHaveLength(5);
    });
  });

  it('shows default options again when the text is cleared', async () => {
    const searchFn = vi.fn(async (q: string) => ({ ok: true, data: q ? [{ code: 'x', value: `${q}-match` }] : options }));
    render(<Autocomplete onSelect={vi.fn()} searchFn={searchFn} placeholder="Buscar empleado" />);
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText('Buscar empleado');

    await act(async () => {
      await user.type(input, 'a');
    });
    await waitFor(() => expect(screen.getByText('a-match')).toBeInTheDocument());

    await act(async () => {
      await user.clear(input);
    });
    await waitFor(() => {
      expect(screen.getAllByText(/^opt-\d$/)).toHaveLength(5);
    });
  });
});
