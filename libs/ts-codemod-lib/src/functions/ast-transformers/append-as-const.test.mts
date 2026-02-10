/* eslint-disable no-template-curly-in-string */
/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import { appendAsConstTransformer } from './append-as-const.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const testFn = async ({
  source,
  expected,
  debug,
}: Readonly<{
  source: string;
  expected: string;
  debug?: boolean;
}>): Promise<void> => {
  if (debug !== true) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
  }

  const transformed = await formatter(
    transformSourceCode(source, false, [appendAsConstTransformer({ debug })]),
  );

  const expectedFormatted = await formatter(expected);

  expect(transformed).toBe(expectedFormatted);
};

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

describe(appendAsConstTransformer, () => {
  describe('Primitive types (should not add as const)', () => {
    test.each([
      {
        name: 'number literal',
        source: 'const num = 42;',
        expected: 'const num = 42;',
      },
      {
        name: 'BigInt literal',
        source: 'const bigint = 100n as const;',
        expected: 'const bigint = 100n;',
      },
      {
        name: 'string literal',
        source: "const str = 'hello';",
        expected: "const str = 'hello';",
      },
      {
        name: 'boolean literal',
        source: 'const bool = true;',
        expected: 'const bool = true;',
      },
      {
        name: 'null',
        source: 'const n = null;',
        expected: 'const n = null;',
      },
      {
        name: 'undefined',
        source: 'const u = undefined;',
        expected: 'const u = undefined;',
      },
      {
        name: 'Regex literal with as const should remove as const',
        source: 'const regex = /test/ as const;',
        expected: 'const regex = /test/;',
      },
    ])('$name', testFn);
  });

  describe('Template literals', () => {
    test.each([
      {
        name: 'template expression without as const (should add)',
        source: 'const greeting = `Hello ${name}`;',
        expected: 'const greeting = `Hello ${name}` as const;',
      },
      {
        name: 'template expression with as const (should keep)',
        source: 'const path = `/${variable}` as const;',
        expected: 'const path = `/${variable}` as const;',
      },
      {
        name: 'no substitution template literal without as const (should keep)',
        source: 'const greeting = `hello`;',
        expected: 'const greeting = `hello`;',
      },
      {
        name: 'no substitution template literal with as const (should remove)',
        source: 'const greeting = `hello` as const;',
        expected: 'const greeting = `hello`;',
      },
      {
        name: 'template expression with variable substitution (should add as const)',
        source: dedent`
          const x = "aaa";
          const foo = \`\${x}bbb\`;
        `,
        expected: dedent`
          const x = "aaa";
          const foo = \`\${x}bbb\` as const;
        `,
      },
    ])('$name', testFn);
  });

  describe('Basic array and object transformations', () => {
    test.each([
      {
        name: 'simple array',
        source: 'const foo = [1, 2, 3];',
        expected: 'const foo = [1, 2, 3] as const;',
      },
      {
        name: 'array already has as const',
        source: 'const arr = [1, 2, 3] as const;',
        expected: 'const arr = [1, 2, 3] as const;',
      },
      {
        name: 'empty array',
        source: 'const emptyArray = [];',
        expected: 'const emptyArray = [] as const;',
      },
      {
        name: 'nested array',
        source: 'const nested = [1, [2, 3], 4];',
        expected: 'const nested = [1, [2, 3], 4] as const;',
      },
      {
        name: 'nested array',
        source: 'const foo = [[1] as const] as const;',
        expected: 'const foo = [[1]] as const;',
      },
      {
        name: 'nested array',
        source: 'const nested = [1, [2, 3] as const, 4];',
        expected: 'const nested = [1, [2, 3], 4] as const;',
      },
      {
        name: 'should remove nested as const from array literal',
        source: 'const arr = [[1, 2] as const, [3, 4]] as const;',
        expected: 'const arr = [[1, 2], [3, 4]] as const;',
      },
      {
        name: 'array with strings',
        source: "const strArray = ['a', 'b', 'c'];",
        expected: "const strArray = ['a', 'b', 'c'] as const;",
      },
      {
        name: 'array with mixed types',
        source: "const mixed = [1, 'a', true, null];",
        expected: "const mixed = [1, 'a', true, null] as const;",
      },
      {
        name: 'should remove as const from boolean literal inside array and add as const to top level',
        source: 'const arr = [true as const, false];',
        expected: 'const arr = [true, false] as const;',
      },
      {
        name: 'simple object',
        source: 'const obj = { a: 1, b: 2 };',
        expected: 'const obj = { a: 1, b: 2 } as const;',
      },
      {
        name: 'object already has as const',
        source: 'const obj = { a: 1 } as const;',
        expected: 'const obj = { a: 1 } as const;',
      },
      {
        name: 'empty object',
        source: 'const emptyObj = {};',
        expected: 'const emptyObj = {} as const;',
      },
      {
        name: 'nested object',
        source: 'const nestedObj = { a: 1, b: { c: 2 } };',
        expected: 'const nestedObj = { a: 1, b: { c: 2 } } as const;',
      },
      {
        name: 'object with array',
        source: 'const objWithArray = { a: 1, b: [1, 2, 3] };',
        expected: 'const objWithArray = { a: 1, b: [1, 2, 3] } as const;',
      },
      {
        name: 'array with objects',
        source: 'const arrayWithObj = [{ a: 1 }, { b: 2 }];',
        expected: 'const arrayWithObj = [{ a: 1 }, { b: 2 }] as const;',
      },
      {
        name: 'should remove as const from string literal inside object and add as const to top level',
        source: 'const obj = { key: "value" as const };',
        expected: 'const obj = { key: "value" } as const;',
      },
      {
        name: 'multiple variable declarations',
        source: 'const a = [1, 2], b = { c: 3 };',
        expected: 'const a = [1, 2] as const, b = { c: 3 } as const;',
      },
      {
        name: 'should remove nested as const from object literal',
        source: 'const obj = { a: { b: 1 } as const, c: 2 } as const;',
        expected: 'const obj = { a: { b: 1 }, c: 2 } as const;',
      },
      {
        name: 'should remove nested as const from mixed literals',
        source: 'let mixed = [{ a: 1 } as const, [2] as const] as const;',
        expected: 'let mixed = [{ a: 1 }, [2]] as const;',
      },
      {
        name: 'should remove deeply nested as const',
        source: 'let deep = [[{ x: 1 as const }] as const] as const;',
        expected: 'let deep = [[{ x: 1 }]] as const;',
      },
      {
        name: 'should remove multiple primitive as const inside literals and add as const to top level',
        source:
          'const mixed = [1 as const, { val: "str" as const }, false as const];',
        expected: 'const mixed = [1, { val: "str" }, false] as const;',
      },
      {
        name: 'should remove primitive as const even if parent already has as const',
        source: 'const arr = [1 as const, 2] as const;',
        expected: 'const arr = [1, 2] as const;',
      },
      {
        name: 'should remove primitive as const in nested object and add as const to top level',
        source: 'const obj = { data: { value: 123 as const } };',
        expected: 'const obj = { data: { value: 123 } } as const;',
      },
      {
        name: 'satisfies without as const should add as const',
        source: 'const a = [1, 2] satisfies readonly number[];',
        expected: 'const a = [1, 2] as const satisfies readonly number[];',
      },
    ])('$name', testFn);
  });

  describe('Spread syntax', () => {
    test.each([
      {
        name: 'simple spread in array',
        source: dedent`
          const flag = true as boolean;
          const a = [0, ...[{ x: 1 }, 2]];
        `,
        expected: dedent`
          const flag = true as boolean;
          const a = [0, ...[{ x: 1 }, 2]] as const;
        `,
      },
      {
        name: 'simple spread in array with as const inside',
        source: dedent`
          const flag = true as boolean;
          const a = [0, ...([{ x: 1 } as const, 2] as const)] as const;
        `,
        expected: dedent`
          const flag = true as boolean;
          const a = [0, ...[{ x: 1 }, 2]] as const;
        `,
      },
      {
        name: 'simple spread in array with ternary expression inside',
        source: dedent`
          const flag = true as boolean;
          const b = [0, ...(flag ? ([1, 2]) : ([]))];
        `,
        expected: dedent`
          const flag = true as boolean;
          const b = [0, ...(flag ? ([1, 2] as const) : ([] as const))] as const;
        `,
      },
      {
        name: 'simple spread in array with ternary expression inside',
        source: dedent`
          const flag = true as boolean;
          const c = [0, ...([1, flag ? [2] : [3]] as const)] as const;
        `,
        expected: dedent`
          const flag = true as boolean;
          const c = [0, ...([1, flag ? [2] as const : [3] as const])] as const;
        `,
      },
      {
        name: 'Nested as const inside spread operator with conditional should be kept',
        source: dedent`
          const flag = true as boolean;

          type Elem =
            | Readonly<{ a: 'str0' }>
            | Readonly<{ b: 'str1' }>
            | Readonly<{ c: 'str2' }>;

          const a = [
            { a: 'str0' },
            ...(flag ? ([{ b: 'str1' }, { c: 'str2' }] as const) : []),
          ] as const satisfies readonly Elem[];
        `,
        expected: dedent`
          const flag = true as boolean;

          type Elem =
            | Readonly<{ a: 'str0' }>
            | Readonly<{ b: 'str1' }>
            | Readonly<{ c: 'str2' }>;

          const a = [
            { a: 'str0' },
            ...(flag ? ([{ b: 'str1' }, { c: 'str2' }] as const) : [] as const),
          ] as const satisfies readonly Elem[];
        `,
      },
      {
        name: 'Spread with conditional without as const should add as const to inner array',
        source: dedent`
          const flag = true as boolean;

          type Elem =
            | Readonly<{ a: 'str0' }>
            | Readonly<{ b: 'str1' }>
            | Readonly<{ c: 'str2' }>;

          const a = [
            { a: 'str0' },
            ...(flag ? [{ b: 'str1' }, { c: 'str2' }] : []),
          ] as const satisfies readonly Elem[];
        `,
        expected: dedent`
          const flag = true as boolean;

          type Elem =
            | Readonly<{ a: 'str0' }>
            | Readonly<{ b: 'str1' }>
            | Readonly<{ c: 'str2' }>;

          const a = [
            { a: 'str0' },
            ...(flag ? [{ b: 'str1' }, { c: 'str2' }] as const : [] as const),
          ] as const satisfies readonly Elem[];
        `,
      },
      {
        name: 'Simple spread without conditional should remove inner as const',
        source: dedent`
          const a = [
            1,
            ...[2, 3] as const,
          ] as const;
        `,
        expected: dedent`
          const a = [
            1,
            ...[2, 3],
          ] as const;
        `,
      },
      {
        name: 'Multiple simple spreads should remove inner as const',
        source: dedent`
          const c = [
            ...[1, 2] as const,
            ...[3, 4] as const,
          ] as const;
        `,
        expected: dedent`
          const c = [
            ...[1, 2],
            ...[3, 4],
          ] as const;
        `,
      },
      {
        name: 'Nested as const inside spread operator without conditional statement should be removed',
        source: dedent`
          const flag = true as boolean;

          type Elem =
            | Readonly<{ a: 'str0' }>
            | Readonly<{ b: 'str1' }>
            | Readonly<{ c: 'str2' }>;

          const a = [
            { a: 'str0' },
            ...([{ b: 'str1' }, { c: 'str2' }] as const),
          ] as const satisfies readonly Elem[];
        `,
        expected: dedent`
          const flag = true as boolean;

          type Elem =
            | Readonly<{ a: 'str0' }>
            | Readonly<{ b: 'str1' }>
            | Readonly<{ c: 'str2' }>;

          const a = [
            { a: 'str0' },
            ...[{ b: 'str1' }, { c: 'str2' }],
          ] as const satisfies readonly Elem[];
        `,
      },
      {
        name: 'Object with spread operator',
        source: 'const obj = { a: 1, ...{ b: 2 } };',
        expected: 'const obj = { a: 1, ...{ b: 2 } } as const;',
      },
    ])('$name', testFn);
  });

  describe('Function contexts', () => {
    test.each([
      {
        name: 'function return statement (not transformed - out of scope)',
        source: 'function foo() { return [1, 2, 3]; }',
        expected: 'function foo() { return [1, 2, 3]; }',
      },
      {
        name: 'arrow function return',
        source: 'const foo = () => ({ a: 1, b: 2 });',
        expected: 'const foo = () => ({ a: 1, b: 2 }) as const;',
      },
      {
        name: 'arrow function with return statement (not transformed - out of scope)',
        source: 'const foo = () => { return { a: 1, b: 2 } };',
        expected: 'const foo = () => { return { a: 1, b: 2 } };',
      },
      {
        name: 'array in function parameter default value (not transformed - out of scope)',
        source: 'function foo(a = [1, 2]) { return a; }',
        expected: 'function foo(a = [1, 2]) { return a; }',
      },
      {
        name: 'object in function parameter default value (not transformed - out of scope)',
        source: 'function foo(a = { b: 1 }) { return a; }',
        expected: 'function foo(a = { b: 1 }) { return a; }',
      },
      {
        name: 'object in function call argument (not transformed with avoidInFunctionArgs)',
        source: 'const a = foo({ b: 1 });',
        expected: 'const a = foo({ b: 1 });',
      },
      {
        name: 'arrow function with generic type parameter',
        source: dedent`
          export const some = <const S,>(value: S): Some<S> =>
            ({
              type: SomeTypeSymbol,
              value
            });
        `,
        expected: dedent`
          export const some = <const S,>(value: S): Some<S> =>
            ({
              type: SomeTypeSymbol,
              value
            }) as const;
        `,
      },
      {
        name: 'arrow function with generic type parameter (should keep existing as const)',
        source: dedent`
          export const some = <const S,>(value: S): Some<S> =>
            ({
              type: SomeTypeSymbol,
              value
            }) as const;
        `,
        expected: dedent`
          export const some = <const S,>(value: S): Some<S> =>
            ({
              type: SomeTypeSymbol,
              value
            }) as const;
        `,
      },
    ])('$name', testFn);
  });

  describe('Transformer ignore comments', () => {
    test.each([
      {
        name: 'generic transformer-ignore-next-line for array',
        source: dedent`
          // transformer-ignore-next-line
          const skippedArray = [1, 2, 3];
        `,
        expected: dedent`
          // transformer-ignore-next-line
          const skippedArray = [1, 2, 3];
        `,
      },
      {
        name: 'generic transformer-ignore-next-line for object',
        source: dedent`
          // transformer-ignore-next-line
          const skippedObject = { a: 1, b: "hello" };
        `,
        expected: dedent`
          // transformer-ignore-next-line
          const skippedObject = { a: 1, b: "hello" };
        `,
      },
      {
        name: 'transformer-ignore-next-line only affects immediate next line',
        source: dedent`
          const transformedArray = [10, 20]; // This should be transformed
          // transformer-ignore-next-line
          const skippedObject = { x: true }; // This should be skipped
          const transformedObject = { y: false }; // This should be transformed
        `,
        expected: dedent`
          const transformedArray = [10, 20] as const; // This should be transformed
          // transformer-ignore-next-line
          const skippedObject = { x: true }; // This should be skipped
          const transformedObject = { y: false } as const; // This should be transformed
        `,
      },
      {
        name: 'file scope transformer-ignore',
        source: dedent`
          /* transformer-ignore */
          const transformedArray = [10, 20]; // This should be skipped
          const skippedObject = { x: true }; // This should be skipped
          const transformedObject = { y: false }; // This should be skipped
        `,
        expected: dedent`
          /* transformer-ignore */
          const transformedArray = [10, 20]; // This should be skipped
          const skippedObject = { x: true }; // This should be skipped
          const transformedObject = { y: false }; // This should be skipped
        `,
      },
      {
        name: 'transformer-specific ignore (next line)',
        source: dedent`
          const a = [1, 2, 3];
          // transformer-ignore-next-line append-as-const
          const b = [4, 5, 6];
          const c = [7, 8, 9];
        `,
        expected: dedent`
          const a = [1, 2, 3] as const;
          // transformer-ignore-next-line append-as-const
          const b = [4, 5, 6];
          const c = [7, 8, 9] as const;
        `,
      },
      {
        name: 'transformer-specific ignore (file scope)',
        source: dedent`
          /* transformer-ignore append-as-const */
          const a = [1, 2, 3];
          const b = { x: 1 };
        `,
        expected: dedent`
          /* transformer-ignore append-as-const */
          const a = [1, 2, 3];
          const b = { x: 1 };
        `,
      },
      {
        name: 'multiple transformers in ignore comment',
        source: dedent`
          const a = [1, 2, 3];
          // transformer-ignore-next-line append-as-const, replace-any-with-unknown
          const b = [4, 5, 6];
          const c = [7, 8, 9];
        `,
        expected: dedent`
          const a = [1, 2, 3] as const;
          // transformer-ignore-next-line append-as-const, replace-any-with-unknown
          const b = [4, 5, 6];
          const c = [7, 8, 9] as const;
        `,
      },
      {
        name: 'wrong transformer name should not affect transformation',
        source: dedent`
          const a = [1, 2, 3];
          // transformer-ignore-next-line some-other-transformer
          const b = [4, 5, 6];
          const c = [7, 8, 9];
        `,
        expected: dedent`
          const a = [1, 2, 3] as const;
          // transformer-ignore-next-line some-other-transformer
          const b = [4, 5, 6] as const;
          const c = [7, 8, 9] as const;
        `,
      },
    ])('$name', testFn);
  });

  describe('ignorePrefixes option (mut_ prefix)', () => {
    test.each([
      {
        name: 'single variable with mut_ prefix',
        source: 'const mut_foo = [1, 2, 3];',
        expected: 'const mut_foo = [1, 2, 3];',
      },
      {
        name: 'multiple variables with mut_ prefix',
        source: 'const mut_a = [1, 2], mut_b = { c: 3 };',
        expected: 'const mut_a = [1, 2], mut_b = { c: 3 };',
      },
    ])('$name', testFn);
  });

  describe('Additional edge cases', () => {
    test.each([
      {
        name: 'type annotation (should be skipped)',
        source: 'const a = 1 as 1;',
        expected: 'const a = 1 as 1;',
      },
      {
        name: 'variable reference',
        source: 'const a = 1; const b = a;',
        expected: 'const a = 1; const b = a;',
      },
      {
        name: 'function call',
        source: 'const result = foo();',
        expected: 'const result = foo();',
      },
      {
        name: 'method call',
        source: 'const result = obj.method();',
        expected: 'const result = obj.method();',
      },
      {
        name: 'binary expression',
        source: 'const sum = a + b;',
        expected: 'const sum = a + b;',
      },
      {
        name: 'new expression',
        source: 'const date = new Date();',
        expected: 'const date = new Date();',
      },
      {
        name: 'class declaration (not transformed - out of scope)',
        source: 'class MyClass { prop = 1; }',
        expected: 'class MyClass { prop = 1; }',
      },
      {
        name: 'class declaration with mut_ prefix',
        source: 'class MyClass { mut_prop = 1; }',
        expected: 'class MyClass { mut_prop = 1; }',
      },
      {
        name: 'Object with computed property',
        source: "const obj = { ['key']: [1, 2] };",
        expected: "const obj = { ['key']: [1, 2] } as const;",
      },
      {
        name: 'constant declaration with primitive number initializer in parentheses',
        source: 'const foo = (1) as const;',
        expected: 'const foo = 1;',
      },
      {
        name: 'Parenthesized array expression',
        source: 'const arr = ([1, 2]);',
        expected: 'const arr = [1, 2] as const;',
      },
      {
        name: 'Parenthesized object expression',
        source: 'const obj = ({ a: 1 });',
        expected: 'const obj = { a: 1 } as const;',
      },
      {
        name: 'Object with method that returns array (method body not transformed)',
        source: 'const obj = { method() { return [1, 2]; } };',
        expected: 'const obj = { method() { return [1, 2]; } } as const;',
      },
      {
        name: 'Object with getter (getter body not transformed)',
        source: 'const obj = { get value() { return [1, 2]; } };',
        expected: 'const obj = { get value() { return [1, 2]; } } as const;',
      },
      {
        name: 'Object with setter',
        source: 'const obj = { set value(v) { } };',
        expected: 'const obj = { set value(v) { } } as const;',
      },
      {
        name: 'import statements (should be skipped)',
        source: ' import * as ts from "typescript"; import("./module")',
        expected: ' import * as ts from "typescript"; import("./module")',
      },
      {
        name: 'directives (should be skipped)',
        source: '"use strict";',
        expected: '"use strict";',
      },
      {
        name: 'object key',
        source: 'const a = { "key": 1 };',
        expected: 'const a = { "key": 1 } as const;',
      },
      {
        name: 'computed key',
        source: 'const a = { ["key"]: 1 };',
        expected: 'const a = { ["key"]: 1 } as const;',
      },
    ])('$name', testFn);
  });
});
