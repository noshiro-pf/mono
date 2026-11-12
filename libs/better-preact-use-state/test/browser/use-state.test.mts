import { act, renderHook } from '@testing-library/preact';
import { useState } from '../../src/index.mjs';

describe(useState, () => {
  test('resetState goes back to the value the state was created with', async () => {
    const { result, rerender } = renderHook(
      ({ initial }: Readonly<{ initial: number }>) => useState(initial),
      { initialProps: { initial: 1 } },
    );

    await act(() => {
      result.current[1](5);
    });

    // A later initial value is ignored, as `useState`'s is.
    rerender({ initial: 2 });

    await act(() => {
      result.current[2].resetState();
    });

    assert.strictEqual(result.current[0], 1);
  });

  test('resetState keeps its identity when the initial value changes', () => {
    const { result, rerender } = renderHook(
      ({ initial }: Readonly<{ initial: Readonly<{ name: string }> }>) =>
        useState(initial),
      { initialProps: { initial: { name: '' } } },
    );

    const first = result.current[2];

    // A new object on every render, as `useState({ name: '' })` passes.
    rerender({ initial: { name: '' } });

    rerender({ initial: { name: 'x' } });

    assert.strictEqual(result.current[2].resetState, first.resetState);

    assert.strictEqual(result.current[2].updateState, first.updateState);
  });

  test('updateState applies its function to the current state', async () => {
    const { result } = renderHook(() => useState(1));

    await act(() => {
      result.current[2].updateState((n) => n + 1);
    });

    assert.strictEqual(result.current[0], 2);
  });
});
