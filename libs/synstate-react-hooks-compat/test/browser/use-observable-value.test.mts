import { act, renderHook } from '@testing-library/react';
import { source } from 'synstate';
import { useObservableValue } from '../../src/index.mjs';

describe(useObservableValue, () => {
  test('starts at the current value and re-renders on every emission', () => {
    const count$ = source<number>(0);

    const { result } = renderHook(() => useObservableValue(count$));

    assert.strictEqual(result.current, 0);

    act(() => {
      count$.next(1);
    });

    assert.strictEqual(result.current, 1);

    act(() => {
      count$.next(42);
    });

    assert.strictEqual(result.current, 42);
  });

  test('holds the given value until an observable without one emits', () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$, -1));

    assert.strictEqual(result.current, -1);

    act(() => {
      count$.next(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('holds undefined until an observable without an initial value emits', () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$));

    assert.strictEqual(result.current, undefined);

    act(() => {
      count$.next(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('stops re-rendering once unmounted', () => {
    const count$ = source<number>(0);

    const { result, unmount } = renderHook(() => useObservableValue(count$));

    unmount();

    act(() => {
      count$.next(1);
    });

    assert.strictEqual(result.current, 0);
  });
});
