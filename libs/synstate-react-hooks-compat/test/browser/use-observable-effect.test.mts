import { act, renderHook } from '@testing-library/react';
import { source } from 'synstate';
import { useObservableEffect } from '../../src/index.mjs';

describe(useObservableEffect, () => {
  test('runs the subscription for as long as the component is mounted', () => {
    const count$ = source<number>();

    const mut_seen: number[] = [];

    const { unmount } = renderHook(() => {
      useObservableEffect(count$, (value) => {
        mut_seen.push(value);
      });
    });

    act(() => {
      count$.next(1);

      count$.next(2);
    });

    unmount();

    act(() => {
      count$.next(3);
    });

    assert.deepStrictEqual(mut_seen, [1, 2]);
  });

  test('does not re-subscribe when the component re-renders', () => {
    const count$ = source<number>();

    const mut_seen: number[] = [];

    const { rerender } = renderHook(() => {
      useObservableEffect(count$, (value) => {
        mut_seen.push(value);
      });
    });

    rerender();

    rerender();

    act(() => {
      count$.next(1);
    });

    assert.deepStrictEqual(mut_seen, [1]);
  });
});
