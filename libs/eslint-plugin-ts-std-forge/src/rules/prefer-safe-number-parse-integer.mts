import { createPreferSafeParseInt } from 'eslint-rule-forge';
import { EQUIVALENT_MODULES, TS_STD_FORGE_MODULE } from './constants.mjs';

export const preferSafeNumberParseInteger = createPreferSafeParseInt({
  moduleName: TS_STD_FORGE_MODULE,
  equivalentModules: EQUIVALENT_MODULES,
  namespace: 'SafeNumber',
  method: 'parseInteger',
});
