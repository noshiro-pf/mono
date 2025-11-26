import { type JSONSchema4 } from '../type.mjs';

/**
 * スキーマ内の pattern プロパティを enum に変換する。
 * これにより string ではなく string literal union 型が生成される
 */
export const convertPatternToEnum = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.type === 'object' && schema.properties !== undefined) {
    const mut_newProperties: Record<string, JSONSchema4> = {};

    for (const [key, value] of Object.entries(schema.properties)) {
      if (
        typeof value === 'object' &&
        value.type === 'string' &&
        typeof value.pattern === 'string'
      ) {
        const enumValues = extractEnumFromPattern(value.pattern);

        if (enumValues.length > 0) {
          const { pattern, ...rest } = value;

          mut_newProperties[key] = {
            ...rest,
            enum: enumValues,
          } as JSONSchema4;
        } else {
          mut_newProperties[key] = value;
        }
      } else {
        mut_newProperties[key] = value;
      }
    }

    return {
      ...schema,
      properties: mut_newProperties,
    } as JSONSchema4;
  }

  return schema;
};

/**
 * pattern プロパティから enum を抽出する。
 * 例: "^(explicit|implicit|unchanged)$" → ["explicit", "implicit", "unchanged"]
 */
const extractEnumFromPattern = (pattern: string): readonly string[] => {
  // パターン: ^(option1|option2|...)$ の形式を想定
  const match = /^\^?\(([^)]+)\)\$?$/u.exec(pattern);

  if (match?.[1] !== undefined) {
    return match[1].split('|');
  }

  return [];
};
