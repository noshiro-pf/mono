// Example: src/safe-array/create.mts (SafeArray.create)
import { Result, SafeArray } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = SafeArray.create(3, 1);

    assert.isTrue(Result.isOk(okResult));

    assert.deepStrictEqual(okResult.value, [1, 1, 1]);

    const errResult = SafeArray.create(-1, 1);

    assert.isTrue(Result.isErr(errResult));

    assert.deepStrictEqual(errResult.value, {
      kind: 'invalid-length',
      length: -1,
    });

    // embed-sample-code-ignore-below
  });
}
