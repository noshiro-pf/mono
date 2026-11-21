import { act, renderHook } from '@testing-library/preact';
import { source, state, type Observable } from 'synstate';
import { expectType } from 'ts-data-forge';
import { useObservableValue } from '../../src/index.mjs';

describe(useObservableValue, () => {
  test('starts at the current value and re-renders on every emission that changes it', async () => {
    const count$ = state<number>(0);

    const { result } = renderHook(() => useObservableValue(count$));

    expectType<typeof result.current, number>('=');

    assert.strictEqual(result.current, 0);

    await act(() => {
      count$.set(1);
    });

    assert.strictEqual(result.current, 1);

    await act(() => {
      count$.set(42);
    });

    assert.strictEqual(result.current, 42);
  });

  test('renders nothing for an emission equal to the current value', async () => {
    // A state that passes on every write, so that the hook is what drops it.
    const count$ = state<number>(1, { equals: () => false });

    const mut_renders = { count: 0 };

    renderHook(() => {
      mut_renders.count += 1;

      return useObservableValue(count$);
    });

    const rendersAtMount = mut_renders.count;

    await act(() => {
      count$.set(1);
    });

    assert.strictEqual(mut_renders.count, rendersAtMount);
  });

  test('holds the given value until an observable without one emits', async () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$, -1));

    expectType<typeof result.current, number>('=');

    assert.strictEqual(result.current, -1);

    await act(() => {
      count$.emit(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('holds undefined until an observable without an initial value emits', async () => {
    const count$ = source<number>();

    const { result } = renderHook(() => useObservableValue(count$));

    expectType<typeof result.current, number | undefined>('=');

    assert.strictEqual(result.current, undefined);

    await act(() => {
      count$.emit(7);
    });

    assert.strictEqual(result.current, 7);
  });

  test('stops re-rendering once unmounted', async () => {
    const count$ = state<number>(0);

    const { result, unmount } = renderHook(() => useObservableValue(count$));

    unmount();

    await act(() => {
      count$.set(1);
    });

    assert.strictEqual(result.current, 0);
  });

  test('stays subscribed across renders with the same observable (#3144)', async () => {
    const count$ = state<number>(0);

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
      count$.set(1);
    });

    assert.strictEqual(result.current, 1);

    assert.strictEqual(mut_subscriptions.current, 1);
  });

  test('moves to a different observable passed on a later render', async () => {
    const a$ = state<number>(1);

    const b$ = state<number>(2);

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$),
      { initialProps: { observable$: a$ } },
    );

    assert.strictEqual(result.current, 1);

    rerender({ observable$: b$ });

    assert.strictEqual(result.current, 2);

    await act(() => {
      b$.set(3);
    });

    assert.strictEqual(result.current, 3);

    await act(() => {
      a$.set(4);
    });

    assert.strictEqual(result.current, 3);
  });

  test('moves to an observable that holds no value yet', async () => {
    const a$: Observable<number> = state<number>(1);

    const b$ = source<number>();

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$),
      { initialProps: { observable$: a$ } },
    );

    assert.strictEqual(result.current, 1);

    rerender({ observable$: b$ });

    assert.strictEqual(result.current, undefined);

    await act(() => {
      b$.emit(2);
    });

    assert.strictEqual(result.current, 2);
  });

  test('reads an observable again when it is passed back', () => {
    const a$ = state<number>(1);

    const b$ = source<number>();

    const initialProps: Readonly<{ observable$: Observable<number> }> = {
      observable$: a$,
    } as const;

    const { result, rerender } = renderHook(
      ({ observable$ }) => useObservableValue(observable$, -1),
      { initialProps },
    );

    rerender({ observable$: b$ });

    a$.set(5);

    rerender({ observable$: a$ });

    assert.strictEqual(result.current, 5);
  });

  test('follows a later emission equal to the previous observable value', async () => {
    const a$ = state<number>(1);

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

    await act(() => {
      b$.emit(1);
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

  test('returns a function-valued emission as it is', async () => {
    const fn = (): number => 1;

    const handler$ = source<() => number>();

    const { result } = renderHook(() => useObservableValue(handler$));

    await act(() => {
      handler$.emit(fn);
    });

    assert.strictEqual(result.current, fn);
  });
});
