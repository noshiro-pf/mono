import { expectType, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { bigintLiteral } from './bigint.mjs';

describe('bigintLiteral', () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const ten = bigintLiteral(10n);
  expectType<typeof ten, Type<10n>>('=');

  test('is/validate/fill', () => {
    expect(ten.is(10n)).toBe(true);
    expect(ten.is(11n)).toBe(false);
    expect(Result.isOk(ten.validate(10n))).toBe(true);
    const res = ten.validate('10');
    expect(Result.isErr(res)).toBe(true);
    const resError = Result.unwrapErrThrow(res);
    expect(validationErrorsToMessages(resError)).toStrictEqual([
      'Expected <bigintLiteral(10)>, got <string> type value "10".',
    ]);
    expect(ten.fill(11n)).toBe(10n);
  });
});
