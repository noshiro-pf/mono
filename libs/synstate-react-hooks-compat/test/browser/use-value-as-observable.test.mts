import { act, render, renderHook } from '@testing-library/react';
import * as React from 'react';
import type { Observable } from 'synstate';
import { useObservableValue, useValueAsObservable } from '../../src/index.mjs';

describe(useValueAsObservable, () => {
  test('keeps one observable across re-renders and pushes each new value into it', () => {
    const { result, rerender } = renderHook(
      ({ value }: Readonly<{ value: number }>) => useValueAsObservable(value),
      { initialProps: { value: 1 } },
    );

    const first: Observable<number> = result.current;

    const mut_seen: number[] = [];

    first.subscribe((value) => {
      mut_seen.push(value);
    });

    rerender({ value: 2 });

    rerender({ value: 3 });

    assert.strictEqual(result.current, first);

    assert.deepStrictEqual(mut_seen, [1, 2, 3]);
  });

  test('completes the observable in a timer after the component unmounts', async () => {
    const { result, unmount } = renderHook(() => useValueAsObservable(0));

    const observable$ = result.current;

    unmount();

    assert.isFalse(observable$.isCompleted);

    await nextTask();

    assert.isTrue(observable$.isCompleted);
  });

  test('keeps one live observable under StrictMode, which runs the effects twice on mount', async () => {
    const { result, rerender, unmount } = renderHook(
      ({ value }: Readonly<{ value: number }>) => {
        const value$ = useValueAsObservable(value);

        return [value$, useObservableValue(value$)] as const;
      },
      { initialProps: { value: 1 }, wrapper: React.StrictMode },
    );

    await nextTask();

    const [first, firstValue] = result.current;

    assert.isFalse(first.isCompleted);

    assert.strictEqual(firstValue, 1);

    rerender({ value: 2 });

    await nextTask();

    assert.strictEqual(result.current[0], first);

    assert.strictEqual(result.current[1], 2);

    unmount();

    await nextTask();

    assert.isTrue(first.isCompleted);
  });

  // `React.Activity` came in React 19.2, and synstate-react-hooks-compat runs
  // these tests on React 16.8 and 17 too. Skipped by version rather than when
  // `React.Activity` is missing, so that a React 19 without it fails.
  describe.skipIf(/^1[678]\./u.test(React.version))(
    'in an Activity that is hidden and shown again',
    () => {
      /** A component that records what its `useValueAsObservable` emits. */
      const createReader = (): Readonly<{
        Reader: (props: Readonly<{ value: number }>) => null;
        seen: readonly number[];
      }> => {
        const mut_seen: number[] = [];

        const Reader = ({ value }: Readonly<{ value: number }>): null => {
          const value$ = useValueAsObservable(value);

          React.useEffect(() => {
            const { unsubscribe } = value$.subscribe((v) => {
              mut_seen.push(v);
            });

            return unsubscribe;
          }, [value$]);

          return null;
        };

        return { Reader, seen: mut_seen };
      };

      const activity = (
        mode: 'hidden' | 'visible',
        Reader: (props: Readonly<{ value: number }>) => null,
        value: number,
      ): React.ReactElement =>
        React.createElement(React.Activity, {
          mode,
          children: React.createElement(Reader, { value }),
        });

      /** Updates, then lets a completion scheduled by a cleanup happen. */
      const step = async (update: () => void): Promise<void> => {
        act(update);

        await nextTask();
      };

      test('follows the value once shown again', async () => {
        const { Reader, seen } = createReader();

        const { rerender } = render(activity('visible', Reader, 1));

        await step(() => {
          rerender(activity('hidden', Reader, 1));
        });

        await step(() => {
          rerender(activity('visible', Reader, 1));
        });

        await step(() => {
          rerender(activity('visible', Reader, 2));
        });

        assert.deepStrictEqual(seen, [1, 1, 2]);
      });

      test('follows the value when shown again without rendering it', async () => {
        const { Reader, seen } = createReader();

        // The same element each time, so React shows the hidden component again
        // without rendering it, and only its effects run.
        const first = React.createElement(Reader, { value: 1 });

        const { rerender } = render(
          React.createElement(React.Activity, {
            mode: 'visible',
            children: first,
          }),
        );

        await step(() => {
          rerender(
            React.createElement(React.Activity, {
              mode: 'hidden',
              children: first,
            }),
          );
        });

        await step(() => {
          rerender(
            React.createElement(React.Activity, {
              mode: 'visible',
              children: first,
            }),
          );
        });

        await step(() => {
          rerender(activity('visible', Reader, 2));
        });

        // On showing, the reader's effect still holds the completed observable
        // from its last render and subscribes to it, which gives its last value;
        // the re-render with the replacement then gives the same value again.
        assert.deepStrictEqual(seen, [1, 1, 1, 2]);
      });

      test('starts from a value that changed while hidden', async () => {
        const { Reader, seen } = createReader();

        const { rerender } = render(activity('visible', Reader, 1));

        await step(() => {
          rerender(activity('hidden', Reader, 1));
        });

        await step(() => {
          rerender(activity('hidden', Reader, 2));
        });

        await step(() => {
          rerender(activity('visible', Reader, 2));
        });

        assert.deepStrictEqual(seen, [1, 2]);
      });
    },
  );

  test('does not push the initial value again on mount', () => {
    const mut_seen: number[] = [];

    // A child's effects run before its parent's, so the child subscribes before
    // the parent's hook has run any effect of its own.
    const Child = ({
      value$,
    }: Readonly<{ value$: Observable<number> }>): null => {
      React.useEffect(() => {
        const { unsubscribe } = value$.subscribe((v) => {
          mut_seen.push(v);
        });

        return unsubscribe;
      }, [value$]);

      return null;
    };

    const Parent = (): React.ReactElement =>
      React.createElement(Child, { value$: useValueAsObservable(1) });

    render(React.createElement(Parent));

    assert.deepStrictEqual(mut_seen, [1]);
  });
});

/** Waits until timers of 0 ms set before it have run. */
const nextTask = (): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
