import { act, renderHook } from '@testing-library/preact';
import { h, render } from 'preact';
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
      count$.emit(1);

      count$.emit(2);
    });

    // Not in `act`: `renderHook`'s `unmount` is a bare `render(null, …)`, as an
    // application unmounts, and preact 11 runs an effect's cleanup only after
    // the next frame (#3917). Wrapped, both versions clean up at once.
    unmount();

    await act(() => {
      count$.emit(3);
    });

    assert.deepStrictEqual(mut_seen, [1, 2]);
  });

  test('delivers nothing right after a bare unmount (#3917)', async () => {
    const count$ = source<number>();

    const mut_seen: number[] = [];

    const Subscriber = (): null => {
      useObservableEffect(count$, (value) => {
        mut_seen.push(value);
      });

      return null;
    };

    const container = document.createElement('div');

    await act(() => {
      render(h(Subscriber, {}), container);
    });

    count$.emit(1);

    render(null, container);

    count$.emit(2);

    assert.deepStrictEqual(mut_seen, [1]);
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
      count$.emit(1);
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
      count$.emit(1);
    });

    rerender({ label: 'b' });

    await act(() => {
      count$.emit(2);
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
      first$.emit(1);

      second$.emit(2);
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
          count$.emit(label.length);
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
