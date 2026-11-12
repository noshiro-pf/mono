import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noSideEffectImport } from './no-side-effect-import.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
  },
});

describe('no-side-effect-import', () => {
  tester.run('no-side-effect-import', noSideEffectImport, {
    valid: [
      {
        name: 'accepts a named import',
        code: "import { SafeArray } from 'ts-std-forge';",
      },
      {
        name: 'accepts a namespace import',
        code: "import * as std from 'ts-std-forge';",
      },
      {
        name: "leaves another module's side-effect import alone",
        code: dedent`
          import './polyfills.mjs';
          import 'ts-std-forge-extras';
          import 'ts-data-forge';
        `,
      },
    ],
    invalid: [
      {
        name: 'removes a side-effect-only import with its line',
        code: dedent`
          import 'ts-std-forge';
          import { SafeArray } from 'ts-std-forge';
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
        `,
        errors: [{ messageId: 'removeSideEffectImport' }],
      },
    ],
  });
});
