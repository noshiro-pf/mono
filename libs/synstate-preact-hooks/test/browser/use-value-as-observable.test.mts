import { render, renderHook } from '@testing-library/preact';
import { h, render as preactRender, type JSX } from 'preact';
import * as Preact from 'preact/hooks';
import type { Observable } from 'synstate';
import { useValueAsObservable } from '../../src/index.mjs';

describe(useValueAsObservable, () => {
  test('keeps one observable and pushes each new value into it', () => {
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

  test('completes the observable when the component unmounts', () => {
    const { result, unmount } = renderHook(() => useValueAsObservable(0));

    const observable$ = result.current;

    assert.isFalse(observable$.isCompleted);

    // Not in `act`: see `use-observable-effect.test.mts` (#3917).
    unmount();

    assert.isTrue(observable$.isCompleted);
  });

  test('is completed right after a bare unmount (#3917)', () => {
    const mut_captured: { observable: Observable<number> | undefined } = {
      observable: undefined,
    };

    const Owner = (): null => {
      mut_captured.observable = useValueAsObservable(0);

      return null;
    };

    const container = document.createElement('div');

    preactRender(h(Owner, {}), container);

    assert.isFalse(mut_captured.observable?.isCompleted ?? true);

    preactRender(null, container);

    assert.isTrue(mut_captured.observable?.isCompleted ?? false);
  });

  test('emits the initial value once', () => {
    const mut_seen: number[] = [];

    // A child's effects run before its parent's, so the child subscribes before
    // the parent's hook has run any effect of its own.
    const Child = ({
      value$,
    }: Readonly<{ value$: Observable<number> }>): null => {
      Preact.useEffect(() => {
        const { unsubscribe } = value$.subscribe((v) => {
          mut_seen.push(v);
        });

        return unsubscribe;
      }, [value$]);

      return null;
    };

    const Parent = (): JSX.Element =>
      h(Child, { value$: useValueAsObservable(1) });

    render(h(Parent, {}));

    assert.deepStrictEqual(mut_seen, [1]);
  });
});
