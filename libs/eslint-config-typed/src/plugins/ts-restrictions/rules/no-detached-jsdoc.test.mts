import parser from '@typescript-eslint/parser';
import { RuleTester } from '@typescript-eslint/rule-tester';
import { noDetachedJsdoc } from './no-detached-jsdoc.mjs';

const tester = new RuleTester({
  languageOptions: {
    parser,
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

const lines = (...xs: readonly string[]): string => xs.join('\n');

const detached = (line: number) =>
  ({ messageId: 'detachedJsdoc', line }) as const;

describe('no-detached-jsdoc', () => {
  tester.run('no-detached-jsdoc', noDetachedJsdoc, {
    valid: [
      {
        name: 'a block above a function',
        code: lines('/** Doc. */', 'export const f = (): void => {};'),
      },
      {
        name: 'a block above a function, with a blank line between',
        code: lines('/** Doc. */', '', 'function f(): void {}'),
      },
      {
        name: 'a line comment between the block and its declaration',
        code: lines('/** Doc. */', '// cspell:ignore xyz', 'var x = 1;'),
      },
      {
        name: 'class members, type members, enum members and properties',
        code: lines(
          'class A {',
          '  /** Doc. */',
          '  readonly a = 1;',
          '  /** Doc. */',
          '  m(): void {}',
          '}',
          'type T = Readonly<{',
          '  /** Doc. */',
          '  a: number;',
          '}>;',
          'interface I {',
          '  /** Doc. */',
          '  b: string;',
          '}',
          'enum E {',
          '  /** Doc. */',
          '  A,',
          '}',
          'const o = {',
          '  /** Doc. */',
          '  a: 1,',
          '};',
        ),
      },
      {
        name: 'a block above an export list and an import',
        code: lines(
          '/** Doc. */',
          "import { a } from 'a';",
          '/** Doc. */',
          'export { a };',
        ),
      },
      {
        name: 'a block above each overload signature',
        code: lines(
          '/** One. */',
          'function f(a: string): string;',
          '/** Two. */',
          'function f(a: number): number;',
          'function f(a: unknown): unknown {',
          '  return a;',
          '}',
        ),
      },
      {
        name: 'a block above a parameter',
        code: lines('const f = (', '  /** Doc. */', '  a: number,', ') => a;'),
      },
      {
        name: 'a block above a statement inside a function body',
        code: lines(
          'const f = (): void => {',
          '  /** Doc. */',
          '  const a = 1;',
          '  console.log(a);',
          '};',
        ),
      },
      {
        name: 'a block comment that is not a JSDoc',
        code: lines(
          '/* Plain. */',
          '/*! License. */',
          '/**/',
          'const a = 1;',
          '/* trailing */',
        ),
      },
      {
        name: "a file's leading block, followed by an import",
        code: lines(
          '/**',
          ' * Module documentation.',
          ' */',
          '',
          "import { a } from 'a';",
          '',
          'export const b = a;',
        ),
      },
      {
        name: "a file's leading block tagged as module documentation",
        code: lines(
          '/**',
          ' * Module documentation.',
          ' *',
          ' * @packageDocumentation',
          ' */',
          '',
          '/** Doc. */',
          'export const b = 1;',
        ),
      },
      {
        name: "a file's leading @module block before a line comment and code",
        code: lines(
          '/** @module a */',
          '',
          '// cspell:ignore xyz',
          '/** Doc. */',
          'export const b = 1;',
        ),
      },
      {
        name: "a file's leading block set apart from the JSDoc below it",
        code: lines(
          '/**',
          ' * Module documentation.',
          ' */',
          '',
          '/** Doc. */',
          'export const b = 1;',
        ),
      },
      {
        name: 'a module block after the imports',
        code: lines(
          "import { a } from 'a';",
          "import { b } from 'b';",
          '',
          '/**',
          ' * Module documentation.',
          ' */',
          '',
          '/** Doc. */',
          'export const c = a + b;',
        ),
      },
      {
        name: 'a module block after a directive prologue',
        code: lines(
          "'use strict';",
          '',
          '/** Module documentation. */',
          '',
          '/** Doc. */',
          'export const c = 1;',
        ),
      },
      {
        name: 'a file holding only its leading module block',
        code: lines('/** @module a */', ''),
      },
      {
        name: 'a block above a property of an object wrapped in as const satisfies',
        code: lines(
          'export const rules = {',
          '  /** Doc. */',
          '  a: 1,',
          '} as const satisfies Readonly<Record<string, number>>;',
        ),
      },
      {
        name: 'a block before a parenthesized initializer',
        code: lines(
          'export const x =',
          '  /** Doc. */',
          '  (1 satisfies number);',
        ),
      },
    ],
    invalid: [
      {
        name: 'two blocks in a row: the first documents nothing',
        code: lines('/** Old. */', '/** New. */', 'export const a = 1;'),
        errors: [detached(1)],
      },
      {
        name: 'a block at the end of a file',
        code: lines('export const a = 1;', '', '/** Left behind. */', ''),
        errors: [detached(3)],
      },
      {
        name: 'a block at the end of a block',
        code: lines(
          'export const f = (): void => {',
          '  console.log(1);',
          '  /** Left behind. */',
          '};',
        ),
        errors: [detached(3)],
      },
      {
        name: 'a block at the end of a class body',
        code: lines(
          'export class A {',
          '  readonly a = 1;',
          '',
          '  /** Left behind. */',
          '}',
        ),
        errors: [detached(4)],
      },
      {
        name: 'a block inside an expression',
        code: lines('export const a = 1 + /** Doc. */ 2;'),
        errors: [detached(1)],
      },
      {
        name: "a block between a declaration's modifiers",
        code: lines('export /** Doc. */ const a = 1;'),
        errors: [detached(1)],
      },
      {
        name: 'a block before an argument',
        code: lines('console.log(', '  /** Doc. */', '  1,', ');'),
        errors: [detached(2)],
      },
      {
        name: 'a block on a JSX attribute',
        code: lines(
          'export const a = (',
          '  <div',
          '    /** Doc. */',
          '    hidden',
          '  />',
          ');',
        ),
        filename: 'file.tsx',
        errors: [detached(3)],
      },
      {
        name: 'a block on the line of the code before it',
        code: lines('console.log(1); /** Doc. */', 'console.log(2);'),
        errors: [detached(1)],
      },
      {
        name: "a file's leading block directly above another JSDoc",
        code: lines(
          '/**',
          ' * Was the documentation of a function that moved.',
          ' */',
          '/** Doc. */',
          'export const b = 1;',
        ),
        errors: [detached(1)],
      },
      {
        name: 'a top-level block after a declaration, above another JSDoc',
        code: lines(
          "import { a } from 'a';",
          '',
          'export const b = a;',
          '',
          '/** A section. */',
          '',
          '/** Doc. */',
          'export const c = a;',
        ),
        errors: [detached(5)],
      },
      {
        name: 'a block inside a function, above another JSDoc',
        code: lines(
          'export const f = (): void => {',
          '  /** A section. */',
          '',
          '  /** Doc. */',
          '  const a = 1;',
          '  console.log(a);',
          '};',
        ),
        errors: [detached(2)],
      },
      {
        name: 'a block that is not the first comment of the file, followed by another',
        code: lines(
          '// cspell:ignore xyz',
          '/** @packageDocumentation */',
          'export const b = 1;',
          '/** Old. */',
          '/** New. */',
          'export const c = 1;',
        ),
        errors: [detached(4)],
      },
    ],
  });

  describe('through type wrappers', () => {
    tester.run('no-detached-jsdoc', noDetachedJsdoc, {
      valid: [
        {
          name: 'a property of an object under satisfies',
          code: lines(
            'export const a = {',
            '  /** Doc. */',
            '  b: 1,',
            '} satisfies Readonly<{ b: number }>;',
          ),
        },
        {
          name: 'a property of an object under as',
          code: lines(
            'export const a = {',
            '  /** Doc. */',
            '  b: 1,',
            '} as Readonly<{ b: number }>;',
          ),
        },
        {
          name: 'a property of an object under <T>',
          code: lines(
            'export const a = <Readonly<{ b: number }>>{',
            '  /** Doc. */',
            '  b: 1,',
            '};',
          ),
        },
        {
          name: 'a property of an object under !',
          code: lines(
            'export const a = ({',
            '  /** Doc. */',
            '  b: 1,',
            '} as { b: number } | undefined)!;',
          ),
        },
        {
          name: 'a parenthesized arrow function under satisfies',
          code: lines(
            'export const a =',
            '  /** Doc. */',
            '  ((): void => {}) satisfies () => void;',
          ),
        },
      ],
      invalid: [
        {
          name: 'a block before an as expression in a const initializer',
          code: lines('export const a =', '  /** Doc. */', '  1 as number;'),
          errors: [detached(2)],
        },
        {
          name: 'a block before a satisfies expression in a const initializer',
          code: lines(
            'export const a =',
            '  /** Doc. */',
            '  1 satisfies number;',
          ),
          errors: [detached(2)],
        },
        {
          name: 'a block inside a satisfies wrapper, after the value',
          code: lines(
            'export const a = {',
            '  b: 1,',
            '  /** Left behind. */',
            '} satisfies Readonly<{ b: number }>;',
          ),
          errors: [detached(3)],
        },
      ],
    });
  });
});
