// Example: src/object/object.mts (filter)
import { Obj, isString } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const scores = { alice: 1, bob: 2 } as const;

    const passing = Obj.filter(scores, (value) => value > 1);

    assert.deepStrictEqual(passing, { bob: 2 });

    // The key is available as the second argument.
    const notAlice = Obj.filter(scores, (_value, key) => key !== 'alice');

    assert.deepStrictEqual(notAlice, { bob: 2 });

    // A type guard narrows the value type of the result.
    const mixed: UnknownRecord = { a: 1, b: 'x' } as const;

    const strings = Obj.filter(mixed, isString);

    assert.deepStrictEqual(strings, { b: 'x' });

    // embed-sample-code-ignore-below
  });
}
