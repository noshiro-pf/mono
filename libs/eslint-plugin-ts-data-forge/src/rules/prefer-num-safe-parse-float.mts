import { createPreferSafeParseFloat } from 'eslint-rule-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

export const preferNumSafeParseFloat = createPreferSafeParseFloat({
  moduleName: TS_DATA_FORGE_MODULE,
  namespace: 'Num',
  method: 'safeParseFloat',
});
