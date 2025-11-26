import { hasKey } from 'ts-data-forge';
import { type JSONSchema4 } from '../type.mjs';

/**
 * booleanObject 定義の additionalProperties を具体的なプロパティに展開する。
 * import-style ルールの BooleanObject 型で使用
 */
export const expandBooleanObjectProperties = (
  schema: JSONSchema4,
): JSONSchema4 => {
  if (
    schema.definitions !== undefined &&
    hasKey(schema.definitions, 'booleanObject')
  ) {
    const booleanObjectDef = schema.definitions.booleanObject;

    if (
      typeof booleanObjectDef === 'object' &&
      booleanObjectDef.type === 'object' &&
      booleanObjectDef.additionalProperties !== undefined
    ) {
      const propertyKeys = ['default', 'named', 'namespace', 'unassigned'];

      const mut_properties: Record<string, JSONSchema4> = {};

      for (const key of propertyKeys) {
        mut_properties[key] =
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          booleanObjectDef.additionalProperties as JSONSchema4;
      }

      const mut_newDefinitions = {
        ...schema.definitions,
        booleanObject: {
          type: 'object',
          properties: mut_properties,
          additionalProperties: false,
        } as JSONSchema4,
      };

      return {
        ...schema,
        definitions: mut_newDefinitions,
      } as JSONSchema4;
    }
  }

  return schema;
};
