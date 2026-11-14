import { act, renderHook } from '@testing-library/react';
import * as React from 'react';
import { source, type Observable } from 'synstate';
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

  test('calls the callback of the latest render', () => {
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

    act(() => {
      count$.next(1);
    });

    rerender({ label: 'b' });

    act(() => {
      count$.next(2);
    });

    assert.deepStrictEqual(mut_seen, ['a:1', 'b:2']);
  });

  test('moves the subscription to an Observable passed later', () => {
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

    act(() => {
      first$.next(1);

      second$.next(2);
    });

    assert.deepStrictEqual(mut_seen, [2]);
  });

  test('passes a value a layout effect of the same commit emits to the new callback, or on React 16.8 and 17 to the previous one', () => {
    const count$ = source<number>();

    const mut_seen: string[] = [];

    const { rerender } = renderHook(
      ({ label }: Readonly<{ label: string }>) => {
        // Declared first, so it runs before any layout effect of the hook
        React.useLayoutEffect(() => {
          count$.next(label.length);
        }, [label]);

        useObservableEffect(count$, (value) => {
          mut_seen.push(`${label}:${value}`);
        });
      },
      { initialProps: { label: 'a' } },
    );

    rerender({ label: 'bb' });

    assert.deepStrictEqual(
      mut_seen,
      // synstate-react-hooks-compat runs these tests on React 16.8 and 17 too,
      // which have no `useInsertionEffect`. There it keeps the callback current
      // in a layout effect, which runs after this one, so the value goes to the
      // previous callback (its README says so). Decided by whether React has
      // `useInsertionEffect`, which is what synstate-react-hooks-compat's
      // `src/react-version-hooks.mts` looks at, not by `React.version`.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- React 16 and 17 have none, whatever the types say
      React.useInsertionEffect === undefined ? ['a:1', 'a:2'] : ['a:1', 'bb:2'],
    );
  });
});
