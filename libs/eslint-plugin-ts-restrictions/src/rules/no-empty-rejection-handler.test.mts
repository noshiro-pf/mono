import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { noEmptyRejectionHandler } from './no-empty-rejection-handler.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      projectService: {
        allowDefaultProject: ['*.ts*'],
      },
      tsconfigRootDir: `${import.meta.dirname}/../..`,
    },
  },
});

describe('no-empty-rejection-handler', () => {
  tester.run('no-empty-rejection-handler', noEmptyRejectionHandler, {
    valid: [
      {
        name: '`() => undefined`, the spelling of a rejection dropped on purpose',
        code: dedent`
          declare const p: Promise<number>;
          p.catch(() => undefined);
        `,
      },
      {
        name: 'a handler that logs the rejection',
        code: dedent`
          declare const p: Promise<number>;
          p.catch((error: unknown) => {
            console.error(error);
          });
        `,
      },
      {
        name: 'an empty fulfillment handler of `then`',
        code: dedent`
          declare const p: Promise<number>;
          p.then(() => {}, (error: unknown) => {
            console.error(error);
          });
        `,
      },
      {
        name: '`then` with no rejection handler',
        code: dedent`
          declare const p: Promise<number>;
          p.then(() => {});
        `,
      },
      {
        name: 'the `catch` method of something that is no thenable',
        code: dedent`
          declare const handler: { catch: (f: () => void) => void };
          handler.catch(() => {});
        `,
      },
      {
        name: 'a handler passed by name',
        code: dedent`
          declare const p: Promise<number>;
          declare const ignore: () => void;
          p.catch(ignore);
        `,
      },
    ],
    invalid: [
      {
        name: 'an empty arrow function given to `catch`',
        code: dedent`
          declare const p: Promise<number>;
          p.catch(() => {});
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
      {
        name: 'an empty arrow function with a parameter',
        code: dedent`
          declare const p: Promise<number>;
          p.catch((_error: unknown) => {});
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
      {
        name: 'an empty `function` expression',
        code: dedent`
          declare const p: Promise<number>;
          p.catch(function () {});
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
      {
        name: 'a block that holds only a comment',
        code: dedent`
          declare const p: Promise<number>;
          p.catch(() => {
            // nothing to do
          });
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
      {
        name: 'the rejection handler of `then`',
        code: dedent`
          declare const p: Promise<number>;
          p.then((n) => n + 1, () => {});
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
      {
        name: 'the handler through type wrappers and parentheses',
        code: dedent`
          declare const p: Promise<number>;
          p.catch((() => {}) satisfies (error: unknown) => void);
          p.catch((() => {}) as (error: unknown) => void);
        `,
        errors: [
          { messageId: 'emptyRejectionHandler' },
          { messageId: 'emptyRejectionHandler' },
        ],
      },
      {
        name: 'a receiver cast to something else, which is still a promise',
        code: dedent`
          declare const p: Promise<number>;
          (p as unknown as { catch: (f: () => void) => void }).catch(() => {});
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
      {
        name: 'an optional call, and a call of a promise a function returns',
        code: dedent`
          declare const p: Promise<number> | undefined;
          declare const f: () => Promise<void>;
          p?.catch(() => {});
          f().catch(() => {});
        `,
        errors: [
          { messageId: 'emptyRejectionHandler' },
          { messageId: 'emptyRejectionHandler' },
        ],
      },
      {
        name: 'a thenable that is no Promise',
        code: dedent`
          declare const t: PromiseLike<number> & {
            catch: (f: () => void) => PromiseLike<number>;
          };
          t.catch(() => {});
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
      {
        name: 'a computed `catch` key',
        code: dedent`
          declare const p: Promise<number>;
          p['catch'](() => {});
        `,
        errors: [{ messageId: 'emptyRejectionHandler' }],
      },
    ],
  });
});
