import { expectType, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { stringLiteral } from './string.mjs';

describe('stringLiteral', () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const hello = stringLiteral('hello');
  expectType<typeof hello, Type<'hello'>>('=');

  test('is/validate/fill', () => {
    expect(hello.is('hello')).toBe(true);
    expect(hello.is('world')).toBe(false);
    expect(Result.isOk(hello.validate('hello'))).toBe(true);
    const res = hello.validate(1);
    expect(Result.isErr(res)).toBe(true);
    if (Result.isErr(res)) {
      expect(validationErrorsToMessages(res.value)).toStrictEqual([
        'Expected <stringLiteral("hello")>, got <number> type value `1`.',
      ]);
    }
    expect(hello.fill('world')).toBe('hello');
  });
});
