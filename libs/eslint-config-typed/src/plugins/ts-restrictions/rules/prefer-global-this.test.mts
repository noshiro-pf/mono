import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import dedent from 'dedent';
import { preferGlobalThis } from './prefer-global-this.mjs';

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

/**
 * The default project loads no DOM library, so the globals are declared here
 * the way a library declares them: a `var` is a property of
 * `typeof globalThis`, a `const` is not — the shape the strict standard library
 * gives a window-only name such as `history`.
 */
const globals = dedent`
  export {};
  declare global {
    interface Window {
      readonly location: string;
      readonly history: string;
      readonly onlyOnWindow: number;
      readonly top: Window | null;
    }
    var window: Window & typeof globalThis;
    var self: Window & typeof globalThis;
    var location: string;
    var history: string;
    const onlyOnWindow: number;
  }
`;

/** Prefixes the declarations above, and the same lines to an `output`. */
const withGlobals = (code: string): string => `${globals}\n${code}` as const;

const messageId = 'prefer-global-this/error';

describe('prefer-global-this', () => {
  tester.run('prefer-global-this', preferGlobalThis, {
    valid: [
      {
        name: 'a window member that typeof globalThis lacks',
        code: withGlobals('const n = window.onlyOnWindow;'),
      },
      {
        name: 'destructuring only names typeof globalThis lacks',
        code: withGlobals('const { onlyOnWindow } = window;'),
      },
      {
        name: 'destructuring a mix: globalThis cannot stand in for all of them',
        code: withGlobals('const { location, onlyOnWindow } = window;'),
      },
      {
        name: 'optional access to a member typeof globalThis lacks',
        code: withGlobals('const n = window?.onlyOnWindow;'),
      },
      {
        name: 'unicorn-plugin exemptions still apply: a window-specific API',
        code: withGlobals('const t = window.top;'),
      },
      {
        name: 'unicorn-plugin exemptions still apply: typeof window',
        code: withGlobals("const hasWindow = typeof window !== 'undefined';"),
      },
      {
        name: 'globalThis itself',
        code: withGlobals('const l = globalThis.location;'),
      },
    ],
    invalid: [
      {
        name: 'a window member that is also on globalThis',
        code: withGlobals('const l = window.location;'),
        output: withGlobals('const l = globalThis.location;'),
        errors: [{ messageId }],
      },
      {
        name: 'destructuring names that are all on globalThis',
        code: withGlobals('const { location, history } = window;'),
        output: withGlobals('const { location, history } = globalThis;'),
        errors: [{ messageId }],
      },
      {
        name: 'self, on a member that is on globalThis',
        code: withGlobals('const l = self.location;'),
        output: withGlobals('const l = globalThis.location;'),
        errors: [{ messageId }],
      },
      {
        name: 'a bare window, which names no member',
        code: withGlobals('const w = window;'),
        output: withGlobals('const w = globalThis;'),
        errors: [{ messageId }],
      },
      {
        name: 'a computed member of self (not window) is not exempt',
        code: withGlobals("const l = self['location'];"),
        output: withGlobals("const l = globalThis['location'];"),
        errors: [{ messageId }],
      },
    ],
  });
});

describe('prefer-global-this through type wrappers', () => {
  tester.run('prefer-global-this', preferGlobalThis, {
    valid: [
      {
        name: 'a member typeof globalThis lacks, behind `satisfies`',
        code: withGlobals('const n = (window satisfies Window).onlyOnWindow;'),
      },
      {
        name: 'a member typeof globalThis lacks, behind `!`',
        code: withGlobals('const n = window!.onlyOnWindow;'),
      },
      {
        name: 'destructuring names typeof globalThis lacks, from an `as`',
        code: withGlobals('const { onlyOnWindow } = window as Window;'),
      },
    ],
    invalid: [
      {
        name: 'a member that is on globalThis, behind `satisfies`',
        code: withGlobals('const l = (window satisfies Window).location;'),
        output: withGlobals(
          'const l = (globalThis satisfies Window).location;',
        ),
        errors: [{ messageId }],
      },
    ],
  });
});
