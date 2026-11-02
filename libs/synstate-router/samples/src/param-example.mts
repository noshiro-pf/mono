import { param } from 'synstate-router';
import { asSafeInt, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('param', () => {
    // embed-sample-code-ignore-above

    assert.deepStrictEqual(
      param.int.decode('42'),
      Optional.some(asSafeInt(42)),
    );

    // Only the canonical form matches, so each integer has one URL.
    assert.deepStrictEqual(param.int.decode('042'), Optional.none);

    const env = param.literal('live', 'sandbox');

    assert.deepStrictEqual(env.decode('staging'), Optional.none);

    // embed-sample-code-ignore-below
  });
}
