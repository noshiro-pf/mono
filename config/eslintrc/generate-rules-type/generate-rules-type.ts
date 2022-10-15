import type { TSESLint } from '@typescript-eslint/utils';
import type { JSONSchema4 } from 'json-schema';
import { compile } from 'json-schema-to-typescript';

type Meta = DeepReadonly<
  DeepPartial<{
    [K in keyof TSESLint.RuleMetaData<string>]: K extends 'docs'
      ? TSESLint.RuleMetaData<string>['docs'] & { category: string }
      : TSESLint.RuleMetaData<string>[K];
  }>
>;

const compilerConfig = {
  bannerComment: '',
  format: false,
} as const;

const toCapitalCase = (str: string): string =>
  str
    .replace(/-./gu, (x) => x[1]?.toUpperCase() ?? str)
    .replace(/^./u, (x) => x[0]?.toUpperCase() ?? str);

const normalizeToSchemaArray = (
  schema: DeepReadonly<JSONSchema4 | JSONSchema4[]> | undefined
): DeepReadonly<JSONSchema4[]> =>
  schema === undefined
    ? []
    : // eslint-disable-next-line no-restricted-globals
    Array.isArray(schema)
    ? schema
    : [schema];

const removeMultiLineCommentCharacter = (str: string): string =>
  str.replace('/*', ' ').replace('*/', ' ');

// eslint-disable-next-line no-restricted-globals
const deepCopy = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

const metaToString = (meta: Meta): string => {
  const { deprecated, docs, fixable, hasSuggestions, type } = meta;
  if (docs === undefined) return '';
  const {
    description,
    recommended,
    category,
    requiresTypeChecking,
    suggestion,
    url,
  } = docs;

  const keyValue: DeepReadonly<[string, boolean | string | undefined][]> = [
    ['type', type],
    ['deprecated', deprecated],
    ['fixable', fixable],
    ['hasSuggestions', hasSuggestions],
    ['category', category],
    ['recommended', recommended],
    ['requiresTypeChecking', requiresTypeChecking],
    ['suggestion', suggestion],
  ];

  const keyValuesStr: DeepReadonly<[string, string][]> = keyValue
    .filter(([_key, value]) => value != null)
    .map(([key, value]) => [
      key,
      // eslint-disable-next-line no-restricted-globals
      removeMultiLineCommentCharacter(String(value ?? '')),
    ]);

  const tableHeader = ['key', 'value'] as const;
  const [longestKeyLength, longestValueLength] = keyValuesStr.reduce<
    readonly [number, number]
  >(
    ([keyMax, valueMax], [key, value]) => [
      Math.max(keyMax, key.length),
      Math.max(valueMax, value.length),
    ],
    [tableHeader[0].length, tableHeader[1].length]
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
      ' '
    )} | ${tableHeader[1].padEnd(longestValueLength, ' ')} |`,
    ` *  | ${':'.padEnd(longestKeyLength, '-')} | ${':'.padEnd(
      longestValueLength,
      '-'
    )} |`,
    ...keyValuesStr.map(
      ([key, value]) =>
        ` *  | ${key.padEnd(longestKeyLength, ' ')} | ${value.padEnd(
          longestValueLength,
          ' '
        )} |`
    ),
    ' */',
  ];
  return result.filter((line) => line !== undefined).join('\n');
};

const rawSchemaToString = (
  rawSchema: DeepReadonly<JSONSchema4 | JSONSchema4[] | undefined>
): string[] =>
  rawSchema === undefined
    ? []
    : [
        '  /**',
        '   * ### schema',
        '   *',
        '   * ```json',
        // eslint-disable-next-line no-restricted-globals
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
  ruleNamePrefix: string
): Promise<string> => {
  const mut_resultToWrite: string[] = [
    '/* cSpell:disable */',
    '/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */',
    "import type { Linter } from 'eslint';",
    ...(schemaList.some(({ schema }) => schema.length === 1)
      ? [
          '',
          '// eslint-disable-next-line @typescript-eslint/no-unused-vars',
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
          // eslint-disable-next-line no-await-in-loop
          const optionsType = await compile(
            sc as JSONSchema4,
            'Options',
            compilerConfig
          ).catch((error) => {
            // eslint-disable-next-line no-restricted-globals
            throw new Error(String(error));
          });

          mut_resultToWrite.push(
            optionsType,
            '',
            '  export type RuleEntry = Linter.RuleLevel',
            '   | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;'
          );
          break;
        }
        default: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));

          /* e.g. "export type Options = { ... };" */
          // eslint-disable-next-line no-await-in-loop
          const optionsTypeList: readonly string[] = await Promise.all(
            schema.map((s, index) =>
              compile(s as JSONSchema4, `Options${index}`, compilerConfig)
            )
          ).catch((error) => {
            // eslint-disable-next-line no-restricted-globals
            throw new Error(String(error));
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
                  i + 1
                ).join(', ')}]`
            )
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
            ruleName
          )}.RuleEntry;`
      ),

    ...(deprecatedSchemaList.length === 0
      ? []
      : [
          '',
          '  // deprecated',
          ...deprecatedSchemaList.map(
            ({ ruleName }) =>
              `'${ruleNamePrefix}${ruleName}': ${toCapitalCase(
                ruleName
              )}.RuleEntry;`
          ),
        ]),

    '}'
  );

  return mut_resultToWrite.join('\n');
};

