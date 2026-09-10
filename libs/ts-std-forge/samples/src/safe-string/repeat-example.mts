// cspell:ignore ababab
// Example: src/safe-string/repeat.mts (SafeString.repeat)
import { Result, SafeString } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = SafeString.repeat('ab', 3);

    assert.isTrue(Result.isOk(okResult));

    assert.deepStrictEqual(okResult.value, 'ababab');

    const errResult = SafeString.repeat('ab', -1);

    assert.isTrue(Result.isErr(errResult));

    assert.deepStrictEqual(errResult.value, {
      kind: 'invalid-count',
      count: -1,
    });

    // embed-sample-code-ignore-below
  });
}
