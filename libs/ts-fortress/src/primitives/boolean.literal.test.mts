import { expectType, Result } from 'ts-data-forge';
import { type Type } from '../type.mjs';
import { validationErrorsToMessages } from '../utils/index.mjs';
import { booleanLiteral } from './boolean.mjs';

describe('booleanLiteral', () => {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const T = booleanLiteral(true);
  expectType<typeof T, Type<true>>('=');

  test('is/validate/fill', () => {
    expect(T.is(true)).toBe(true);
    expect(T.is(false)).toBe(false);
    expect(Result.isOk(T.validate(true))).toBe(true);
    const res = T.validate(0);
    expect(Result.isErr(res)).toBe(true);
    if (Result.isErr(res)) {
      expect(validationErrorsToMessages(res.value)).toStrictEqual([
        'Expected <booleanLiteral(true)>, got <number> type value `0`.',
      ]);
    }
    expect(T.fill(false)).toBe(true);
  });
});
