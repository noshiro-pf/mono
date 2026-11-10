import { createPreferSafeParseInt } from 'eslint-rule-forge';
import { EQUIVALENT_MODULES, TS_DATA_FORGE_MODULE } from './constants.mjs';

export const preferNumSafeParseInt = createPreferSafeParseInt({
  moduleName: TS_DATA_FORGE_MODULE,
  equivalentModules: EQUIVALENT_MODULES,
  namespace: 'Num',
  method: 'safeParseInt',
});
