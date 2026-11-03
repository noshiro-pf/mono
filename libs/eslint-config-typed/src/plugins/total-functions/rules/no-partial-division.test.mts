import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noPartialDivision } from './no-partial-division.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

ruleTester.run('no-partial-division', noPartialDivision, {
  valid: [
    {
      filename: 'file.ts',
      code: dedent`
        1 / 1;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        1n / 1n;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        1 + 1;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const foo = 1;
        const bar = 1 as const;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const foo = 1;
        const bar = 1;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const foo: bigint = 1n;
        const bar = 1n as const;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const foo = 1n;
        const bar = 1n;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | 43;
        const bar = 1 / foo;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 43 & { __tag: string };
        const bar = 1 / foo;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 43n & { __tag: string };
        const bar = 1n / foo;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        let mut_x = 6;
        mut_x /= 2;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        let mut_x = 6n;
        mut_x /= 2n;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | 43;
        let mut_x = 6;
        mut_x /= foo;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        let mut_x = 6;
        mut_x *= 0;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        1 / -1;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        1n / -1n;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        1 / +2;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        1 / -(-3);
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        let mut_x = 6;
        mut_x /= -2;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const obj: { readonly n: 2 };
        const result = 1 / obj.n;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const f: () => -3;
        const result = 1 / f();
      `,
    },
  ],
  invalid: [
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / 0;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / 0.0;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / -0;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1n / 0n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1n / -0n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const foo: bigint = 1n;
        const bar: bigint = 0n;
        const result = foo / bar;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const foo: bigint = 1n;
        const bar: bigint = 1n;
        const result = foo / bar;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const foo = 1n;
        const bar = 0n;
        const result = foo / bar;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | 0;
        const bar = 1 / foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | number;
        const bar = 1 / foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: number & { __tag: string };
        const bar = 1 / foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        let mut_x = 6;
        mut_x /= 0;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        let mut_x = 6n;
        mut_x /= 0n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const y: number;
        let mut_x = 6;
        mut_x /= y;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | 0;
        let mut_x = 6;
        mut_x /= foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const obj: { readonly n: number };
        let mut_x = 6;
        mut_x /= obj.n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / null;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / '0';
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / true;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / -null;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / -'1';
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const obj: { readonly n: 0 | 2 };
        const result = 1 / obj.n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const y: number;
        const result = 1 / -y;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
  ],
} as const);

ruleTester.run('no-partial-division through type wrappers', noPartialDivision, {
  valid: [
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / (2 satisfies number);
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / (2 as number);
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1n / (2n satisfies bigint);
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / -(2 satisfies number);
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / <number>2;
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | 43;
        const result = 1 / (foo satisfies number);
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42;
        const result = 1 / foo!;
      `,
    },
  ],
  invalid: [
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / (0 satisfies number);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / (0 as 1);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1 / -(0 satisfies number);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1n / (0n satisfies bigint);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const y: number;
        const result = 1 / (y as unknown as 1);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const y: number;
        const result = 1 / (y as 1);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const y: number | undefined;
        const result = 1 / y!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 0 | undefined;
        const result = 1 / foo!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | number;
        const result = 1 / (foo satisfies number);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = (1 / 0) satisfies number;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const y: number;
        let mut_x = 6;
        mut_x /= y as 2;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | undefined;
        const result = 1 / foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42;
        const result = 1 / (foo as 42 | null);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | undefined;
        const result = 1 / (foo! as 42 | undefined);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1n / +(-2n);
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1n / +-2n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        const result = 1n / +2n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 0 | null;
        const result = 1 / foo!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: number | undefined;
        const result = 1 / (foo as 42 | undefined)!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | undefined;
        const result = 1 / foo!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | undefined;
        let mut_x = 6;
        mut_x /= foo!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | undefined;
        const result = 1 / (foo as 42 | undefined)!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | undefined;
        const result = 1 / (foo satisfies 42 | undefined)!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
    {
      filename: 'file.ts',
      code: dedent`
        declare const foo: 42 | null;
        const result = 1 / foo!;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
        },
      ],
    },
  ],
} as const);

// `x % 0` is `NaN` and `x % 0n` throws a `RangeError`, as `/` does, so the
// remainder is judged by the same denominator rules.
ruleTester.run('no-partial-division on the remainder', noPartialDivision, {
  valid: [
    {
      name: 'a non-zero literal divisor, of either kind and either sign',
      filename: 'file.ts',
      code: dedent`
        declare const x: number;
        declare const b: bigint;
        export const r1 = x % 2;
        export const r2 = b % -3n;
        export const r3 = x % (2 satisfies number);
        let mut_x = x;
        mut_x %= 4;
      `,
    },
    {
      name: 'a divisor whose type is a non-zero literal',
      filename: 'file.ts',
      code: dedent`
        declare const x: number;
        const PER_ROW = 4;
        export const r1 = x % PER_ROW;
      `,
    },
  ],
  invalid: [
    {
      name: 'a divisor that may be zero',
      filename: 'file.ts',
      code: dedent`
        declare const x: number;
        declare const xs: readonly number[];
        export const r1 = x % xs.length;
      `,
      errors: [{ messageId: 'partialRemainder' }],
    },
    {
      name: 'a zero divisor, and a bigint one',
      filename: 'file.ts',
      code: dedent`
        declare const x: number;
        declare const b: bigint;
        export const r1 = x % 0;
        export const r2 = b % 0n;
      `,
      errors: [
        { messageId: 'partialRemainder' },
        { messageId: 'partialRemainder' },
      ],
    },
    {
      name: 'the compound assignment',
      filename: 'file.ts',
      code: dedent`
        declare const n: number;
        let mut_x = 10;
        mut_x %= n;
      `,
      errors: [{ messageId: 'partialRemainder' }],
    },
  ],
});
