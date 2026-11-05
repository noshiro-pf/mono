import { createState, isObservable } from 'synstate';
import { constant } from './constant.mjs';
import { toObservable } from './to-observable.mjs';

describe(toObservable, () => {
  test('a constant becomes a completed observable holding it', () => {
    const result$ = toObservable(constant('a'));

    assert.isTrue(isObservable(result$));

    assert.isTrue(result$.isCompleted);

    assert.strictEqual(result$.getSnapshot().value, 'a');
  });

  test('an observable is returned as is', () => {
    const [count$] = createState(0);

    assert.strictEqual(toObservable(count$), count$);
  });
});
