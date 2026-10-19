import { createState, isObservable } from 'synstate';
import { expectType } from 'ts-data-forge';
import type { Bindable } from './bindable.mjs';
import { constant } from './constant.mjs';
import { derive } from './derive.mjs';
import { toObservable } from './to-observable.mjs';
import { view } from './view.mjs';

describe(derive, () => {
  test('constants only give a constant without creating a node', () => {
    const fn = vi.fn((a: number, b: string) => `${b}${a}`);

    const result = derive([constant(1), constant('x')], fn);

    expectType<typeof result, Bindable<string>>('=');

    assert.isFalse(isObservable(result));

    assert.strictEqual<unknown>(result, 'x1');

    expect(fn).toHaveBeenCalledExactlyOnceWith(1, 'x');
  });

  test('passes each value with its own type', () => {
    const [count$] = createState(0);

    derive([count$, constant('a'), view(count$, (n) => n > 0)], (n, s, b) => {
      expectType<typeof n, number>('=');

      expectType<typeof s, 'a'>('=');

      expectType<typeof b, boolean>('=');

      return 0;
    });

    assert.isTrue(true);
  });

  test('observables, constants and views are combined', () => {
    const [count$, setCount] = createState(1);

    const [label$, setLabel] = createState('a');

    const result = derive(
      [count$, constant('-'), view(label$, (s) => s.toUpperCase())],
      (n, sep, label) => `${n}${sep}${label}`,
    );

    assert.isTrue(isObservable(result));

    const result$ = toObservable(result);

    assert.strictEqual(result$.getSnapshot().value, '1-A');

    setCount(2);

    assert.strictEqual(result$.getSnapshot().value, '2-A');

    setLabel('b');

    assert.strictEqual(result$.getSnapshot().value, '2-B');
  });
});
