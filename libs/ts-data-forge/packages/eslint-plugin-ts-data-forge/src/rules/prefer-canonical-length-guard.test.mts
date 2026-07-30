import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferCanonicalLengthGuard } from './prefer-canonical-length-guard.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
});

// The folded-in comparison rules are type-aware, so they need a TypeScript
// program; the guard-normalization half does not.
const typedTester = new RuleTester({
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

describe('prefer-canonical-length-guard (folded-in length comparisons)', () => {
  typedTester.run('prefer-canonical-length-guard', preferCanonicalLengthGuard, {
    valid: [
      {
        name: 'ignores non-array length comparisons',
        code: dedent`
          const str = 'hello';
          const ok = str.length > 0;
        `,
      },
    ],
    invalid: [
      {
        name: 'xs.length > 0 becomes Arr.isNonEmpty(xs)',
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
        name: 'xs.length >= 2 becomes Arr.isMinLengthArray(xs, 2)',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length >= 2;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isMinLengthArray(xs, 2);
        `,
        errors: [{ messageId: 'useIsMinLengthArray' }],
      },
      {
        name: 'xs.length === 3 becomes Arr.isFixedLengthArray(xs, 3)',
        code: dedent`
          const xs = [1, 2, 3];
          const ok = xs.length === 3;
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';
          const xs = [1, 2, 3];
          const ok = Arr.isFixedLengthArray(xs, 3);
        `,
        errors: [{ messageId: 'useIsFixedLengthArray' }],
      },
    ],
  });
});

describe('prefer-canonical-length-guard', () => {
  tester.run('prefer-canonical-length-guard', preferCanonicalLengthGuard, {
    valid: [
      {
        name: 'ignores non-degenerate bounds',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isFixedLengthTuple(xs, 2);
        `,
      },
      {
        name: 'ignores isMinLengthArray with a bound other than 1',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isMinLengthArray(xs, 2);
        `,
      },
      {
        name: 'ignores isBoundedLengthTuple unless both bounds are 0',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isBoundedLengthTuple(xs, 0, 1);
        `,
      },
      {
        name: 'ignores a non-literal bound',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const n = 0;
          const ok = Arr.isFixedLengthTuple(xs, n);
        `,
      },
      {
        name: 'ignores an Arr that is not from ts-data-forge',
        code: dedent`
          import { Arr } from './my-helpers.mjs';

          declare const xs: readonly number[];
          const ok = Arr.isFixedLengthTuple(xs, 0);
        `,
      },
      {
        name: 'ignores already-canonical guards',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isEmpty(xs);
        `,
      },
      {
        name: 'ignores spread arguments',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const args: readonly [readonly number[], 0];
          const ok = Arr.isFixedLengthTuple(...args);
        `,
      },
    ],
    invalid: [
      {
        name: 'isFixedLengthArray(xs, 0) becomes isEmpty(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isFixedLengthArray(xs, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isEmpty(xs);
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'isMinLengthTuple(xs, 1) becomes isNonEmpty(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isMinLengthTuple(xs, 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'isFixedLengthTuple(xs, 0) becomes isEmpty(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isFixedLengthTuple(xs, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isEmpty(xs);
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'isMaxLengthTuple(xs, 0) becomes isEmpty(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isMaxLengthTuple(xs, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isEmpty(xs);
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'isBoundedLengthTuple(xs, 0, 0) becomes isEmpty(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isBoundedLengthTuple(xs, 0, 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isEmpty(xs);
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'isMinLengthArray(xs, 1) becomes isNonEmpty(xs)',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isMinLengthArray(xs, 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = Arr.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'keeps a complex array expression intact',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const obj: Readonly<{ items: readonly number[] }>;
          const ok = Arr.isFixedLengthTuple(obj.items.filter((x) => x > 0), 0);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const obj: Readonly<{ items: readonly number[] }>;
          const ok = Arr.isEmpty(obj.items.filter((x) => x > 0));
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'resolves an aliased Arr import',
        code: dedent`
          import { Arr as A } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = A.isFixedLengthTuple(xs, 0);
        `,
        output: dedent`
          import { Arr as A } from 'ts-data-forge';

          declare const xs: readonly number[];
          const ok = A.isEmpty(xs);
        `,
        errors: [{ messageId: 'useCanonicalGuard' }],
      },
      {
        name: 'rewrites several guards in one file',
        code: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const a = Arr.isFixedLengthTuple(xs, 0);
          const b = Arr.isMinLengthArray(xs, 1);
        `,
        output: dedent`
          import { Arr } from 'ts-data-forge';

          declare const xs: readonly number[];
          const a = Arr.isEmpty(xs);
          const b = Arr.isNonEmpty(xs);
        `,
        errors: [
          { messageId: 'useCanonicalGuard' },
          { messageId: 'useCanonicalGuard' },
        ],
      },
    ],
  });
});
