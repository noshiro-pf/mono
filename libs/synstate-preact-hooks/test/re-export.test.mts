import { expectType, Optional } from 'ts-data-forge';
import {
  derive,
  source,
  withInitialValue,
  type InitializedObservable,
  type Observable,
  type Unsubscribe,
} from '../src/index.mjs';

describe('re-exports of synstate', () => {
  test('include its types as well as its functions', () => {
    const count = source<number>().pipe(withInitialValue(1));

    const doubled = derive([count], (n) => n * 2);

    const unsubscribe = doubled.subscribe(() => {});

    expectType<typeof doubled, InitializedObservable<number>>('<=');

    expectType<typeof doubled, Observable<number>>('<=');

    expectType<typeof unsubscribe, Unsubscribe>('=');

    assert.strictEqual(Optional.unwrap(doubled.getSnapshot()), 2);

    unsubscribe();
  });
});
