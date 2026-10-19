import { createState, isObservable } from 'synstate';
import { expectType } from 'ts-data-forge';
import { constant } from './constant.mjs';
import { toObservable } from './to-observable.mjs';
import { view } from './view.mjs';

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

  test('a view becomes the source mapped by its function', () => {
    const [count$, setCount] = createState(1);

    const result$ = toObservable(view(count$, (n) => n > 1));

    expectType<ReturnType<typeof result$.getSnapshot>['value'], boolean>('<=');

    assert.isFalse(result$.getSnapshot().value);

    setCount(2);

    assert.isTrue(result$.getSnapshot().value);
  });
});
