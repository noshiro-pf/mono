import parserModule from '@typescript-eslint/parser';
import { TSESLint } from '@typescript-eslint/utils';
import * as path from 'node:path';
import { describe, expect, test } from 'vitest';
import { strictDependenciesRule } from './strict-dependencies.mjs';

// FIXME: https://github.com/knowledge-work/eslint-plugin-strict-dependencies/tree/v1.3.27 のテストをコピーしてきて
// Codex でテスト・型チェックが通るようにさせただけなので、意味の無いテストになっていないかチェックして修正する

type RuleOptions = Parameters<
  (typeof strictDependenciesRule)['create']
>[0]['options'];

const pluginName = 'test-strict-dependencies';
const ruleId = 'strict-dependencies';

const fromRoot = (relativePath: string): string =>
  path.join(process.cwd(), relativePath);

const normalize = (value: string): string => path.normalize(value);

const allowPagesOptions: RuleOptions = [
  [
    {
      module: 'src/components/ui',
      allowReferenceFrom: ['src/components/pages'],
      allowSameModule: true,
    },
  ],
] as const;

const targetMembersOptions: RuleOptions = [
  [
    {
      module: 'src/components/ui',
      allowReferenceFrom: ['src/pages/**'],
      targetMembers: ['Text'],
    },
  ],
] as const;

const runRule = (
  code: string,
  filename: string,
  options: RuleOptions,
): readonly TSESLint.Linter.LintMessage[] => {
  const linter = new TSESLint.Linter();

  const config: TSESLint.Linter.ConfigType = [
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
      languageOptions: {
        parser: parserModule,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: 'module',
        },
      },
      plugins: {
        [pluginName]: {
          rules: {
            [ruleId]: strictDependenciesRule,
          },
        },
      },
      rules: {
        [`${pluginName}/${ruleId}`]: ['error', ...options],
      },
    },
  ];

  return linter.verify(code, config, filename);
};

describe('strictDependenciesRule', () => {
  test('allows import from permitted module', () => {
    const messages = runRule(
      "import { Text } from 'src/components/ui/Text';",
      fromRoot('src/components/pages/allowed.ts'),
      allowPagesOptions,
    );

    expect(messages).toHaveLength(0);
  });

  test('reports forbidden import when module is not allowed', () => {
    const messages = runRule(
      "import { Text } from 'src/components/ui/Text';",
      fromRoot('src/components/test/aaa.ts'),
      allowPagesOptions,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe('forbidden-import');
    expect(messages[0]?.message).toBe(
      `import '${normalize('src/components/ui/Text')}' is not allowed from ${normalize('src/components/test/aaa.ts')}.`,
    );
  });

  test('reports forbidden specifier when target member is restricted', () => {
    const messages = runRule(
      "import { Text, TextProps } from 'src/components/ui/Text';",
      fromRoot('src/components/button.tsx'),
      targetMembersOptions,
    );

    expect(messages).toHaveLength(1);
    expect(messages[0]?.messageId).toBe('forbidden-import-specifier');
    expect(messages[0]?.message).toBe(
      `import specifier 'Text' is not allowed from ${normalize('src/components/button.tsx')}.`,
    );
  });
});
