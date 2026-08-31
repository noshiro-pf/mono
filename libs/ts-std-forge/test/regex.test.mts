import { Result } from 'ts-data-forge';
import { Regex } from '../src/index.mjs';

describe('Regex.create', () => {
  test('returns Ok with a working RegExp for a valid pattern', () => {
    const result = Regex.create('^a+$', 'u');

    assert.isTrue(Result.isOk(result));

    assert.isTrue(result.value.test('aaa'));

    assert.isFalse(result.value.test('b'));
  });

  test('returns a tagged Err with the SyntaxError as cause for an invalid pattern', () => {
    const result = Regex.create('(');

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.kind, 'invalid-regexp');

    // Pattern validity is the engine's own grammar check, so it is not
    // pre-validated. Classification is conservative: only a caught
    // SyntaxError (the spec-mandated type for parse failures) is labeled
    // 'invalid-regexp'; any other throw would fall back to 'unexpected'.
    assert.deepStrictEqual(result.value.cause.name, 'SyntaxError');
  });

  test('returns a tagged Err for invalid flags', () => {
    const result = Regex.create('a', 'not-a-flag');

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.kind, 'invalid-regexp');
  });
});
