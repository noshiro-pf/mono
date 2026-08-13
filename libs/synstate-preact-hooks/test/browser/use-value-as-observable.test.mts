import { renderHook } from '@testing-library/preact';
import { type Observable } from 'synstate';
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

    unmount();

    assert.isTrue(observable$.isCompleted);
  });
});
