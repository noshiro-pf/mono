import type { DeprecatedInfo } from '@eslint/core';
import { immerCodingStyleRules } from 'eslint-plugin-immer-coding-style';
import { reactCodingStyleRules } from 'eslint-plugin-react-coding-style';
import { tsDataForgeRules } from 'eslint-plugin-ts-data-forge';
import { tsUiRestrictionsRules } from 'eslint-plugin-ts-ui-restrictions';
import { vitestCodingStyleRules } from 'eslint-plugin-vitest-coding-style';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { compile, type Options } from 'json-schema-to-typescript';
import { Arr, castDeepMutable, expectType } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type {
  EslintNRules,
  EslintReactRules,
  Rule,
  Rules,
} from '../../../src/index.mjs';
import { strictDependenciesRules } from '../../../src/plugins/strict-dependencies/rules/index.mjs';
import { totalFunctionsRules } from '../../../src/plugins/total-functions/rules/index.mjs';
import { treeShakableRules } from '../../../src/plugins/tree-shakable/rules/index.mjs';
import { tsRestrictionsRules } from '../../../src/plugins/ts-restrictions/rules/rules.mjs';
// eslint-disable-next-line import-x/no-relative-packages -- tools/ is not a package; this is how packages reach its shared scripts
import { withInternalTag } from '../../../../../tools/configs/gen-eslint-plugin-rule-types.mjs';
import { eslintPlugins } from '../constants/eslint-plugins.mjs';
import { tsTypeForgeImportStatement } from '../constants/ts-type-forge-import.mjs';
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
import {
  isObjectFormSchema,
  normalizeSchemaToArray,
} from './normalize-schema-to-array.mjs';
import {
  metaToString,
  rawSchemaToString,
  withSchemaDoc,
} from './print/index.mjs';
import { renameShadowedDeclarations } from './rename-shadowed-declarations.mjs';
import { stripGeneratorBoilerplateComments } from './strip-generator-boilerplate-comments.mjs';
import type { JSONSchema4 } from './type.mjs';

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
  format: true,
  unknownAny: true,
} as const satisfies Partial<Options>;

