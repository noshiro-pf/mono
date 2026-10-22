import { createPreferArrayIsArray } from 'eslint-rule-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

export const preferArrIsArray = createPreferArrayIsArray({
  moduleName: TS_DATA_FORGE_MODULE,
  namespace: 'Arr',
});
