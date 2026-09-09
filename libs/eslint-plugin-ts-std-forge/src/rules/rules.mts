import { type ESLintPlugin } from '../types.mjs';
import { preferIsNonNullObject } from './prefer-is-non-null-object.mjs';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';
import { preferSafeArrayIsArray } from './prefer-safe-array-is-array.mjs';
import { preferSafeArrayLengthGuard } from './prefer-safe-array-length-guard.mjs';
import { preferSafeNumberParseInteger } from './prefer-safe-number-parse-integer.mjs';
import { preferSafeNumberParse } from './prefer-safe-number-parse.mjs';

export const tsStdForgeRules = {
  'prefer-is-non-null-object': preferIsNonNullObject,
  'prefer-is-record-and-has-key': preferIsRecordAndHasKey,
  'prefer-safe-array-is-array': preferSafeArrayIsArray,
  'prefer-safe-array-length-guard': preferSafeArrayLengthGuard,
  'prefer-safe-number-parse': preferSafeNumberParse,
  'prefer-safe-number-parse-integer': preferSafeNumberParseInteger,
} as const satisfies ESLintPlugin['rules'];
