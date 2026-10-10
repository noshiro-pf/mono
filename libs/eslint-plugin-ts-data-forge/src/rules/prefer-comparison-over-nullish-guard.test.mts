import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferComparisonOverNullishGuard } from './prefer-comparison-over-nullish-guard.mjs';

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

describe('prefer-comparison-over-nullish-guard', () => {
  tester.run(
    'prefer-comparison-over-nullish-guard',
    preferComparisonOverNullishGuard,
    {
      valid: [
        {
          name: 'point-free usage is allowed',
          code: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const xs: readonly (string | undefined)[];
            const ys = xs.filter(isNotUndefined);
          `,
        },
        {
          name: 'other ts-data-forge guards are not affected',
          code: dedent`
            import { isNonNullish } from 'ts-data-forge';
            declare const x: string | null | undefined;
            const y = isNonNullish(x);
          `,
        },
        {
          name: 'same-named function not imported from ts-data-forge',
          code: dedent`
            const isNotUndefined = (u: unknown): boolean => u !== undefined;
            declare const x: string | undefined;
            const y = isNotUndefined(x);
          `,
        },
      ],
      invalid: [
        {
          name: 'isNotUndefined with explicit argument',
          code: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const x: string | undefined;
            const y = isNotUndefined(x);
          `,
          output: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const x: string | undefined;
            const y = x !== undefined;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'isUndefined with explicit argument',
          code: dedent`
            import { isUndefined } from 'ts-data-forge';
            declare const x: string | undefined;
            const y = isUndefined(x);
          `,
          output: dedent`
            import { isUndefined } from 'ts-data-forge';
            declare const x: string | undefined;
            const y = x === undefined;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'isNull with explicit argument',
          code: dedent`
            import { isNull } from 'ts-data-forge';
            declare const x: string | null;
            const y = isNull(x);
          `,
          output: dedent`
            import { isNull } from 'ts-data-forge';
            declare const x: string | null;
            const y = x === null;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'isNotNull inside a logical expression (no extra parens)',
          code: dedent`
            import { isNotNull } from 'ts-data-forge';
            declare const x: string | null;
            const y = isNotNull(x) && x.length > 0;
          `,
          output: dedent`
            import { isNotNull } from 'ts-data-forge';
            declare const x: string | null;
            const y = x !== null && x.length > 0;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'negated call is wrapped in parentheses',
          code: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const x: string | undefined;
            const y = !isNotUndefined(x);
          `,
          output: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const x: string | undefined;
            const y = !(x !== undefined);
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'member-access argument',
          code: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const obj: { value: string | undefined };
            const y = isNotUndefined(obj.value);
          `,
          output: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const obj: { value: string | undefined };
            const y = obj.value !== undefined;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'low-precedence argument is parenthesized',
          code: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const a: string | undefined;
            declare const b: string | undefined;
            declare const cond: boolean;
            const y = isNotUndefined(cond ? a : b);
          `,
          output: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const a: string | undefined;
            declare const b: string | undefined;
            declare const cond: boolean;
            const y = (cond ? a : b) !== undefined;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'namespace import member call',
          code: dedent`
            import * as tf from 'ts-data-forge';
            declare const x: string | undefined;
            const y = tf.isNotUndefined(x);
          `,
          output: dedent`
            import * as tf from 'ts-data-forge';
            declare const x: string | undefined;
            const y = x !== undefined;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
      ],
    },
  );
});

describe('prefer-comparison-over-nullish-guard through type wrappers', () => {
  tester.run(
    'prefer-comparison-over-nullish-guard',
    preferComparisonOverNullishGuard,
    {
      valid: [],
      invalid: [
        {
          name: 'the call wrapped in `satisfies`, `as` or `<T>`',
          code: dedent`
            import { isNull, isNotUndefined } from 'ts-data-forge';
            declare const x: string | null | undefined;
            const a = isNull(x) satisfies boolean;
            const b = isNotUndefined(x) as boolean;
            const c = <boolean>isNull(x);
          `,
          output: dedent`
            import { isNull, isNotUndefined } from 'ts-data-forge';
            declare const x: string | null | undefined;
            const a = (x === null) satisfies boolean;
            const b = (x !== undefined) as boolean;
            const c = <boolean>(x === null);
          `,
          errors: [
            { messageId: 'preferComparison' },
            { messageId: 'preferComparison' },
            { messageId: 'preferComparison' },
          ],
        },
        {
          name: 'a wrapped argument is parenthesized under `===`',
          code: dedent`
            import { isNull } from 'ts-data-forge';
            declare const x: unknown;
            const a = isNull(x as string | null);
            const b = isNull(x satisfies unknown);
            const c = isNull(x!);
          `,
          output: dedent`
            import { isNull } from 'ts-data-forge';
            declare const x: unknown;
            const a = (x as string | null) === null;
            const b = (x satisfies unknown) === null;
            const c = x! === null;
          `,
          errors: [
            { messageId: 'preferComparison' },
            { messageId: 'preferComparison' },
            { messageId: 'preferComparison' },
          ],
        },
        {
          name: 'the guard itself reached through a wrapper',
          code: dedent`
            import { isNull } from 'ts-data-forge';
            declare const x: string | null | undefined;
            const a = (isNull as (u: unknown) => boolean)(x);
          `,
          output: dedent`
            import { isNull } from 'ts-data-forge';
            declare const x: string | null | undefined;
            const a = x === null;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
        {
          name: 'the namespace reached through a wrapper',
          code: dedent`
            import * as tf from 'ts-data-forge';
            declare const x: string | null | undefined;
            const b = (tf as typeof tf).isNotUndefined(x);
          `,
          output: dedent`
            import * as tf from 'ts-data-forge';
            declare const x: string | null | undefined;
            const b = x !== undefined;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
      ],
    },
  );
});

describe('prefer-comparison-over-nullish-guard with parenthesized operands', () => {
  tester.run(
    'prefer-comparison-over-nullish-guard',
    preferComparisonOverNullishGuard,
    {
      valid: [],
      invalid: [
        {
          name: 'bitwise operators bind looser than `===`',
          code: dedent`
            import { isNull } from 'ts-data-forge';
            declare const a: number;
            declare const b: number;
            const p = isNull(a | b);
            const q = isNull(a ^ b);
            const r = isNull((a & b));
          `,
          output: dedent`
            import { isNull } from 'ts-data-forge';
            declare const a: number;
            declare const b: number;
            const p = (a | b) === null;
            const q = (a ^ b) === null;
            const r = (a & b) === null;
          `,
          errors: [
            { messageId: 'preferComparison' },
            { messageId: 'preferComparison' },
            { messageId: 'preferComparison' },
          ],
        },
        {
          name: 'an equality argument is parenthesized for readability',
          code: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const a: unknown;
            declare const b: unknown;
            const p = isNotUndefined(a === b);
          `,
          output: dedent`
            import { isNotUndefined } from 'ts-data-forge';
            declare const a: unknown;
            declare const b: unknown;
            const p = (a === b) !== undefined;
          `,
          errors: [{ messageId: 'preferComparison' }],
        },
      ],
    },
  );
});
