import { createPreferSafeParseInt } from 'eslint-rule-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

export const preferNumSafeParseInt = createPreferSafeParseInt({
  moduleName: TS_DATA_FORGE_MODULE,
  namespace: 'Num',
  method: 'safeParseInt',
});
