// Example: src/safe-number/parse.mts (SafeNumber.parse)
import { Result, SafeNumber } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = SafeNumber.parse(' 0x10 ');

    assert.isTrue(Result.isOk(okResult));

    assert.deepStrictEqual(okResult.value, 16);

    const errResult = SafeNumber.parse('12px');

    assert.isTrue(Result.isErr(errResult));

    assert.deepStrictEqual(errResult.value, {
      kind: 'invalid-number',
      input: '12px',
    });

    // embed-sample-code-ignore-below
  });
}
