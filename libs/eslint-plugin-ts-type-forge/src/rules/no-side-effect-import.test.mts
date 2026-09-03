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
        code: dedent`
          import { type NonEmptyArray } from 'ts-type-forge';

          export type Names = NonEmptyArray<string>;
        `,
      },
      {
        name: 'leaves the ambient globals entry point alone',
        code: dedent`
          import 'ts-type-forge/global';
        `,
      },
      {
        name: 'leaves other side-effect imports alone',
        code: dedent`
          import './polyfills.mjs';
          import 'ts-type-forge-extras';
        `,
      },
    ],
    invalid: [
      {
        name: 'removes a side-effect-only import',
        code: dedent`
          import 'ts-type-forge';
        `,
        output: '',
        errors: [{ messageId: 'removeSideEffectImport' }],
      },
      {
        name: 'removes it along with its line',
        code: dedent`
          import 'ts-type-forge';
          import { type Uint32 } from 'ts-type-forge';

          export type Size = Uint32;
        `,
        output: dedent`
          import { type Uint32 } from 'ts-type-forge';

          export type Size = Uint32;
        `,
        errors: [{ messageId: 'removeSideEffectImport' }],
      },
      {
        name: 'removes every side-effect-only import',
        code: dedent`
          import 'ts-type-forge';
          import 'ts-type-forge/global';
          import 'ts-type-forge';

          export type Size = number;
        `,
        output: dedent`
          import 'ts-type-forge/global';

          export type Size = number;
        `,
        errors: [
          { messageId: 'removeSideEffectImport' },
          { messageId: 'removeSideEffectImport' },
        ],
      },
    ],
  });
});
