import { Arr, isBoolean } from 'ts-data-forge';
import { type JSONSchema4 } from '../type.mjs';

/**
 * react/jsx-boolean-value のスキーマから重複した union を排除するために、空配列専用のパターンと 1 要素以上のパターンを明示する
 */
export const normalizeJsxBooleanValueSchema = (
  schema: JSONSchema4,
): JSONSchema4 => {
  if (schema.anyOf === undefined || !Arr.isArray(schema.anyOf)) {
    return schema;
  }

  const updatedAnyOf = schema.anyOf.map((option, index) => {
    if (isBoolean(option) || Arr.isArray(option)) {
      return option;
    }

    if (index === 0) {
      return {
        ...option,
        items: [],
        minItems: 0,
        maxItems: 0,
      };
    }

    return {
      ...option,
      minItems: option.minItems ?? 1,
    };
  });

  return {
    ...schema,
    anyOf: updatedAnyOf,
  };
};
