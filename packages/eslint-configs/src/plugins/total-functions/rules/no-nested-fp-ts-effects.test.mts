import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { noNestedFpTsEffects } from './no-nested-fp-ts-effects.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parserOptions: {
      sourceType: 'module',
      project: './tsconfig.tests.json',
    },
    parser,
  },
});

ruleTester.run('no-async-effect-within-io', noNestedFpTsEffects, {
  valid: [
    // CallExpression with no symbol is okay
    {
      filename: 'file.ts',
      code: `
        (() => undefined)();
      `,
    },
    // Some other type with coincidentally the same name is okay (zero call signatures)
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          a: A;
        }

        export interface Task<A> {
          a: A;
        }

        const liftIO = <A>(val: A): IO<A> => ({ a: val });

        const liftTask = <A>(val: A): Task<A> => ({ a: val });

        const foo = liftIO(liftTask("a"));
      `,
    },
    // Some other type with coincidentally the same name is okay (multiple call signatures)
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          (): A;
          (a: string): void;
        }

        export interface Task<A> {
          (): Promise<A>;
          (a: string): void;
        }

        declare const liftIO: <A>(val: A) => IO<A>;

        declare const liftTask: <A>(val: A) => Task<A>;

        const foo = liftIO(liftTask("a"));
      `,
    },
    // IO<string> is okay
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          (): A;
        }

        declare const liftIO: <A>(val: A) => IO<A>;

        const bar = liftIO("a");
      `,
    },
  ],
  invalid: [
    // IO<Task<A>> is invalid
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          (): A;
        }

        export interface Task<A> {
          (): Promise<A>;
        }

        declare const liftIO: <A>(val: A) => IO<A>;

        declare const liftTask: <A>(val: A) => Task<A>;

        const foo = liftIO(liftTask("a"));
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    // IO<TaskEither<A>> is invalid
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          (): A;
        }

        export interface TaskEither<A> {
          (): Promise<A>;
        }

        declare const liftIO: <A>(val: A) => IO<A>;

        declare const liftTaskEither: <A>(val: A) => TaskEither<A>;

        const foo = liftIO(liftTaskEither("a"));
      `,
      errors: [
        {
          messageId: 'errorStringGeneric',
          type: AST_NODE_TYPES.CallExpression,
        },
      ],
    },
    // IO<Promise<A>> is invalid
    {
      filename: 'file.ts',
      code: `
        export interface IO<A> {
          (): A;
        }

        declare const liftIO: <A>(val: A) => IO<A>;

        const foo = liftIO(Promise.resolve("a"));
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
