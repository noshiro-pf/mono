import { createPreferSafeParseFloat } from 'eslint-rule-forge';
import { TS_STD_FORGE_MODULE } from './constants.mjs';

/**
 * The ts-data-forge rule of the same shape names `Num.safeParseFloat`, which
 * has delegated to `SafeNumber.parse` since the D-49 inversion and wraps the
 * result in a `FiniteNumber` brand. This one names the implementation, for
 * callers who do not want the brand or the extra dependency.
 */
export const preferSafeNumberParse = createPreferSafeParseFloat({
  moduleName: TS_STD_FORGE_MODULE,
  namespace: 'SafeNumber',
  method: 'parse',
});
