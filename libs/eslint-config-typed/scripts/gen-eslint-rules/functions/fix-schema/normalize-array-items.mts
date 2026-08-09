import { Arr } from 'ts-data-forge';
import { type MutableRecord } from 'ts-type-forge';
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

  const mut_properties: MutableRecord<string, JSONSchema4> = {};

  for (const [key, property] of Object.entries(schema.properties)) {
    if (
      propertyNames.includes(key) &&
      property.items !== undefined &&
      Arr.isArray(property.items) &&
      Arr.isFixedLengthArray(1, property.items)
    ) {
      const [firstItem] = property.items;

      mut_hasChanges = true;

      mut_properties[key] = {
        ...property,
        items: firstItem,
      };

      continue;
    }

    mut_properties[key] = property;
  }

  if (!mut_hasChanges) {
    return schema;
  }

  return {
    ...schema,
    properties: mut_properties,
  };
};
