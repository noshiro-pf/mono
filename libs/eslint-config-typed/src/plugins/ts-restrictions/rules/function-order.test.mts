import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { functionOrder } from './function-order.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

const tsxTester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
    },
  },
});

/**
 * A fixture as its list of lines, rather than a `dedent` template: the fix
 * moves whole lines, and where the blank lines and the final newline end up is
 * part of what each output asserts, which `dedent` would trim at the edges.
 */
const lines = (...xs: readonly string[]): string => xs.join('\n');

describe('function-order', () => {
  tester.run('function-order', functionOrder, {
    valid: [
      {
        name: 'helper above its caller',
        code: lines(
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf();',
        ),
      },
      {
        name: 'exported functions first, then helpers lower-level first',
        code: lines(
          'export const run = (): number => caller();',
          '',
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf();',
        ),
      },
      {
        name: 'function declarations',
        code: lines(
          'export function run(): number { return caller(); }',
          '',
          'function leaf(): number { return 1; }',
          '',
          'function caller(): number { return leaf(); }',
        ),
      },
      {
        name: 'an exported function may call one exported later',
        code: lines(
          'export const a = (): number => b();',
          '',
          'export const b = (): number => 1;',
        ),
      },
      {
        name: 'a helper may call an exported function',
        code: lines(
          'export const a = (): number => 1;',
          '',
          'export function b(): number {',
          '  return 1;',
          '}',
          '',
          'const helper = (): number => a() + b();',
        ),
      },
      {
        name: 'mutual recursion has no order',
        code: lines(
          'const isEven = (n: number): boolean => n === 0 || isOdd(n - 1);',
          '',
          'const isOdd = (n: number): boolean => n !== 0 && isEven(n - 1);',
        ),
      },
      {
        name: 'self recursion',
        code: 'const f = (n: number): number => (n <= 0 ? 0 : f(n - 1));',
      },
      {
        name: 'main referenced at load time is an entry point, not a helper',
        code: lines(
          'const main = async (): Promise<void> => { await step(); };',
          '',
          'const step = async (): Promise<void> => {};',
          '',
          'await main();',
        ),
      },
      {
        name: 'a helper read by a constant at load time is left where it is',
        code: lines(
          'const caller = (): number => compute(1);',
          '',
          'const compute = (n: number): number => n;',
          '',
          'const value = compute(2);',
        ),
      },
      {
        name: 'a helper passed to a call at load time is left where it is',
        code: lines(
          'export const run = (): number => memoized();',
          '',
          'const caller = (): number => impl();',
          '',
          'const impl = (): number => 1;',
          '',
          'const memoized = memoize(impl);',
        ),
      },
      {
        name: 'a const holding a call is not a function',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'export const Component = memo(() => helper());',
        ),
      },
      {
        name: 'a reference in a type is not a call',
        code: lines(
          'const caller = (f: typeof leaf): number => f();',
          '',
          'const leaf = (): number => 1;',
        ),
      },
      {
        name: 'calls from code that is not a top-level function do not count',
        code: lines(
          'class C { m(): number { return leaf(); } }',
          '',
          'const leaf = (): number => 1;',
        ),
      },
      {
        name: 'a function exported by a specifier list is exported',
        code: lines('const a = (): number => 1;', '', 'export { a };'),
      },
      {
        name: 'main started by a function called in place is an entry point',
        code: lines(
          'const main = async (): Promise<void> => { await step(); };',
          '',
          'const step = async (): Promise<void> => {};',
          '',
          'void (async (): Promise<void> => { await main(); })();',
        ),
      },
      {
        name: 'a type sharing the name of a function is not a call',
        code: lines(
          'type leaf = number;',
          '',
          'const caller = (): leaf => 1;',
          '',
          'const leaf = (): number => 1;',
        ),
      },
      {
        name: 'nested functions are not ordered',
        code: lines(
          'export const run = (): number => {',
          '  const inner = (): number => leaf();',
          '  const leaf = (): number => 1;',
          '  return inner();',
          '};',
        ),
      },
      {
        name: 'let is not a function binding',
        code: lines(
          'let caller = (): number => leaf();',
          '',
          'const leaf = (): number => 1;',
          '',
          'caller = (): number => 2;',
        ),
      },
    ],
    invalid: [
      {
        name: 'helper below its caller',
        code: lines(
          'const caller = (): number => leaf();',
          '',
          'const leaf = (): number => 1;',
          '',
        ),
        output: lines(
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf();',
          '',
        ),
        errors: [
          {
            messageId: 'calleeAfterCaller',
            data: { callee: 'leaf', caller: 'caller' },
          },
        ],
      },
      {
        name: 'a helper passed as a value counts as called',
        code: lines(
          'const caller = (xs: readonly number[]): readonly number[] => xs.map(double);',
          '',
          'const double = (x: number): number => x * 2;',
        ),
        output: lines(
          'const double = (x: number): number => x * 2;',
          '',
          'const caller = (xs: readonly number[]): readonly number[] => xs.map(double);',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'function declarations',
        code: lines(
          'function caller(): number { return leaf(); }',
          '',
          'function leaf(): number { return 1; }',
        ),
        output: lines(
          'function leaf(): number { return 1; }',
          '',
          'function caller(): number { return leaf(); }',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'moved above the first of several callers, with its comments',
        code: lines(
          'const a = (): number => leaf();',
          '',
          '// b, also a caller',
          'const b = (): number => leaf() + 1;',
          '',
          '/**',
          ' * The leaf.',
          ' */',
          'const leaf = (): number => 1; // trailing',
          '',
          'export {};',
        ),
        output: lines(
          '/**',
          ' * The leaf.',
          ' */',
          'const leaf = (): number => 1; // trailing',
          '',
          'const a = (): number => leaf();',
          '',
          '// b, also a caller',
          'const b = (): number => leaf() + 1;',
          '',
          'export {};',
        ),
        errors: [
          {
            messageId: 'calleeAfterCaller',
            data: { callee: 'leaf', caller: 'a' },
          },
        ],
      },
      {
        name: 'no fix under a comment a blank line above the function',
        code: lines(
          'const caller = (): number => leaf();',
          '',
          '// section',
          '',
          'const leaf = (): number => 1;',
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix under a comment a blank line above where it would go',
        code: lines(
          '// section',
          '',
          'const helper = (): number => 1;',
          '',
          'export const run = (): number => helper();',
        ),
        output: null,
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'no fix across a comment that applies to a stretch of the file',
        code: lines(
          'const caller = (): number => leaf();',
          '// #region',
          'const leaf = (): number => 1;',
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix across a sample-embedding marker',
        code: lines(
          'const helper = (): number => 1;',
          '// embed-sample-code-ignore-above',
          'export const run = (): number => helper();',
        ),
        output: null,
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'no fix across a section heading between the two',
        code: lines(
          'const caller = (): number => leaf();',
          '',
          '// ===== Utilities =====',
          '',
          'const other = (): number => 2;',
          '',
          'const leaf = (): number => 1;',
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'a comment with a blank line after it inside a function body does not stop the fix',
        code: lines(
          'const caller = (): number => {',
          '  // note',
          '',
          '  return leaf();',
          '};',
          '',
          'const leaf = (): number => 1;',
        ),
        output: lines(
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => {',
          '  // note',
          '',
          '  return leaf();',
          '};',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix across an oxlint-disable range',
        code: lines(
          'const caller = (): number => leaf();',
          '/* oxlint-disable */',
          'const leaf = (): number => 1;',
          '/* oxlint-enable */',
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix across a cspell:disable range',
        code: lines(
          'const caller = (): number => leaf();',
          '// cspell:disable',
          'const leaf = (): number => 1;',
          '// cspell:enable',
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'a comment that only mentions eslint-disable does not stop the fix',
        code: lines(
          'const caller = (): number => leaf();',
          '',
          '/** Finds each `eslint-disable` comment. */',
          'const leaf = (): number => 1;',
        ),
        output: lines(
          '/** Finds each `eslint-disable` comment. */',
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf();',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'a comment trailing the statement above does not stop the fix',
        code: lines(
          'const caller = (): number => leaf(); // note',
          '',
          'const leaf = (): number => 1;',
        ),
        output: lines(
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf(); // note',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'mutually recursive helpers still come after what they call',
        code: lines(
          'const isEven = (n: number): boolean => n === 0 || isOdd(n - 1) || leaf();',
          '',
          'const isOdd = (n: number): boolean => n !== 0 && isEven(n - 1);',
          '',
          'const leaf = (): boolean => true;',
        ),
        output: lines(
          'const leaf = (): boolean => true;',
          '',
          'const isEven = (n: number): boolean => n === 0 || isOdd(n - 1) || leaf();',
          '',
          'const isOdd = (n: number): boolean => n !== 0 && isEven(n - 1);',
          '',
        ),
        errors: [
          {
            messageId: 'calleeAfterCaller',
            data: { callee: 'leaf', caller: 'isEven' },
          },
        ],
      },
      {
        name: 'a chain is ordered over several passes',
        code: lines(
          'const a = (): number => b();',
          '',
          'const b = (): number => c();',
          '',
          'const c = (): number => 1;',
        ),
        output: [
          lines(
            'const b = (): number => c();',
            '',
            'const a = (): number => b();',
            '',
            'const c = (): number => 1;',
          ),
          lines(
            'const c = (): number => 1;',
            '',
            'const b = (): number => c();',
            '',
            'const a = (): number => b();',
            '',
          ),
        ],
        errors: [
          {
            messageId: 'calleeAfterCaller',
            data: { callee: 'b', caller: 'a' },
          },
          {
            messageId: 'calleeAfterCaller',
            data: { callee: 'c', caller: 'b' },
          },
        ],
      },
      {
        name: 'exported function below a helper',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'export const run = (): number => helper();',
        ),
        output: lines(
          'export const run = (): number => helper();',
          '',
          'const helper = (): number => 1;',
          '',
        ),
        errors: [
          {
            messageId: 'exportedAfterHelper',
            data: { name: 'run', helper: 'helper' },
          },
        ],
      },
      {
        name: 'exported by a specifier list, below a helper',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'const run = (): number => helper();',
          '',
          'export { run };',
        ),
        output: lines(
          'const run = (): number => helper();',
          '',
          'const helper = (): number => 1;',
          '',
          'export { run };',
        ),
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'exported by a renaming specifier, below a helper',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'const run = (): number => helper();',
          '',
          'export { run as start };',
        ),
        output: lines(
          'const run = (): number => helper();',
          '',
          'const helper = (): number => 1;',
          '',
          'export { run as start };',
        ),
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'exported by export =, below a helper',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'const run = (): number => helper();',
          '',
          'export = run;',
        ),
        output: lines(
          'const run = (): number => helper();',
          '',
          'const helper = (): number => 1;',
          '',
          'export = run;',
        ),
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'export default arrow function below a helper',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'export default (): number => helper();',
        ),
        output: lines(
          'export default (): number => helper();',
          '',
          'const helper = (): number => 1;',
          '',
        ),
        errors: [
          {
            messageId: 'exportedAfterHelper',
            data: { name: 'default', helper: 'helper' },
          },
        ],
      },
      {
        name: "a type-only export's function is still a helper",
        code: lines(
          'const caller = (): number => leaf();',
          '',
          'const leaf = (): number => 1;',
          '',
          'export type { caller };',
        ),
        output: lines(
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf();',
          '',
          'export type { caller };',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'the move goes above the comments attached to where it goes',
        code: lines(
          'import { a } from "a";',
          '',
          '// prettier-ignore',
          'const caller = (): number => leaf() + a;',
          '',
          'const leaf = (): number => 1;',
        ),
        output: lines(
          'import { a } from "a";',
          '',
          'const leaf = (): number => 1;',
          '',
          '// prettier-ignore',
          'const caller = (): number => leaf() + a;',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix above a comment that leads the file',
        code: lines(
          '/// <reference types="vite/client" />',
          'const helper = (): number => 1;',
          '',
          'export const run = (): number => helper();',
        ),
        output: null,
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'a JSDoc leading the file moves with the function it documents',
        code: lines(
          '/** The helper. */',
          'const helper = (): number => 1;',
          '',
          'export const run = (): number => helper();',
        ),
        output: lines(
          'export const run = (): number => helper();',
          '',
          '/** The helper. */',
          'const helper = (): number => 1;',
          '',
        ),
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'no fix above a pragma leading the file',
        code: lines(
          '/** @jsxImportSource preact */',
          'const helper = (): number => 1;',
          '',
          'export const run = (): number => helper();',
        ),
        output: null,
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'comments sharing a line above the function move with it',
        code: lines(
          'const caller = (): number => leaf();',
          '',
          '/** Returns 1. */ // hot path',
          'const leaf = (): number => 1;',
        ),
        output: lines(
          '/** Returns 1. */ // hot path',
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf();',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'prose ending in -enable is not a range marker',
        code: lines(
          'const caller = (): number => leaf();',
          '// auto-enable the thing',
          'const leaf = (): number => 1;',
        ),
        output: lines(
          '// auto-enable the thing',
          'const leaf = (): number => 1;',
          '',
          'const caller = (): number => leaf();',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      ...[
        ['/* c8 ignore start */', '/* c8 ignore stop */'],
        ['/* istanbul ignore start */', '/* istanbul ignore end */'],
        ['// @formatter:off', '// @formatter:on'],
        ['// prettier-ignore-start', '// prettier-ignore-end'],
        ['// #region', '// #endregion'],
      ].map(([open = '', close = '']) => ({
        name: `no fix across ${open}`,
        code: lines(
          'const caller = (): number => leaf();',
          open,
          'const leaf = (): number => 1;',
          close,
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' as const }],
      })),
      {
        name: 'no fix above a shebang',
        code: lines(
          '#!/usr/bin/env node',
          'const helper = (): number => 1;',
          '',
          'export const run = (): number => helper();',
        ),
        output: null,
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'export default function below a helper',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'export default function (): number { return helper(); }',
        ),
        output: lines(
          'export default function (): number { return helper(); }',
          '',
          'const helper = (): number => 1;',
          '',
        ),
        errors: [
          {
            messageId: 'exportedAfterHelper',
            data: { name: 'default', helper: 'helper' },
          },
        ],
      },
      {
        name: 'an overloaded function moves with its signatures',
        code: lines(
          'const helper = (): number => 1;',
          '',
          '/** Doc. */',
          'export function run(x: string): string;',
          'export function run(x: number): number;',
          'export function run(x: string | number): string | number { return x; }',
        ),
        output: lines(
          '/** Doc. */',
          'export function run(x: string): string;',
          'export function run(x: number): number;',
          'export function run(x: string | number): string | number { return x; }',
          '',
          'const helper = (): number => 1;',
          '',
        ),
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'a helper moves above an overloaded caller and its signatures',
        code: lines(
          'function caller(x: string): string;',
          'function caller(x: number): number;',
          'function caller(x: string | number): string | number { return leaf(x); }',
          '',
          'const leaf = <T,>(x: T): T => x;',
        ),
        output: lines(
          'const leaf = <T,>(x: T): T => x;',
          '',
          'function caller(x: string): string;',
          'function caller(x: number): number;',
          'function caller(x: string | number): string | number { return leaf(x); }',
          '',
        ),
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix where an overload signature stands apart',
        code: lines(
          'const helper = (): number => 1;',
          '',
          'export function run(x: string): string;',
          'const other = 1;',
          'export function run(x: number): number;',
          'export function run(x: string | number): string | number { return x; }',
        ),
        output: null,
        errors: [{ messageId: 'exportedAfterHelper' }],
      },
      {
        name: 'no fix in a file with CRLF line endings',
        code: 'const caller = (): number => leaf();\r\n\r\nconst leaf = (): number => 1;\r\n',
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix where removing the statement would join its neighbors',
        code: lines(
          'const caller = (): number => leaf()',
          'const x = 1',
          'const leaf = (): number => 1;',
          '[x].forEach(print);',
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
      {
        name: 'no fix for a statement sharing its line',
        code: lines(
          'const caller = (): number => leaf();',
          'const leaf = (): number => 1; const other = 2;',
        ),
        output: null,
        errors: [{ messageId: 'calleeAfterCaller' }],
      },
    ],
  });

  describe('through type wrappers', () => {
    tester.run('function-order', functionOrder, {
      valid: [
        {
          name: 'a function called in place through a type wrapper runs at load',
          code: lines(
            'const main = (): void => { step(); };',
            '',
            'const step = (): void => {};',
            '',
            '((() => { main(); }) satisfies () => void)();',
          ),
        },
        {
          name: 'a wrapped export default names an exported function',
          code: lines(
            'const run = (): number => helper();',
            '',
            'const helper = (): number => 1;',
            '',
            'export default (run satisfies () => number);',
          ),
        },
        {
          name: 'a wrapped const holding a call is not a function',
          code: lines(
            'const caller = (): number => leaf();',
            '',
            'const leaf = memoize((): number => 1) satisfies () => number;',
          ),
        },
      ],
      invalid: [
        {
          name: 'an exported function exported by a wrapped export default',
          code: lines(
            'const helper = (): number => 1;',
            '',
            'const run = (): number => helper();',
            '',
            'export default (run satisfies () => number);',
          ),
          output: lines(
            'const run = (): number => helper();',
            '',
            'const helper = (): number => 1;',
            '',
            'export default (run satisfies () => number);',
          ),
          errors: [{ messageId: 'exportedAfterHelper' }],
        },
        {
          name: 'satisfies',
          code: lines(
            'const caller = ((): number => leaf()) satisfies () => number;',
            '',
            'const leaf = ((): number => 1) satisfies () => number;',
          ),
          output: lines(
            'const leaf = ((): number => 1) satisfies () => number;',
            '',
            'const caller = ((): number => leaf()) satisfies () => number;',
            '',
          ),
          errors: [{ messageId: 'calleeAfterCaller' }],
        },
        {
          name: 'as, angle brackets, non-null and parentheses',
          code: lines(
            'const caller = (function (): number { return leaf!(); }) as () => number;',
            '',
            'const leaf = <() => number>((): number => 1);',
          ),
          output: lines(
            'const leaf = <() => number>((): number => 1);',
            '',
            'const caller = (function (): number { return leaf!(); }) as () => number;',
            '',
          ),
          errors: [{ messageId: 'calleeAfterCaller' }],
        },
        {
          name: 'a wrapped callee',
          code: lines(
            'const caller = (): number => (leaf as () => number)();',
            '',
            'const leaf = (): number => 1;',
          ),
          output: lines(
            'const leaf = (): number => 1;',
            '',
            'const caller = (): number => (leaf as () => number)();',
            '',
          ),
          errors: [{ messageId: 'calleeAfterCaller' }],
        },
      ],
    });
  });

  describe('React component files', () => {
    tsxTester.run('function-order', functionOrder, {
      valid: [
        {
          name: 'props type, memoized component, displayName, then helpers',
          code: lines(
            'type Props = Readonly<{ n: number }>;',
            '',
            'export const Counter = memo((props: Props) => <div>{format(props.n)}</div>);',
            '',
            "Counter.displayName = 'Counter';",
            '',
            'const pad = (s: string): string => s.padStart(2);',
            '',
            'const format = (n: number): string => pad(String(n));',
          ),
        },
      ],
      invalid: [
        {
          name: 'an exported function component below a helper',
          code: lines(
            'type Props = Readonly<{ n: number }>;',
            '',
            'const format = (n: number): string => String(n);',
            '',
            'export const Counter = (props: Props): React.JSX.Element => <div>{format(props.n)}</div>;',
          ),
          output: lines(
            'type Props = Readonly<{ n: number }>;',
            '',
            'export const Counter = (props: Props): React.JSX.Element => <div>{format(props.n)}</div>;',
            '',
            'const format = (n: number): string => String(n);',
            '',
          ),
          errors: [{ messageId: 'exportedAfterHelper' }],
        },
      ],
    });
  });
});
