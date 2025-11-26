import { type JSONSchema4 } from '../type.mjs';

/**
 * スキーマ定義を JSDoc コメントの code block として整形する
 */
export const rawSchemaToString = (
  rawSchema: JSONSchema4 | readonly JSONSchema4[] | undefined,
): readonly string[] =>
  rawSchema === undefined
    ? []
    : [
        '  /**',
        '   * ### schema',
        '   *',
        '   * ```json',

        JSON.stringify(rawSchema, null, 2)
          .split('\n')
          .map((line) => `  * ${line}`)
          .join('\n'),
        '  * ```',
        '  */',
      ];
