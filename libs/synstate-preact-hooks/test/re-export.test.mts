import { expectType } from 'ts-data-forge';
import {
  derive,
  source,
  withInitialValue,
  type InitializedObservable,
  type Observable,
  type Subscription,
} from '../src/index.mjs';

describe('re-exports of synstate', () => {
  test('include its types as well as its functions', () => {
    const count = source<number>().pipe(withInitialValue(1));

    const doubled = derive([count], (n) => n * 2);

    const subscription = doubled.subscribe(() => {});

    expectType<typeof doubled, InitializedObservable<number>>('<=');

    expectType<typeof doubled, Observable<number>>('<=');

    expectType<typeof subscription, Subscription>('=');

    assert.strictEqual(doubled.getSnapshot().value, 2);

    subscription.unsubscribe();
  });
});
