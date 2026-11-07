import { act, renderHook } from '@testing-library/preact';
import { source } from 'synstate';
import { expectType } from 'ts-data-forge';
import { useObservableValue } from '../../src/index.mjs';

describe(useObservableValue, () => {
  test('starts at the current value and re-renders on every emission', async () => {
    const count$ = source<number>(0);

    const { result } = renderHook(() => useObservableValue(count$));

    expectType<typeof result.current, number>('=');

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

    expectType<typeof result.current, number>('=');

    assert.strictEqual(result.current, -1);

    await act(() => {
      count$.next(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('holds undefined until an observable without an initial value emits', async () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$));

    expectType<typeof result.current, number | undefined>('=');

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

  test('stays subscribed across renders with the same observable (#3144)', async () => {
    const count$ = source<number>(0);

    const mut_subscriptions = { current: 0 };

    // Counts the calls of `subscribe`; the methods run on `count$` itself,
    // whose private fields a proxy does not have.
    const counted$ = new Proxy(count$, {
      get: (target, key) => {
        if (key === 'subscribe') {
          return (onNext: (v: number) => void) => {
            mut_subscriptions.current += 1;

            return target.subscribe(onNext);
          };
        }

        const value: unknown = Reflect.get(target, key, target);

        return typeof value === 'function' ? value.bind(target) : value;
      },
    });

    const { result, rerender } = renderHook(() => useObservableValue(counted$));

    rerender();

    rerender();

    assert.strictEqual(mut_subscriptions.current, 1);

    await act(() => {
      count$.next(1);
    });

    assert.strictEqual(result.current, 1);

    assert.strictEqual(mut_subscriptions.current, 1);
  });

  test('moves to a different observable passed on a later render', async () => {
    const a$ = source<number>(1);

    const b$ = source<number>(2);

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$),
      { initialProps: { observable$: a$ } },
    );

    assert.strictEqual(result.current, 1);

    rerender({ observable$: b$ });

    assert.strictEqual(result.current, 2);

    await act(() => {
      b$.next(3);
    });

    assert.strictEqual(result.current, 3);

    await act(() => {
      a$.next(4);
    });

    assert.strictEqual(result.current, 3);
  });
});
