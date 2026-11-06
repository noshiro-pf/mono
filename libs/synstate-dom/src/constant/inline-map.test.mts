import { createState } from 'synstate';
import { expectType } from 'ts-data-forge';
import { isInlineMap } from '../internal/index.mjs';
import type { Bindable, ElementBindable } from './bindable.mjs';
import { inlineMap, type InlineMap } from './inline-map.mjs';

const fn = (n: number): string => `${n} items` as const;

describe(inlineMap, () => {
  test('opens to the source and the function it was made from', () => {
    const [count$] = createState(2);

    const v = inlineMap(count$, fn);

    expectType<typeof v, InlineMap<string>>('=');

    v.open((source, f) => {
      assert.strictEqual<unknown>(source, count$);

      assert.strictEqual<unknown>(f, fn);
    });
  });

  test('ties the function parameter to the source value type', () => {
    const [count$] = createState(0);

    // @ts-expect-error a `string` parameter does not take the `number` values of `count$`
    inlineMap(count$, (s: string) => s.length);

    assert.isTrue(true);
  });

  test('is accepted where an ElementBindable is, and not where a Bindable is', () => {
    const [count$] = createState(0);

    const b: ElementBindable<boolean> = inlineMap(count$, (n) => n === 0);

    // @ts-expect-error a component's prop and the Bindable helpers never take an inline map
    const _c: Bindable<boolean> = inlineMap(count$, (n) => n === 0);

    assert.isTrue(isInlineMap(b));
  });
});
