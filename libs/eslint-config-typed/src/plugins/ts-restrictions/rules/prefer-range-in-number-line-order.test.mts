import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferRangeInNumberLineOrder } from './prefer-range-in-number-line-order.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../../../..`,
    },
  },
});

describe('prefer-range-in-number-line-order', () => {
  tester.run(
    'prefer-range-in-number-line-order',
    preferRangeInNumberLineOrder,
    {
      valid: [
        {
          name: 'a range already in number line order',
          code: dedent`
            declare const x: number, min: number, max: number;
            const a = min <= x && x <= max;
            const b = min < x && x < max;
            const c = x < min || max < x;
            const d = x <= min || max <= x;
          `,
        },
        {
          name: 'two comparisons sharing no operand',
          code: dedent`
            declare const a: number, b: number, c: number, d: number;
            const x = a > b && c > d;
          `,
        },
        {
          name: 'two lower bounds are not a range',
          code: dedent`
            declare const x: number, a: number, b: number;
            const y = x > a && x > b;
            const z = a < x || b < x;
          `,
        },
        {
          name: 'an equality is not a range',
          code: dedent`
            declare const x: number, a: number, b: number;
            const y = x === a && x > b;
          `,
        },
        {
          name: 'a literal shared by two comparisons is a bound, not a value tested',
          code: dedent`
            declare const a: number, b: number;
            const x = 0 > a && b > 0;
            const y = a > 0 || 0 > b;
          `,
        },
        {
          name: 'a single comparison',
          code: dedent`
            declare const x: number;
            const y = x > 0;
          `,
        },
        {
          name: 'comparisons not adjacent in the chain',
          code: dedent`
            declare const x: number, min: number, max: number, p: boolean;
            const y = x >= min && p && max >= x;
          `,
        },
        {
          name: '`??` is not a chain of comparisons',
          code: dedent`
            declare const x: number, min: number;
            const y = (x > min) ?? (min > x);
          `,
        },
      ],
      invalid: [
        {
          name: '`x >= min && max >= x`',
          code: dedent`
            declare const x: number, min: number, max: number;
            const y = x >= min && max >= x;
          `,
          output: dedent`
            declare const x: number, min: number, max: number;
            const y = min <= x && x <= max;
          `,
          errors: [
            {
              messageId: 'preferNumberLineOrder',
              data: { replacement: 'min <= x && x <= max' },
            },
          ],
        },
        {
          name: '`x > min && max > x`',
          code: dedent`
            declare const x: number, min: number, max: number;
            const y = x > min && max > x;
          `,
          output: dedent`
            declare const x: number, min: number, max: number;
            const y = min < x && x < max;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'only one side written the other way',
          code: dedent`
            declare const x: number, max: number;
            const y = x >= 0 && x < max;
          `,
          output: dedent`
            declare const x: number, max: number;
            const y = 0 <= x && x < max;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: '`min > x || x > max`',
          code: dedent`
            declare const x: number, min: number, max: number;
            const y = min > x || x > max;
          `,
          output: dedent`
            declare const x: number, min: number, max: number;
            const y = x < min || max < x;
          `,
          errors: [
            {
              messageId: 'preferNumberLineOrder',
              data: { replacement: 'x < min || max < x' },
            },
          ],
        },
        {
          name: 'the upper bound first under `&&`',
          code: dedent`
            declare const x: number, min: number, max: number;
            const y = x <= max && x >= min;
          `,
          output: dedent`
            declare const x: number, min: number, max: number;
            const y = min <= x && x <= max;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'the upper bound first under `||`, already ascending',
          code: dedent`
            declare const x: number, min: number, max: number;
            const y = max < x || x < min;
          `,
          output: dedent`
            declare const x: number, min: number, max: number;
            const y = x < min || max < x;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'within a longer chain',
          code: dedent`
            declare const x: number, n: number, p: boolean, q: boolean;
            const y = p && x >= 0 && x < n && q;
          `,
          output: dedent`
            declare const x: number, n: number, p: boolean, q: boolean;
            const y = p && 0 <= x && x < n && q;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'two ranges in one chain',
          code: dedent`
            declare const x: number, y: number, w: number, h: number;
            const r = x >= 0 && x < w && y >= 0 && y < h;
          `,
          output: dedent`
            declare const x: number, y: number, w: number, h: number;
            const r = 0 <= x && x < w && 0 <= y && y < h;
          `,
          errors: [
            { messageId: 'preferNumberLineOrder' },
            { messageId: 'preferNumberLineOrder' },
          ],
        },
        {
          name: 'a range nested under the other operator',
          code: dedent`
            declare const x: number, min: number, max: number, p: boolean;
            const y = p || (x > min && x < max);
          `,
          output: dedent`
            declare const x: number, min: number, max: number, p: boolean;
            const y = p || (min < x && x < max);
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'the value tested is a member access',
          code: dedent`
            declare const xs: readonly number[];
            const y = xs.length > 0 && 10 >= xs.length;
          `,
          output: dedent`
            declare const xs: readonly number[];
            const y = 0 < xs.length && xs.length <= 10;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'parentheses around an operand are kept',
          code: dedent`
            declare const a: number, b: number, min: number, max: number;
            const y = (a + b) >= min && (a + b) <= max;
          `,
          output: dedent`
            declare const a: number, b: number, min: number, max: number;
            const y = min <= (a + b) && (a + b) <= max;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'an operand binding as loosely as the comparison gains parentheses',
          code: dedent`
            declare const v: unknown;
            const y = v as number >= 0 && (v as number) < 10;
          `,
          output: dedent`
            declare const v: unknown;
            const y = 0 <= (v as number) && (v as number) < 10;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'comments and line breaks are kept',
          code: dedent`
            declare const x: number, min: number, max: number;
            const y =
              x /* value */ >= min &&
              // upper
              max >= x;
          `,
          output: dedent`
            declare const x: number, min: number, max: number;
            const y =
              min <= x /* value */ &&
              // upper
              x <= max;
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'in a condition',
          code: dedent`
            declare const x: number, min: number, max: number;
            if (x < min || x > max) {
              throw new Error('out of range');
            }
          `,
          output: dedent`
            declare const x: number, min: number, max: number;
            if (x < min || max < x) {
              throw new Error('out of range');
            }
          `,
          errors: [{ messageId: 'preferNumberLineOrder' }],
        },
        {
          name: 'an operand with a side effect is only suggested',
          code: dedent`
            declare const f: () => number;
            const y = f() >= 0 && f() < 10;
          `,
          output: null,
          errors: [
            {
              messageId: 'preferNumberLineOrder',
              suggestions: [
                {
                  messageId: 'reorderRange',
                  data: { replacement: '0 <= f() && f() < 10' },
                  output: dedent`
                    declare const f: () => number;
                    const y = 0 <= f() && f() < 10;
                  `,
                },
              ],
            },
          ],
        },
      ],
    },
  );
});
