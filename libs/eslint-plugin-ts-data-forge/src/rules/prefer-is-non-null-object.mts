import { createPreferIsNonNullObject } from 'eslint-plugin-ts-std-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

/**
 * Implemented in eslint-plugin-ts-std-forge, like the `isNonNullObject` that
 * ts-data-forge re-exports; this one points at ts-data-forge.
 */
export const preferIsNonNullObject =
  createPreferIsNonNullObject(TS_DATA_FORGE_MODULE);
