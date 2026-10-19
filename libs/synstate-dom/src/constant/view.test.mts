import { createState } from 'synstate';
import { expectType } from 'ts-data-forge';
import { isView } from '../internal/index.mjs';
import type { Bindable } from './bindable.mjs';
import { view, type View } from './view.mjs';

const fn = (n: number): string => `${n} items` as const;

describe(view, () => {
  test('opens to the source and the function it was made from', () => {
    const [count$] = createState(2);

    const v = view(count$, fn);

    expectType<typeof v, View<string>>('=');

    v.open((source, f) => {
      assert.strictEqual<unknown>(source, count$);

      assert.strictEqual<unknown>(f, fn);
    });
  });

  test('ties the function parameter to the source value type', () => {
    const [count$] = createState(0);

    // @ts-expect-error a `string` parameter does not take the `number` values of `count$`
    view(count$, (s: string) => s.length);

    assert.isTrue(true);
  });

  test('is accepted where a Bindable is', () => {
    const [count$] = createState(0);

    const b: Bindable<boolean> = view(count$, (n) => n === 0);

    assert.isTrue(isView(b));
  });
});
