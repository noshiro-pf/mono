import { skipBrowserEvaluatedFunctions } from 'eslint-rule-forge';
import type { ESLintPlugin } from '../types.mjs';
import { preferIsNonNullObject } from './prefer-is-non-null-object.mjs';
import { preferIsRecordAndHasKey } from './prefer-is-record-and-has-key.mjs';
import { preferSafeArrayIsArray } from './prefer-safe-array-is-array.mjs';
import { preferSafeArrayLengthGuard } from './prefer-safe-array-length-guard.mjs';
import { preferSafeNumberParseInteger } from './prefer-safe-number-parse-integer.mjs';
import { preferSafeNumberParse } from './prefer-safe-number-parse.mjs';

// Every rule leaves alone the functions Playwright and Puppeteer run in the
// page (`page.evaluate(() => …)`), where nothing the file imports exists.
export const tsStdForgeRules = {
  'prefer-is-non-null-object': skipBrowserEvaluatedFunctions(
    preferIsNonNullObject,
  ),
  'prefer-is-record-and-has-key': skipBrowserEvaluatedFunctions(
    preferIsRecordAndHasKey,
  ),
  'prefer-safe-array-is-array': skipBrowserEvaluatedFunctions(
    preferSafeArrayIsArray,
  ),
  'prefer-safe-array-length-guard': skipBrowserEvaluatedFunctions(
    preferSafeArrayLengthGuard,
  ),
  'prefer-safe-number-parse': skipBrowserEvaluatedFunctions(
    preferSafeNumberParse,
  ),
  'prefer-safe-number-parse-integer': skipBrowserEvaluatedFunctions(
    preferSafeNumberParseInteger,
  ),
} as const satisfies ESLintPlugin['rules'];
