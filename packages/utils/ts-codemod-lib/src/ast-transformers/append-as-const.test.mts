/* eslint-disable vitest/expect-expect */
import { codeFromStringLines, testPreprocess } from '../utils/index.mjs';
import { appendAsConstTransformer } from './append-as-const.mjs';

const testFn = ({
  source,
  expected,
  debug,
}: Readonly<{
  source: string;
  expected: string;
  debug?: boolean;
}>): void => {
  const { expectedFormatted, result } = testPreprocess(
    appendAsConstTransformer,
    source,
    expected,
    debug ?? false,
  );

  expect(result).toBe(expectedFormatted);
};

describe('appendAsConstTransformer', () => {
  test.each([
    {
      name: 'ArrayLiteralExpression - simple',
      source: 'const foo = [1, 2, 3];',
      expected: 'const foo = [1, 2, 3] as const;',
    },
    {
      name: 'ArrayLiteralExpression - empty',
      source: 'const emptyArray = [];',
      expected: 'const emptyArray = [] as const;',
    },
    {
      name: 'ArrayLiteralExpression - nested',
      source: 'const nested = [1, [2, 3], 4];',
      expected: 'const nested = [1, [2, 3], 4] as const;',
    },
    {
      name: 'ArrayLiteralExpression - with strings',
      source: "const strArray = ['a', 'b', 'c'];",
      expected: "const strArray = ['a', 'b', 'c'] as const;",
    },
    {
      name: 'ArrayLiteralExpression - mixed types',
      source: "const mixed = [1, 'a', true, null];",
      expected: "const mixed = [1, 'a', true, null] as const;",
    },
    {
      name: 'ObjectLiteralExpression - simple',
      source: 'const obj = { a: 1, b: 2 };',
      expected: 'const obj = { a: 1, b: 2 } as const;',
    },
    {
      name: 'ObjectLiteralExpression - empty',
      source: 'const emptyObj = {};',
      expected: 'const emptyObj = {} as const;',
    },
    {
      name: 'ObjectLiteralExpression - nested',
      source: 'const nestedObj = { a: 1, b: { c: 2 } };',
      expected: 'const nestedObj = { a: 1, b: { c: 2 } } as const;',
    },
    {
      name: 'ObjectLiteralExpression - with array',
      source: 'const objWithArray = { a: 1, b: [1, 2, 3] };',
      expected: 'const objWithArray = { a: 1, b: [1, 2, 3] } as const;',
    },
    {
      name: 'Mixed - array with object',
      source: 'const arrayWithObj = [{ a: 1 }, { b: 2 }];',
      expected: 'const arrayWithObj = [{ a: 1 }, { b: 2 }] as const;',
    },
    {
      name: 'Variable declaration with multiple variables',
      source: 'const a = [1, 2], b = { c: 3 };',
      expected: 'const a = [1, 2] as const, b = { c: 3 } as const;',
    },
    {
      name: 'Function return',
      source: 'function foo() { return [1, 2, 3]; }',
      expected: 'function foo() { return [1, 2, 3] as const; }',
    },
    {
      name: 'Arrow function return',
      source: 'const foo = () => ({ a: 1, b: 2 });',
      expected: 'const foo = () => ({ a: 1, b: 2 } as const);',
    },
    {
      name: 'Array in function parameter',
      source: 'function foo(a = [1, 2]) { return a; }',
      expected: 'function foo(a = [1, 2] as const) { return a; }',
    },
    {
      name: 'Object in function parameter',
      source: 'function foo(a = { b: 1 }) { return a; }',
      expected: 'function foo(a = { b: 1 } as const) { return a; }',
    },
    {
      name: 'Skip ArrayLiteralExpression with disable comment',
      source: codeFromStringLines(
        '// transformer-disable-next-line',
        'const skippedArray = [1, 2, 3];',
      ),
      expected: codeFromStringLines(
        '// transformer-disable-next-line',
        'const skippedArray = [1, 2, 3];', // Expect no "as const"
      ),
    },
    {
      name: 'Skip ObjectLiteralExpression with disable comment',
      source: codeFromStringLines(
        '// transformer-disable-next-line',
        'const skippedObject = { a: 1, b: "hello" };',
      ),
      expected: codeFromStringLines(
        '// transformer-disable-next-line',
        'const skippedObject = { a: 1, b: "hello" };', // Expect no "as const"
      ),
    },
    {
      name: 'Disable comment only affects the immediate next line',
      source: codeFromStringLines(
        'const transformedArray = [10, 20]; // This should be transformed',
        '// transformer-disable-next-line',
        'const skippedObject = { x: true }; // This should be skipped',
        'const transformedObject = { y: false }; // This should be transformed',
      ),
      expected: codeFromStringLines(
        'const transformedArray = [10, 20] as const; // This should be transformed',
        '// transformer-disable-next-line',
        'const skippedObject = { x: true }; // This should be skipped',
        'const transformedObject = { y: false } as const; // This should be transformed',
      ),
    },
    // Cases where the transformer doesn't modify the code
    {
      name: 'Primitive literal - number',
      source: 'const num = 42;',
      expected: 'const num = 42;',
    },
    {
      name: 'Primitive literal - string',
      source: "const str = 'hello';",
      expected: "const str = 'hello';",
    },
    {
      name: 'Primitive literal - boolean',
      source: 'const bool = true;',
      expected: 'const bool = true;',
    },
    {
      name: 'Primitive literal - null',
      source: 'const n = null;',
      expected: 'const n = null;',
    },
    {
      name: 'Primitive literal - undefined',
      source: 'const u = undefined;',
      expected: 'const u = undefined;',
    },
    {
      name: 'Variable reference',
      source: 'const a = 1; const b = a;',
      expected: 'const a = 1; const b = a;',
    },
    {
      name: 'Function call',
      source: 'const result = foo();',
      expected: 'const result = foo();',
    },
    {
      name: 'Method call',
      source: 'const result = obj.method();',
      expected: 'const result = obj.method();',
    },
    {
      name: 'Binary expression',
      source: 'const sum = a + b;',
      expected: 'const sum = a + b;',
    },
    {
      name: 'Template literal',
      // eslint-disable-next-line no-template-curly-in-string
      source: 'const greeting = `Hello ${name}`;',
      // eslint-disable-next-line no-template-curly-in-string
      expected: 'const greeting = `Hello ${name}`;',
    },
    {
      name: 'New expression',
      source: 'const date = new Date();',
      expected: 'const date = new Date();',
    },
    {
      name: 'Already has as const - array',
      source: 'const arr = [1, 2, 3] as const;',
      expected: 'const arr = [1, 2, 3] as const;',
    },
    {
      name: 'Already has as const - object',
      source: 'const obj = { a: 1 } as const;',
      expected: 'const obj = { a: 1 } as const;',
    },
    {
      name: 'Primitive literal - number',
      source: 'const num = 42;',
      expected: 'const num = 42;',
    },
    {
      name: 'Class declaration',
      source: 'class MyClass { prop = 1; }',
      expected: 'class MyClass { prop = 1; }',
    },
  ])('$name', testFn);
});
