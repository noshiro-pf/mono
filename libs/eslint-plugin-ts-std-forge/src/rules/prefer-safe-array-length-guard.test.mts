import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferSafeArrayLengthGuard } from './prefer-safe-array-length-guard.mjs';

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

describe('prefer-safe-array-length-guard', () => {
  tester.run('prefer-safe-array-length-guard', preferSafeArrayLengthGuard, {
    valid: [
      {
        name: 'a string length check is not an array length check',
        code: dedent`
          declare const s: string;
          const ok = s.length > 0;
        `,
      },
      {
        name: 'a bound with no named guard is left alone',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length > 2;
        `,
      },
      {
        name: 'comparing two lengths is left alone',
        code: dedent`
          declare const xs: readonly number[];
          declare const ys: readonly number[];
          const ok = xs.length === ys.length;
        `,
      },
      {
        name: 'already using the guard',
        code: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty(xs);
        `,
      },
    ],
    invalid: [
      {
        name: 'xs.length === 0 becomes isEmpty',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length === 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isEmpty(xs);
        `,
        errors: [{ messageId: 'useIsEmpty' }],
      },
      {
        name: 'xs.length > 0 becomes isNonEmpty',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length > 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'xs.length >= 1 becomes isNonEmpty',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length >= 1;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'xs.length !== 0 becomes isNonEmpty',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length !== 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'the operands the other way round are normalized',
        code: dedent`
          declare const xs: readonly number[];
          const ok = 0 < xs.length;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'a tuple is an array too',
        code: dedent`
          declare const xs: readonly [number, number];
          const ok = xs.length === 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly [number, number];
          const ok = SafeArray.isEmpty(xs);
        `,
        errors: [{ messageId: 'useIsEmpty' }],
      },
      {
        name: 'two checks in one file import once',
        code: dedent`
          declare const xs: readonly number[];
          declare const ys: readonly number[];
          const a = xs.length === 0;
          const b = ys.length > 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          declare const ys: readonly number[];
          const a = SafeArray.isEmpty(xs);
          const b = SafeArray.isNonEmpty(ys);
        `,
        errors: [{ messageId: 'useIsEmpty' }, { messageId: 'useIsNonEmpty' }],
      },
    ],
  });
});

describe('prefer-safe-array-length-guard through type wrappers', () => {
  tester.run('prefer-safe-array-length-guard', preferSafeArrayLengthGuard, {
    valid: [
      {
        name: 'a string cast to an array is still a string',
        code: dedent`
          declare const s: string;
          const ok = (s as unknown as readonly string[]).length > 0;
        `,
      },
      {
        name: 'a bound with no named guard behind `as const` is left alone',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length > (2 as const);
        `,
      },
    ],
    invalid: [
      {
        name: 'reads the bound through `as const`',
        code: dedent`
          declare const xs: readonly number[];
          const ok = xs.length > (0 as const);
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'reads the length through `as`',
        code: dedent`
          declare const xs: readonly number[];
          const ok = (xs.length as number) > 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty(xs);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
      {
        name: 'reads the length through `!`, with the bound on the left',
        code: dedent`
          declare const xs: readonly number[];
          const ok = (0 satisfies number) === xs.length!;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[];
          const ok = SafeArray.isEmpty(xs);
        `,
        errors: [{ messageId: 'useIsEmpty' }],
      },
      {
        name: 'keeps a wrapper on the array and reads `!` as the array it asserts',
        code: dedent`
          declare const xs: readonly number[] | undefined;
          const ok = xs!.length !== 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const xs: readonly number[] | undefined;
          const ok = SafeArray.isNonEmpty(xs!);
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
    ],
  });
});

describe('prefer-safe-array-length-guard with parenthesized operands', () => {
  tester.run('prefer-safe-array-length-guard', preferSafeArrayLengthGuard, {
    valid: [],
    invalid: [
      {
        name: 'keeps the parentheses of a sequence array',
        code: dedent`
          declare const a: number;
          declare const xs: readonly number[];
          const ok = (a, xs).length > 0;
        `,
        output: dedent`
          import { SafeArray } from 'ts-std-forge';
          declare const a: number;
          declare const xs: readonly number[];
          const ok = SafeArray.isNonEmpty((a, xs));
        `,
        errors: [{ messageId: 'useIsNonEmpty' }],
      },
    ],
  });
});
