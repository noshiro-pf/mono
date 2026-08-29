import { Result } from 'ts-data-forge';
import { Regex } from '../src/index.mjs';

describe('Regex.create', () => {
  test('returns Ok with a working RegExp for a valid pattern', () => {
    const result = Regex.create('^a+$', 'u');

    assert.isTrue(Result.isOk(result));

    assert.isTrue(result.value.test('aaa'));

    assert.isFalse(result.value.test('b'));
  });

  test('returns Err for an invalid pattern', () => {
    const result = Regex.create('(');

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(result.value.name, 'SyntaxError');
  });

  test('returns Err for invalid flags', () => {
    const result = Regex.create('a', 'not-a-flag');

    assert.isTrue(Result.isErr(result));
  });
});
