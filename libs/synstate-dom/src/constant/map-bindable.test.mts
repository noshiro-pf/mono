import { createState, isObservable } from 'synstate';
import { expectType } from 'ts-data-forge';
import { isView } from '../internal/index.mjs';
import type { Bindable } from './bindable.mjs';
import { constant } from './constant.mjs';
import { mapBindable } from './map-bindable.mjs';
import { toObservable } from './to-observable.mjs';
import { view } from './view.mjs';

describe(mapBindable, () => {
  test('a constant gives a constant without creating a node', () => {
    const fn = vi.fn((n: number) => n * 2);

    const result = mapBindable(constant(3), fn);

    expectType<typeof result, Bindable<number>>('=');

    assert.isFalse(isObservable(result));

    assert.isFalse(isView(result));

    assert.strictEqual<unknown>(result, 6);

    expect(fn).toHaveBeenCalledExactlyOnceWith(3);
  });

  test('a view gives a view with the functions composed', () => {
    const [count$, setCount] = createState(1);

    const result = mapBindable(
      view(count$, (n) => n + 1),
      String,
    );

    assert.isTrue(isView(result));

    assert.isFalse(isObservable(result));

    const result$ = toObservable(result);

    assert.strictEqual(result$.getSnapshot().value, '2');

    setCount(5);

    assert.strictEqual(result$.getSnapshot().value, '6');
  });

  test('an observable gives a mapped observable', () => {
    const [count$, setCount] = createState(1);

    const result = mapBindable(count$, (n) => n * 10);

    assert.isTrue(isObservable(result));

    const result$ = toObservable(result);

    assert.strictEqual(result$.getSnapshot().value, 10);

    setCount(2);

    assert.strictEqual(result$.getSnapshot().value, 20);
  });
});
