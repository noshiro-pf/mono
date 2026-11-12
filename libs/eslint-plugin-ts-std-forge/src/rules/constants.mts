export const TS_STD_FORGE_MODULE = 'ts-std-forge';

/** The package that re-exports {@link SHARED_EXPORTS} of ts-std-forge. */
export const TS_DATA_FORGE_MODULE = 'ts-data-forge';

// The same list as eslint-plugin-ts-data-forge's, kept here rather than shared:
// a published plugin's code imports nothing from the other plugin, and each
// copy is checked against the packages by its own global setup.
/**
 * The exports ts-data-forge re-exports from ts-std-forge: the same declarations
 * under the same names, so that `import { isRecord } from 'ts-data-forge'` is as
 * good as the ts-std-forge import, and every rule reads and writes them through
 * either. `configs/shared-exports.global-setup.mts` holds it to what the two
 * packages export, once per test run.
 */
export const SHARED_EXPORTS = [
  'AsyncData',
  'AsyncErr',
  'AsyncIdle',
  'AsyncPending',
  'AsyncResult',
  'Err',
  'HasKeyReturnType',
  'None',
  'Ok',
  'Optional',
  'PanicError',
  'Pipe',
  'Result',
  'Some',
  'TernaryErr',
  'TernaryOk',
  'TernaryResult',
  'TernaryWarn',
  'UnknownAsyncData',
  'UnknownOptional',
  'UnknownResult',
  'UnknownTernaryResult',
  'createPanicError',
  'expectType',
  'hasKey',
  'isMutableRecord',
  'isNonNullObject',
  'isPanicError',
  'isRecord',
  'keyIsIn',
  'match',
  'pipe',
  'unknownToString',
] as const;

/**
 * The module whose imports of {@link SHARED_EXPORTS} a fix reuses as its own
 * (`EquivalentModule` of eslint-rule-forge).
 */
export const EQUIVALENT_MODULES = [
  { moduleName: TS_DATA_FORGE_MODULE, exportNames: SHARED_EXPORTS },
] as const;
