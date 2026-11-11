import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferArrEmptinessGuard } from './prefer-arr-emptiness-guard.mjs';

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

describe('prefer-arr-emptiness-guard', () => {
  tester.run('prefer-arr-emptiness-guard', preferArrEmptinessGuard, {
    valid: [
      {
        name: 'ignores non-array types',
        code: dedent`
          const str = "hello";
          const ok = str.length > 0;
        `,
      },
      {
        name: 'leaves half of a range to prefer-arr-is-bounded-length-array',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length >= 1 && xs.length <= 3;
        `,
      },
      {
        name: 'ignores comparisons with non-zero',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length > 1;
        `,
      },
    ],
    invalid: [
      {
        name: 'replaces xs.length >= 1 with Arr.isNonEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length >= 1;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'replaces xs.length !== 0 with Arr.isNonEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length !== 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'replaces xs.length === 0 with Arr.isEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length === 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isEmpty(xs);
        `,
        errors: [{ messageId: 'useIsEmpty' }],
      },
      {
        name: 'replaces xs.length <= 0 with Arr.isEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length <= 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isEmpty(xs);
        `,
        errors: [{ messageId: 'useIsEmpty' }],
      },
      {
        name: 'replaces xs.length < 1 with Arr.isEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length < 1;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isEmpty(xs);
        `,
        errors: [{ messageId: 'useIsEmpty' }],
      },
      {
        name: 'replaces xs.length > 0 with Arr.isNonEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'replaces 0 < xs.length with Arr.isNonEmpty',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = 0 < xs.length;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'keeps existing Arr import',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          const xs = [1, 2, 3];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
    ],
  });
}, 20000);

describe('prefer-arr-emptiness-guard through type wrappers', () => {
  tester.run('prefer-arr-emptiness-guard', preferArrEmptinessGuard, {
    valid: [
      {
        name: 'a type that says `0` is not the value `0`: only a literal is read through its wrapper',
        code: dedent`
          declare const xs: readonly number[];
          declare const n: number;
          const a = xs.length > (n as 0);
        `,
      },
      {
        name: 'a computed index named `length` is not the length',
        code: dedent`
          declare const xs: readonly number[];
          declare const length: number;
          const a = xs[length] > 0;
          const b = xs[length]! > 0;
        `,
      },
      {
        name: 'a string cast to an array',
        code: dedent`
          declare const s: string;
          const ok = (s as unknown as readonly string[]).length > 0;
        `,
      },
    ],
    invalid: [
      {
        name: 'the length or the zero wrapped',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = (xs.length satisfies number) > 0;
          const b = xs.length > (0 as number);
          const c = 0 < xs.length!;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const a = Arr.isNonEmpty(xs);
          const b = Arr.isNonEmpty(xs);
          const c = Arr.isNonEmpty(xs);
        `,
        errors: [
          { messageId: 'useIsNonEmpty' },
          { messageId: 'useIsNonEmpty' },
          { messageId: 'useIsNonEmpty' },
        ],
      },
    ],
  });
}, 20000);

describe('prefer-arr-emptiness-guard with parenthesized operands', () => {
  tester.run('prefer-arr-emptiness-guard', preferArrEmptinessGuard, {
    valid: [],
    invalid: [
      {
        name: 'a sequence array keeps its parentheses',
        code: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = (log(), xs).length > 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          declare const log: () => void;
          const ok = Arr.isNonEmpty((log(), xs));
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
    ],
  });
}, 20000);

describe('prefer-arr-emptiness-guard and the import it adds', () => {
  tester.run('prefer-arr-emptiness-guard', preferArrEmptinessGuard, {
    valid: [],
    invalid: [
      {
        name: 'a leading directive stays first',
        code: dedent`
          'use client';
          declare const xs: readonly number[];
          const ok = xs.length > 0;
        `,
        output: dedent`
          'use client';
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'joins an existing named import from the module',
        code: dedent`
          import { asInt } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { asInt, Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'turns a type-only specifier into a value import',
        code: dedent`
          import { type Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'writes the local name of an aliased import',
        code: dedent`
          import { Arr as A } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { Arr as A } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = A.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'no fix when an import type binds the name',
        code: dedent`
          import type { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          const ok = xs.length > 0;
        `,
        output: null,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'no fix where a local binding takes the name',
        code: dedent`
          declare const xs: readonly number[];
          const f = (Arr: unknown) => xs.length > 0;
        `,
        output: null,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'a type parameter of the name does not take the value',
        code: dedent`
          declare const xs: readonly number[];
          function f<Arr>() {
            return xs.length > 0;
          }
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          function f<Arr>() {
            return Arr.isNonEmpty(xs);
          }
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'a local type alias of the name does not take the value',
        code: dedent`
          declare const xs: readonly number[];
          function f() {
            type Arr = number;
            return xs.length > 0;
          }
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          declare const xs: readonly number[];
          function f() {
            type Arr = number;
            return Arr.isNonEmpty(xs);
          }
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'each fix adds the import it needs, one per pass',
        code: dedent`
          declare const xs: readonly number[];
          const a = xs.length > 0;
          const b = 0 < xs.length;
        `,
        output: [
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            const a = Arr.isNonEmpty(xs);
            const b = 0 < xs.length;
          `,
          dedent`
            import { Arr } from 'ts-data-forge';
            declare const xs: readonly number[];
            const a = Arr.isNonEmpty(xs);
            const b = Arr.isNonEmpty(xs);
          `,
        ],
        errors: [
          { messageId: 'useIsNonEmpty' },
          { messageId: 'useIsNonEmpty' },
        ],
      },
    ],
  });
}, 20000);
