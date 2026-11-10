import { act, renderHook } from '@testing-library/react';
import { source, type Observable } from 'synstate';
import { expectType } from 'ts-data-forge';
import { useObservableValue } from '../../src/index.mjs';

describe(useObservableValue, () => {
  test('starts at the current value and re-renders on every emission that changes it', () => {
    const count$ = source<number>(0);

    const { result } = renderHook(() => useObservableValue(count$));

    expectType<typeof result.current, number>('=');

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

  test('renders nothing for an emission equal to the current value', () => {
    const count$ = source<number>(1);

    const mut_renders = { count: 0 };

    renderHook(() => {
      mut_renders.count += 1;

      return useObservableValue(count$);
    });

    const rendersAtMount = mut_renders.count;

    act(() => {
      count$.next(1);
    });

    assert.strictEqual(mut_renders.count, rendersAtMount);
  });

  test('holds the given value until an observable without one emits', () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$, -1));

    expectType<typeof result.current, number>('=');

    assert.strictEqual(result.current, -1);

    act(() => {
      count$.next(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('holds undefined until an observable without an initial value emits', () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$));

    expectType<typeof result.current, number | undefined>('=');

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

  test('stays subscribed across renders with the same observable (#3144)', () => {
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

    act(() => {
      count$.next(1);
    });

    assert.strictEqual(result.current, 1);

    assert.strictEqual(mut_subscriptions.current, 1);
  });

  test('moves to a different observable passed on a later render', () => {
    const a$ = source<number>(1);

    const b$ = source<number>(2);

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$),
      { initialProps: { observable$: a$ } },
    );

    assert.strictEqual(result.current, 1);

    rerender({ observable$: b$ });

    assert.strictEqual(result.current, 2);

    act(() => {
      b$.next(3);
    });

    assert.strictEqual(result.current, 3);

    act(() => {
      a$.next(4);
    });

    assert.strictEqual(result.current, 3);
  });

  test('moves to an observable that holds no value yet', () => {
    const a$: Observable<number> = source<number>(1);

    const b$ = source<number>();

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$),
      { initialProps: { observable$: a$ } },
    );

    assert.strictEqual(result.current, 1);

    rerender({ observable$: b$ });

    assert.strictEqual(result.current, undefined);

    act(() => {
      b$.next(2);
    });

    assert.strictEqual(result.current, 2);
  });

  test('reads an observable again when it is passed back', () => {
    const a$ = source<number>(1);

    const b$ = source<number>();

    const initialProps: Readonly<{ observable$: Observable<number> }> = {
      observable$: a$,
    } as const;

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$, -1),
      { initialProps },
    );

    rerender({ observable$: b$ });

    a$.next(5);

    rerender({ observable$: a$ });

    assert.strictEqual(result.current, 5);
  });

  test('follows a later emission equal to the previous observable value', () => {
    const a$ = source<number>(1);

    const b$ = source<number>();

    const initialProps: Readonly<{ observable$: Observable<number> }> = {
      observable$: a$,
    } as const;

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$, -1),
      { initialProps },
    );

    rerender({ observable$: b$ });

    assert.strictEqual(result.current, -1);

    act(() => {
      b$.next(1);
    });

    assert.strictEqual(result.current, 1);
  });

  test('uses the latest initial value until the observable emits', () => {
    const count$ = source<number>();

    const { result, rerender } = renderHook(
      ({ initial }) => useObservableValue(count$, initial),
      { initialProps: { initial: -1 } },
    );

    assert.strictEqual(result.current, -1);

    rerender({ initial: -2 });

    assert.strictEqual(result.current, -2);
  });

  test('returns a function-valued emission as it is', () => {
    const fn = (): number => 1;

    const handler$ = source<() => number>();

    const { result } = renderHook(() => useObservableValue(handler$));

    act(() => {
      handler$.next(fn);
    });

    assert.strictEqual(result.current, fn);
  });
});
