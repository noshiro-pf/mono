import { type JSONSchema4 } from '../type.mjs';
import { normalizeArrayItemsProperties } from './normalize-array-items.mjs';

/**
 * `expect-expect` ルールの assertFunctionNames/assertFunctionPatterns が tuple 形式の items を持っているため、
 * json-schema-to-typescript が `readonly [] | readonly [string]` を生成してしまう問題を修正する。
 * items を単一のスキーマオブジェクトに変換し、`readonly string[]` を出力させる
 */
export const normalizeExpectExpectSchema = (schema: JSONSchema4): JSONSchema4 =>
  normalizeArrayItemsProperties(schema, [
    'assertFunctionNames',
    'assertFunctionPatterns',
  ]);
