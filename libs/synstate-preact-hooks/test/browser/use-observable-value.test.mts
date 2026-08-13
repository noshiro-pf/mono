import { act, renderHook } from '@testing-library/preact';
import { source } from 'synstate';
import { useObservableValue } from '../../src/index.mjs';

describe(useObservableValue, () => {
  test('starts at the current value and re-renders on every emission', async () => {
    const count$ = source<number>(0);

    const { result } = renderHook(() => useObservableValue(count$));

    assert.strictEqual(result.current, 0);

    await act(() => {
      count$.next(1);
    });

    assert.strictEqual(result.current, 1);

    await act(() => {
      count$.next(42);
    });

    assert.strictEqual(result.current, 42);
  });

  test('holds the given value until an observable without one emits', async () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$, -1));

    assert.strictEqual(result.current, -1);

    await act(() => {
      count$.next(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('holds undefined until an observable without an initial value emits', async () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$));

    assert.strictEqual(result.current, undefined);

    await act(() => {
      count$.next(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('stops re-rendering once unmounted', async () => {
    const count$ = source<number>(0);

    const { result, unmount } = renderHook(() => useObservableValue(count$));

    unmount();

    await act(() => {
      count$.next(1);
    });

    assert.strictEqual(result.current, 0);
  });
});
