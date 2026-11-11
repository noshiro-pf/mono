import { createPreferEmptinessGuard } from 'eslint-rule-forge';
import { EQUIVALENT_MODULES, TS_STD_FORGE_MODULE } from './constants.mjs';

/**
 * Only the emptiness checks, because only these two guards exist: ts-data-forge
 * answers `xs.length >= n` for an arbitrary `n` with `Arr.isMinLengthArray` and
 * the rest of the branded length family, which ts-std-forge deliberately has no
 * counterpart for (D-26 / D-39). ts-data-forge's `prefer-canonical-length-guard`
 * builds its emptiness half with the same factory.
 */
export const preferSafeArrayLengthGuard = createPreferEmptinessGuard({
  moduleName: TS_STD_FORGE_MODULE,
  namespace: 'SafeArray',
  equivalentModules: EQUIVALENT_MODULES,
});
