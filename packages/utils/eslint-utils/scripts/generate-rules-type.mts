import { type Rule } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { type JSONSchema4 } from 'json-schema';
import { compile } from 'json-schema-to-typescript';
import {
  deepCopy,
  deepReplace,
  isArray,
  toCapitalCase,
  toSafeUint,
  toStr,
} from './utils.mjs';

type Meta = DeepReadonly<
  DeepPartial<{
    [K in keyof Rule.RuleMetaData]: K extends 'docs'
      ? Required<Rule.RuleMetaData>['docs'] & { category: string }
      : Rule.RuleMetaData[K];
  }>
>;

const compilerConfig = {
  bannerComment: '',
  format: false,
} as const;

const normalizeToSchemaArray = (
  schema: DeepReadonly<JSONSchema4 | JSONSchema4[]> | undefined,
): DeepReadonly<JSONSchema4[]> =>
  schema === undefined ? [] : isArray(schema) ? schema : [schema];

const removeMultiLineCommentCharacter = (str: string): string =>
  str.replace('/*', ' ').replace('*/', ' ');

const metaToString = (meta: Meta | undefined): string => {
  if (meta === undefined) return '';

  const { deprecated, docs, fixable, hasSuggestions, type } = meta;

  if (docs === undefined) return '';

  // eslint-disable-next-line deprecation/deprecation
  const { description, recommended, category, url } = docs;

  const keyValue: DeepReadonly<[string, boolean | string | undefined][]> = [
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

  const keyValuesStr: DeepReadonly<[string, string][]> = keyValue
    .filter(([_key, value]) => value != null)
    .map(([key, value]) => [
      key,
      removeMultiLineCommentCharacter(toStr(value ?? '')),
    ]);

  const tableHeader = ['key', 'value'] as const;
  const [longestKeyLength, longestValueLength] = keyValuesStr.reduce<
    readonly [SafeUint, SafeUint]
  >(
    ([keyMax, valueMax], [key, value]) => [
      toSafeUint(Math.max(keyMax, key.length)),
      toSafeUint(Math.max(valueMax, value.length)),
    ],
    [tableHeader[0].length, tableHeader[1].length],
  );

  const result = [
    '/**',
    description == null
      ? undefined
      : ` * @description ${removeMultiLineCommentCharacter(description)}`,
    url == null ? undefined : ` * @link ${url}`,
    ' *',
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
    ' */',
  ];
  return result.filter((line) => line !== undefined).join('\n');
};

const rawSchemaToString = (
  rawSchema: DeepReadonly<JSONSchema4 | JSONSchema4[] | undefined>,
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

const createResult = async (
  schemaList: DeepReadonly<
    {
      ruleName: string;
      docs: string;
      deprecated: boolean;
      schema: JSONSchema4[];
      rawSchema: JSONSchema4 | JSONSchema4[] | undefined;
    }[]
  >,
  typeName: string,
  ruleNamePrefix: string,
): Promise<string> => {
  const mut_resultToWrite: string[] = [
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
      mut_resultToWrite.push('  export type RuleEntry = "off";');
    } else {
      switch (schema.length) {
        case 0:
          mut_resultToWrite.push('  export type RuleEntry = Linter.RuleLevel;');
          break;

        case 1: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));

          const sc = schema[0];
          if (sc === undefined) {
            throw new Error("schema shouldn't be undefined here");
          }

          /* e.g. "export type Options = { ... };" */
          const optionsType = await compile(
            // eslint-disable-next-line no-restricted-syntax
            sc as JSONSchema4,
            'Options',
            compilerConfig,
          ).catch((error) => {
            throw new Error(toStr(error));
          });

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
          const optionsTypeList: readonly string[] = await Promise.all(
            schema.map((s, index) =>
              // eslint-disable-next-line no-restricted-syntax
              compile(s as JSONSchema4, `Options${index}`, compilerConfig),
            ),
          ).catch((error) => {
            throw new Error(toStr(error));
          });

          // e.g. "Options0, Options1, Options2"
          const OptionsStrs: readonly `Options${number}`[] =
            optionsTypeList.map((_, index) => `Options${index}` as const);

          mut_resultToWrite.push(
            ...optionsTypeList,
            '',
            '  export type RuleEntry = Linter.RuleLevel',
            ...OptionsStrs.map(
              (_, i) =>
                `   | readonly [Linter.RuleLevel, ${OptionsStrs.slice(
                  0,
                  toSafeUint(i + 1),
                ).join(', ')}]`,
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
          `'${ruleNamePrefix}${ruleName}': ${toCapitalCase(
            ruleName,
          )}.RuleEntry;`,
      ),

    ...(deprecatedSchemaList.length === 0
      ? []
      : [
          '',
          '  // deprecated',
          ...deprecatedSchemaList.map(
            ({ ruleName }) =>
              `'${ruleNamePrefix}${ruleName}': ${toCapitalCase(
                ruleName,
              )}.RuleEntry;`,
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

const createRulePrefix = (
  rulePrefixOrNull: string | undefined,
  pluginName: string,
): string =>
  pluginName === 'eslint'
    ? ''
    : rulePrefixOrNull !== undefined && rulePrefixOrNull !== ''
      ? rulePrefixOrNull
      : `${pluginName.replace(/^eslint-plugin-/u, '')}/`;

export const generateRulesType = async (
  typeName: string,
  pluginName: string,
  rulePrefixOrNull: string | undefined,
): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/dynamic-import-chunkname
  const pluginPackage = await import(pluginName);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const rules: DeepReadonly<[string, Rule.RuleModule][]> =
    pluginName === 'eslint'
      ? // eslint-disable-next-line deprecation/deprecation
        deepCopy(Array.from(builtinRules.entries()))
      : // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        Object.entries(pluginPackage.default.rules);

  const schemaList: DeepReadonly<
    {
      ruleName: string;
      docs: string;
      deprecated: boolean;
      schema: JSONSchema4[];
      rawSchema: JSONSchema4 | JSONSchema4[];
    }[]
  > = rules.map(([ruleName, { meta }]) => ({
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