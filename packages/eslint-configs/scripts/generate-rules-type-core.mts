import { toSafeUint, toUint32 } from '@noshiro/mono-utils';
import { type Rule } from 'eslint';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { type JSONSchema4 } from 'json-schema';
import { compile, type Options } from 'json-schema-to-typescript';
import {
  deepCopy,
  deepReplace,
  falseToUndefined,
  isArray,
  toCapitalCase,
  toStr,
} from './utils.mjs';

type Meta = DeepReadonly<
  DeepPartial<{
    [K in keyof Rule.RuleMetaData]: K extends 'docs'
      ? Required<Rule.RuleMetaData>['docs'] & { category: string }
      : Rule.RuleMetaData[K];
  }>
>;

const generatorOption: Readonly<{
  explicitRuleDefaultOption: boolean;
}> = {
  explicitRuleDefaultOption: true,
} as const;

const RuleSeverityWithDefaultOption = 'RuleSeverityWithDefaultOption';

const RuleSeverity = generatorOption.explicitRuleDefaultOption
  ? 'Linter.StringSeverity'
  : 'Linter.RuleSeverity';

const compilerConfig = {
  bannerComment: '',
  format: false,
  unknownAny: true,
} as const satisfies Partial<Options>;

const normalizeToSchemaArray = (
  schema: DeepReadonly<JSONSchema4 | JSONSchema4[]> | undefined,
): DeepReadonly<JSONSchema4[]> =>
  // schema が JSONSchema4 | JSONSchema4[] | undefined 型を満たしていない plugin があったためその問題を吸収する対応。
  typeof schema !== 'object' ? [] : isArray(schema) ? schema : [schema];

const removeMultiLineCommentCharacter = (str: string): string =>
  str.replace('/*', ' ').replace('*/', ' ');

const metaToString = (meta: Meta | undefined): string => {
  if (meta === undefined) return '';

  const { deprecated, docs, fixable, hasSuggestions, type } = meta;

  if (docs === undefined) return '';

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
        ? // eslint-disable-next-line unicorn/consistent-destructuring, @typescript-eslint/no-deprecated
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
    "import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';",
    ...(schemaList.some(({ schema }) => schema.length === 1)
      ? [
          '',
          `type SpreadOptionsIfIsArray<T extends readonly [${RuleSeverity}, unknown]> =`,
          `T[1] extends readonly unknown[] ? readonly [${RuleSeverity}, ...T[1]] : T;`,
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
          mut_resultToWrite.push(`  export type RuleEntry = ${RuleSeverity};`);
          break;

        case 1: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));

          const sc = schema[0];
          if (sc === undefined) {
            throw new Error("schema can't be undefined here");
          }

          /* e.g. "export type Options = { ... };" */
          const optionsType = await compile(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            sc as JSONSchema4,
            'Options',
            compilerConfig,
          ).catch((error) => {
            throw new Error(toStr(error));
          });

          mut_resultToWrite.push(
            optionsType,
            '',
            '  export type RuleEntry = ',
            generatorOption.explicitRuleDefaultOption
              ? `"off" | ${RuleSeverityWithDefaultOption}`
              : 'Linter.StringSeverity',
            `   | SpreadOptionsIfIsArray<readonly [${RuleSeverity}, Options]>;`,
          );
          break;
        }

        default: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));

          /* e.g. "export type Options = { ... };" */
          const optionsTypeList: readonly string[] = await Promise.all(
            schema.map((s, index) =>
              compile(
                // eslint-disable-next-line total-functions/no-unsafe-type-assertion
                s as JSONSchema4,
                `Options${index}`,
                compilerConfig,
              ),
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
            '  export type RuleEntry = ',
            generatorOption.explicitRuleDefaultOption
              ? `"off" | ${RuleSeverityWithDefaultOption}`
              : 'Linter.RuleSeverity',
            ...OptionsStrs.map(
              (_, i) =>
                `   | readonly [${
                  RuleSeverity
                }, ${OptionsStrs.slice(0, toUint32(i + 1)).join(', ')}]`,
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
    `export type ${typeName} = Readonly<{`,

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

    '}>',

    '',
  );

  if (schemaList.some((s) => !s.deprecated && s.schema.length > 0)) {
    mut_resultToWrite.push(
      `export type ${typeName}Option = Readonly<{`,

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

      '}>',
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

export const generateRulesTypeCore = async (
  typeName: string,
  pluginName: string,
  rulePrefixOrNull: string | undefined,
): Promise<string> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/dynamic-import-chunkname
  const pluginPackage = await import(pluginName);

  const rules: DeepReadonly<[string, Rule.RuleModule][]> =
    pluginName === 'eslint'
      ? // eslint-disable-next-line @typescript-eslint/no-deprecated
        deepCopy(Array.from(builtinRules.entries()))
      : Object.entries(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access
          pluginPackage.default.rules as Record<string, Rule.RuleModule>,
        );

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
      falseToUndefined(
        pluginName === '@typescript-eslint/eslint-plugin'
          ? // schema に入った変更で compile できなくなってしまったので暫定対応
            deepReplace(meta?.schema, '#/items/0/', '#/')
          : meta?.schema,
      ),
    ),
    deprecated: meta?.deprecated ?? false,
    rawSchema: falseToUndefined(meta?.schema) ?? [],
    docs: metaToString(meta),
  }));

  return createResult(
    schemaList,
    typeName,
    createRulePrefix(rulePrefixOrNull, pluginName),
  );
};
