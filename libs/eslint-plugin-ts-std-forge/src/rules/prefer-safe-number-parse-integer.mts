import { createPreferSafeParseInt } from 'eslint-rule-forge';
import { TS_STD_FORGE_MODULE } from './constants.mjs';

export const preferSafeNumberParseInteger = createPreferSafeParseInt({
  moduleName: TS_STD_FORGE_MODULE,
  namespace: 'SafeNumber',
  method: 'parseInteger',
});
