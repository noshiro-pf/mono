import { hasKeyValue, isNonNullObject, isString } from '@noshiro/ts-utils';

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
    throw new Error(`object is not credential error type: ${String(e)}`);
  }
};
