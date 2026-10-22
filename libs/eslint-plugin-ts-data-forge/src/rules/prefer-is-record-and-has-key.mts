import { createPreferIsRecordAndHasKey } from 'eslint-rule-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

export const preferIsRecordAndHasKey = createPreferIsRecordAndHasKey({
  moduleName: TS_DATA_FORGE_MODULE,
});
