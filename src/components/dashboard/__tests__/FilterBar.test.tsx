import { act, fireEvent, render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FilterBar } from '../FilterBar';

// Each rerender with a new searchValue simulates the URL round-trip:
// the parent trims the query and commits it later (router.replace + searchParams).
function setup() {
  const onEmit = vi.fn();
  const view = render(<FilterBar searchValue="" onSearchChange={onEmit} />);
  const commit = (q: string) =>
    view.rerender(<FilterBar searchValue={q} onSearchChange={onEmit} />);
  return { onEmit, commit };
}

function type(value: string) {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value } });
}

function wait() {
  act(() => vi.advanceTimersByTime(300));
}

describe('FilterBar search', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('emits the debounced value', () => {
    const { onEmit } = setup();
    type('IS');
    wait();
    expect(onEmit).toHaveBeenCalledWith('IS');
  });

  it('keeps characters typed while a previous search is still committing', () => {
    const { onEmit, commit } = setup();
    type('IS');
    wait();
    type('ISA');
    commit('IS'); // late echo of the first search
    expect(screen.getByRole('searchbox')).toHaveValue('ISA');
    wait();
    expect(onEmit).toHaveBeenLastCalledWith('ISA');
  });

  it('keeps a trailing space after the trimmed value is committed', () => {
    const { commit } = setup();
    type('Laura ');
    wait();
    commit('Laura');
    expect(screen.getByRole('searchbox')).toHaveValue('Laura ');
  });

  it('mirrors genuine external changes (back navigation, clear)', () => {
    const { onEmit, commit } = setup();
    type('IS');
    wait();
    commit('IS');
    commit('');
    expect(screen.getByRole('searchbox')).toHaveValue('');
    wait();
    expect(onEmit).toHaveBeenCalledTimes(1);
  });
});
