import { createPreferIsNonNullObject } from 'eslint-rule-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

export const preferIsNonNullObject = createPreferIsNonNullObject({
  moduleName: TS_DATA_FORGE_MODULE,
});
