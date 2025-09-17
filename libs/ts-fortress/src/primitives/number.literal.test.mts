import { expectType, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { numberLiteral } from './number.mjs';

describe('numberLiteral', () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const five = numberLiteral(5);
  expectType<typeof five, Type<5>>('=');

  test('is/validate/fill', () => {
    expect(five.is(5)).toBe(true);
    expect(five.is(6)).toBe(false);
    expect(Result.isOk(five.validate(5))).toBe(true);
    const res = five.validate('5');
    expect(Result.isErr(res)).toBe(true);
    const resError = Result.unwrapErrThrow(res);
    expect(validationErrorsToMessages(resError)).toStrictEqual([
      'Expected <numberLiteral(5)>, got <string> type value "5".',
    ]);
    expect(five.fill(6)).toBe(5);
  });
});
