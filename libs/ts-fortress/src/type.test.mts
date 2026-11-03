import { number } from './primitives/index.mjs';
import { withStructure } from './type.mjs';

describe(withStructure, () => {
  test('keeps the members a type inherits through its prototype', () => {
    const base = number(0);

    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    const inherited = Object.create(base) as typeof base;

    const replaced = withStructure(inherited, { kind: 'unknown' });

    assert.strictEqual(Object.getPrototypeOf(replaced), base);

    assert.isTrue(replaced.is(1));

    assert.isFalse(replaced.is('a'));

    assert.deepStrictEqual(replaced.structure, { kind: 'unknown' });
  });

  test('leaves a lazy default unevaluated until it is read', () => {
    const computeDefault = vi.fn((): number => 7);

    const base = number(0);

    const lazy = Object.defineProperties(
      {},
      {
        ...Object.getOwnPropertyDescriptors(base),
        defaultValue: { get: computeDefault, enumerable: true },
      },
    );

    // @sumi-expect-error banned-syntax/no-unsafe-type-assertion
    const replaced = withStructure(lazy as typeof base, { kind: 'unknown' });

    expect(computeDefault).not.toHaveBeenCalled();

    assert.strictEqual(replaced.defaultValue, 7);
  });
});
