import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { noPrematureFpTsEffects } from './no-premature-fp-ts-effects.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

ruleTester.run('no-premature-fp-ts-effects', noPrematureFpTsEffects, {
  valid: [
    {
      filename: 'file.ts',
      code: `
        const myFunc = () => "hello";
        const result: string = myFunc();
      `,
    },
    {
      filename: 'file.ts',
      code: `
        const myFunc = (s: string) => "hello " + s;
        const result: string = myFunc("asdf");
      `,
    },
    {
      filename: 'file.ts',
      code: `
        export interface Lazy<A> {
          (): A
        }

        const lazy: Lazy<string> = () => "hello";

        const lazyResult: string = lazy();
      `,
    },
    // exercise the try/catch around calleeType.symbol.name (this test prompts it to throw)
    {
      filename: 'file.ts',
      code: `
        const foo: { a: () => string } | undefined =
        Date.now() > 0 ? undefined : { a: () => "" };
        foo?.a();
      `,
    },
  ],
  invalid: [
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          (): A
        }

        const io: IO<string> = () => "hello";

        const ioResult: string = io();
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        export interface Task<A> {
          (): Promise<A>
        }

        const task: Task<string> = () => Promise.resolve("hello");

        const taskResult: Promise<string> = task();
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          (): A
        }
        const logErrors = (): IO<void> => () => undefined;
        const result = logErrors()();
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
  ],
} as const);
