import { type JSONSchema4 } from '../type.mjs';
import { normalizeArrayItemsProperties } from './normalize-array-items.mjs';

/**
 * jsx-pascal-case の ignore が tuple 形式で出力されるのを防ぎ、`readonly string[]` を生成させる
 */
export const normalizeJsxPascalCaseSchema = (
  schema: JSONSchema4,
): JSONSchema4 => normalizeArrayItemsProperties(schema, ['ignore']);
