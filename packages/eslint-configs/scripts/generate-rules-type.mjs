import { toSafeUint, toUint32 } from '@noshiro/mono-scripts';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { compile } from 'json-schema-to-typescript';
import { deepReplace, isArray, toCapitalCase, toStr } from './utils.mjs';
const compilerConfig = {
  bannerComment: '',
  format: false,
};
const normalizeToSchemaArray = (schema) =>
  // schema が JSONSchema4 | JSONSchema4[] | undefined 型を満たしていない plugin があったためその問題を吸収する対応。
  typeof schema !== 'object' ? [] : isArray(schema) ? schema : [schema];
const removeMultiLineCommentCharacter = (str) =>
  str.replace('/*', ' ').replace('*/', ' ');
const metaToString = (meta) => {
  if (meta === undefined) return '';
  const { deprecated, docs, fixable, hasSuggestions, type } = meta;
  if (docs === undefined) return '';
  const { description, recommended, category, url } = docs;
  const keyValue = [
    ['type', type],
    ['deprecated', deprecated],
    ['fixable', fixable],
    ['hasSuggestions', hasSuggestions],
    ['category', category],
    ['recommended', recommended],
    [
      'requiresTypeChecking',
      // eslint-disable-next-line no-restricted-syntax
      'requiresTypeChecking' in docs
        ? // eslint-disable-next-line unicorn/consistent-destructuring, deprecation/deprecation
          Boolean(docs.requiresTypeChecking)
        : undefined,
    ],
  ];
  const keyValuesStr = keyValue
    .filter(([_key, value]) => value != null)
    .map(([key, value]) => [
      key,
      removeMultiLineCommentCharacter(toStr(value ?? '')),
    ]);
  const tableHeader = ['key', 'value'];
  const [longestKeyLength, longestValueLength] = keyValuesStr.reduce(
    ([keyMax, valueMax], [key, value]) => [
      toSafeUint(Math.max(keyMax, key.length)),
      toSafeUint(Math.max(valueMax, value.length)),
    ],
    [toSafeUint(tableHeader[0].length), toSafeUint(tableHeader[1].length)],
  );
  const result = [
    '/**',
    description == null
      ? undefined
      : ` * @description ${removeMultiLineCommentCharacter(description)}`,
    url == null ? undefined : ` * @link ${url}`,
    ' *',
    ' *  ```md',
    ` *  | ${tableHeader[0].padEnd(longestKeyLength, ' ')} | ${tableHeader[1].padEnd(longestValueLength, ' ')} |`,
    ` *  | ${':'.padEnd(longestKeyLength, '-')} | ${':'.padEnd(longestValueLength, '-')} |`,
    ...keyValuesStr.map(
      ([key, value]) =>
        ` *  | ${key.padEnd(longestKeyLength, ' ')} | ${value.padEnd(longestValueLength, ' ')} |`,
    ),
    ' *  ```',
    ' */',
  ];
  return result.filter((line) => line !== undefined).join('\n');
};
const rawSchemaToString = (rawSchema) =>
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
const createResult = async (schemaList, typeName, ruleNamePrefix) => {
  const mut_resultToWrite = [
    '/* cSpell:disable */',
    "import { type Linter } from 'eslint';",
    ...(schemaList.some(({ schema }) => schema.length === 1)
      ? [
          '',
          'type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =',
          'T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;',
        ]
      : []),
    '',
  ];
  for (const { ruleName, docs, deprecated, schema, rawSchema } of schemaList) {
    mut_resultToWrite.push(docs, `namespace ${toCapitalCase(ruleName)} {`);
    if (deprecated) {
      if (schema.length > 0) {
        mut_resultToWrite.push(...rawSchemaToString(rawSchema));
      }
      mut_resultToWrite.push('  export type RuleEntry = 0;');
    } else {
      switch (schema.length) {
        case 0:
          mut_resultToWrite.push('  export type RuleEntry = Linter.RuleLevel;');
          break;
        case 1: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));
          const sc = schema[0];
          if (sc === undefined) {
            throw new Error("schema can't be undefined here");
          }
          console.log('start', ruleName);
          /* e.g. "export type Options = { ... };" */
          const optionsType = await compile(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            sc,
            'Options',
            compilerConfig,
          ).catch((error) => {
            throw new Error(toStr(error));
          });
          console.log('end');
          mut_resultToWrite.push(
            optionsType,
            '',
            '  export type RuleEntry = Linter.RuleLevel',
            '   | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;',
          );
          break;
        }
        default: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));
          /* e.g. "export type Options = { ... };" */
          const optionsTypeList = await Promise.all(
            schema.map((s, index) =>
              compile(
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                s,
                `Options${index}`,
                compilerConfig,
              ),
            ),
          ).catch((error) => {
            throw new Error(toStr(error));
          });
          // e.g. "Options0, Options1, Options2"
          const OptionsStrs = optionsTypeList.map(
            (_, index) => `Options${index}`,
          );
          mut_resultToWrite.push(
            ...optionsTypeList,
            '',
            '  export type RuleEntry = Linter.RuleLevel',
            ...OptionsStrs.map(
              (_, i) =>
                `   | readonly [Linter.RuleLevel, ${OptionsStrs.slice(0, toUint32(i + 1)).join(', ')}]`,
            ),
          );
          break;
        }
      }
    }
    mut_resultToWrite.push('}', '\n');
  }
  const deprecatedSchemaList = schemaList.filter((s) => s.deprecated);
  mut_resultToWrite.push(
    `export type ${typeName} = {`,
    ...schemaList
      .filter((s) => !s.deprecated)
      .map(
        ({ ruleName }) =>
          `'${ruleNamePrefix}${ruleName}': ${toCapitalCase(ruleName)}.RuleEntry;`,
      ),
    ...(deprecatedSchemaList.length === 0
      ? []
      : [
          '',
          '  // deprecated',
          ...deprecatedSchemaList.map(
            ({ ruleName }) =>
              `'${ruleNamePrefix}${ruleName}': ${toCapitalCase(ruleName)}.RuleEntry;`,
          ),
        ]),
    '}',
    '',
  );
  if (schemaList.some((s) => !s.deprecated && s.schema.length > 0)) {
    mut_resultToWrite.push(
      `export type ${typeName}Option = {`,
      ...schemaList
        .filter((s) => !s.deprecated && s.schema.length > 0)
        .map(({ ruleName, schema }) =>
          [
            `'${ruleNamePrefix}${ruleName}': `,
            schema.length === 1
              ? `${toCapitalCase(ruleName)}.Options;`
              : `[${schema
                  .map(
                    (_, index) => `${toCapitalCase(ruleName)}.Options${index}`,
                  )
                  .join(', ')}]`,
          ].join(''),
        ),
      '}',
    );
  }
  return mut_resultToWrite.join('\n');
};
const createRulePrefix = (rulePrefixOrNull, pluginName) =>
  pluginName === 'eslint'
    ? ''
    : rulePrefixOrNull !== undefined && rulePrefixOrNull !== ''
      ? rulePrefixOrNull
      : `${pluginName.replace(/^eslint-plugin-/u, '')}/`;
export const generateRulesType = async (
  typeName,
  pluginName,
  rulePrefixOrNull,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/dynamic-import-chunkname
  const pluginPackage = await import(pluginName);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const rules =
    pluginName === 'eslint'
      ? // eslint-disable-next-line deprecation/deprecation
        structuredClone(Array.from(builtinRules.entries()))
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Object.entries(pluginPackage.default.rules);
  const schemaList = rules.map(([ruleName, { meta }]) => ({
    ruleName,
    schema: normalizeToSchemaArray(
      pluginName === '@typescript-eslint/eslint-plugin'
        ? // schema に入った変更で compile できなくなってしまったので暫定対応
          deepReplace(meta?.schema, '#/items/0/', '#/')
        : meta?.schema,
    ),
    deprecated: meta?.deprecated ?? false,
    rawSchema: meta?.schema ?? [],
    docs: metaToString(meta),
  }));
  return createResult(
    schemaList,
    typeName,
    createRulePrefix(rulePrefixOrNull, pluginName),
  );
};
