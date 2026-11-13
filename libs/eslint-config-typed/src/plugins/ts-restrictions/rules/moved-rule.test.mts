import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { tsRestrictionsRules } from './rules.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('the ids of the rules that moved to ts-ui-restrictions', () => {
  test.each([
    [
      'jsx-boolean-logical-operands',
      tsRestrictionsRules['jsx-boolean-logical-operands'],
      'jsx-boolean-logical-operands',
    ],
    [
      'require-ime-guard-on-enter',
      tsRestrictionsRules['require-ime-guard-on-enter'],
      'require-ime-guard',
    ],
  ] as const)('%s is deprecated in favor of its new id', (_, rule, newName) => {
    assert.deepStrictEqual(rule.meta.deprecated, {
      message: `Moved to \`eslint-plugin-ts-ui-restrictions\` as \`ts-ui-restrictions/${newName}\`, which \`eslint-config-typed\` turns on in its place.`,
      replacedBy: [
        {
          plugin: { name: 'eslint-plugin-ts-ui-restrictions' },
          rule: { name: newName },
        },
      ],
      availableUntil: '8.0.0',
    });
  });

  // A config that still sets the old id, with options, keeps the rule running
  // as it did.
  tester.run(
    'require-ime-guard-on-enter',
    tsRestrictionsRules['require-ime-guard-on-enter'],
    {
      valid: [
        {
          code: dedent`
            type KeyboardEvent = Readonly<{ key: string; isComposing: boolean }>;
            export const onKeyDown = (e: KeyboardEvent): boolean =>
              e.key === 'Escape';
          `,
          options: [{ keys: ['Enter'] }],
        },
      ],
      invalid: [
        {
          code: dedent`
            type KeyboardEvent = Readonly<{ key: string; isComposing: boolean }>;
            export const onKeyDown = (e: KeyboardEvent): boolean =>
              e.key === 'Enter';
          `,
          options: [{ keys: ['Enter'] }],
          errors: [{ messageId: 'missingImeGuard' }],
        },
      ],
    },
  );
});