const createRulePrefix = (
  rulePrefixOrNull: string | undefined,
  pluginName: string
): string =>
  pluginName === 'eslint'
    ? ''
    : rulePrefixOrNull !== undefined && rulePrefixOrNull !== ''
    ? rulePrefixOrNull
    : `${pluginName.replace(/^eslint-plugin-/u, '')}/`;

const generateRulesType = async (
  typeName: string,
  pluginName: string,
  rulePrefixOrNull: string | undefined
): Promise<string> => {
  const rules: DeepReadonly<
    [string, TSESLint.RuleModule<string, unknown[]>][]
  > =
    pluginName === 'eslint'
      ? deepCopy(
          // eslint-disable-next-line no-restricted-globals
          Array.from(
            // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports,import/no-internal-modules,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,unicorn/prefer-module
            require('eslint/use-at-your-own-risk')?.builtinRules.entries() ?? []
          )
        )
      : // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports,import/no-internal-modules,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,unicorn/prefer-module,import/no-dynamic-require,no-restricted-globals
        Object.entries(require(pluginName).rules);

  const schemaList: DeepReadonly<
    {
      ruleName: string;
      docs: string;
      deprecated: boolean;
      schema: JSONSchema4[];
      rawSchema: JSONSchema4 | JSONSchema4[];
    }[]
  > = rules.map(([ruleName, value]) => ({
    ruleName,
    schema: normalizeToSchemaArray(
      value.meta.schema as DeepReadonly<JSONSchema4 | JSONSchema4[]> | undefined
    ),
    deprecated: value.meta.deprecated ?? false,
    rawSchema: value.meta.schema,
    docs: metaToString(value.meta),
  }));

  return createResult(
    schemaList,
    typeName,
    createRulePrefix(rulePrefixOrNull, pluginName)
  );
};

export const main = async (): Promise<void> => {
  if (process.argv.length < 5) {
    throw new Error('wrong number of arguments.');
  }
  const typeName = process.argv[2];
  const pluginName = process.argv[3];
  const rulePrefixOrNull = process.argv[4];

  if (
    typeof typeName !== 'string' ||
    typeof pluginName !== 'string' ||
    typeof rulePrefixOrNull !== 'string'
  ) {
    throw new TypeError('each type of arguments should be string');
  }

  const result = await generateRulesType(
    typeName,
    pluginName,
    rulePrefixOrNull
  );

  console.log(result);
};
