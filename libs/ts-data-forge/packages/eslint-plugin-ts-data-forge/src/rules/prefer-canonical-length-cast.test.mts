import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCanonicalLengthCast } from './prefer-canonical-length-cast.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

describe('prefer-canonical-length-cast', () => {
  tester.run('prefer-canonical-length-cast', preferCanonicalLengthCast, {
    valid: [
      {
        name: 'ignores non-degenerate bounds',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asMinLengthArray(2, xs);
        `,
      },
      {
        name: 'ignores a bounded range that is not degenerate',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asBoundedLengthArray(1, 5, xs);
        `,
      },
      {
        name: 'ignores asMaxLengthArray with a bound other than 0',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asMaxLengthArray(5, xs);
        `,
      },
      {
        name: 'ignores the widening asBoundedLengthArray(0, n, xs) case',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asBoundedLengthArray(0, 5, xs);
        `,
      },
      {
        name: 'ignores the curried form',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          const asNonEmpty = Arr.asMinLengthArray(1);
          const asPair = Arr.asBoundedLengthArray(2, 2);
        `,
      },
      {
        name: 'ignores a non-literal bound',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const n = 1;
          const ys = Arr.asMinLengthArray(n, xs);
        `,
      },
      {
        name: 'ignores already-canonical casts',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asNonEmptyArray(xs);
        `,
      },
      {
        name: 'ignores an Arr that is not from ts-data-forge',
        code: dedent`
          import { Arr } from './my-helpers.mjs';

          declare const xs: readonly number[];
          const ys = Arr.asMinLengthArray(1, xs);
        `,
      },
      {
        name: 'ignores spread arguments',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const args: readonly [1, readonly number[]];
          const ys = Arr.asMinLengthArray(...args);
        `,
      },
    ],
    invalid: [
      {
        name: 'asMinLengthArray(1, xs) becomes asNonEmptyArray(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asMinLengthArray(1, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asNonEmptyArray(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'asBoundedLengthArray(n, n, xs) becomes asFixedLengthArray(n, xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asBoundedLengthArray(3, 3, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asFixedLengthArray(3, xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'asMaxLengthArray(0, xs) becomes asEmptyArray(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asMaxLengthArray(0, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asEmptyArray(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'keeps a complex array expression intact',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const obj: Readonly<{ items: readonly number[] }>;
          const ys = Arr.asMinLengthArray(1, obj.items.filter((x) => x > 0));
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const obj: Readonly<{ items: readonly number[] }>;
          const ys = Arr.asNonEmptyArray(obj.items.filter((x) => x > 0));
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'resolves an aliased Arr import',
        code: dedent`
          import { Arr as A } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = A.asMinLengthArray(1, xs);
        `,
        output: dedent`
          import { Arr as A } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = A.asNonEmptyArray(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'rewrites several casts in one file',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const a = Arr.asMinLengthArray(1, xs);
          const b = Arr.asBoundedLengthArray(2, 2, xs);
          const c = Arr.asMaxLengthArray(0, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const a = Arr.asNonEmptyArray(xs);
          const b = Arr.asFixedLengthArray(2, xs);
          const c = Arr.asEmptyArray(xs);
        `,
        errors: [
          { messageId: 'useCanonicalCast' },
          { messageId: 'useCanonicalCast' },
          { messageId: 'useCanonicalCast' },
        ],
      },
      {
        name: 'asFixedLengthArray(0, xs) becomes asEmptyArray(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asFixedLengthArray(0, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asEmptyArray(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'asBoundedLengthArray(0, 0, xs) becomes asEmptyArray(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asBoundedLengthArray(0, 0, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asEmptyArray(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'asMinLengthTuple(1, xs) becomes asNonEmptyTuple(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asMinLengthTuple(1, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asNonEmptyTuple(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'asFixedLengthTuple(0, xs) becomes asEmptyTuple(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asFixedLengthTuple(0, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asEmptyTuple(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'asMaxLengthTuple(0, xs) becomes asEmptyTuple(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asMaxLengthTuple(0, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asEmptyTuple(xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
      {
        name: 'asBoundedLengthTuple(n, n, xs) becomes asFixedLengthTuple(n, xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asBoundedLengthTuple(3, 3, xs);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ys = Arr.asFixedLengthTuple(3, xs);
        `,
        errors: [{ messageId: 'useCanonicalCast' }],
      },
    ],
  });
});
