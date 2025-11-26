import { Arr, isBoolean } from 'ts-data-forge';
import { type JSONSchema4 } from '../type.mjs';

/**
 * object-shorthand の options でオブジェクト付きの tuple が 2 要素になるように minItems を補完する
 */
export const enforceObjectShorthandTupleLength = (
  schema: JSONSchema4,
): JSONSchema4 => {
  if (schema.anyOf === undefined || !Arr.isArray(schema.anyOf)) {
    return schema;
  }

  const updatedAnyOf = schema.anyOf.map((option, index) => {
    if (isBoolean(option) || Arr.isArray(option)) {
      return option;
    }

    if (
      index === 0 ||
      !Arr.isArray(option.items) ||
      option.items.length !== 2
    ) {
      return option;
    }

    return {
      ...option,
      minItems: 2,
    };
  });

  return {
    ...schema,
    anyOf: updatedAnyOf,
  };
};
