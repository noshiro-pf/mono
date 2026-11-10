import {
  createState,
  filter,
  map,
  type InitializedObservable,
  type Observable,
} from 'synstate-next';
import { expectType } from 'ts-data-forge';
import { Optional } from 'ts-std-forge';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('pipe', () => {
    // embed-sample-code-ignore-above
    const [count, setCount] = createState(1);

    // `map` keeps the value held at the start: the result always holds one.
    const doubled = count.pipe(map((n) => n * 2));

    expectType<typeof doubled, InitializedObservable<number>>('=');

    // `filter` may drop it: the result may hold none.
    const even = count.pipe(filter((n) => n % 2 === 0));

    expectType<typeof even, Observable<number>>('=');

    assert.strictEqual(doubled.value, 2);

    assert.isFalse(even.hasValue);

    setCount(4);

    assert.strictEqual(doubled.value, 8);

    assert.deepStrictEqual(even.getSnapshot(), Optional.some(4));

    // embed-sample-code-ignore-below
  });
}
