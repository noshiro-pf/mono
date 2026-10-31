import { act, renderHook } from '@testing-library/preact';
import * as Preact from 'preact/hooks';
import { source, type Observable } from 'synstate';
import { useObservableEffect } from '../../src/index.mjs';

describe(useObservableEffect, () => {
  test('runs the subscription for as long as the component is mounted', async () => {
    const count$ = source<number>();

    const mut_seen: number[] = [];

    const { unmount } = renderHook(() => {
      useObservableEffect(count$, (value) => {
        mut_seen.push(value);
      });
    });

    await act(() => {
      count$.next(1);

      count$.next(2);
    });

    unmount();

    await act(() => {
      count$.next(3);
    });

    assert.deepStrictEqual(mut_seen, [1, 2]);
  });

  test('does not re-subscribe when the component re-renders', async () => {
    const count$ = source<number>();

    const mut_seen: number[] = [];

    const { rerender } = renderHook(() => {
      useObservableEffect(count$, (value) => {
        mut_seen.push(value);
      });
    });

    rerender();

    rerender();

    await act(() => {
      count$.next(1);
    });

    assert.deepStrictEqual(mut_seen, [1]);
  });

  test('calls the callback of the latest render', async () => {
    const count$ = source<number>();

    const mut_seen: string[] = [];

    const { rerender } = renderHook(
      ({ label }: Readonly<{ label: string }>) => {
        useObservableEffect(count$, (value) => {
          mut_seen.push(`${label}:${value}`);
        });
      },
      { initialProps: { label: 'a' } },
    );

    await act(() => {
      count$.next(1);
    });

    rerender({ label: 'b' });

    await act(() => {
      count$.next(2);
    });

    assert.deepStrictEqual(mut_seen, ['a:1', 'b:2']);
  });

  test('moves the subscription to an Observable passed later', async () => {
    const first$ = source<number>();

    const second$ = source<number>();

    const mut_seen: number[] = [];

    const { rerender } = renderHook(
      ({ count$ }: Readonly<{ count$: Observable<number> }>) => {
        useObservableEffect(count$, (value) => {
          mut_seen.push(value);
        });
      },
      { initialProps: { count$: first$ } },
    );

    rerender({ count$: second$ });

    await act(() => {
      first$.next(1);

      second$.next(2);
    });

    assert.deepStrictEqual(mut_seen, [2]);
  });

  test('passes a value a layout effect of the same commit emits to the new callback', async () => {
    const count$ = source<number>();

    const mut_seen: string[] = [];

    const { rerender } = renderHook(
      ({ label }: Readonly<{ label: string }>) => {
        // Declared first, so it runs before any layout effect of the hook
        Preact.useLayoutEffect(() => {
          count$.next(label.length);
        }, [label]);

        useObservableEffect(count$, (value) => {
          mut_seen.push(`${label}:${value}`);
        });
      },
      { initialProps: { label: 'a' } },
    );

    await act(() => {
      rerender({ label: 'bb' });
    });

    assert.deepStrictEqual(mut_seen, ['a:1', 'bb:2']);
  });
});
