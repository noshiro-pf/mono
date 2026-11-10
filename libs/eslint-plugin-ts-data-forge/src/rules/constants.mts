import * as ts from 'typescript';

export const TS_DATA_FORGE_MODULE = 'ts-data-forge';

/** Where the algebraic data types ts-data-forge re-exports are defined. */
export const TS_STD_FORGE_MODULE = 'ts-std-forge';

/**
 * The exports ts-data-forge re-exports from ts-std-forge: the same declarations
 * under the same names, so that `import { isRecord } from 'ts-std-forge'` is as
 * good as the ts-data-forge import, and every rule reads and writes them through
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

/** The type flags of every primitive type but `void`. */
export const primitiveTypeFlags =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.ESSymbolLike |
  ts.TypeFlags.Null |
  ts.TypeFlags.Undefined;

/**
 * The module whose imports of {@link SHARED_EXPORTS} a fix reuses as its own
 * (`EquivalentModule` of eslint-rule-forge).
 */
export const EQUIVALENT_MODULES = [
  { moduleName: TS_STD_FORGE_MODULE, exportNames: SHARED_EXPORTS },
] as const;
