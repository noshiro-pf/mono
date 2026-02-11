import { isBoolean, isString } from 'ts-data-forge';
import { type Rule } from '../../../../src/index.mjs';
import { toStr } from '../../utils/index.mjs';
import { isDeprecated } from '../is-deprecated.mjs';

/**
 * ルールのメタ情報から JSDoc コメント形式の文字列を生成する
 */
export const metaToString = (meta: DeepReadonly<Rule['meta']>): string => {
  if (meta === undefined) return '';

  const { deprecated, docs, fixable, hasSuggestions, type } = meta;

  if (docs === undefined) return '';

  const { description, recommended, url } = docs;

  const keyValue: DeepReadonly<[string, boolean | string | undefined][]> = [
    ['type', type],
    ['deprecated', isDeprecated(deprecated)],
    ['fixable', fixable],
    ['hasSuggestions', hasSuggestions],
    [
      'recommended',
      isString(recommended) || isBoolean(recommended) ? recommended : undefined,
    ],
    [
      'requiresTypeChecking',
      // eslint-disable-next-line no-restricted-syntax
      'requiresTypeChecking' in docs
        ? // eslint-disable-next-line unicorn/consistent-destructuring
          Boolean(docs.requiresTypeChecking)
        : undefined,
    ],
  ] as const;

  const keyValuesStr: DeepReadonly<[string, string][]> = keyValue
    .filter(([_key, value]) => value != null)
    .map(([key, value]) => [
      key,
      removeMultiLineCommentCharacter(toStr(value ?? '')),
    ]);

  const tableHeader = ['key', 'value'] as const;

  const [longestKeyLength, longestValueLength] = keyValuesStr.reduce<
    readonly [number, number]
  >(
    ([keyMax, valueMax], [key, value]) => [
      Math.max(keyMax, key.length),
      Math.max(valueMax, value.length),
    ],
    [tableHeader[0].length, tableHeader[1].length],
  );

  const result = [
    '/**',
    description == null
      ? undefined
      : (` * @description ${removeMultiLineCommentCharacter(description)}` as const),
    url == null ? undefined : (` * @link ${url}` as const),
    ' *',
    ' *  ```md',
    ` *  | ${tableHeader[0].padEnd(
      longestKeyLength,
      ' ',
    )} | ${tableHeader[1].padEnd(longestValueLength, ' ')} |`,
    ` *  | ${':'.padEnd(longestKeyLength, '-')} | ${':'.padEnd(
      longestValueLength,
      '-',
    )} |`,
    ...keyValuesStr.map(
      ([key, value]) =>
        ` *  | ${key.padEnd(longestKeyLength, ' ')} | ${value.padEnd(
          longestValueLength,
          ' ',
        )} |`,
    ),
    ' *  ```',
    ' */',
  ] as const;

  return result.filter((line) => line !== undefined).join('\n');
};

/**
 * JSDoc 内で使用できない文字列を削除する
 */
const removeMultiLineCommentCharacter = (str: string): string =>
  str.replace('/*', ' ').replace('*/', ' ');
