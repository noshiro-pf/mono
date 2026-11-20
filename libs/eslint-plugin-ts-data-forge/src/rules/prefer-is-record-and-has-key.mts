import { createPreferIsRecordAndHasKey } from 'eslint-rule-forge';
import {
  EQUIVALENT_MODULES,
  NAMESPACE_SUBPATHS,
  TS_DATA_FORGE_MODULE,
} from './constants.mjs';

export const preferIsRecordAndHasKey = createPreferIsRecordAndHasKey({
  moduleName: TS_DATA_FORGE_MODULE,
  equivalentModules: EQUIVALENT_MODULES,
  namespaceSubpaths: NAMESPACE_SUBPATHS,
});
