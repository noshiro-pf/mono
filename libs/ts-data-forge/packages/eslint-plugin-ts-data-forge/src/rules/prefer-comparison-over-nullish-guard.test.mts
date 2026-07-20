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
