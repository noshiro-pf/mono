import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
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
      code: `
        1 / 1;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        1n / 1n;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        1 + 1;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        const foo = 1;
        const bar = 1 as const;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        const foo = 1;
        const bar = 1;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        const foo: bigint = 1n;
        const bar = 1n as const;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        const foo = 1n;
        const bar = 1n;
        const result = foo / bar;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        declare const foo: 42 | 43;
        const bar = 1 / foo;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        declare const foo: 43 & { __tag: string };
        const bar = 1 / foo;
      `,
    },
    {
      filename: 'file.ts',
      code: `
        declare const foo: 43n & { __tag: string };
        const bar = 1n / foo;
      `,
    },
  ],
  invalid: [
    {
      filename: 'file.ts',
      code: `
        const result = 1 / 0;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        const result = 1 / 0.0;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        const result = 1 / -0;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        const result = 1n / 0n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        const result = 1n / -0n;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        const foo: bigint = 1n;
        const bar: bigint = 0n;
        const result = foo / bar;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        const foo: bigint = 1n;
        const bar: bigint = 1n;
        const result = foo / bar;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        const foo = 1n;
        const bar = 0n;
        const result = foo / bar;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        declare const foo: 42 | 0;
        const bar = 1 / foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        declare const foo: 42 | number;
        const bar = 1 / foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        declare const foo: number & { __tag: string };
        const bar = 1 / foo;
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.BinaryExpression,
        },
      ],
    },
  ],
} as const);