// Plugins whose `valid-title` rule schema needs `mustMatch`/`mustNotMatch`
// pattern expansion. Hoisted to module scope as a Set so it is allocated once
// and looked up in O(1) rather than re-allocating/scanning on every iteration.
const validTitlePlugins: ReadonlySet<string> = new Set<string>([
  'eslint-plugin-playwright',
  'eslint-plugin-jest',
  '@vitest/eslint-plugin',
]);

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
      spreadsOptions: boolean;
      schemaToPrint: JSONSchema4 | JSONSchema4[];
    }[]
  > = rules.map(([ruleName, { meta }]) => {
    const rawSchema = falseToUndefined(meta?.schema);

    const fixedSchema: readonly JSONSchema4[] = normalizeSchemaToArray(
      falseToUndefined(
        pluginName === '@typescript-eslint/eslint-plugin' ||
          pluginName === '@stylistic/eslint-plugin'
          ? // Temporary workaround because schema changes made the compilation fail
            // (`deepReplace` takes `false`, which JSON round-trips, but not `undefined`)
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

      if (ruleName === 'valid-title' && validTitlePlugins.has(pluginName)) {
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
      // Decided before normalization, which makes `{ type: 'array' }` and
      // `[{ type: 'array' }]` look the same.
      spreadsOptions: isObjectFormSchema(rawSchema),
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
      spreadsOptions: boolean;
      schemaToPrint: JSONSchema4 | JSONSchema4[];
    }[]
  >,
  typeName: string,
  ruleNamePrefix: string,
): Promise<string> => {
  const mut_resultToWrite: string[] = [
    '/* cSpell:disable */',
    "import type { Linter } from 'eslint';",
    tsTypeForgeImportStatement,
    // An object-form schema always normalizes to one schema, so every rule that
    // spreads takes the `case 1` branch below.
    ...(schemaList.some((s) => !isDeprecated(s.deprecated) && s.spreadsOptions)
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
    spreadsOptions,
  } of schemaList) {
    const namespaceName = toCapitalCase(ruleName);

    mut_resultToWrite.push(
      withInternalTag(docs),
      `namespace ${namespaceName} {`,
    );

    if (isDeprecated(deprecated)) {
      if (Arr.isNonEmpty(schema)) {
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
            ...withSchemaDoc(
              rawSchemaToString(schemaToPrint),
              renameShadowedDeclarations(namespaceName, [
                stripGeneratorBoilerplateComments(optionsType),
              ]).join('\n'),
            ),
            '',
            '  export type RuleEntry = ',
            generatorOption.explicitRuleDefaultOption
              ? `"off" | ${RuleSeverityWithDefaultOption}`
              : 'Linter.StringSeverity',
            // An object-form schema validates the whole options array, so an
            // array-typed `Options` is the options themselves. In an
            // array-form schema it is the first option, kept as one element.
            spreadsOptions
              ? `   | SpreadOptionsIfIsArray<readonly [${RuleSeverityForNoOption}, Options]>;`
              : `   | readonly [${RuleSeverityForNoOption}, Options];`,
            '',
          );

          break;
        }

        default: {
          const schemasWithDefaults = schema.map(addDefaultValuesToDescription);

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
            ...withSchemaDoc(
              rawSchemaToString(schemaToPrint),
              renameShadowedDeclarations(
                namespaceName,
                optionsTypeList.map(stripGeneratorBoilerplateComments),
              ).join('\n'),
            ),
            '',
            '  export type RuleEntry = ',
            generatorOption.explicitRuleDefaultOption
              ? `"off" | ${RuleSeverityWithDefaultOption}`
              : 'Linter.RuleSeverity',
            // `scan` yields the severity on its own, then the severity with
            // each further options type appended - one pass, where mapping the
            // index rebuilt and re-joined the whole prefix for every row.
            // `tail` drops the severity-only row, which is not an overload.
            ...Arr.tail(
              Arr.scan(
                OptionsStrs,
                (row, optionsType) => `${row}, ${optionsType}`,
                RuleSeverityForNoOption,
              ),
            ).map((row) => `   | readonly [${row}]`),
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

    ...(Arr.isEmpty(deprecatedSchemaList)
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
    schemaList.some(
      (s) => !isDeprecated(s.deprecated) && Arr.isNonEmpty(s.schema),
    )
  ) {
    mut_resultToWrite.push(
      '',
      `export type ${typeName}Option = {`,

      ...schemaList
        .filter((s) => !isDeprecated(s.deprecated) && Arr.isNonEmpty(s.schema))
        .map(({ ruleName, schema }) =>
          [
            `'${ruleNamePrefix}${ruleName}': `,
            Arr.isFixedLengthArray(1, schema)
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
      : (`${pluginName.replace(/^eslint-plugin-/u, '')}/` as const);

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
        Array.from(builtinRules) as unknown as DeepReadonly<[string, Rule][]>
      );

    case eslintPlugins.EslintTsRestrictionsRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(tsRestrictionsRules as unknown as Rules);

    case eslintPlugins.EslintTsUiRestrictionsRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(tsUiRestrictionsRules as unknown as Rules);

    case eslintPlugins.EslintReactCodingStyleRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(reactCodingStyleRules as unknown as Rules);

    case eslintPlugins.EslintVitestCodingStyleRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(vitestCodingStyleRules as unknown as Rules);

    case eslintPlugins.EslintImmerCodingStyleRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(immerCodingStyleRules as unknown as Rules);

    // A workspace plugin with no default export: its rules object is named.
    case eslintPlugins.EslintTsDataForgeRules.pluginName:
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return Object.entries(tsDataForgeRules as unknown as Rules);

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

if (import.meta.vitest !== undefined) {
  /** The text of `RuleEntry` in the namespace generated for `ruleName`. */
  const ruleEntryOf = (generated: string, ruleName: string): string => {
    const namespaceStart = generated.indexOf(
      `namespace ${toCapitalCase(ruleName)} {`,
    );

    assert.isAtLeast(namespaceStart, 0);

    const entryStart = generated.indexOf(
      'export type RuleEntry =',
      namespaceStart,
    );

    assert.isAtLeast(entryStart, 0);

    // `RuleEntry` must be this namespace's, not the next one's. The next
    // `namespace` keyword ends this one; a `}` does not, since the compiled
    // `Options` may close a brace at column 0.
    const nextNamespace = generated.indexOf('\nnamespace ', namespaceStart);

    assert.isTrue(nextNamespace === -1 || entryStart < nextNamespace);

    const entryEnd = generated.indexOf(';', entryStart);

    assert.isAtLeast(entryEnd, 0);

    return generated
      .slice(entryStart, entryEnd + 1)
      .replaceAll(/\s+/gu, ' ')
      .trim();
  };

  const notSpread =
    'export type RuleEntry = "off" | Linter.Severity | readonly [Linter.StringSeverity, Options];';

  type CallbackReturn = EslintNRules['n/callback-return'];

  type NoInvalidHtmlAttr = EslintReactRules['react/no-invalid-html-attribute'];

  // The committed rule types take the documented array option as one element;
  // the elements as separate options, which ESLint refuses, do not type-check.
  expectType<readonly ['error', readonly ['done', 'next']], CallbackReturn>(
    '<=',
  );

  expectType<readonly ['error', 'done', 'next'], CallbackReturn>('!<=');

  expectType<readonly ['error', readonly ['rel']], NoInvalidHtmlAttr>('<=');

  expectType<readonly ['error', 'rel'], NoInvalidHtmlAttr>('!<=');

  describe(generateRulesTypeCore, () => {
    test('spreads the options of an object-form schema, which validates the whole options array', async () => {
      const generated = await generateRulesTypeCore(
        'EslintRules',
        'eslint',
        undefined,
      );

      // `consistent-this`: `schema: { type: 'array', … }`
      expect(ruleEntryOf(generated, 'consistent-this')).toBe(
        'export type RuleEntry = "off" | Linter.Severity | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;',
      );
    });

    test('keeps an array-valued first option of an array-form schema as one element', async () => {
      const generated = await generateRulesTypeCore(
        'EslintNRules',
        'eslint-plugin-n',
        undefined,
      );

      // `callback-return`: `schema: [{ type: 'array', … }]`
      expect(ruleEntryOf(generated, 'callback-return')).toBe(notSpread);

      expect(ruleEntryOf(generated, 'no-restricted-import')).toBe(notSpread);
    });

    test('keeps the array-valued first option of react/no-invalid-html-attribute as one element', async () => {
      const generated = await generateRulesTypeCore(
        'EslintReactRules',
        'eslint-plugin-react',
        undefined,
      );

      expect(ruleEntryOf(generated, 'no-invalid-html-attribute')).toBe(
        notSpread,
      );
    });
  });
}
