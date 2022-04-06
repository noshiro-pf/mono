import { hasKeyValue, isNonNullObject, isString, Str } from '@noshiro/ts-utils';

export const assertIsCredentialError: (
  e: unknown
) => asserts e is { code: string; message: string } = (e) => {
  if (
    !(
      isNonNullObject(e) &&
      hasKeyValue(e, 'code', isString) &&
      hasKeyValue(e, 'message', isString)
    )
  ) {
    throw new Error(`object is not credential error type: ${Str.from(e)}`);
  }
};
