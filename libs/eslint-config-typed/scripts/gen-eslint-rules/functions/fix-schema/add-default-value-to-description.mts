import { type MutableRecord } from 'ts-type-forge';
import { type JSONSchema4 } from '../type.mjs';

/**
 * スキーマのプロパティに default 値がある場合、description に default 値を追加する。
 * json-schema-to-typescript は description を JSDoc コメントとして出力する
 */
export const addDefaultValuesToDescription = (
  schema: JSONSchema4,
): JSONSchema4 => {
  if (schema.properties === undefined) {
    return schema;
  }

  const mut_newProperties: MutableRecord<string, JSONSchema4> = {};

  for (const [key, propSchema] of Object.entries(schema.properties)) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (propSchema === undefined) {
      continue;
    }

    const prop = propSchema;

    if (prop.default !== undefined) {
      // Note: `JSON.stringify` already renders an empty array as `[]`.
      const defaultValue =
        typeof prop.default === 'string'
          ? (`"${prop.default}"` as const)
          : JSON.stringify(prop.default);

      const existingDescription =
        prop.description !== undefined
          ? (`${prop.description}\n\n` as const)
          : '';

      mut_newProperties[key] = {
        ...prop,
        description: `${existingDescription}@default ${defaultValue}`,
      };
    } else {
      mut_newProperties[key] = prop;
    }
  }

  return {
    ...schema,
    properties: mut_newProperties,
  };
};
