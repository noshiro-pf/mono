import { type DeprecatedInfo } from '@eslint/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { type JSONSchema4 as JSONSchema4_ } from 'json-schema';
import { compile, type Options } from 'json-schema-to-typescript';
import {
  Arr,
  castDeepMutable,
  hasKey,
  isBoolean,
  isString,
} from 'ts-data-forge';
import { type Rule, type Rules } from '../../../src/index.mjs';
import { reactCodingStyleRules } from '../../../src/plugins/react-coding-style/rules/rules.mjs';
import { strictDependenciesRules } from '../../../src/plugins/strict-dependencies/rules/index.mjs';
import { totalFunctionsRules } from '../../../src/plugins/total-functions/rules/index.mjs';
import { treeShakableRules } from '../../../src/plugins/tree-shakable/rules/index.mjs';
import { tsRestrictionsRules } from '../../../src/plugins/ts-restrictions/rules/rules.mjs';
import { vitestCodingStyleRules } from '../../../src/plugins/vitest-coding-style/rules/rules.mjs';
import { eslintPlugins } from '../constants/eslint-plugins.mjs';
import {
  deepReplace,
  falseToUndefined,
  toCapitalCase,
  toStr,
} from '../utils/index.mjs';

type JSONSchema4 = DeepReadonly<JSONSchema4_>;

/**
 * ルールが非推奨かどうかを判定する
 */
const isDeprecated = (
  deprecated: boolean | DeepReadonly<DeprecatedInfo> | undefined,
): boolean =>
  typeof deprecated === 'object' ||
  (typeof deprecated === 'boolean' && deprecated);

const generatorOption: Readonly<{
  explicitRuleDefaultOption: boolean;
}> = {
  explicitRuleDefaultOption: true,
} as const;

const RuleSeverityWithDefaultOption = 'Linter.Severity';

const RuleSeverityForNoOption = generatorOption.explicitRuleDefaultOption
  ? 'Linter.StringSeverity'
  : 'Linter.RuleSeverity';

const compilerConfig = {
  bannerComment: '',
  format: false,
  unknownAny: true,
} as const satisfies Partial<Options>;

/**
 * スキーマを配列形式に正規化する。プラグイン間の型不整合を吸収する
 */
const normalizeToSchemaArray = (
  schema: DeepReadonly<JSONSchema4 | JSONSchema4[]> | undefined,
): DeepReadonly<JSONSchema4[]> =>
  // Some plugins violate the JSONSchema4 | JSONSchema4[] | undefined contract, so absorb that inconsistency here.
  typeof schema !== 'object' ? [] : Arr.isArray(schema) ? schema : [schema];

/**
 * スキーマが `type: "array"` を持つ場合、それを除去して内容を正規化する。
 * これにより `& readonly unknown[]` という不要な型が生成されるのを防ぐ
 */
const removeArrayTypeFromSchema = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.type === 'array') {
    const { type, ...rest } = schema;

    return rest as JSONSchema4;
  }

  return schema;
};

/**
 * スキーマが `type: "string"` を持つ場合、それを除去して内容を正規化する。
 * これにより `string &` という不要な型が生成されるのを防ぐ
 */
const removeStringTypeFromSchema = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.type === 'string') {
    const { type, ...rest } = schema;

    return rest as JSONSchema4;
  }

  return schema;
};

/**
 * スキーマのプロパティに default 値がある場合、description に default 値を追加する。
 * json-schema-to-typescript は description を JSDoc コメントとして出力する
 */
const addDefaultValuesToDescription = (
  schema: JSONSchema4,
): DeepReadonly<JSONSchema4> => {
  if (schema.properties === undefined) {
    return schema;
  }

  const mut_newProperties: Record<string, DeepReadonly<JSONSchema4>> = {};

  for (const [key, propSchema] of Object.entries(schema.properties)) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (propSchema === undefined) {
      continue;
    }

    const prop = propSchema as DeepReadonly<JSONSchema4>;

    if (prop.default !== undefined) {
      const defaultValue =
        typeof prop.default === 'string'
          ? `"${prop.default}"`
          : Array.isArray(prop.default) && prop.default.length === 0
            ? '[]'
            : JSON.stringify(prop.default);

      const existingDescription =
        prop.description !== undefined ? `${prop.description}\n\n` : '';

      mut_newProperties[key] = {
        ...prop,
        description: `${existingDescription}@default ${defaultValue}`,
      } as DeepReadonly<JSONSchema4>;
    } else {
      mut_newProperties[key] = prop;
    }
  }

  return {
    ...schema,
    properties: mut_newProperties,
  } as DeepReadonly<JSONSchema4>;
};

