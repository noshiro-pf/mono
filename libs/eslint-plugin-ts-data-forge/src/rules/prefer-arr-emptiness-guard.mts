import { createPreferEmptinessGuard } from 'eslint-rule-forge';
import { isPartOfBoundedLengthCheck } from './ast-utils.mjs';
import { EQUIVALENT_MODULES, TS_DATA_FORGE_MODULE } from './constants.mjs';

/**
 * The emptiness half of `prefer-canonical-length-guard`: `xs.length > 0`,
 * `xs.length === 0` and the like become `Arr.isNonEmpty(xs)` / `Arr.isEmpty(xs)`
 * directly. ts-std-forge's `prefer-safe-array-length-guard` is the same factory
 * writing `SafeArray`. A comparison that is half of a range
 * (`xs.length >= 1 && xs.length <= 3`) is left to
 * `prefer-arr-is-bounded-length-array`.
 */
export const preferArrEmptinessGuard = createPreferEmptinessGuard({
  moduleName: TS_DATA_FORGE_MODULE,
  namespace: 'Arr',
  equivalentModules: EQUIVALENT_MODULES,
  isHandledElsewhere: isPartOfBoundedLengthCheck,
});
