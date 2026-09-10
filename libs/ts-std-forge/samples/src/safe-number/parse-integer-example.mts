// Example: src/safe-number/parse-integer.mts (SafeNumber.parseInteger)
import { Result, SafeNumber } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = SafeNumber.parseInteger('-12.9');

    assert.isTrue(Result.isOk(okResult));

    assert.deepStrictEqual(okResult.value, -12);

    const errResult = SafeNumber.parseInteger('123abc');

    assert.isTrue(Result.isErr(errResult));

    assert.deepStrictEqual(errResult.value, {
      kind: 'invalid-integer',
      input: '123abc',
    });

    // embed-sample-code-ignore-below
  });
}