/**
 * patternProperties の `^must(?:Not)?Match$` を明示的な `mustMatch` と `mustNotMatch` プロパティに変換する。
 * これにより index signature ではなく、具体的なプロパティ名を持つ型が生成される。
 * また、共通の型を definitions に抽出して $ref で参照するようにする
 */
/* eslint-disable functional/no-let, @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-member-access, total-functions/no-unsafe-type-assertion */

const expandMustMatchPatternProperties = (schema: JSONSchema4): JSONSchema4 => {
  if (
    schema.patternProperties !== undefined &&
    Object.hasOwn(schema.patternProperties, '^must(?:Not)?Match$')
  ) {
    const { patternProperties, properties, definitions, ...rest } = schema;

    const mustMatchSchema = patternProperties['^must(?:Not)?Match$'];

    // oneOf の中で繰り返される型を PatternOrPatternArray として定義
    let patternTypeSchema: JSONSchema4 | undefined;

    // mustMatchSchema の oneOf 内の object 型を展開し、共通型を抽出
    const mut_expandedMustMatchSchema = { ...mustMatchSchema };

    if (
      mut_expandedMustMatchSchema.oneOf &&
      Array.isArray(mut_expandedMustMatchSchema.oneOf)
    ) {
      // 最初に PatternOrPatternArray の定義を抽出
      const mut_nonObjectOptions: JSONSchema4[] = [];

      let mut_objectOption: JSONSchema4 | undefined;

      for (const option of mut_expandedMustMatchSchema.oneOf) {
        if (
          option.type === 'object' &&
          option.propertyNames &&
          typeof option.propertyNames === 'object' &&
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          Object.hasOwn(option.propertyNames, 'enum') &&
          Array.isArray(option.propertyNames.enum)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          mut_objectOption = option;

          if (!patternTypeSchema && option.additionalProperties) {
            patternTypeSchema = option.additionalProperties as JSONSchema4;
          }
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          mut_nonObjectOptions.push(option);
        }
      }

      // PatternOrPatternArray が定義されている場合、oneOf を書き換え
      if (patternTypeSchema && mut_objectOption) {
        // propertyNames.enum から具体的なプロパティを生成
        const mut_properties: Record<string, JSONSchema4> = {};

        const propertyNames = (
          mut_objectOption as JSONSchema4 & {
            propertyNames: { enum: readonly string[] };
          }
        ).propertyNames;

        for (const propName of propertyNames.enum) {
          if (typeof propName === 'string') {
            mut_properties[propName] = {
              $ref: '#/definitions/PatternOrPatternArray',
            } as JSONSchema4;
          }
        }

        const {
          additionalProperties,
          propertyNames: _pn,
          ...optionRest
        } = mut_objectOption;

        // oneOf を PatternOrPatternArray の $ref と変換後の object に置き換え
        mut_expandedMustMatchSchema.oneOf = [
          { $ref: '#/definitions/PatternOrPatternArray' },
          {
            ...optionRest,
            properties: mut_properties,
            additionalProperties: false,
          },
        ];
      }
    }

    // 共通の型を definitions に追加
    const mut_newDefinitions = { ...definitions };

    // PatternOrPatternArray 型を追加
    if (patternTypeSchema !== undefined) {
      mut_newDefinitions['PatternOrPatternArray'] = patternTypeSchema;
    }

    mut_newDefinitions['MustMatchType'] =
      mut_expandedMustMatchSchema as JSONSchema4;

    return {
      ...rest,
      definitions: mut_newDefinitions,
      properties: {
        ...properties,
        mustMatch: {
          $ref: '#/definitions/MustMatchType',
        },
        mustNotMatch: {
          $ref: '#/definitions/MustMatchType',
        },
      },
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

  if (match?.[1]) {
    return match[1].split('|');
  }

  return [];
};

/**
 * スキーマ内の pattern プロパティを enum に変換する。
 * これにより string ではなく string literal union 型が生成される
 */
const convertPatternToEnum = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.type === 'object' && schema.properties) {
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
 * booleanObject 定義の additionalProperties を具体的なプロパティに展開する。
 * import-style ルールの BooleanObject 型で使用
 */
const expandBooleanObjectProperties = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.definitions && hasKey(schema.definitions, 'booleanObject')) {
    const booleanObjectDef = schema.definitions.booleanObject;

    if (
      typeof booleanObjectDef === 'object' &&
      booleanObjectDef.type === 'object' &&
      booleanObjectDef.additionalProperties
    ) {
      const propertyKeys = ['default', 'named', 'namespace', 'unassigned'];

      const mut_properties: Record<string, JSONSchema4> = {};

      for (const key of propertyKeys) {
        mut_properties[key] =
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

/**
 * スキーマの title プロパティを "Options" に変更する。
 * これにより、生成される型名が title の値ではなく Options になる
 */
const renameTitleToOptions = (schema: JSONSchema4): JSONSchema4 => {
  if (schema.title && schema.title !== 'Options') {
    const { title, ...rest } = schema;

    return {
      ...rest,
      title: 'Options',
    } as JSONSchema4;
  }

  return schema;
};

/**
 * JSDoc 内で使用できない文字列を削除する
 */
const removeMultiLineCommentCharacter = (str: string): string =>
  str.replace('/*', ' ').replace('*/', ' ');

/**
 * ルールのメタ情報から JSDoc コメント形式の文字列を生成する
 */
const metaToString = (meta: DeepReadonly<Rule['meta']>): string => {
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
  ];

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

/**
 * スキーマ定義を JSDoc コメントの code block として整形する
 */
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

/**
 * スキーマリストから型定義ファイルの内容を生成する。ルールごとに namespace と RuleEntry 型を作成し、プラグイン全体の型を export する
 */
const createResult = async (
  schemaList: DeepReadonly<
    {
      ruleName: string;
      docs: string;
      deprecated: boolean | DeprecatedInfo;
      schema: JSONSchema4[];
      rawSchema: JSONSchema4 | JSONSchema4[];
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
          `type SpreadOptionsIfIsArray<T extends readonly [${RuleSeverityForNoOption}, unknown]> =`,
          `T[1] extends readonly unknown[] ? readonly [${RuleSeverityForNoOption}, ...T[1]] : T;`,
        ]
      : []),
    '',
  ];

  for (const { deprecated, docs, rawSchema, ruleName, schema } of schemaList) {
    mut_resultToWrite.push(docs, `namespace ${toCapitalCase(ruleName)} {`);

    if (isDeprecated(deprecated)) {
      if (schema.length > 0) {
        mut_resultToWrite.push(...rawSchemaToString(rawSchema));
      }

      mut_resultToWrite.push('  export type RuleEntry = 0;', '');
    } else {
      switch (schema.length) {
        case 0:
          mut_resultToWrite.push(
            '',
            `  export type RuleEntry = ${RuleSeverityForNoOption};`,
            '',
          );

          break;

        case 1: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));

          const sc = schema[0];

          if (sc === undefined) {
            throw new Error("schema can't be undefined here");
          }

          const schemaWithDefaults = addDefaultValuesToDescription(sc);

          /* e.g. "export type Options = { ... };" */
          const optionsType = await compile(
            castDeepMutable(schemaWithDefaults),
            'Options',
            compilerConfig,
          ).catch((error: unknown) => {
            throw new Error(toStr(error));
          });

          mut_resultToWrite.push(
            optionsType,
            '',
            '  export type RuleEntry = ',
            generatorOption.explicitRuleDefaultOption
              ? `"off" | ${RuleSeverityWithDefaultOption}`
              : 'Linter.StringSeverity',
            `   | SpreadOptionsIfIsArray<readonly [${RuleSeverityForNoOption}, Options]>;`,
            '',
          );

          break;
        }

        default: {
          mut_resultToWrite.push(...rawSchemaToString(rawSchema));

          const schemasWithDefaults = schema.map((s) =>
            addDefaultValuesToDescription(s),
          );

          /* e.g. "export type Options = { ... };" */
          const optionsTypeList: readonly string[] = await Promise.all(
            schemasWithDefaults.map((s, index) =>
              compile(castDeepMutable(s), `Options${index}`, compilerConfig),
            ),
          ).catch((error: unknown) => {
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
                  RuleSeverityForNoOption
                }, ${OptionsStrs.slice(0, i + 1).join(', ')}]`,
            ),
            '',
          );

          break;
        }
      }
    }

    mut_resultToWrite.push('}', '\n', '\n');
  }

  const deprecatedSchemaList = schemaList.filter((s) =>
    isDeprecated(s.deprecated),
  );

  mut_resultToWrite.push(
    '',
    `export type ${typeName} = {`,

    ...schemaList
      .filter((s) => !isDeprecated(s.deprecated))
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

  if (
    schemaList.some((s) => !isDeprecated(s.deprecated) && s.schema.length > 0)
  ) {
    mut_resultToWrite.push(
      '',
      `export type ${typeName}Option = {`,

      ...schemaList
        .filter((s) => !isDeprecated(s.deprecated) && s.schema.length > 0)
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
      '',
    );
  }

  return mut_resultToWrite.join('\n');
};

/**
 * プラグイン名からルール名のプレフィックスを生成する（例: "eslint-plugin-react" → "react/"）
 */
const createRulePrefix = (
  rulePrefixOrNull: string | undefined,
  pluginName: string,
): string =>
  pluginName === 'eslint'
    ? ''
    : rulePrefixOrNull !== undefined && rulePrefixOrNull !== ''
      ? rulePrefixOrNull
      : `${pluginName.replace(/^eslint-plugin-/u, '')}/`;

/**
 * ESLint プラグインのルール定義から TypeScript 型定義を生成するメイン関数
 */
export const generateRulesTypeCore = async (
  typeName: string,
  pluginName: string,
  rulePrefixOrNull: string | undefined,
): Promise<string> => {
  const rules = await getRules(pluginName);

  const schemaList: DeepReadonly<
    {
      ruleName: string;
      docs: string;
      deprecated: boolean | DeprecatedInfo;
      schema: JSONSchema4[];
      rawSchema: JSONSchema4 | JSONSchema4[];
    }[]
  > = rules.map(([ruleName, { meta }]) => {
    const fixedSchema: readonly JSONSchema4[] = normalizeToSchemaArray(
      falseToUndefined(
        pluginName === '@typescript-eslint/eslint-plugin' ||
          pluginName === '@stylistic/eslint-plugin'
          ? // Temporary workaround because schema changes made the compilation fail
            deepReplace(meta?.schema, '#/items/0/', '#/')
          : meta?.schema,
      ),
    ).map((s) => {
      if (
        pluginName === 'eslint' &&
        ruleName === 'logical-assignment-operators'
      ) {
        return removeArrayTypeFromSchema(s);
      }

      if (
        pluginName === '@typescript-eslint/eslint-plugin' &&
        ruleName === 'return-await'
      ) {
        return removeStringTypeFromSchema(s);
      }

      if (
        (pluginName === 'eslint-plugin-playwright' ||
          pluginName === 'eslint-plugin-jest' ||
          pluginName === '@vitest/eslint-plugin') &&
        ruleName === 'valid-title'
      ) {
        return expandMustMatchPatternProperties(s);
      }

      if (
        pluginName === 'eslint-plugin-prefer-arrow-functions' &&
        ruleName === 'prefer-arrow-functions'
      ) {
        return convertPatternToEnum(s);
      }

      if (
        pluginName === 'eslint-plugin-unicorn' &&
        ruleName === 'import-style'
      ) {
        return expandBooleanObjectProperties(s);
      }

      if (
        pluginName === 'eslint-plugin-cypress' &&
        ruleName === 'unsafe-to-chain-command'
      ) {
        return renameTitleToOptions(s);
      }

      return s;
    });

    return {
      ruleName,
      schema: fixedSchema,
      deprecated: meta?.deprecated ?? false,
      rawSchema: falseToUndefined(meta?.schema) ?? [],
      docs: metaToString(meta),
    };
  });

  return createResult(
    schemaList,
    typeName,
    createRulePrefix(rulePrefixOrNull, pluginName),
  );
};

/**
 * プラグイン名から対応するルール一覧を取得する。組み込みルールとカスタムルールを統一的に扱う
 */
const getRules = async (
  pluginName: string,
): Promise<DeepReadonly<[string, Rule][]>> => {
  switch (pluginName) {
    case 'eslint':
      return (
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        Array.from(builtinRules.entries()) as unknown as DeepReadonly<
          [string, Rule][]
        >
      );

    case eslintPlugins.EslintTsRestrictionsRules.pluginName:
      return Object.entries(tsRestrictionsRules as unknown as Rules);

    case eslintPlugins.EslintReactCodingStyleRules.pluginName:
      return Object.entries(reactCodingStyleRules as unknown as Rules);

    case eslintPlugins.EslintVitestCodingStyleRules.pluginName:
      return Object.entries(vitestCodingStyleRules as unknown as Rules);

    case eslintPlugins.EslintTotalFunctions.pluginName:
      return Object.entries(totalFunctionsRules as unknown as Rules);

    case eslintPlugins.EslintTreeShakable.pluginName:
      return Object.entries(treeShakableRules as unknown as Rules);

    case eslintPlugins.EslintStrictDependencies.pluginName:
      return Object.entries(strictDependenciesRules as unknown as Rules);

    case eslintPlugins.EslintPreferArrowFunctionRules.pluginName:
    case eslintPlugins.EslintImportsRules.pluginName:
      return Object.entries(
        // eslint-disable-next-line unicorn/no-await-expression-member
        (await import(pluginName)).rules as Rules,
      );

    default:
      return Object.entries(
        // eslint-disable-next-line unicorn/no-await-expression-member
        (await import(pluginName)).default.rules as Rules,
      );
  }
};
