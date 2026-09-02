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
          import { Arr } from 'ts-data-forge';

          const first = Arr.isNonEmpty(xs) ? xs[0] : undefined;
        `,
      },
      {
        name: 'accepts a namespace import',
        code: dedent`
          import * as tdf from 'ts-data-forge';

          const sum = tdf.Arr.sum(xs);
        `,
      },
      {
        name: 'leaves other side-effect imports alone',
        code: dedent`
          import './polyfills.mjs';
          import 'ts-data-forge-extras';
        `,
      },
    ],
    invalid: [
      {
        name: 'removes a side-effect-only import',
        code: dedent`
          import 'ts-data-forge';
        `,
        output: '',
        errors: [{ messageId: 'removeSideEffectImport' }],
      },
      {
        name: 'removes it along with its line',
        code: dedent`
          import 'ts-data-forge';
          import { Arr } from 'ts-data-forge';

          const sum = Arr.sum(xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          const sum = Arr.sum(xs);
        `,
        errors: [{ messageId: 'removeSideEffectImport' }],
      },
      {
        name: 'removes every side-effect-only import',
        code: dedent`
          import 'ts-data-forge';
          import './polyfills.mjs';
          import 'ts-data-forge';

          const answer = 42;
        `,
        output: dedent`
          import './polyfills.mjs';

          const answer = 42;
        `,
        errors: [
          { messageId: 'removeSideEffectImport' },
          { messageId: 'removeSideEffectImport' },
        ],
      },
    ],
  });
});
