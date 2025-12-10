import { type DeprecatedInfo } from '@eslint/core';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { compile, type Options } from 'json-schema-to-typescript';
import { castDeepMutable } from 'ts-data-forge';
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
import {
  addDefaultValuesToDescription,
  convertPatternToEnum,
  enforceMinItemsForRestrictedTuple,
  enforceObjectShorthandTupleLength,
  expandBooleanObjectProperties,
  expandMustMatchPatternProperties,
  normalizeExpectExpectSchema,
  normalizeJsxBooleanValueSchema,
  normalizeJsxPascalCaseSchema,
  normalizeNoKeywordPrefixSchema,
  removeArrayTypeFromSchema,
  removeStringTypeFromSchema,
  renameTitleToOptions,
} from './fix-schema/index.mjs';
import { isDeprecated } from './is-deprecated.mjs';
import { normalizeSchemaToArray } from './normalize-schema-to-array.mjs';
import { metaToString, rawSchemaToString } from './print/index.mjs';
import { type JSONSchema4 } from './type.mjs';

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
      schemaToPrint: JSONSchema4 | JSONSchema4[];
    }[]
  > = rules.map(([ruleName, { meta }]) => {
    const fixedSchema: readonly JSONSchema4[] = normalizeSchemaToArray(
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
        pluginName === '@typescript-eslint/eslint-plugin' &&
        ruleName === 'no-restricted-imports'
      ) {
        return enforceMinItemsForRestrictedTuple(s);
      }

      if (
        pluginName === 'eslint' &&
        (ruleName === 'no-restricted-imports' ||
          ruleName === 'no-restricted-globals')
      ) {
        return enforceMinItemsForRestrictedTuple(s);
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
        pluginName === 'eslint-plugin-playwright' &&
        ruleName === 'expect-expect'
      ) {
        return normalizeExpectExpectSchema(s);
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

      if (pluginName === 'eslint' && ruleName === 'object-shorthand') {
        return enforceObjectShorthandTupleLength(s);
      }

      if (
        pluginName === 'eslint-plugin-cypress' &&
        ruleName === 'unsafe-to-chain-command'
      ) {
        return renameTitleToOptions(s);
      }

      if (
        pluginName === 'eslint-plugin-react' &&
        ruleName === 'jsx-boolean-value'
      ) {
        return normalizeJsxBooleanValueSchema(s);
      }

      if (
        pluginName === 'eslint-plugin-react' &&
        ruleName === 'jsx-pascal-case'
      ) {
        return normalizeJsxPascalCaseSchema(s);
      }

      if (
        pluginName === 'eslint-plugin-unicorn' &&
        ruleName === 'no-keyword-prefix'
      ) {
        return normalizeNoKeywordPrefixSchema(s);
      }

      return s;
    });

    return {
      ruleName,
      schema: fixedSchema,
      deprecated: meta?.deprecated ?? false,
      // schemaToPrint: falseToUndefined(meta?.schema) ?? [],
      schemaToPrint: fixedSchema,
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
 * スキーマリストから型定義ファイルの内容を生成する。ルールごとに namespace と RuleEntry 型を作成し、プラグイン全体の型を export する
 */
const createResult = async (
  schemaList: DeepReadonly<
    {
      ruleName: string;
      docs: string;
      deprecated: boolean | DeprecatedInfo;
      schema: JSONSchema4[];
      schemaToPrint: JSONSchema4 | JSONSchema4[];
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

  for (const {
    deprecated,
    docs,
    schemaToPrint,
    ruleName,
    schema,
  } of schemaList) {
    mut_resultToWrite.push(docs, `namespace ${toCapitalCase(ruleName)} {`);

    if (isDeprecated(deprecated)) {
      if (schema.length > 0) {
        mut_resultToWrite.push(...rawSchemaToString(schemaToPrint));
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
          mut_resultToWrite.push(...rawSchemaToString(schemaToPrint));

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
          mut_resultToWrite.push(...rawSchemaToString(schemaToPrint));

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
 * プラグイン名から対応するルール一覧を取得する。組み込みルールとカスタムルールを統一的に扱う
 */
const getRules = async (
  pluginName: string,
): Promise<DeepReadonly<[string, Rule][]>> => {
  switch (pluginName) {
    case 'eslint':
      return (
        // eslint-disable-next-line @typescript-eslint/no-deprecated, total-functions/no-unsafe-type-assertion
        Array.from(builtinRules.entries()) as unknown as DeepReadonly<
          [string, Rule][]
        >
      );

    case eslintPlugins.EslintTsRestrictionsRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(tsRestrictionsRules as unknown as Rules);

    case eslintPlugins.EslintReactCodingStyleRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(reactCodingStyleRules as unknown as Rules);

    case eslintPlugins.EslintVitestCodingStyleRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(vitestCodingStyleRules as unknown as Rules);

    case eslintPlugins.EslintTotalFunctions.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(totalFunctionsRules as unknown as Rules);

    case eslintPlugins.EslintTreeShakable.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(treeShakableRules as unknown as Rules);

    case eslintPlugins.EslintStrictDependencies.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(strictDependenciesRules as unknown as Rules);

    case eslintPlugins.EslintPreferArrowFunctionRules.pluginName:
    case eslintPlugins.EslintImportsRules.pluginName:
      return Object.entries(
        // eslint-disable-next-line unicorn/no-await-expression-member, total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access
        (await import(pluginName)).rules as Rules,
      );

    default:
      return Object.entries(
        // eslint-disable-next-line unicorn/no-await-expression-member, total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unsafe-member-access
        (await import(pluginName)).default.rules as Rules,
      );
  }
};
