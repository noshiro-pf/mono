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
        'function foo(a: Map<string, number>, b: Promise<Map<string, number>>) {',
        '  console.log(a, b);',
        '}',
      ),
      expected: codeFromStringLines(
        'function foo(a: ReadonlyMap<string, number>, b: Promise<ReadonlyMap<string, number>>) {',
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
      name: 'mutable arrays (nested 2)',
      source: codeFromStringLines(
        'function foo(a: { p: number[]}[], b: Promise<number[][]>) {',
        '  console.log(a, b);',
        '}',
      ),
      expected: codeFromStringLines(
        'function foo(a: readonly (Readonly<{ p: readonly number[] }>)[], b: Promise<readonly (readonly number[])[]>) {',
        '  console.log(a, b);',
        '}',
      ),
    },
    // {
    //   name: 'mutable arrays (in type alias)',
    //   source: codeFromStringLines(
    //     'type Foo = number[];',
    //     'function bar(a: Foo) {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'type Foo = readonly number[];',
    //     'function bar(a: Foo) {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable arrays (in interface)',
    //   source: codeFromStringLines('interface Foo {', '  a: number[];', '}'),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  a: readonly number[];',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable arrays (in class)',
    //   source: codeFromStringLines('class Foo {', '  a: number[];', '}'),
    //   expected: codeFromStringLines(
    //     'class Foo {',
    //     '  a: readonly number[];',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable arrays (in class method)',
    //   source: codeFromStringLines(
    //     'class Foo {',
    //     '  a() {',
    //     '    const b: number[] = [];',
    //     '    console.log(b);',
    //     '  }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'class Foo {',
    //     '  a() {',
    //     '    const b: readonly number[] = [];',
    //     '    console.log(b);',
    //     '  }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'function type',
    //   source: codeFromStringLines('let foo: () => number;'),
    //   expected: codeFromStringLines('let foo: () => number;'),
    // },
    // {
    //   name: 'object property',
    //   source: codeFromStringLines(
    //     //
    //     'let foo = {',
    //     '  a: 1',
    //     '};',
    //   ),
    //   expected: codeFromStringLines(
    //     //
    //     'let foo = {',
    //     '  a: 1',
    //     '};',
    //   ),
    // },
    // {
    //   name: 'object property array type',
    //   source: codeFromStringLines(
    //     //
    //     'type foo: {',
    //     '  a: number[]',
    //     '};',
    //   ),
    //   expected: codeFromStringLines(
    //     'let foo = {',
    //     '  a: readonly number[]',
    //     '};',
    //   ),
    // },

    // {
    //   name: 'mutable array (non-generic)',
    //   source: codeFromStringLines(
    //     'function foo(a: number[], b: Promise<number[]>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(a: readonly number[], b: Promise<readonly number[]>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable arrays (generic)',
    //   source: codeFromStringLines(
    //     'function foo(a: Array<number>, b: Promise<Array<number>>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(a: readonly number[], b: Promise<readonly number[]>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable sets',
    //   source: codeFromStringLines(
    //     'function foo(a: Set<number>, b: Promise<Set<number>>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(a: ReadonlySet<number>, b: Promise<ReadonlySet<number>>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable maps',
    //   source: codeFromStringLines(
    //     'function foo(a: Map<number>, b: Promise<Map<number>>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(a: ReadonlyMap<number>, b: Promise<ReadonlyMap<number>>) {',
    //     '  console.log(a, b);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'inside interfaces',
    //   source: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly bar: Array<string>;',
    //     '  readonly baz: Promise<Array<string>>;',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly bar: readonly string[];',
    //     '  readonly baz: Promise<readonly string[]>;',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'index signatures',
    //   source: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly [key: string]: {',
    //     '    readonly a: Array<string>;',
    //     '    readonly b: Promise<Array<string>>;',
    //     '  };',
    //     '}',
    //     'interface Bar {',
    //     '  [key: string]: string',
    //     '}',
    //     'interface Baz {',
    //     '  [key: string]: { prop: string }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly [key: string]: {',
    //     '    readonly a: readonly string[];',
    //     '    readonly b: Promise<readonly string[]>;',
    //     '  };',
    //     '}',
    //     'interface Bar {',
    //     '  readonly [key: string]: string',
    //     '}',
    //     'interface Baz {',
    //     '  readonly [key: string]: { readonly prop: string }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'non-readonly class properties',
    //   source: codeFromStringLines(
    //     'class Klass {',
    //     '  foo: number;',
    //     '  private bar: number;',
    //     '  static baz: number;',
    //     '  private static qux: number;',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'class Klass {',
    //     '  foo: number;',
    //     '  private bar: number;',
    //     '  static baz: number;',
    //     '  private static qux: number;',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'non-readonly class parameter properties',
    //   source: codeFromStringLines(
    //     'class Klass {',
    //     '  constructor (',
    //     '    public publicProp: string,',
    //     '    protected protectedProp: string,',
    //     '    private privateProp: string,',
    //     '  ) { }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'class Klass {',
    //     '  constructor (',
    //     '    public readonly publicProp: string,',
    //     '    protected readonly protectedProp: string,',
    //     '    private readonly privateProp: string,',
    //     '  ) { }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'literals without readonly modifiers',
    //   source: codeFromStringLines(
    //     'let foo: {',
    //     '  a: number,',
    //     '  b: ReadonlyArray<string>,',
    //     '  c: () => string,',
    //     '  d: { readonly [key: string]: string },',
    //     '  [key: string]: string,',
    //     '  readonly e: {',
    //     '    a: number,',
    //     '    b: ReadonlyArray<string>,',
    //     '    c: () => string,',
    //     '    d: { readonly [key: string]: string },',
    //     '    [key: string]: string,',
    //     '  }',
    //     '};',
    //   ),
    //   expected: codeFromStringLines(
    //     'let foo: {',
    //     '  a: number,',
    //     '  b: ReadonlyArray<string>,',
    //     '  c: () => string,',
    //     '  d: { readonly [key: string]: string },',
    //     '  [key: string]: string,',
    //     '  readonly e: {',
    //     '    a: number,',
    //     '    b: ReadonlyArray<string>,',
    //     '    c: () => string,',
    //     '    d: { readonly [key: string]: string },',
    //     '    [key: string]: string,',
    //     '  }',
    //     '};',
    //   ),
    // },
    // {
    //   name: 'mapped types',
    //   source: 'const func = (x: { [key in string]: number }) => {}',
    //   expected: 'const func = (x: { readonly [key in string]: number }) => {}',
    // },
    // {
    //   name: 'explicit readonly parameter types',
    //   source: codeFromStringLines(
    //     'function foo(...a: ReadonlyArray<number>) {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(...a: readonly number[]) {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'explicit readonly parameter types (non-generic)',
    //   source: codeFromStringLines(
    //     'const foo = (...a: readonly number[]) => {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'const foo = (...a: readonly number[]) => {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'explicit readonly parameter types (generic)',
    //   source: codeFromStringLines(
    //     'const foo = (tuple: readonly [number, string, readonly [number, string]]) => {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'const foo = (tuple: readonly [number, string, readonly [number, string]]) => {',
    //     '  console.log(a);',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'explicit readonly return types (generic)',
    //   source: codeFromStringLines(
    //     'function foo(): ReadonlyArray<number> {',
    //     '  return [1, 2, 3];',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(): readonly number[] {',
    //     '  return [1, 2, 3];',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'explicit readonly return types (non-generic)',
    //   source: codeFromStringLines(
    //     'const foo = (): readonly number[] => {',
    //     '  return [1, 2, 3];',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'const foo = (): readonly number[] => {',
    //     '  return [1, 2, 3];',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'implicit readonly arrays',
    //   source: codeFromStringLines(
    //     'const foo = [1, 2, 3];',
    //     'function bar(param = [1, 2, 3]) {}',
    //   ),
    //   expected: codeFromStringLines(
    //     'const foo = [1, 2, 3];',
    //     'function bar(param = [1, 2, 3]) {}',
    //   ),
    // },
    // {
    //   name: 'readonly local types',
    //   source: codeFromStringLines(
    //     'function foo() {',
    //     '  type Foo = ReadonlyArray<string>;',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo() {',
    //     '  type Foo = readonly string[];',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable variable declarations (generic)',
    //   source: 'const foo: Array<string> = [];',
    //   expected: 'const foo: string[] = [];',
    // },
    // {
    //   name: 'mutable variable declarations (non-generic)',
    //   source: 'const foo: string[] = [];',
    //   expected: 'const foo: readonly string[] = [];',
    // },
    // {
    //   name: 'readonly variable declarations (generic)',
    //   source: 'const foo: ReadonlyArray<string> = [];',
    //   expected: 'const foo: readonly string[] = [];',
    // },
    // {
    //   name: 'readonly variable declarations (non-generic)',
    //   source: 'const foo: readonly string[] = [];',
    //   expected: 'const foo: readonly string[] = [];',
    // },
    // {
    //   name: 'interfaces with readonly modifiers',
    //   source: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly a: number,',
    //     '  readonly b: ReadonlyArray<string>,',
    //     '  readonly c: () => string,',
    //     '  readonly d: { readonly [key: string]: string },',
    //     '  readonly [key: string]: string,',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly a: number,',
    //     '  readonly b: ReadonlyArray<string>,',
    //     '  readonly c: () => string,',
    //     '  readonly d: { readonly [key: string]: string },',
    //     '  readonly [key: string]: string,',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'interfaces with readonly modifiers',
    //   source: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly a: number,',
    //     '  readonly b: ReadonlyArray<string>,',
    //     '  readonly c: () => string,',
    //     '  readonly d: { readonly [key: string]: string },',
    //     '  readonly [key: string]: string,',
    //     '  readonly e: {',
    //     '    readonly a: number,',
    //     '    readonly b: ReadonlyArray<string>,',
    //     '    readonly c: () => string,',
    //     '    readonly d: { readonly [key: string]: string },',
    //     '    readonly [key: string]: string,',
    //     '  }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly a: number,',
    //     '  readonly b: ReadonlyArray<string>,',
    //     '  readonly c: () => string,',
    //     '  readonly d: { readonly [key: string]: string },',
    //     '  readonly [key: string]: string,',
    //     '  readonly e: {',
    //     '    readonly a: number,',
    //     '    readonly b: ReadonlyArray<string>,',
    //     '    readonly c: () => string,',
    //     '    readonly d: { readonly [key: string]: string },',
    //     '    readonly [key: string]: string,',
    //     '  }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'interfaces without readonly modifiers',
    //   source: codeFromStringLines(
    //     'interface Foo {',
    //     '  a: number,',
    //     '  b: ReadonlyArray<string>,',
    //     '  c: () => string,',
    //     '  d: { [key: string]: string },',
    //     '  [key: string]: string,',
    //     '  e: {',
    //     '    a: number,',
    //     '    b: ReadonlyArray<string>,',
    //     '    c: () => string,',
    //     '    d: { [key: string]: string },',
    //     '    [key: string]: string,',
    //     '  }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly a: number,',
    //     '  readonly b: ReadonlyArray<string>,',
    //     '  readonly c: () => string,',
    //     '  readonly d: { readonly [key: string]: string },',
    //     '  readonly [key: string]: string,',
    //     '  readonly e: {',
    //     '    readonly a: number,',
    //     '    readonly b: ReadonlyArray<string>,',
    //     '    readonly c: () => string,',
    //     '    readonly d: { readonly [key: string]: string },',
    //     '    readonly [key: string]: string,',
    //     '  }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'interfaces with call signatures and method signatures',
    //   source: codeFromStringLines(
    //     'interface Foo {',
    //     '  (): void',
    //     '  foo(): void',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  (): void',
    //     '  foo(): void',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'literal with readonly index signature',
    //   source: 'let foo: { readonly [key: string]: number };',
    //   expected: 'let foo: Readonly<{ [key: string]: number }>;',
    // },
    // {
    //   name: 'type literals elements with a readonly modifer in an array',
    //   source:
    //     'type foo = ReadonlyArray<{ readonly type: string, readonly code: string }>;',
    //   expected:
    //     'type foo = readonly Readonly<{ type: string, code: string }>[];',
    // },
    // {
    //   name: 'type literals with readonly on members',
    //   source: codeFromStringLines(
    //     'let foo: {',
    //     '  readonly a: number,',
    //     '  readonly b: ReadonlyArray<string>,',
    //     '  readonly c: () => string,',
    //     '  readonly d: { readonly [key: string]: string }',
    //     '  readonly [key: string]: string',
    //     '};',
    //   ),
    //   expected: codeFromStringLines(
    //     'let foo: Readonly<{',
    //     '  a: number,',
    //     '  b: readonly string[],',
    //     '  c: () => string,',
    //     '  d: Readonly<{ [key: string]: string }>',
    //     '  [key: string]: string',
    //     '}>;',
    //   ),
    // },
    // {
    //   name: 'class parameter properties',
    //   source: codeFromStringLines(
    //     'class Klass {',
    //     '  constructor (',
    //     '    prop: string,',
    //     '    public publicProp: string,',
    //     '    protected protectedProp: string,',
    //     '    private privateProp: string,',
    //     '  ) { }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'class Klass {',
    //     '  constructor (',
    //     '    readonly prop: string,',
    //     '    public readonly publicProp: string,',
    //     '    protected readonly protectedProp: string,',
    //     '    private readonly privateProp: string,',
    //     '  ) { }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'class parameter properties',
    //   source: codeFromStringLines(
    //     'class Klass {',
    //     '  constructor (',
    //     '    nonParameterProp: string,',
    //     '    readonly readonlyProp: string,',
    //     '    public readonly publicReadonlyProp: string,',
    //     '    protected readonly protectedReadonlyProp: string,',
    //     '    private readonly privateReadonlyProp: string,',
    //     '  ) { }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'class Klass {',
    //     '  constructor (',
    //     '    nonParameterProp: string,',
    //     '    readonly readonlyProp: string,',
    //     '    public readonly publicReadonlyProp: string,',
    //     '    protected readonly protectedReadonlyProp: string,',
    //     '    private readonly privateReadonlyProp: string,',
    //     '  ) { }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mapped types without readonly on members',
    //   source: 'const func = (x: { [key in string]: number }) => {}',
    //   expected: 'const func = (x: Readonly<{ [key in string]: number }>) => {}',
    // },
    // {
    //   name: 'mapped types with readonly on members',
    //   source: 'const func = (x: { readonly [key in string]: number }) => {}',
    //   expected: 'const func = (x: { readonly [key in string]: number }) => {}',
    // },
    // {
    //   name: 'mutable return types',
    //   source: codeFromStringLines(
    //     'function foo(...numbers: ReadonlyArray<number>): Array<number> {}',
    //     'function bar(...numbers: readonly number[]): number[] {}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(...numbers: readonly number[]): readonly number[] {}',
    //     'function bar(...numbers: readonly number[]): readonly number[] {}',
    //   ),
    // },
    // {
    //   name: 'mutable return types',
    //   source: codeFromStringLines(
    //     'const foo = (...numbers: ReadonlyArray<number>): Array<number> =>  {}',
    //     'const bar = (...numbers: readonly number[]): number[] =>  {}',
    //   ),
    //   expected: codeFromStringLines(
    //     'const foo = (...numbers: readonly number[]): readonly number[] =>  {}',
    //     'const bar = (...numbers: readonly number[]): readonly number[] =>  {}',
    //   ),
    // },
    // {
    //   name: 'mutable return types',
    //   source: codeFromStringLines(
    //     'class Foo {',
    //     '  foo(...numbers: ReadonlyArray<number>): Array<number> {',
    //     '  }',
    //     '}',
    //     'class Bar {',
    //     '  foo(...numbers: readonly number[]): number[] {',
    //     '  }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'class Foo {',
    //     '  foo(...numbers: readonly number[]): readonly number[] {',
    //     '  }',
    //     '}',
    //     'class Bar {',
    //     '  foo(...numbers: readonly number[]): readonly number[] {',
    //     '  }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'mutable return types',
    //   source: codeFromStringLines(
    //     'function foo(...numbers: ReadonlyArray<number>): Promise<Array<number>> {}',
    //     'function foo(...numbers: ReadonlyArray<number>): Promise<number[]> {}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(...numbers: readonly number[]): Promise<readonly number[]> {}',
    //     'function foo(...numbers: readonly number[]): Promise<readonly number[]> {}',
    //   ),
    // },
    // {
    //   name: 'mutable return types',
    //   source: codeFromStringLines(
    //     'function foo(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>> {}',
    //     'function foo(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>> {}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
    //     'function foo(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
    //   ),
    // },
    // {
    //   name: 'mutable return types',
    //   source:
    //     'function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } | { readonly b: string[] } {}',
    //   expected:
    //     'function foo(...numbers: readonly number[]): Readonly<{ a: readonly number[] }> | Readonly<{ b: readonly string[] }> {}',
    // },
    // {
    //   name: 'mutable return types',
    //   source: codeFromStringLines(
    //     'type Foo<T> = { readonly x: T; };',
    //     'function foo(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>> {}',
    //     'function foo(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>> {}',
    //   ),
    //   expected: codeFromStringLines(
    //     'type Foo<T> = Readonly<{ x: T; }>;',
    //     'function foo(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
    //     'function foo(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
    //   ),
    // },
    // {
    //   name: 'mutable return types',
    //   source:
    //     'function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } & { readonly b: string[] } {}',
    //   expected:
    //     'function foo(...numbers: readonly number[]): Readonly<{ a: readonly number[] }> & Readonly<{ b: readonly string[] }> {}',
    // },
    // {
    //   name: 'mutable return types',
    //   source:
    //     'function foo<T>(x: T): T extends Array<number> ? string : number[] {}',
    //   expected:
    //     'function foo<T>(x: T): T extends readonly number[] ? string : readonly number[] {}',
    // },
    // {
    //   name: 'mutable return types',
    //   source: codeFromStringLines(
    //     'function foo(bar: string): { baz: number } {',
    //     '  return 1 as any;',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo(bar: string): Readonly<{ baz: number }> {',
    //     '  return 1 as any;',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'implicit readonly array variables',
    //   source: 'const numbers = [1, 2, 3] as const;',
    //   expected: 'const numbers = [1, 2, 3] as const;',
    // },
    // {
    //   name: 'implicit readonly return types',
    //   source: codeFromStringLines(
    //     'function foo() {',
    //     '  return [1, 2, 3] as const;',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo() {',
    //     '  return [1, 2, 3] as const;',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'implicit readonly return types',
    //   source: codeFromStringLines(
    //     'const foo = () => {',
    //     '  return [1, 2, 3] as const;',
    //     '};',
    //   ),
    //   expected: codeFromStringLines(
    //     'const foo = () => {',
    //     '  return [1, 2, 3] as const;',
    //     '};',
    //   ),
    // },
    // {
    //   name: 'classes',
    //   source: codeFromStringLines(
    //     'class Klass {',
    //     '  foo: number;',
    //     '  private bar: number;',
    //     '  static baz: number;',
    //     '  private static qux: number;',
    //     '  foo() {',
    //     '    let bar: {',
    //     '      foo: number;',
    //     '    };',
    //     '  }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'class Klass {',
    //     '  readonly foo: number;',
    //     '  private readonly bar: number;',
    //     '  static readonly baz: number;',
    //     '  private static readonly qux: number;',
    //     '  foo() {',
    //     '    let bar: {',
    //     '      foo: number;',
    //     '    };',
    //     '  }',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'interfaces',
    //   source: codeFromStringLines(
    //     'interface Foo {',
    //     '  foo: number,',
    //     '  bar: ReadonlyArray<string>,',
    //     '  baz: () => string,',
    //     '  qux: { [key: string]: string }',
    //     '}',
    //   ),
    //   expected: codeFromStringLines(
    //     'interface Foo {',
    //     '  readonly foo: number,',
    //     '  readonly bar: readonly string[],',
    //     '  readonly baz: () => string,',
    //     '  readonly qux: Readonly<{ [key: string]: string }>',
    //     '}',
    //   ),
    // },
    // {
    //   name: 'ignore mutable identifiers',
    //   source: 'let mut_Foo: string[] = [];',
    //   expected: 'let mut_Foo: string[] = [];',
    // },
    // {
    //   name: 'mutable local variables',
    //   source: codeFromStringLines(
    //     'function foo() {',
    //     '  let foo: {',
    //     '    a: number,',
    //     '    b: ReadonlyArray<string>,',
    //     '    c: () => string,',
    //     '    d: { [key: string]: string },',
    //     '    [key: string]: string,',
    //     '    readonly d: {',
    //     '      a: number,',
    //     '      b: ReadonlyArray<string>,',
    //     '      c: () => string,',
    //     '      d: { [key: string]: string },',
    //     '      [key: string]: string,',
    //     '    }',
    //     '  }',
    //     '};',
    //   ),
    //   expected: codeFromStringLines(
    //     'function foo() {',
    //     '  let foo: {',
    //     '    a: number,',
    //     '    b: ReadonlyArray<string>,',
    //     '    c: () => string,',
    //     '    d: { [key: string]: string },',
    //     '    [key: string]: string,',
    //     '    readonly d: {',
    //     '      a: number,',
    //     '      b: ReadonlyArray<string>,',
    //     '      c: () => string,',
    //     '      d: { [key: string]: string },',
    //     '      [key: string]: string,',
    //     '    }',
    //     '  }',
    //     '};',
    //   ),
    // },

    // {
    //   name: 'mutable arrays',
    //   source: 'type Foo = Array<string>;',
    //   expected: 'type Foo = readonly string[];',
    // },
    // {
    //   name: 'mutable arrays',
    //   source: 'const foo: number[] = [];',
    //   expected: 'const foo: readonly number[] = [];',
    // },
    // {
    //   name: 'mutable arrays',
    //   source: 'const foo = [];',
    //   expected: 'const foo = [];',
    // },

    // ...(
    //   [
    //     {
    //       source: 'type Foo = [string, string];',
    //       expected: 'type Foo = readonly [string, string];',
    //     },
    //     {
    //       source: "const foo: [string, string] = ['foo', 'bar'];",
    //       expected: "const foo: readonly [string, string] = ['foo', 'bar'];",
    //     },
    //     {
    //       source: "const foo = ['foo', 'bar'];",
    //       expected: "const foo = ['foo', 'bar'];",
    //     },
    //     {
    //       source: "const foo = ['foo', 'bar'] as [string, string];",
    //       expected: "const foo = ['foo', 'bar'] as readonly [string, string];",
    //     },
    //     {
    //       name: 'satisfies operator',
    //       source: "const foo = ['foo', 'bar'] satisfies [string, string];",
    //       expected:
    //         "const foo = ['foo', 'bar'] satisfies readonly [string, string];",
    //     },
    //   ] as { name?: string; source: string; expected: string }[]
    // ) // as const で型を固定
    //   .map((testCase, i) => ({
    //     ...testCase,
    //     name: `mutable tuples (${i + 1}${testCase.name ?? ''})`,
    //   })),

    ...createTestCaseGroup('mutable sets', [
      {
        source: 'type Foo = Set<string>;',
        expected: 'type Foo = ReadonlySet<string>;',
      },
      {
        source: 'const foo: Set<string> = new Set();',
        expected: 'const foo: ReadonlySet<string> = new Set();',
      },
      {
        name: 'as',
        source: 'const foo = new Set() as Set<string>;',
        expected: 'const foo = new Set() as ReadonlySet<string>;',
      },
      {
        name: 'satisfies operator',
        source: 'const foo = new Set() satisfies Set<string>;',
        expected: 'const foo = new Set() satisfies ReadonlySet<string>;',
      },
    ]),

    ...createTestCaseGroup('mutable maps', [
      {
        source: 'type Foo = Map<string, string>',
        expected: 'type Foo = ReadonlyMap<string, string>',
      },
      {
        source: 'const foo: Map<string, string> = new Map();',
        expected: 'const foo: ReadonlyMap<string, string> = new Map();',
      },
      {
        name: 'as',
        source: 'const foo = new Map() as Map<string, string>;',
        expected: 'const foo = new Map() as ReadonlyMap<string, string>;',
      },
      {
        name: 'satisfies operator',
        source: 'const foo = new Map() satisfies Map<string, string>;',
        expected:
          'const foo = new Map() satisfies ReadonlyMap<string, string>;',
      },
    ]),

    // mut_ keyword 追加版
    // 元から readonly 版
    // tuple
    // satisfies
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

      expect(result.trimEnd()).toBe(expectedFormatted.trimEnd());
    },
  );
});

const createTestCaseGroup = <
  const Cs extends DeepReadonly<
    { name?: string; source: string; expected: string }[]
  >,
>(
  groupName: string,
  cases: Cs,
): Readonly<{
  [K in keyof Cs]: Cs[K] & Readonly<{ name: string }>;
}> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  cases.map(
    (testCase, i) =>
      ({
        ...testCase,
        name: `[${groupName} (${i + 1})] ${testCase.name ?? ''}`,
      }) as const,
  ) as Readonly<{
    [K in keyof Cs]: Cs[K] & Readonly<{ name: string }>;
  }>;
