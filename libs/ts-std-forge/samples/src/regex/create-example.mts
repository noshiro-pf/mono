// Example: src/regex/create.mts (Regex.create)
import { Regex, Result } from 'ts-std-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    const okResult = Regex.create('^a+$', 'u');

    assert.isTrue(Result.isOk(okResult));

    const errResult = Regex.create('(');

    assert.isTrue(Result.isErr(errResult));

    assert.deepStrictEqual(errResult.value.kind, 'invalid-regexp');

    // embed-sample-code-ignore-below
  });
}
