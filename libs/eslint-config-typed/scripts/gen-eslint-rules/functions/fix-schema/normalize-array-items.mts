import { Arr } from 'ts-data-forge';
import { type JSONSchema4 } from '../type.mjs';

/**
 * 指定したプロパティで items が配列（tuple）として定義されている場合、単一スキーマに正規化する。
 * これにより json-schema-to-typescript が `readonly [] | readonly [T]` を生成するのを防ぎ、`readonly T[]` を出力させる
 */
export const normalizeArrayItemsProperties = (
  schema: JSONSchema4,
  propertyNames: readonly string[],
): JSONSchema4 => {
  if (schema.type !== 'object' || schema.properties === undefined) {
    return schema;
  }

  let mut_hasChanges = false;

  const mut_properties: Record<string, JSONSchema4> = {};

  for (const [key, property] of Object.entries(schema.properties)) {
    if (
      propertyNames.includes(key) &&
      property.items !== undefined &&
      Arr.isArray(property.items) &&
      property.items.length === 1
    ) {
      const [firstItem] = property.items;

      if (firstItem !== undefined) {
        mut_hasChanges = true;

        const { items, ...restProperty } = property;

        mut_properties[key] = {
          ...restProperty,
          items: firstItem,
        } as JSONSchema4;

        continue;
      }
    }

    mut_properties[key] = property;
  }

  if (!mut_hasChanges) {
    return schema;
  }

  return {
    ...schema,
    properties: mut_properties,
  } as JSONSchema4;
};
