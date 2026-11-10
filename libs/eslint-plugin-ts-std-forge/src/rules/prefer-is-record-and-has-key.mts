import { createPreferIsRecordAndHasKey } from 'eslint-rule-forge';
import { EQUIVALENT_MODULES, TS_STD_FORGE_MODULE } from './constants.mjs';

export const preferIsRecordAndHasKey = createPreferIsRecordAndHasKey({
  moduleName: TS_STD_FORGE_MODULE,
  equivalentModules: EQUIVALENT_MODULES,
});
