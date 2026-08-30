import { isRecord, isString, unknownToString } from 'ts-data-forge';
import { hasKeyValue } from '../utils-ported/index.mjs';

export const assertIsCredentialError: (
  e: unknown,
) => asserts e is Readonly<{ code: string; message: string }> = (e) => {
  if (!(
    isRecord(e) &&
    hasKeyValue(e, 'code', isString) &&
    hasKeyValue(e, 'message', isString)
  )) {
    throw new Error(
      `object is not credential error type: ${unknownToString(e)}`,
    );
  }
};
