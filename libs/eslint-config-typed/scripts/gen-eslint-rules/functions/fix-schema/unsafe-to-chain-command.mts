import { type JSONSchema4 } from '../type.mjs';

/**
 * スキーマの title プロパティを "Options" に変更する。
 * これにより、生成される型名が title の値ではなく Options になる
 */
export const renameTitleToOptions = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.title !== undefined && schema.title !== 'Options') {
    const { title, ...rest } = schema;

    return {
      ...rest,
      title: 'Options',
    } as JSONSchema4;
  }

  return schema;
};
