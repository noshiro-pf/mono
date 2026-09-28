import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import dedent from 'dedent';
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
      code: dedent`
        const myFunc = () => "hello";
        const result: string = myFunc();
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
        const myFunc = (s: string) => "hello " + s;
        const result: string = myFunc("asdf");
      `,
    },
    {
      filename: 'file.ts',
      code: dedent`
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
      code: dedent`
        const foo: { a: () => string } | undefined =
        Date.now() > 0 ? undefined : { a: () => "" };
        foo?.a();
      `,
    },
  ],
  invalid: [
    {
      filename: 'file.ts',
      code: dedent`
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
      code: dedent`
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
      code: dedent`
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

describe('no-premature-fp-ts-effects through type wrappers', () => {
  ruleTester.run('no-premature-fp-ts-effects', noPrematureFpTsEffects, {
    valid: [
      {
        name: 'a wrapped function that is not an effect at any layer',
        filename: 'file.ts',
        code: dedent`
          declare const f: () => void;
          (f satisfies () => void)();
          f!();
        `,
      },
    ],
    invalid: [
      {
        name: 'an effect cast to a plain function',
        filename: 'file.ts',
        code: dedent`
          export interface IO<A> {
            (): A
          }
          declare const effect: IO<void>;
          (effect as () => void)();
          (<() => void>effect)();
          (effect satisfies unknown as () => void)();
        `,
        errors: [
          { messageId: 'errorStringGeneric' },
          { messageId: 'errorStringGeneric' },
          { messageId: 'errorStringGeneric' },
        ],
      },
      {
        name: 'a plain function cast to an effect',
        filename: 'file.ts',
        code: dedent`
          export interface IO<A> {
            (): A
          }
          declare const f: () => void;
          declare const effect: IO<void>;
          (f as IO<void>)();
          effect!();
        `,
        errors: [
          { messageId: 'errorStringGeneric' },
          { messageId: 'errorStringGeneric' },
        ],
      },
    ],
  });
});
