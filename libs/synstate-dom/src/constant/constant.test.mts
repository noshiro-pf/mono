import { createState } from 'synstate';
import { expectType } from 'ts-data-forge';
import type { Bindable } from './bindable.mjs';
import { constant, type Constant } from './constant.mjs';

describe(constant, () => {
  test('returns the value unchanged', () => {
    const value = { a: 1 } as const;

    assert.strictEqual(constant(value), value);

    assert.strictEqual(constant('btn'), 'btn');
  });

  test('keeps the literal type', () => {
    const c = constant('btn');

    expectType<typeof c, Constant<'btn'>>('=');

    assert.strictEqual<unknown>(c, 'btn');
  });

  test('a constant can be read as its value', () => {
    const n: number = constant(1);

    assert.strictEqual(n, 1);
  });

  test('rejects null, undefined and observables', () => {
    const [count$] = createState(0);

    // @ts-expect-error null is not a constant: omit the prop instead
    constant(null);

    // @ts-expect-error undefined is not a constant: omit the prop instead
    constant(undefined);

    // @ts-expect-error wrapping an observable would bind it once
    constant(count$);

    const maybe = Math.random() > 2 ? 'a' : undefined;

    // @ts-expect-error a value that may be undefined is an observable of `T | undefined`
    constant(maybe);

    assert.isTrue(true);
  });

  test('a plain value is not a Bindable', () => {
    const [count$] = createState(0);

    // @ts-expect-error a plain value would be written once and never updated
    const plain: Bindable<string> = 'btn';

    // @ts-expect-error the snapshot is read once
    const snapshot: Bindable<number> = count$.getSnapshot().value;

    const fromConstant: Bindable<string> = constant('btn');

    const fromObservable: Bindable<number> = count$;

    assert.strictEqual<unknown>(plain, 'btn');

    assert.strictEqual<unknown>(snapshot, 0);

    assert.strictEqual<unknown>(fromConstant, 'btn');

    assert.strictEqual(fromObservable, count$);
  });
});
