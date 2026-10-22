import { createPreferIsRecordAndHasKey } from 'eslint-plugin-ts-std-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

/**
 * Implemented in eslint-plugin-ts-std-forge, like the `isRecord` and `hasKey`
 * that ts-data-forge re-exports; this one points at ts-data-forge.
 */
export const preferIsRecordAndHasKey =
  createPreferIsRecordAndHasKey(TS_DATA_FORGE_MODULE);
