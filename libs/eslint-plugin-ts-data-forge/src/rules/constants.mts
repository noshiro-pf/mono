import * as ts from 'typescript';

export const TS_DATA_FORGE_MODULE = 'ts-data-forge';

/** Where the algebraic data types ts-data-forge re-exports are defined. */
export const TS_STD_FORGE_MODULE = 'ts-std-forge';

/** The type flags of every primitive type but `void`. */
export const primitiveTypeFlags =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.ESSymbolLike |
  ts.TypeFlags.Null |
  ts.TypeFlags.Undefined;
