import { createPreferArrayIsArray } from 'eslint-rule-forge';
import { TS_STD_FORGE_MODULE } from './constants.mjs';

export const preferSafeArrayIsArray = createPreferArrayIsArray({
  moduleName: TS_STD_FORGE_MODULE,
  namespace: 'SafeArray',
});
