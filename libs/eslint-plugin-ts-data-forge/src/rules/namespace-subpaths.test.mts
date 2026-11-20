import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrEmptinessGuard } from './prefer-arr-emptiness-guard.mjs';
import { preferArrIsArray } from './prefer-arr-is-array.mjs';
import { preferCanonicalArraySlicing } from './prefer-canonical-array-slicing.mjs';
import { preferNumSafeParseFloat } from './prefer-num-safe-parse-float.mjs';

// `import * as Arr from 'ts-data-forge/array'` and `import * as Num from
// 'ts-data-forge/number'` bind what `import { Arr, Num } from 'ts-data-forge'`
// does, for the rules eslint-rule-forge's factories build and for the plugin's
// own (`NAMESPACE_SUBPATHS`).

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

describe('Arr bound by the ts-data-forge/array namespace', () => {
  tester.run('prefer-arr-emptiness-guard', preferArrEmptinessGuard, {
    valid: [],
    invalid: [
      {
        name: 'writes through the namespace, with no new import',
        code: dedent`
          import * as Arr from 'ts-data-forge/array';
          const xs = [1, 2, 3];
          const ok = xs.length >= 1;
        `,
        output: dedent`
          import * as Arr from 'ts-data-forge/array';
          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'adds the namespace import where the file imports another subpath',
        code: dedent`
          import * as Num from 'ts-data-forge/number';
          const xs = [Num.MAX_SAFE_INTEGER];
          const ok = xs.length >= 1;
        `,
        output: dedent`
          import * as Num from 'ts-data-forge/number';
          import * as Arr from 'ts-data-forge/array';
          const xs = [Num.MAX_SAFE_INTEGER];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
    ],
  });

  tester.run('prefer-arr-is-array', preferArrIsArray, {
    valid: [],
    invalid: [
      {
        name: 'writes through an alias of the namespace',
        code: dedent`
          import * as A from 'ts-data-forge/array';
          declare const u: unknown;
          const ok = Array.isArray(u);
        `,
        output: dedent`
          import * as A from 'ts-data-forge/array';
          declare const u: unknown;
          const ok = A.isArray(u);
        `,
        errors: [{ messageId: 'useIsArray' }],
      },
    ],
  });

  tester.run('prefer-canonical-array-slicing', preferCanonicalArraySlicing, {
    valid: [],
    invalid: [
      {
        name: "a plugin rule's suggestion writes through the namespace",
        code: dedent`
          import * as Arr from 'ts-data-forge/array';
          declare const xs: readonly number[];
          const ys = xs.toSpliced(0, 1);
        `,
        errors: [
          {
            messageId: 'preferCanonicalArraySlicingUnfixed',
            suggestions: [
              {
                messageId: 'suggestCanonicalArraySlicing',
                output: dedent`
                  import * as Arr from 'ts-data-forge/array';
                  declare const xs: readonly number[];
                  const ys = Arr.tail(xs);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});

describe('Num bound by the ts-data-forge/number namespace', () => {
  tester.run('prefer-num-safe-parse-float', preferNumSafeParseFloat, {
    valid: [],
    invalid: [
      {
        // `Result` has no subpath of its own: it is added by name.
        name: 'writes through the namespace and adds what has no subpath by name',
        code: dedent`
          import * as Num from 'ts-data-forge/number';
          const a = parseFloat('12px');
        `,
        errors: [
          {
            messageId: 'useSafeParseFloat',
            suggestions: [
              {
                messageId: 'replaceWithSafeParse',
                output: dedent`
                  import { Result } from 'ts-data-forge';
                  import * as Num from 'ts-data-forge/number';
                  const a = Result.unwrapOkOr(Num.safeParseFloat('12px'), Number.NaN);
                `,
              },
            ],
          },
        ],
      },
    ],
  });
});
