import { Arr, isBoolean } from 'ts-data-forge';
import { type JSONSchema4 } from '../type.mjs';

/**
 * no-restricted-* 系ルールの tuple 形式のスキーマに minItems を追加し、空配列を許容しないようにする
 */
export const enforceMinItemsForRestrictedTuple = (
  schema: JSONSchema4,
): JSONSchema4 => {
  if (schema.anyOf === undefined || !Arr.isArray(schema.anyOf)) {
    return schema;
  }

  const updatedAnyOf = schema.anyOf.map((option, index) => {
    if (index !== 1 || isBoolean(option) || Arr.isArray(option)) {
      return option;
    }

    const { items, minItems } = option;

    if (!Arr.isArray(items) || items.length !== 1) {
      return option;
    }

    const [firstItem] = items;

    return {
      ...option,
      minItems: minItems ?? 1,
      items: [firstItem],
    };
  });

  return {
    ...schema,
    anyOf: updatedAnyOf,
  };
};
