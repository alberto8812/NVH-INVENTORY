// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { CrudFormDialog } from '@/shared/presentation/components/form-builder/CrudFormDialog';
import type { FormConfig } from '@/shared/presentation/types/form-config.types';

const searchAction = vi.fn(async (q: string) => [
  { code: '1', value: `${q}-one` },
  { code: '2', value: `${q}-two` },
]);

function buildConfig(overrides: Partial<NonNullable<FormConfig['sections']>[0]['fields'][0]> = {}): FormConfig {
  return {
    fields: [],
    sections: [
      {
        title: 'Test',
        fields: [
          {
            name: 'parentId',
            label: 'Padre',
            type: 'autocomplete',
            gridCols: 1,
            autocompleteConfig: {
              searchAction,
              returnMode: 'code',
              minChars: 2,
              debounceMs: 50,
            },
            ...overrides,
          },
        ],
      },
    ],
  };
}

function renderDialog(config = buildConfig()) {
  const onSubmit = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <CrudFormDialog
      open={true}
      onOpenChange={onOpenChange}
      title="Test Dialog"
      formConfig={config}
      onSubmit={onSubmit}
    />,
  );
  return { onSubmit, onOpenChange };
}

describe('AutocompleteField', () => {
  beforeEach(() => {
    searchAction.mockClear();
  });

  it('shows default options on focus when the field is empty', async () => {
    searchAction.mockResolvedValue([
      { code: '1', value: 'opt-1' },
      { code: '2', value: 'opt-2' },
      { code: '3', value: 'opt-3' },
      { code: '4', value: 'opt-4' },
      { code: '5', value: 'opt-5' },
    ]);
    renderDialog();
    const user = userEvent.setup();

    await act(async () => {
      await user.click(screen.getByPlaceholderText(/padre/i));
    });

    expect(searchAction).toHaveBeenCalledWith('', undefined);
    await waitFor(() => {
      expect(screen.getAllByText(/^opt-\d$/)).toHaveLength(5);
    }, { timeout: 500 });
  });

  it('falls back to default options when fewer than minChars typed', async () => {
    renderDialog();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/padre/i);
    await act(async () => {
      await user.type(input, 'a'); // below minChars=2
    });

    await waitFor(() => {
      expect(searchAction).toHaveBeenLastCalledWith('', undefined);
    }, { timeout: 500 });
    expect(searchAction).not.toHaveBeenCalledWith('a', undefined);
  });

  it('calls searchAction after debounce when 2+ chars typed', async () => {
    renderDialog();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/padre/i);

    await act(async () => {
      await user.type(input, 'ab');
    });

    // Wait for debounce (50ms) to fire
    // searchAction receives (query, watchedValue) — watchedValue is undefined when no watch field
    await waitFor(() => {
      expect(searchAction).toHaveBeenCalledWith('ab', undefined);
    }, { timeout: 500 });
  });

  it('shows dropdown options and clicking one selects it', async () => {
    searchAction.mockResolvedValue([
      { code: '1', value: 'ab-one' },
      { code: '2', value: 'ab-two' },
    ]);

    renderDialog();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/padre/i);

    await act(async () => {
      await user.type(input, 'ab');
    });

    await waitFor(() => {
      expect(screen.getByText('ab-one')).toBeInTheDocument();
    }, { timeout: 500 });

    await act(async () => {
      await user.click(screen.getByText('ab-one'));
    });

    // After clicking option, dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('ab-two')).not.toBeInTheDocument();
    });
  });

  it('closes dropdown on blur after 150ms', async () => {
    searchAction.mockResolvedValue([{ code: '1', value: 'ab-one' }]);

    renderDialog();
    const user = userEvent.setup();
    const input = screen.getByPlaceholderText(/padre/i);

    await act(async () => {
      await user.type(input, 'ab');
    });

    await waitFor(() => {
      expect(screen.getByText('ab-one')).toBeInTheDocument();
    }, { timeout: 500 });

    await act(async () => {
      await user.tab(); // blur the input
    });

    // After blur + 150ms timeout, dropdown should close
    await waitFor(() => {
      expect(screen.queryByText('ab-one')).not.toBeInTheDocument();
    }, { timeout: 500 });
  });
});
