// Example: src/safe-date/to-iso-string.mts (SafeDate.toISOString)
import { Result, SafeDate } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = SafeDate.toISOString(new Date(0));

    assert.isTrue(Result.isOk(okResult));

    const errResult = SafeDate.toISOString(new Date(Number.NaN));

    assert.isTrue(Result.isErr(errResult));

    assert.deepStrictEqual(errResult.value, { kind: 'invalid-date' });

    // embed-sample-code-ignore-below
  });
}
