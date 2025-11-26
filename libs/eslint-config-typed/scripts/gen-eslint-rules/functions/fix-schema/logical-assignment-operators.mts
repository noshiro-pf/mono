import { type JSONSchema4 } from '../type.mjs';

/**
 * スキーマが `type: "array"` を持つ場合、それを除去して内容を正規化する。
 * これにより `& readonly unknown[]` という不要な型が生成されるのを防ぐ
 */
export const removeArrayTypeFromSchema = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.type === 'array') {
    const { type, ...rest } = schema;

    return rest as JSONSchema4;
  }

  return schema;
};
