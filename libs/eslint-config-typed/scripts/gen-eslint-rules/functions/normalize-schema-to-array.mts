import { Arr } from 'ts-data-forge';
import { type JSONSchema4 } from './type.mjs';

/**
 * スキーマを配列形式に正規化する。プラグイン間の型不整合を吸収する
 */
export const normalizeSchemaToArray = (
  schema: JSONSchema4 | readonly JSONSchema4[] | undefined,
): readonly JSONSchema4[] =>
  // Some plugins violate the JSONSchema4 | JSONSchema4[] | undefined contract, so absorb that inconsistency here.
  typeof schema !== 'object'
    ? ([] as const)
    : Arr.isArray(schema)
      ? schema
      : ([schema] as const);
