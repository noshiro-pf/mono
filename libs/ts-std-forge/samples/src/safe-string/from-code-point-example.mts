// Example: src/safe-string/from-code-point.mts (SafeString.fromCodePoint)
import { Result, SafeString } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = SafeString.fromCodePoint(0x61, 0x1f600);

    assert.isTrue(Result.isOk(okResult));

    const errResult = SafeString.fromCodePoint(0x110000);

    assert.isTrue(Result.isErr(errResult));

    assert.deepStrictEqual(errResult.value, {
      kind: 'invalid-code-point',
      codePoint: 0x110000,
      index: 0,
    });

    // embed-sample-code-ignore-below
  });
}
