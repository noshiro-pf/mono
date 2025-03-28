import * as prettier from 'prettier';
import { Project } from 'ts-morph';
import { codeFromStringLines } from '../index.mjs';
import { replaceToReadonly } from './replace-to-readonly.mjs';

describe('replaceToReadonly', () => {
  // https://github.com/eslint-functional/eslint-plugin-functional/blob/main/tests/rules/prefer-readonly-type.test.ts
  test.each([
    {
      name: 'mutable array (non-generic)',
      source: codeFromStringLines(
        'function foo(a: number[], b: Promise<number[]>) {',
        '  console.log(a, b);',
        '}',
      ),
      expected: codeFromStringLines(
        'function foo(a: readonly number[], b: Promise<readonly number[]>) {',
        '  console.log(a, b);',
        '}',
      ),
    },
    {
      name: 'mutable arrays (generic)',
      source: codeFromStringLines(
        'function foo(a: Array<number>, b: Promise<Array<number>>) {',
        '  console.log(a, b);',
        '}',
      ),
      expected: codeFromStringLines(
        'function foo(a: readonly number[], b: Promise<readonly number[]>) {',
        '  console.log(a, b);',
        '}',
      ),
    },
    {
      name: 'mutable sets',
      source: codeFromStringLines(
        'function foo(a: Set<number>, b: Promise<Set<number>>) {',
        '  console.log(a, b);',
        '}',
      ),
      expected: codeFromStringLines(
        'function foo(a: ReadonlySet<number>, b: Promise<ReadonlySet<number>>) {',
        '  console.log(a, b);',
        '}',
      ),
    },
    {
      name: 'mutable maps',
      source: codeFromStringLines(
        'function foo(a: Map<number>, b: Promise<Map<number>>) {',
        '  console.log(a, b);',
        '}',
      ),
      expected: codeFromStringLines(
        'function foo(a: ReadonlyMap<number>, b: Promise<ReadonlyMap<number>>) {',
        '  console.log(a, b);',
        '}',
      ),
    },

    {
      name: 'mutable arrays (nested)',
      source: codeFromStringLines(
        'function foo(a: number[][], b: Promise<number[][]>) {',
        '  console.log(a, b);',
        '}',
      ),
      expected: codeFromStringLines(
        'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {',
        '  console.log(a, b);',
        '}',
      ),
    },
    {
      name: 'mutable arrays (in type alias)',
      source: codeFromStringLines(
        'type Foo = number[];',
        'function bar(a: Foo) {',
        '  console.log(a);',
        '}',
      ),
      expected: codeFromStringLines(
        'type Foo = readonly number[];',
        'function bar(a: Foo) {',
        '  console.log(a);',
        '}',
      ),
    },
    {
      name: 'mutable arrays (in interface)',
      source: codeFromStringLines('interface Foo {', '  a: number[];', '}'),
      expected: codeFromStringLines(
        'interface Foo {',
        '  a: readonly number[];',
        '}',
      ),
    },
    {
      name: 'mutable arrays (in class)',
      source: codeFromStringLines('class Foo {', '  a: number[];', '}'),
      expected: codeFromStringLines(
        'class Foo {',
        '  a: readonly number[];',
        '}',
      ),
    },
    {
      name: 'mutable arrays (in class method)',
      source: codeFromStringLines(
        'class Foo {',
        '  a() {',
        '    const b: number[] = [];',
        '    console.log(b);',
        '  }',
        '}',
      ),
      expected: codeFromStringLines(
        'class Foo {',
        '  a() {',
        '    const b: readonly number[] = [];',
        '    console.log(b);',
        '  }',
        '}',
      ),
    },
    {
      name: 'function type',
      source: codeFromStringLines('let foo: () => number;'),
      expected: codeFromStringLines('let foo: () => number;'),
    },
    {
      name: 'object property',
      source: codeFromStringLines(
        //
        'let foo = {',
        '  a: 1',
        '};',
      ),
      expected: codeFromStringLines(
        //
        'let foo = {',
        '  a: 1',
        '};',
      ),
    },
    {
      name: 'object property array type',
      source: codeFromStringLines(
        //
        'type foo: {',
        '  a: number[]',
        '};',
      ),
      expected: codeFromStringLines(
        'let foo = {',
        '  a: readonly number[]',
        '};',
      ),
    },
  ] as const satisfies { name: string; source: string; expected: string }[])(
    '$name',
    async ({ source, expected }) => {
      const project = new Project();
      const sourceFile = project.createSourceFile('__tempfile__.ts', source);

      replaceToReadonly(sourceFile);

      const result = await prettier.format(sourceFile.getText(), {
        parser: 'typescript',
      });

      sourceFile.delete();

      const expectedFormatted = await prettier.format(expected, {
        parser: 'typescript',
      });

      expect(result).toBe(expectedFormatted);
    },
  );
});
