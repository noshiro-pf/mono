/* eslint-disable vitest/expect-expect */
import * as prettier from 'prettier';
import { Project } from 'ts-morph';
import { canonicalizeToReadonly } from './replace-to-readonly.mjs';
import { codeFromStringLines } from './utils/index.mjs';

describe('canonicalizeToReadonly', () => {
  describe('type literals', () => {
    test.each([
      {
        name: 'in function args',
        source: 'function foo(a: { p: number[], readonly q: boolean[] }) {}',
        expected:
          'function foo(a: Readonly<{ p: readonly number[], q: readonly boolean[] }>) {}',
      },
      {
        name: 'nested, in function args',
        source: 'function foo(a: { readonly p: string[], q: bigint[] }[]) {}',
        expected:
          'function foo(a: readonly Readonly<{ p: readonly string[], q: readonly bigint[] }>[]) {}',
      },
      {
        name: 'in type alias',
        source: codeFromStringLines(
          'type TypeAlias = {',
          '  a: number[]',
          '};',
        ),
        expected: codeFromStringLines(
          'type TypeAlias = Readonly<{',
          '  a: readonly number[]',
          '}>;',
        ),
      },
      {
        name: 'type literals without readonly modifiers',
        source: codeFromStringLines(
          'let foo: {',
          '  a: number,',
          '  b: ReadonlyArray<string>,',
          '  c: () => string,',
          '  d: { readonly [key: string]: string[] },',
          '  [key: string]: string[],',
          '  readonly e: {',
          '    a: number,',
          '    b: ReadonlyArray<string>,',
          '    c: () => string,',
          '    d: { readonly [key: string]: string[] },',
          '    [key: string]: string[],',
          '  }',
          '};',
        ),
        expected: codeFromStringLines(
          'let foo: Readonly<{',
          '  a: number,',
          '  b: readonly string[],',
          '  c: () => string,',
          '  d: Readonly<{ [key: string]: readonly string[] }>,',
          '  [key: string]: readonly string[],',
          '  e: Readonly<{',
          '    a: number,',
          '    b: readonly string[],',
          '    c: () => string,',
          '    d: Readonly<{ [key: string]: readonly string[] }>,',
          '    [key: string]: readonly string[],',
          '  }>',
          '}>;',
        ),
      },

      {
        name: 'type literals elements with a readonly modifer in an array',
        source:
          'type foo = ReadonlyArray<{ readonly type: string, readonly code: string }>;',
        expected:
          'type foo = readonly Readonly<{ type: string, code: string }>[];',
      },
      {
        name: 'type literals with readonly on members',
        source: codeFromStringLines(
          'let foo: {',
          '  readonly a: number,',
          '  readonly b: ReadonlyArray<string>,',
          '  readonly c: () => string,',
          '  readonly d: { readonly [key: string]: string[] }',
          '  readonly [key: string]: string[',
          '};',
        ),
        expected: codeFromStringLines(
          'let foo: Readonly<{',
          '  a: number,',
          '  b: readonly string[],',
          '  c: () => string,',
          '  d: Readonly<{ [key: string]: readonly string[] }>',
          '  [key: string]: readonly string[]',
          '}>;',
        ),
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('arrays', () => {
    test.each([
      {
        name: 'mutable array types in type alias (non-generic)',
        source: 'type Foo = number[];',
        expected: 'type Foo = readonly number[];',
      },
      {
        name: 'mutable array types in function args (non-generic)',
        source: 'function foo(a: number[], b: Promise<number[]>) {}',
        expected:
          'function foo(a: readonly number[], b: Promise<readonly number[]>) {}',
      },
      {
        name: 'mutable array types in function args (generic)',
        source: 'function foo(a: Array<number>, b: Promise<Array<number>>) {}',
        expected:
          'function foo(a: readonly number[], b: Promise<readonly number[]>) {}',
      },
      {
        name: 'mutable array types in interface',
        source: codeFromStringLines(
          'interface SimpleInterface {',
          '  a: number[];',
          '}',
        ),
        expected: codeFromStringLines(
          'interface SimpleInterface {',
          '  readonly a: readonly number[];',
          '}',
        ),
      },
      {
        name: 'mutable nested array types (non-generic)',
        source: 'function foo(a: number[][], b: Promise<number[][]>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'mutable nested array types (generic)',
        source:
          'function foo(a: Array<Array<number>>, b: Promise<Array<Array<number>>>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'mutable nested array types (generic & non-generic combined)',
        source:
          'function foo(a: Array<number[]>, b: Promise<Array<number>[]>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'mutable nested array types (readonly & non-readonly combined)',
        source:
          'function foo(a: readonly number[][], b: Promise<(readonly number[])[]>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'mutable arrays in nested with objects',
        source: codeFromStringLines(
          'function foo(a: { p: number[] }[], b: Promise<number[][]>) {',
          '  console.log(a, b);',
          '}',
        ),
        expected: codeFromStringLines(
          'function foo(a: readonly (Readonly<{ p: readonly number[] }>)[], b: Promise<readonly (readonly number[])[]>) {',
          '  console.log(a, b);',
          '}',
        ),
      },
      {
        name: 'no type annotations',
        source: codeFromStringLines(
          'const foo = [1, 2, 3];',
          'function bar(param = [1, 2, 3]) {}',
        ),
        expected: codeFromStringLines(
          'const foo = [1, 2, 3];',
          'function bar(param = [1, 2, 3]) {}',
        ),
      },
      {
        name: 'local types',
        source: codeFromStringLines(
          'function foo() {',
          '  type Foo = ReadonlyArray<string>;',
          '  type Bar = Array<string>;',
          '}',
        ),
        expected: codeFromStringLines(
          'function foo() {',
          '  type Foo = readonly string[];',
          '  type Bar = readonly string[];',
          '}',
        ),
      },
      {
        name: 'mutable variable declarations (generic)',
        source: 'const foo: Array<string> = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'mutable variable declarations (non-generic)',
        source: 'const foo: string[] = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'readonly variable declarations (generic)',
        source: 'const foo: ReadonlyArray<string> = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'readonly variable declarations (non-generic)',
        source: 'const foo: readonly string[] = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'no type annotation',
        source: 'const foo = [];',
        expected: 'const foo = [];',
      },
      {
        name: 'no type annotation with as const',
        source: 'const numbers = [1, 2, 3] as const;',
        expected: 'const numbers = [1, 2, 3] as const;',
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('tuples', () => {
    test.each([
      {
        name: 'mutable tuples in type alias',
        source: 'type Foo = [string, string];',
        expected: 'type Foo = readonly [string, string];',
      },
      {
        name: 'variable declaration with type annotation',
        source: "const foo: [string, string] = ['foo', 'bar'];",
        expected: "const foo: readonly [string, string] = ['foo', 'bar'];",
      },
      {
        name: 'variable declaration without type annotation',
        source: "const foo = ['foo', 'bar'];",
        expected: "const foo = ['foo', 'bar'];",
      },
      {
        name: 'as',
        source: "const foo = ['foo', 'bar'] as [string, string];",
        expected: "const foo = ['foo', 'bar'] as readonly [string, string];",
      },
      {
        name: 'satisfies operator',
        source: "const foo = ['foo', 'bar'] satisfies [string, string];",
        expected:
          "const foo = ['foo', 'bar'] satisfies readonly [string, string];",
      },
      {
        name: 'nested mutable tuple',
        source: codeFromStringLines(
          'const foo = (tuple: [number, string, [number[], { x: string }]]) => {',
          '  console.log(a);',
          '}',
        ),
        expected: codeFromStringLines(
          'const foo = (tuple: readonly [number, string, readonly [readonly number[], Readonly<{ x: string }>]]) => {',
          '  console.log(a);',
          '}',
        ),
      },
      {
        name: 'already readonly',
        source: codeFromStringLines(
          'const foo = (tuple: readonly [number, string, readonly [number, string]]) => {',
          '  console.log(a);',
          '}',
        ),
        expected: codeFromStringLines(
          'const foo = (tuple: readonly [number, string, readonly [number, string]]) => {',
          '  console.log(a);',
          '}',
        ),
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('sets', () => {
    test.each([
      {
        name: 'type alias',
        source: 'type Foo = Set<string>;',
        expected: 'type Foo = ReadonlySet<string>;',
      },
      {
        name: 'variable declaration with type annotation',
        source: 'const foo: Set<string> = new Set();',
        expected: 'const foo: ReadonlySet<string> = new Set();',
      },
      {
        name: 'variable declaration without type annotation',
        source: 'const foo = new Set<string>();',
        expected: 'const foo = new Set<string>();',
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
      {
        name: 'in function args',
        source: 'function foo(a: Set<number>, b: Promise<Set<number>>) {}',
        expected:
          'function foo(a: ReadonlySet<number>, b: Promise<ReadonlySet<number>>) {}',
      },
      {
        name: 'named tuples',
        source: 'type T = [names: string[], values: number[]];',
        expected:
          'type T = readonly [names: readonly string[], values: readonly number[]];',
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('maps', () => {
    test.each([
      {
        name: 'type alias',
        source: 'type Foo = Map<string, string>',
        expected: 'type Foo = ReadonlyMap<string, string>',
      },
      {
        name: 'variable declaration with type annotation',
        source: 'const foo: Map<string, string> = new Map();',
        expected: 'const foo: ReadonlyMap<string, string> = new Map();',
      },
      {
        name: 'variable declaration without type annotation',
        source: 'const foo = new Map<string, string>();',
        expected: 'const foo = new Map<string, string>();',
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
      {
        name: 'in function args',
        source:
          'function foo(a: Map<string, number>, b: Promise<Map<string, number>>) {}',
        expected:
          'function foo(a: ReadonlyMap<string, number>, b: Promise<ReadonlyMap<string, number>>) {}',
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('interfaces', () => {
    test.each([
      {
        name: 'mutable & readonly',
        source: codeFromStringLines(
          'interface Foo {',
          '  bar: Array<string>;',
          '  readonly baz: Promise<string[]>;',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Foo {',
          '  readonly bar: readonly string[];',
          '  readonly baz: Promise<readonly string[]>;',
          '}',
        ),
      },
      {
        name: 'with readonly modifiers',
        source: codeFromStringLines(
          'interface Foo {',
          '  readonly a: number,',
          '  readonly b: ReadonlyArray<string>,',
          '  readonly c: () => string,',
          '  readonly d: { readonly [key: string]: string[] },',
          '  readonly [key: string]: string[],',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Foo {',
          '  readonly a: number,',
          '  readonly b: readonly string[],',
          '  readonly c: () => string,',
          '  readonly d: Readonly<{ [key: string]: readonly string[] }>,',
          '  readonly [key: string]: readonly string[],',
          '}',
        ),
      },
      {
        name: 'with readonly modifiers nested',
        source: codeFromStringLines(
          'interface Foo {',
          '  readonly a: number,',
          '  readonly b: ReadonlyArray<string>,',
          '  readonly c: () => string,',
          '  readonly d: { readonly [key: string]: readonly string[] },',
          '  readonly [key: string]: readonly string[],',
          '  readonly e: {',
          '    readonly a: number,',
          '    readonly b: ReadonlyArray<string>,',
          '    readonly c: () => string,',
          '    readonly d: { readonly [key: string]: readonly string[] },',
          '    readonly [key: string]: readonly string[],',
          '  }',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Foo {',
          '  readonly a: number,',
          '  readonly b: readonly string[],',
          '  readonly c: () => string,',
          '  readonly d: Readonly<{ [key: string]: readonly string[] }>,',
          '  readonly [key: string]: readonly string[],',
          '  readonly e: Readonly<{',
          '    a: number,',
          '    b: readonly string[],',
          '    c: () => string,',
          '    d: Readonly<{ [key: string]: readonly string[] }>,',
          '    [key: string]: readonly string[],',
          '  }>',
          '}',
        ),
      },
      {
        name: 'without readonly modifiers nested',
        source: codeFromStringLines(
          'interface Foo {',
          '  a: number,',
          '  b: ReadonlyArray<string>,',
          '  c: () => string,',
          '  d: { [key: string]: string[] },',
          '  [key: string]: string[],',
          '  e: {',
          '    a: number,',
          '    b: ReadonlyArray<string>,',
          '    c: () => string,',
          '    d: { [key: string]: string[] },',
          '    [key: string]: string[],',
          '  }',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Foo {',
          '  readonly a: number,',
          '  readonly b: readonly string[],',
          '  readonly c: () => string,',
          '  readonly d: Readonly<{ [key: string]: readonly string[] }>,',
          '  readonly [key: string]: readonly string[],',
          '  readonly e: Readonly<{',
          '    a: number,',
          '    b: readonly string[],',
          '    c: () => string,',
          '    d: Readonly<{ [key: string]: readonly string[] }>,',
          '    [key: string]: readonly string[],',
          '  }>',
          '}',
        ),
      },
      {
        name: 'interfaces with call signatures and method signatures',
        source: codeFromStringLines(
          'interface Foo {',
          '  (): void',
          '  foo(): void',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Foo {',
          '  (): void',
          '  foo(): void',
          '}',
        ),
      },
      {
        name: 'extends',
        source: 'interface Foo extends Box<[X[]]> {}',
        expected: 'interface Foo extends Box<readonly[readonly X[]]> {}',
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('index signatures', () => {
    test.each([
      {
        name: 'array value',
        source: codeFromStringLines(
          'interface Foo {',
          '  [key: string]: string[]',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Foo {',
          '  readonly [key: string]: readonly string[]',
          '}',
        ),
      },
      {
        name: 'readonly key',
        source: codeFromStringLines(
          'interface Bar {',
          '  readonly [key: string]: string[]',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Bar {',
          '  readonly [key: string]: readonly string[]',
          '}',
        ),
      },
      {
        name: 'readonly key and mutable object value',
        source: codeFromStringLines(
          'interface Foo {',
          '  readonly [key: string]: {',
          '    a: Array<string>;',
          '    readonly b: Promise<Array<string>>;',
          '  };',
          '}',
        ),
        expected: codeFromStringLines(
          'interface Foo {',
          '  readonly [key: string]: Readonly<{',
          '    a: readonly string[];',
          '    b: Promise<readonly string[]>;',
          '  }>;',
          '}',
        ),
      },
      {
        name: 'type declaration',
        source: codeFromStringLines(
          'type Foo = {',
          '  readonly [key: string]: string[]',
          '}',
        ),
        expected: codeFromStringLines(
          'type Foo = Readonly<{',
          '  [key: string]: readonly string[]',
          '}>',
        ),
      },
      {
        name: 'class',
        source: codeFromStringLines(
          'class Klass {',
          '  [key: string]: string[]',
          '}',
        ),
        expected: codeFromStringLines(
          'class Klass {',
          '  readonly [key: string]: readonly string[]',
          '}',
        ),
      },
      {
        name: 'class',
        source: codeFromStringLines(
          'class Klass {',
          '  x: number[] = [];',
          '  [key: string]: string[]',
          '}',
        ),
        expected: codeFromStringLines(
          'class Klass {',
          '  readonly x: readonly number[] = [];',
          '  readonly [key: string]: readonly string[]',
          '}',
        ),
      },
      {
        name: 'nested, interface',
        source: codeFromStringLines(
          'interface NestedIndexSignatureInterface {',
          '  [key: string]: {',
          '    [subkey: string]: string[]',
          '  }',
          '}',
        ),
        expected: codeFromStringLines(
          'interface NestedIndexSignatureInterface {',
          '  readonly [key: string]: Readonly<{',
          '    [subkey: string]: readonly string[]',
          '  }>',
          '}',
        ),
      },
      {
        name: 'nested, type alias',
        source: codeFromStringLines(
          'type NestedIndexSignatureTypeAlias = {',
          '  [key: string]: {',
          '    [subkey: string]: string[]',
          '  }',
          '}',
        ),
        expected: codeFromStringLines(
          'type NestedIndexSignatureTypeAlias = Readonly<{',
          '  [key: string]: Readonly<{',
          '    [subkey: string]: readonly string[]',
          '  }>',
          '}>',
        ),
      },
      {
        name: 'variable declarations',
        source: 'let foo: { readonly [key: string]: number };',
        expected: 'let foo: Readonly<{ [key: string]: number }>;',
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('mapped types', () => {
    test.each([
      {
        name: 'in type alias',
        source: 'type T = { [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'in type alias (PlusToken)',
        source: 'type T = {+readonly [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'in type alias (MinusToken)',
        source: 'type T = { -readonly [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'in type alias (ReadonlyKeyword)',
        source: 'type T = {    readonly [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'in function arguments with readonly',
        source:
          'const func = (x: { readonly [key in string]: number[] }) => {}',
        expected:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
      },
      {
        name: 'in function arguments without readonly',
        source: 'const func = (x: { [key in string]: number[] }) => {}',
        expected:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
      },
      {
        name: 'in function arguments with Readonly<*>',
        source:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
        expected:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('classes', () => {
    describe('property declarations', () => {
      test.each([
        {
          name: '',
          source: codeFromStringLines(
            'class Foo {',
            '  a: number[];',
            '  b: Array<string>;',
            '  c: readonly boolean[];',
            '  d: ReadonlyArray<bigint>;',
            '}',
          ),
          expected: codeFromStringLines(
            'class Foo {',
            '  readonly a: readonly number[];',
            '  readonly b: readonly string[];',
            '  readonly c: readonly boolean[];',
            '  readonly d: readonly bigint[];',
            '}',
          ),
        },
        {
          name: 'with modifiers',
          source: codeFromStringLines(
            'class Klass {',
            '  foo: number;',
            '  private bar: number;',
            '  static baz: number;',
            '  private static qux: number;',
            '}',
          ),
          expected: codeFromStringLines(
            'class Klass {',
            '  readonly foo: number;',
            '  private readonly bar: number;',
            '  static readonly baz: number;',
            '  private readonly static qux: number;',
            '}',
          ),
        },
        {
          name: 'static member',
          source: codeFromStringLines(
            'class Foo {',
            '  static a: number[];',
            '}',
          ),
          expected: codeFromStringLines(
            'class Foo {',
            '  static readonly a: readonly number[];',
            '}',
          ),
        },
      ])('$name', testCanonicalizeToReadonly);
    });

    describe('methods', () => {
      test.each([
        {
          name: 'mutable arrays in class method',
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
      ])('$name', testCanonicalizeToReadonly);
    });

    describe('parameter properties', () => {
      test.each([
        {
          name: 'non-readonly class parameter properties',
          source: codeFromStringLines(
            'class Klass {',
            '  constructor (',
            '    prop: string,',
            '    public publicProp: string,',
            '    protected protectedProp: string,',
            '    private privateProp: string,',
            '  ) { }',
            '}',
          ),
          expected: codeFromStringLines(
            'class Klass {',
            '  constructor (',
            '    readonly prop: string,',
            '    public readonly publicProp: string,',
            '    protected readonly protectedProp: string,',
            '    private readonly privateProp: string,',
            '  ) { }',
            '}',
          ),
        },
        {
          name: 'non-readonly class parameter properties',
          source: codeFromStringLines(
            'class Klass {',
            '  constructor (',
            '    readonly prop: string,',
            '    public readonly publicProp: string,',
            '    protected readonly protectedProp: string,',
            '    private readonly privateProp: string,',
            '  ) { }',
            '}',
          ),
          expected: codeFromStringLines(
            'class Klass {',
            '  constructor (',
            '    readonly prop: string,',
            '    public readonly publicProp: string,',
            '    protected readonly protectedProp: string,',
            '    private readonly privateProp: string,',
            '  ) { }',
            '}',
          ),
        },
        {
          name: 'object or array values',
          source: codeFromStringLines(
            'class Klass {',
            '  constructor (',
            '    public publicProp: string,',
            '    protected protectedProp: { a: string },',
            '    private privateProp: string[],',
            '  ) { }',
            '}',
          ),
          expected: codeFromStringLines(
            'class Klass {',
            '  constructor (',
            '    public readonly publicProp: string,',
            '    protected readonly protectedProp: Readonly<{ a: string }>,',
            '    private readonly privateProp: readonly string[],',
            '  ) { }',
            '}',
          ),
        },
      ])('$name', testCanonicalizeToReadonly);
    });
  });

  describe('functions', () => {
    describe('spread syntax', () => {
      test.each([
        {
          name: 'explicit readonly parameter types (generic)',
          source: codeFromStringLines(
            'function foo(...a: ReadonlyArray<number>) {',
            '  console.log(a);',
            '}',
          ),
          expected: codeFromStringLines(
            'function foo(...a: readonly number[]) {',
            '  console.log(a);',
            '}',
          ),
        },
        {
          name: 'explicit readonly parameter types (non-generic)',
          source: codeFromStringLines(
            'const foo = (...a: readonly number[]) => {',
            '  console.log(a);',
            '}',
          ),
          expected: codeFromStringLines(
            'const foo = (...a: readonly number[]) => {',
            '  console.log(a);',
            '}',
          ),
        },
      ])('$name', testCanonicalizeToReadonly);
    });

    describe('return types', () => {
      test.each([
        {
          name: 'mutable return types',
          source: codeFromStringLines(
            'function foo(...numbers: ReadonlyArray<number>): Array<number> {}',
            'function bar(...numbers: readonly number[]): number[] {}',
          ),
          expected: codeFromStringLines(
            'function foo(...numbers: readonly number[]): readonly number[] {}',
            'function bar(...numbers: readonly number[]): readonly number[] {}',
          ),
        },
        {
          name: 'mutable return types',
          source: codeFromStringLines(
            'const foo = (...numbers: ReadonlyArray<number>): Array<number> =>  {}',
            'const bar = (...numbers: readonly number[]): number[] =>  {}',
          ),
          expected: codeFromStringLines(
            'const foo = (...numbers: readonly number[]): readonly number[] =>  {}',
            'const bar = (...numbers: readonly number[]): readonly number[] =>  {}',
          ),
        },
        {
          name: 'mutable return types',
          source: codeFromStringLines(
            'class Foo {',
            '  foo(...numbers: ReadonlyArray<number>): Array<number> {',
            '  }',
            '}',
            'class Bar {',
            '  foo(...numbers: readonly number[]): number[] {',
            '  }',
            '}',
          ),
          expected: codeFromStringLines(
            'class Foo {',
            '  foo(...numbers: readonly number[]): readonly number[] {',
            '  }',
            '}',
            'class Bar {',
            '  foo(...numbers: readonly number[]): readonly number[] {',
            '  }',
            '}',
          ),
        },
        {
          name: 'mutable return types',
          source: codeFromStringLines(
            'function foo(...numbers: ReadonlyArray<number>): Promise<Array<number>> {}',
            'function bar(...numbers: ReadonlyArray<number>): Promise<number[]> {}',
          ),
          expected: codeFromStringLines(
            'function foo(...numbers: readonly number[]): Promise<readonly number[]> {}',
            'function bar(...numbers: readonly number[]): Promise<readonly number[]> {}',
          ),
        },
        {
          name: 'mutable return types',
          source: codeFromStringLines(
            'function foo(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>> {}',
            'function bar(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>> {}',
          ),
          expected: codeFromStringLines(
            'function foo(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
            'function bar(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
          ),
        },
        {
          name: 'mutable return types',
          source:
            'function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } | { readonly b: string[] } {}',
          expected:
            'function foo(...numbers: readonly number[]): Readonly<{ a: readonly number[] }> | Readonly<{ b: readonly string[] }> {}',
        },
        {
          name: 'mutable return types',
          source: codeFromStringLines(
            'type Foo<T> = { readonly x: T; };',
            'function foo(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>> {}',
            'function foo(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>> {}',
          ),
          expected: codeFromStringLines(
            'type Foo<T> = Readonly<{ x: T; }>;',
            'function foo(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
            'function foo(...numbers: readonly number[]): Promise<Foo<readonly number[]>> {}',
          ),
        },
        {
          name: 'mutable return types',
          source:
            'function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } & { readonly b: string[] } {}',
          expected:
            'function foo(...numbers: readonly number[]): Readonly<{ a: readonly number[] }> & Readonly<{ b: readonly string[] }> {}',
        },
        {
          name: 'mutable return types',
          source:
            'function foo<T>(x: T): T extends Array<number> ? string : number[] {}',
          expected:
            'function foo<T>(x: T): T extends readonly number[] ? string : readonly number[] {}',
        },
        {
          name: 'mutable return types',
          source: codeFromStringLines(
            'function foo(bar: string): { baz: number } {',
            '  return 1 as any;',
            '}',
          ),
          expected: codeFromStringLines(
            'function foo(bar: string): Readonly<{ baz: number }> {',
            '  return 1 as any;',
            '}',
          ),
        },
        {
          name: 'already readonly (generic)',
          source: codeFromStringLines(
            'function foo(): ReadonlyArray<number> {',
            '  return [1, 2, 3];',
            '}',
          ),
          expected: codeFromStringLines(
            'function foo(): readonly number[] {',
            '  return [1, 2, 3];',
            '}',
          ),
        },
        {
          name: 'already readonly (non-generic)',
          source: codeFromStringLines(
            'const foo = (): readonly number[] => {',
            '  return [1, 2, 3];',
            '}',
          ),
          expected: codeFromStringLines(
            'const foo = (): readonly number[] => {',
            '  return [1, 2, 3];',
            '}',
          ),
        },
        {
          name: 'implicit readonly return types',
          source: codeFromStringLines(
            'function foo() {',
            '  return [1, 2, 3] as const;',
            '}',
          ),
          expected: codeFromStringLines(
            'function foo() {',
            '  return [1, 2, 3] as const;',
            '}',
          ),
        },
        {
          name: 'implicit readonly return types',
          source: codeFromStringLines(
            'const foo = () => {',
            '  return [1, 2, 3] as const;',
            '};',
          ),
          expected: codeFromStringLines(
            'const foo = () => {',
            '  return [1, 2, 3] as const;',
            '};',
          ),
        },
      ])('$name', testCanonicalizeToReadonly);
    });

    describe('local variables', () => {
      test.each([
        {
          name: 'mutable local variables',
          source: codeFromStringLines(
            'function foo() {',
            '  let foo: {',
            '    a: number,',
            '    b: ReadonlyArray<string>,',
            '    c: () => string,',
            '    d: { [key: string]: string[] },',
            '    [key: string]: string[],',
            '    readonly d: {',
            '      a: number,',
            '      b: ReadonlyArray<string>,',
            '      c: () => string,',
            '      d: { [key: string]: string[] },',
            '      [key: string]: string[],',
            '    }',
            '  }',
            '};',
          ),
          expected: codeFromStringLines(
            'function foo() {',
            '  let foo: Readonly<{',
            '    a: number,',
            '    b: readonly string[],',
            '    c: () => string,',
            '    d: Readonly<{ [key: string]: readonly string[] }>,',
            '    [key: string]: readonly string[],',
            '    d: Readonly<{',
            '      a: number,',
            '      b: readonly string[],',
            '      c: () => string,',
            '      d: Readonly<{ [key: string]: readonly string[] }>,',
            '      [key: string]: readonly string[],',
            '    }>',
            '  }>',
            '};',
          ),
        },
      ])('$name', testCanonicalizeToReadonly);
    });
  });

  describe('type predicate', () => {
    test.each([
      {
        name: 'isArrayOfLength1OrMore',
        source: codeFromStringLines(
          'const isArrayOfLength1 = <A,>(',
          '  array: A[],',
          '): array is [A, ...A[]] => array.length >= 1;',
        ),
        expected: codeFromStringLines(
          'const isArrayOfLength1 = <A,>(',
          '  array: readonly A[],',
          '): array is readonly [A, ...A[]] => array.length >= 1;',
        ),
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('type parameter', () => {
    test.each([
      {
        name: 'tupleMap',
        source: codeFromStringLines(
          'const tupleMap = <const T extends unknown[], const B>(',
          '  tpl: T,',
          '  mapFn: (a: T[number], index: number) => B,',
          '): { [K in keyof T]: B } =>',
          '  tpl.map(mapFn as (a: unknown, index: number) => B) as {',
          '    [K in keyof T]: B;',
          '  };',
        ),
        expected: codeFromStringLines(
          'const tupleMap = <const T extends readonly unknown[], const B>(',
          '  tpl: T,',
          '  mapFn: (a: T[number], index: number) => B,',
          '): Readonly<{ [K in keyof T]: B }> =>',
          '  tpl.map(mapFn as (a: unknown, index: number) => B) as Readonly<{',
          '    [K in keyof T]: B;',
          '  }>;',
        ),
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('normalize `Readonly`s', () => {
    test.each([
      {
        name: 'array type wrapped with `Readonly`',
        source: 'type T = Readonly<1[]>;',
        expected: 'type T = readonly 1[];',
      },
      {
        name: 'readonly array type wrapped with `Readonly`',
        source: 'type T = Readonly<readonly 2[]>;',
        expected: 'type T = readonly 2[];',
      },
      {
        name: 'nested Readonly',
        source: 'type T = Readonly<Readonly<{ x: 3 }>>;',
        expected: 'type T = Readonly<{ x: 3 }>;',
      },
      {
        name: 'nested Readonly 2',
        source: 'type T = Readonly<((Readonly<Readonly<(({ x: 4 })[])>>))>;',
        expected: 'type T = readonly Readonly<{ x: 4 }>[];',
      },
    ])('$name', testCanonicalizeToReadonly);
  });

  describe('others', () => {
    test.each([
      {
        name: 'function type',
        source: 'let foo: () => number;',
        expected: 'let foo: () => number;',
      },
      {
        name: 'spread assignment',
        source: 'const [x, y]: [number[], number[]] = [[1, 2, 3], [4, 5, 6]];',
        expected:
          'const [x, y]: readonly [readonly number[], readonly number[]] = [[1, 2, 3], [4, 5, 6]];',
      },
      {
        name: 'namespace',
        source: codeFromStringLines(
          'namespace X {',
          '  type TypeAlias = {',
          '    a: number[]',
          '  };',
          '}',
        ),
        expected: codeFromStringLines(
          'namespace X {',
          '  type TypeAlias = Readonly<{',
          '    a: readonly number[]',
          '  }>;',
          '}',
        ),
      },
      {
        name: 'module',
        source: codeFromStringLines(
          'module X {',
          '  type TypeAlias = {',
          '    a: number[]',
          '  };',
          '}',
        ),
        expected: codeFromStringLines(
          'module X {',
          '  type TypeAlias = Readonly<{',
          '    a: readonly number[]',
          '  }>;',
          '}',
        ),
      },
      // {
      //   name: 'ignore mutable identifiers',
      //   source: 'let mut_Foo: string[] = [];',
      //   expected: 'let mut_Foo: string[] = [];',
      // },
    ])('$name', testCanonicalizeToReadonly);
  });

  // describe('test', () => {
  //   test.each([])('$name', testReplaceToReadonly);
  // });
});

const testCanonicalizeToReadonly = async ({
  name,
  source,
  expected,
}: Readonly<{
  name: string;
  source: string;
  expected: string;
}>): Promise<void> => {
  console.debug(name);

  const project = new Project();
  const sourceFile = project.createSourceFile('__tempfile__.ts', source);

  canonicalizeToReadonly(sourceFile);

  const result = await prettier.format(sourceFile.getText(), {
    parser: 'typescript',
  });

  sourceFile.delete();

  const expectedFormatted = await prettier.format(expected, {
    parser: 'typescript',
  });

  expect(result.trimEnd()).toBe(expectedFormatted.trimEnd());
};
