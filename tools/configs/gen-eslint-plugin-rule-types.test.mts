import { Result } from 'ts-data-forge';
import {
  generateRuleTypesFileContent,
  RULE_NAMESPACE_INTERNAL_TAG,
  withInternalTag,
} from './gen-eslint-plugin-rule-types.mjs';

describe('generateRuleTypesFileContent', () => {
  const noOptionRule = {
    meta: {
      type: 'problem',
      docs: { description: 'Disallow foo.' },
      schema: [],
    },
  } as const;

  const optionRule = {
    meta: {
      type: 'suggestion',
      docs: { description: 'Prefer bar.' },
      fixable: 'code',
      deprecated: true,
      schema: [{ type: 'object' }],
    },
  } as const;

  test('derives the type and rules-object names from the plugin prefix', () => {
    const content = generateRuleTypesFileContent({
      pluginPrefix: 'ts-data-forge',
      expectTypeFrom: 'ts-data-forge',
      rules: { 'no-foo': noOptionRule },
    });

    assert.isTrue(Result.isOk(content));

    assert.include(content.value, 'export type EslintTsDataForgeRules =');

    assert.include(content.value, 'export type EslintTsDataForgeRulesOption =');

    assert.include(
      content.value,
      "import type { tsDataForgeRules } from './rules/index.mjs';",
    );

    assert.include(content.value, "  'ts-data-forge/no-foo': NoFoo.RuleEntry;");
  });

  test('gives a plugin without options an explicitly empty record', () => {
    const content = generateRuleTypesFileContent({
      pluginPrefix: 'synstate',
      expectTypeFrom: 'ts-std-forge',
      rules: { 'no-foo': noOptionRule },
    });

    assert.isTrue(Result.isOk(content));

    // `Readonly<{}>` would accept any non-nullish value.
    assert.notInclude(content.value, 'Readonly<{}>');

    assert.include(
      content.value,
      'export type EslintSynstateRulesOption = ReadonlyRecord<never, never>;',
    );

    assert.include(
      content.value,
      "import type { ReadonlyRecord } from 'ts-type-forge';",
    );

    assert.notInclude(content.value, 'TSESLint');

    assert.include(
      content.value,
      '  export type RuleEntry = Linter.StringSeverity;',
    );
  });

  test('emits an Options type, and imports only what it uses, for a rule with options', () => {
    const content = generateRuleTypesFileContent({
      pluginPrefix: 'ts-fortress',
      expectTypeFrom: 'ts-data-forge',
      rules: { 'no-foo': noOptionRule, 'prefer-bar': optionRule },
    });

    assert.isTrue(Result.isOk(content));

    assert.include(
      content.value,
      "import type { TSESLint } from '@typescript-eslint/utils';",
    );

    assert.notInclude(content.value, 'ts-type-forge');

    assert.include(
      content.value,
      "  export type Options = NonNullable<RuleOptionsOf<'prefer-bar'>[0]>;",
    );

    assert.include(
      content.value,
      [
        'export type EslintTsFortressRulesOption = Readonly<{',
        "  'ts-fortress/prefer-bar': PreferBar.Options;",
        '}>;',
      ].join('\n'),
    );
  });

  test('keeps an array-valued first option as one element of the rule entry', () => {
    const arrayOptionRule = {
      meta: {
        type: 'suggestion',
        docs: { description: 'Prefer baz.' },
        schema: [{ type: 'array', items: { type: 'string' } }],
      },
    } as const;

    const content = generateRuleTypesFileContent({
      pluginPrefix: 'ts-fortress',
      expectTypeFrom: 'ts-data-forge',
      rules: { 'prefer-baz': arrayOptionRule },
    });

    assert.isTrue(Result.isOk(content));

    // ESLint passes `['error', ['a', 'b']]` to the rule as `[['a', 'b']]`;
    // spreading the array into the entry would accept `['error', 'a', 'b']`,
    // which ESLint refuses, and reject the valid form.
    assert.notInclude(content.value, 'SpreadOptionsIfIsArray');

    assert.include(
      content.value,
      [
        '  export type RuleEntry =',
        "    | 'off'",
        '    | Linter.Severity',
        '    | readonly [Linter.StringSeverity, Options];',
      ].join('\n'),
    );
  });

  test('writes the rule metadata into the JSDoc', () => {
    const content = generateRuleTypesFileContent({
      pluginPrefix: 'ts-fortress',
      expectTypeFrom: 'ts-data-forge',
      rules: { 'prefer-bar': optionRule },
    });

    assert.isTrue(Result.isOk(content));

    assert.include(content.value, ' * @description Prefer bar.');

    assert.include(
      content.value,
      [
        ' *  | key        | value      |',
        ' *  | :--------- | :--------- |',
        ' *  | type       | suggestion |',
        ' *  | deprecated | true       |',
        ' *  | fixable    | code       |',
      ].join('\n'),
    );

    // check:forgotten-exports reads the tag, which keeps the namespace out.
    assert.include(
      content.value,
      [' *  ```', ' *', ` * ${RULE_NAMESPACE_INTERNAL_TAG}`, ' */'].join('\n'),
    );

    assert.include(content.value, '   *     "type": "object"');
  });

  test('writes a hasSuggestions row for a rule that offers suggestions', () => {
    const suggestionRule = {
      meta: {
        type: 'suggestion',
        docs: { description: 'Prefer qux.' },
        hasSuggestions: true,
        schema: [],
      },
    } as const;

    const content = generateRuleTypesFileContent({
      pluginPrefix: 'ts-data-forge',
      expectTypeFrom: 'ts-data-forge',
      rules: { 'prefer-qux': suggestionRule, 'no-foo': noOptionRule },
    });

    assert.isTrue(Result.isOk(content));

    assert.include(
      content.value,
      [
        ' *  | key            | value      |',
        ' *  | :------------- | :--------- |',
        ' *  | type           | suggestion |',
        ' *  | deprecated     | false      |',
        ' *  | fixable        | false      |',
        ' *  | hasSuggestions | true       |',
        ' *  ```',
      ].join('\n'),
    );

    // A rule that does not declare it gets no row, as in eslint-config-typed's
    // generated types.
    assert.include(
      content.value,
      [
        ' *  | key        | value   |',
        ' *  | :--------- | :------ |',
        ' *  | type       | problem |',
        ' *  | deprecated | false   |',
        ' *  | fixable    | false   |',
        ' *  ```',
      ].join('\n'),
    );
  });

  test('asserts with expectType that the generated names match the rules object', () => {
    const content = generateRuleTypesFileContent({
      pluginPrefix: 'synstate',
      expectTypeFrom: 'ts-std-forge',
      rules: { 'no-foo': noOptionRule },
    });

    assert.isTrue(Result.isOk(content));

    assert.include(content.value, "import { expectType } from 'ts-std-forge';");

    const rulesObjectName = 'synstateRules';

    assert.include(
      content.value,
      [
        'expectType<',
        '  keyof EslintSynstateRules,',
        `  \`synstate/\${keyof typeof ${rulesObjectName}}\``,
        ">('=');",
      ].join('\n'),
    );

    assert.notInclude(content.value, 'AssertTrue');

    assert.notInclude(content.value, 'TypeEq');
  });

  test('fails on a rule without a description', () => {
    const content = generateRuleTypesFileContent({
      pluginPrefix: 'ts-fortress',
      expectTypeFrom: 'ts-data-forge',
      rules: { 'no-foo': { meta: { type: 'problem', schema: [] } } },
    });

    assert.isTrue(Result.isErr(content));

    assert.include(content.value, '"no-foo"');
  });
});

describe(withInternalTag, () => {
  test('makes the tag the comment of a rule with no docs', () => {
    assert.strictEqual(
      withInternalTag(''),
      `/** ${RULE_NAMESPACE_INTERNAL_TAG} */`,
    );
  });

  test('adds the tag as the last paragraph of a doc comment', () => {
    assert.strictEqual(
      withInternalTag(['/**', ' * Disallows x.', ' */'].join('\n')),
      [
        '/**',
        ' * Disallows x.',
        ' *',
        ` * ${RULE_NAMESPACE_INTERNAL_TAG}`,
        ' */',
      ].join('\n'),
    );
  });

  test('refuses a comment of another shape rather than drop it', () => {
    assert.throws(() => withInternalTag('/** @deprecated */'));

    assert.throws(() => withInternalTag('// Disallows x.\n */'));
  });
});
