import parser from '@typescript-eslint/parser';
import plugin from '@vitest/eslint-plugin';
import dedent from 'dedent';
import { RuleTester } from 'eslint';
import { eslintConfigForVitest } from './vitest.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

const settings = { ...eslintConfigForVitest().settings } as const;

const preferDescribeFunctionTitle =
  plugin.rules['prefer-describe-function-title'];

describe(eslintConfigForVitest, () => {
  // Without `settings.vitest.typecheck`, the rule takes any import named as the
  // title for a function and autofixes the string into a reference to it.
  assert.isDefined(preferDescribeFunctionTitle);

  tester.run('prefer-describe-function-title', preferDescribeFunctionTitle, {
    valid: [
      {
        name: 'a title matching a type-only import',
        settings,
        code: dedent`
          import { type ParsedPath } from 'node:path';

          describe('ParsedPath', () => {});

          export type T = ParsedPath;
        `,
      },
    ],
    invalid: [
      {
        name: 'a title matching an imported function',
        settings,
        code: dedent`
          import { join } from 'node:path';

          describe('join', () => {});
        `,
        output: dedent`
          import { join } from 'node:path';

          describe(join, () => {});
        `,
        errors: [{ messageId: 'preferFunction' }],
      },
    ],
  });
});
