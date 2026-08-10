import { type JSONSchema4 } from '../type.mjs';
import { normalizeArrayItemsProperties } from './normalize-array-items.mjs';

/**
 * no-keyword-prefix の disallowedPrefixes が tuple 形式で出力されるのを防ぎ、`readonly string[]` を生成させる
 */
export const normalizeNoKeywordPrefixSchema = (
  schema: JSONSchema4,
): JSONSchema4 => normalizeArrayItemsProperties(schema, ['disallowedPrefixes']);
