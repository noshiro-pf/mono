/* eslint-disable vitest/expect-expect */
import { codeFromStringLines, testPreprocess } from '../utils/index.mjs';
import { convertToReadonlyType } from './convert-to-readonly-type.mjs';

describe('convertToReadonlyType', () => {
  describe('Type literals', () => {
    test.each([
      {
        name: 'In function args',
        source: 'function foo(a: { p: number[], readonly q: boolean[] }) {}',
        expected:
          'function foo(a: Readonly<{ p: readonly number[], q: readonly boolean[] }>) {}',
      },
      {
        name: 'Nested, in function args',
        source: 'function foo(a: { readonly p: string[], q: bigint[] }[]) {}',
        expected:
          'function foo(a: readonly Readonly<{ p: readonly string[], q: readonly bigint[] }>[]) {}',
      },
      {
        name: 'In type alias',
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
        name: 'Type literals without readonly modifiers',
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
        name: 'Type literal elements with a readonly modifier in an array',
        source:
          'type foo = ReadonlyArray<{ readonly type: string, readonly code: string }>;',
        expected:
          'type foo = readonly Readonly<{ type: string, code: string }>[];',
      },
      {
        name: 'Type literals with readonly on members',
        source: codeFromStringLines(
          'let foo: {',
          '  readonly a: number,',
          '  readonly b: ReadonlyArray<string>,',
          '  readonly c: () => string,',
          '  readonly d: { readonly [key: string]: string[] },',
          '  readonly [key: string]: string[]',
          '};',
        ),
        expected: codeFromStringLines(
          'let foo: Readonly<{',
          '  a: number,',
          '  b: readonly string[],',
          '  c: () => string,',
          '  d: Readonly<{ [key: string]: readonly string[] }>,',
          '  [key: string]: readonly string[]',
          '}>;',
        ),
      },
    ])('$name', testFn);
  });

  describe('Arrays', () => {
    test.each([
      {
        name: 'Mutable array types in type alias (non-generic)',
        source: 'type Foo = number[];',
        expected: 'type Foo = readonly number[];',
      },
      {
        name: 'Mutable array types in function args (non-generic)',
        source: 'function foo(a: number[], b: Promise<number[]>) {}',
        expected:
          'function foo(a: readonly number[], b: Promise<readonly number[]>) {}',
      },
      {
        name: 'Mutable array types in function args (generic)',
        source: 'function foo(a: Array<number>, b: Promise<Array<number>>) {}',
        expected:
          'function foo(a: readonly number[], b: Promise<readonly number[]>) {}',
      },
      {
        name: 'Mutable array types in interface',
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
        name: 'Mutable nested array types (non-generic)',
        source: 'function foo(a: number[][], b: Promise<number[][]>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'Mutable nested array types (generic)',
        source:
          'function foo(a: Array<Array<number>>, b: Promise<Array<Array<number>>>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'Mutable nested array types (generic & non-generic combined)',
        source:
          'function foo(a: Array<number[]>, b: Promise<Array<number>[]>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'Mutable nested array types (readonly & non-readonly combined)',
        source:
          'function foo(a: readonly number[][], b: Promise<(readonly number[])[]>) {}',
        expected:
          'function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}',
      },
      {
        name: 'Mutable arrays nested within objects',
        source: codeFromStringLines(
          'function foo(a: { p: number[] }[], b: Promise<number[][]>) {',
          '  console.log(a, b);',
          '}',
        ),
        expected: codeFromStringLines(
          'function foo(a: readonly Readonly<{ p: readonly number[] }>[], b: Promise<readonly (readonly number[])[]>) {',
          '  console.log(a, b);',
          '}',
        ),
      },
      {
        name: 'No type annotations',
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
        name: 'Local types within function',
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
        name: 'Mutable variable declarations (generic)',
        source: 'const foo: Array<string> = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'Mutable variable declarations (non-generic)',
        source: 'const foo: string[] = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'Readonly variable declarations (generic)',
        source: 'const foo: ReadonlyArray<string> = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'Readonly variable declarations (non-generic)',
        source: 'const foo: readonly string[] = [];',
        expected: 'const foo: readonly string[] = [];',
      },
      {
        name: 'No type annotation',
        source: 'const foo = [];',
        expected: 'const foo = [];',
      },
      {
        name: 'No type annotation with as const',
        source: 'const numbers = [1, 2, 3] as const;',
        expected: 'const numbers = [1, 2, 3] as const;',
      },
    ])('$name', testFn);
  });

  describe('Tuples', () => {
    test.each([
      {
        name: 'Mutable tuples in type alias',
        source: 'type Foo = [string, string];',
        expected: 'type Foo = readonly [string, string];',
      },
      {
        name: 'Variable declaration with type annotation',
        source: "const foo: [string, string] = ['foo', 'bar'];",
        expected: "const foo: readonly [string, string] = ['foo', 'bar'];",
      },
      {
        name: 'Variable declaration without type annotation',
        source: "const foo = ['foo', 'bar'];",
        expected: "const foo = ['foo', 'bar'];",
      },
      {
        name: 'Type assertion with as',
        source: "const foo = ['foo', 'bar'] as [string, string];",
        expected: "const foo = ['foo', 'bar'] as readonly [string, string];",
      },
      {
        name: 'Satisfies operator',
        source: "const foo = ['foo', 'bar'] satisfies [string, string];",
        expected:
          "const foo = ['foo', 'bar'] satisfies readonly [string, string];",
      },
      {
        name: 'Nested mutable tuple',
        source: codeFromStringLines(
          'const foo = (tuple: [number, string, [number[], { x: string }]]) => {',
          '  console.log(tuple);',
          '}',
        ),
        expected: codeFromStringLines(
          'const foo = (tuple: readonly [number, string, readonly [readonly number[], Readonly<{ x: string }>]]) => {',
          '  console.log(tuple);',
          '}',
        ),
      },
      {
        name: 'Already readonly tuple',
        source: codeFromStringLines(
          'const foo = (tuple: readonly [number, string, readonly [number, string]]) => {',
          '  console.log(tuple);',
          '}',
        ),
        expected: codeFromStringLines(
          'const foo = (tuple: readonly [number, string, readonly [number, string]]) => {',
          '  console.log(tuple);',
          '}',
        ),
      },
      {
        name: 'Tuple with optional element',
        source: 'type OptionalTuple = [string, number?];',
        expected: 'type OptionalTuple = readonly [string, number?];',
      },
      {
        name: 'Tuple with rest element',
        source: 'type RestTuple = [string, ...number[]];',
        expected: 'type RestTuple = readonly [string, ...number[]];',
      },
      {
        name: 'Tuple with optional and rest elements',
        source: 'type OptionalRestTuple = [string?, ...Map<string, number>[]];',
        expected:
          'type OptionalRestTuple = readonly [string?, ...ReadonlyMap<string, number>[]];',
      },
      {
        name: 'Named tuples',
        source: 'type T = [names: string[], values: number[]];',
        expected:
          'type T = readonly [names: readonly string[], values: readonly number[]];',
      },
    ])('$name', testFn);
  });

  describe('Sets', () => {
    test.each([
      {
        name: 'Type alias',
        source: 'type Foo = Set<string>;',
        expected: 'type Foo = ReadonlySet<string>;',
      },
      {
        name: 'Variable declaration with type annotation',
        source: 'const foo: Set<string> = new Set();',
        expected: 'const foo: ReadonlySet<string> = new Set();',
      },
      {
        name: 'Variable declaration without type annotation',
        source: 'const foo = new Set<string>();',
        expected: 'const foo = new Set<string>();',
      },
      {
        name: 'Type assertion with as',
        source: 'const foo = new Set() as Set<string>;',
        expected: 'const foo = new Set() as ReadonlySet<string>;',
      },
      {
        name: 'Satisfies operator',
        source: 'const foo = new Set() satisfies Set<string>;',
        expected: 'const foo = new Set() satisfies ReadonlySet<string>;',
      },
      {
        name: 'In function args',
        source: 'function foo(a: Set<number>, b: Promise<Set<number>>) {}',
        expected:
          'function foo(a: ReadonlySet<number>, b: Promise<ReadonlySet<number>>) {}',
      },
    ])('$name', testFn);
  });

  describe('Maps', () => {
    test.each([
      {
        name: 'Type alias',
        source: 'type Foo = Map<string, string>',
        expected: 'type Foo = ReadonlyMap<string, string>',
      },
      {
        name: 'Variable declaration with type annotation',
        source: 'const foo: Map<string, string> = new Map();',
        expected: 'const foo: ReadonlyMap<string, string> = new Map();',
      },
      {
        name: 'Variable declaration without type annotation',
        source: 'const foo = new Map<string, string>();',
        expected: 'const foo = new Map<string, string>();',
      },
      {
        name: 'Type assertion with as',
        source: 'const foo = new Map() as Map<string, string>;',
        expected: 'const foo = new Map() as ReadonlyMap<string, string>;',
      },
      {
        name: 'Satisfies operator',
        source: 'const foo = new Map() satisfies Map<string, string>;',
        expected:
          'const foo = new Map() satisfies ReadonlyMap<string, string>;',
      },
      {
        name: 'In function args',
        source:
          'function foo(a: Map<string, number>, b: Promise<Map<string, number>>) {}',
        expected:
          'function foo(a: ReadonlyMap<string, number>, b: Promise<ReadonlyMap<string, number>>) {}',
      },
    ])('$name', testFn);
  });

  describe('Interfaces', () => {
    test.each([
      {
        name: 'Mutable & readonly properties',
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
        name: 'Interface with various readonly members',
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
        name: 'Interface with nested readonly members',
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
        name: 'Interface with nested non-readonly members',
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
        name: 'Interface with call signatures and method signatures',
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
        name: 'Interface extends clause',
        source: 'interface Foo extends Box<[X[]]> {}',
        expected: 'interface Foo extends Box<readonly [readonly X[]]> {}',
      },
      {
        name: 'Interface multiple extends',
        source: codeFromStringLines(
          'interface A { a: string[]; }',
          'interface B { b: number[]; }',
          'interface C extends A, B { c: boolean[]; }',
        ),
        expected: codeFromStringLines(
          'interface A { readonly a: readonly string[]; }',
          'interface B { readonly b: readonly number[]; }',
          'interface C extends A, B { readonly c: readonly boolean[]; }',
        ),
      },
      {
        name: 'Interface with call/construct signatures',
        source: codeFromStringLines(
          'interface CallableConstructable {',
          '  (arg: number[]): string[];',
          '  new (arg: Map<string, number>): Set<boolean[]>;',
          '  prop: string[];',
          '}',
        ),
        expected: codeFromStringLines(
          'interface CallableConstructable {',
          '  (arg: readonly number[]): readonly string[];',
          '  new (arg: ReadonlyMap<string, number>): ReadonlySet<readonly boolean[]>;',
          '  readonly prop: readonly string[];',
          '}',
        ),
      },
    ])('$name', testFn);
  });

  describe('Index signatures', () => {
    test.each([
      {
        name: 'Index signature with array value',
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
        name: 'Index signature with readonly key modifier',
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
        name: 'Index signature with readonly key and mutable object value',
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
        name: 'Index signature in type alias',
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
        name: 'Index signature in class',
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
        name: 'Class with property and index signature',
        source: codeFromStringLines(
          'class Klass {',
          '  x: number[] = [];',
          '  [key: string]: string[] | number[]',
          '}',
        ),
        expected: codeFromStringLines(
          'class Klass {',
          '  readonly x: readonly number[] = [];',
          '  readonly [key: string]: readonly string[] | readonly number[]',
          '}',
        ),
      },
      {
        name: 'Nested index signature in interface',
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
        name: 'Nested index signature in type alias',
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
        name: 'Variable declaration with index signature type',
        source: 'let foo: { readonly [key: string]: number };',
        expected: 'let foo: Readonly<{ [key: string]: number }>;',
      },
    ])('$name', testFn);
  });

  describe('Mapped types', () => {
    test.each([
      {
        name: 'Mapped type in type alias',
        source: 'type T = { [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'Mapped type in type alias (PlusToken)',
        source: 'type T = {+readonly [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'Mapped type in type alias (MinusToken)',
        source: 'type T = { -readonly [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'Mapped type in type alias (ReadonlyKeyword)',
        source: 'type T = {    readonly [key in string]: number[] }',
        expected: 'type T = Readonly<{ [key in string]: readonly number[] }>',
      },
      {
        name: 'Mapped type in function arguments with readonly',
        source:
          'const func = (x: { readonly [key in string]: number[] }) => {}',
        expected:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
      },
      {
        name: 'Mapped type in function arguments without readonly',
        source: 'const func = (x: { [key in string]: number[] }) => {}',
        expected:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
      },
      {
        name: 'Mapped type in function arguments with Readonly<*>',
        source:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
        expected:
          'const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}',
      },
    ])('$name', testFn);
  });

  describe('Classes', () => {
    describe('Property declarations', () => {
      test.each([
        {
          name: 'Basic property types',
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
          name: 'Properties with various modifiers',
          source: codeFromStringLines(
            'class Klass {',
            '  foo: number;',
            '  private bar: number;',
            '  static baz: number;',
            '  protected static qux: number;',
            '}',
          ),
          expected: codeFromStringLines(
            'class Klass {',
            '  readonly foo: number;',
            '  private readonly bar: number;',
            '  static readonly baz: number;',
            '  protected static readonly qux: number;',
            '}',
          ),
        },
        {
          name: 'Static property',
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
        {
          name: 'Class private identifier field',
          source: codeFromStringLines(
            'class HashField {',
            '  #data: string[] = [];',
            '  getData() { return this.#data; }',
            '}',
          ),
          expected: codeFromStringLines(
            'class HashField {',
            '  readonly #data: readonly string[] = [];',
            '  getData() { return this.#data; }',
            '}',
          ),
        },
      ])('$name', testFn);
    });

    describe('Methods', () => {
      test.each([
        {
          name: 'Mutable arrays in class method body',
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
          name: 'Mutable arrays in class method parameters',
          source: codeFromStringLines(
            'class Foo {',
            '  a(s: string[], p: { x: number }) {}',
            '}',
          ),
          expected: codeFromStringLines(
            'class Foo {',
            '  a(s: readonly string[], p: Readonly<{ x: number }>) {}',
            '}',
          ),
        },
        {
          name: 'Getter and Setter types',
          source: codeFromStringLines(
            'class Foo {',
            '  get a(): number[] { return []; }',
            '  set a(s: string[], p: { x: number }) {}',
            '}',
          ),
          expected: codeFromStringLines(
            'class Foo {',
            '  get a(): readonly number[] { return []; }',
            '  set a(s: readonly string[], p: Readonly<{ x: number }>) {}',
            '}',
          ),
        },
        {
          name: 'Class static method return/params',
          source: codeFromStringLines(
            'class Util {',
            '  static process(data: Map<string, number[]>): Set<string>[] { return []; }',
            '}',
          ),
          expected: codeFromStringLines(
            'class Util {',
            '  static process(data: ReadonlyMap<string, readonly number[]>): readonly ReadonlySet<string>[] { return []; }',
            '}',
          ),
        },
      ])('$name', testFn);
    });

    describe('Parameter properties', () => {
      test.each([
        {
          name: 'Non-readonly class parameter properties',
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
          name: 'Already readonly class parameter properties',
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
          name: 'Object or array parameter properties',
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
      ])('$name', testFn);
    });
  });

  describe('Functions', () => {
    describe('Spread syntax (Rest parameters)', () => {
      test.each([
        {
          name: 'Rest parameter with explicit ReadonlyArray type',
          source: 'function foo(...a: ReadonlyArray<number>) {}',
          expected: 'function foo(...a: number[]) {}',
        },
        {
          name: 'Rest parameter with explicit readonly array type',
          source: 'const foo = (...a: readonly number[]) => {}',
          expected: 'const foo = (...a: number[]) => {}',
        },
        {
          name: 'Unnecessary readonly operator',
          source: 'const foo = (...a: readonly unknown[]) => {}',
          expected: 'const foo = (...a: unknown[]) => {}',
        },
        {
          name: 'Unnecessary readonly operator',
          source: 'const foo = (...a: unknown[]) => {}',
          expected: 'const foo = (...a: unknown[]) => {}',
        },
        {
          name: 'Unnecessary readonly operator',
          source: 'const foo = (...a: Readonly<unknown[]>) => {}',
          expected: 'const foo = (...a: unknown[]) => {}',
        },
      ])('$name', testFn);
    });

    describe('Return types', () => {
      test.each([
        {
          name: 'Mutable return types (function declaration)',
          source: codeFromStringLines(
            'declare function f1(...numbers: ReadonlyArray<number>): Array<number>',
            'declare function f2(...numbers: readonly number[]): number[]',
            'declare function f3(...numbers: ReadonlyArray<number>): Promise<Array<number>>',
            'declare function f4(...numbers: ReadonlyArray<number>): Promise<number[]>',
            'declare function f5(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>>',
            'declare function f6(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>>',
          ),
          expected: codeFromStringLines(
            'declare function f1(...numbers: number[]): readonly number[]',
            'declare function f2(...numbers: number[]): readonly number[]',
            'declare function f3(...numbers: number[]): Promise<readonly number[]>',
            'declare function f4(...numbers: number[]): Promise<readonly number[]>',
            'declare function f5(...numbers: number[]): Promise<Foo<readonly number[]>>',
            'declare function f6(...numbers: number[]): Promise<Foo<readonly number[]>>',
          ),
        },
        {
          name: 'Mutable return types (function expression)',
          source: codeFromStringLines(
            'const foo = (...numbers: ReadonlyArray<number>): Array<number> => {}',
            'const bar = (...numbers: readonly number[]): number[] => {}',
          ),
          expected: codeFromStringLines(
            'const foo = (...numbers: number[]): readonly number[] => {}',
            'const bar = (...numbers: number[]): readonly number[] => {}',
          ),
        },
        {
          name: 'Mutable return types (class method)',
          source: codeFromStringLines(
            'class Foo {',
            '  foo(...numbers: ReadonlyArray<number>): Array<number> {}',
            '}',
            'class Bar {',
            '  foo(...numbers: readonly number[]): number[] {}',
            '}',
          ),
          expected: codeFromStringLines(
            'class Foo {',
            '  foo(...numbers: number[]): readonly number[] {}',
            '}',
            'class Bar {',
            '  foo(...numbers: number[]): readonly number[] {}',
            '}',
          ),
        },
        {
          name: 'Mutable return types (intersection)',
          source:
            'declare function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } & { readonly b: string[] }',
          expected:
            'declare function foo(...numbers: number[]): Readonly<{ a: readonly number[] } & { b: readonly string[] }>',
        },
        {
          name: 'Mutable return types (union)',
          source:
            'declare function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } | { readonly b: string[] }',
          expected:
            'declare function foo(...numbers: number[]): Readonly<{ a: readonly number[] } | { b: readonly string[] }>',
        },
        {
          name: 'Mutable return types (wrapped in another type)',
          source: codeFromStringLines(
            'type Foo<T> = { readonly x: T; };',
            'declare function func1(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>>',
            'declare function func2(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>>',
          ),
          expected: codeFromStringLines(
            'type Foo<T> = Readonly<{ x: T; }>;',
            'declare function func1(...numbers: number[]): Promise<Foo<readonly number[]>>',
            'declare function func2(...numbers: number[]): Promise<Foo<readonly number[]>>',
          ),
        },
        {
          name: 'Mutable return types (conditional)',
          source:
            'declare function foo<T>(x: T): T extends Array<number> ? string : number[]',
          expected:
            'declare function foo<T>(x: T): T extends readonly number[] ? string : readonly number[]',
        },
        {
          name: 'Mutable return type with type assertion',
          source: codeFromStringLines(
            'function foo(bar: string): { baz: number } {',
            '  return {} as { baz: number };',
            '}',
          ),
          expected: codeFromStringLines(
            'function foo(bar: string): Readonly<{ baz: number }> {',
            '  return {} as Readonly<{ baz: number }>;',
            '}',
          ),
        },
        {
          name: 'Already readonly return type (generic)',
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
          name: 'Already readonly return type (non-generic)',
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
          name: 'Implicit readonly return type in function (as const)',
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
          name: 'Implicit readonly return type in arrow function (as const)',
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
      ])('$name', testFn);
    });

    describe('Local variables', () => {
      test.each([
        {
          name: 'Mutable local variables',
          source: codeFromStringLines(
            'function foo() {',
            '  let foo: {',
            '    a: number,',
            '    b: ReadonlyArray<string>,',
            '    c: () => string,',
            '    d: { [key: string]: string[] },',
            '    e: { [key: string]: string[] },',
            '    readonly f: {',
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
            '    e: Readonly<{ [key: string]: readonly string[] }>,',
            '    f: Readonly<{',
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
      ])('$name', testFn);
    });

    describe('Generics', () => {
      test.each([
        {
          name: 'Generic constraint',
          source:
            'function process<T extends { data: string[] }>(input: T): T { return input; }',
          expected:
            'function process<T extends Readonly<{ data: readonly string[] }>>(input: T): T { return input; }',
        },
        {
          name: 'Generic default type',
          source:
            'type Container<T = Map<string, number[]>> = { item: T }; type E = Container;',
          expected:
            'type Container<T = ReadonlyMap<string, readonly number[]>> = Readonly<{ item: T }>; type E = Container;',
        },
        {
          name: 'Generic function using type parameter in array',
          source: 'function wrapArray<T>(input: T): T[] { return [input]; }',
          expected:
            'function wrapArray<T>(input: T): readonly T[] { return [input]; }',
        },
        {
          name: 'Generic function using type parameter in map/set',
          source:
            'function wrapMap<T>(input: T): Map<string, T[]> { return new Map([["key", [input]]]); }',
          expected:
            'function wrapMap<T>(input: T): ReadonlyMap<string, readonly T[]> { return new Map([["key", [input]]]); }',
        },
        {
          name: 'Generic constraint with conditional type',
          source:
            'type Constrained<T extends string[] | number[]> = T extends string[] ? { s: T } : { n: T }; type G = Constrained<boolean[][]>;',
          expected:
            'type Constrained<T extends readonly string[] | readonly number[]> = T extends readonly string[] ? Readonly<{ s: T }> : Readonly<{ n: T }>; type G = Constrained<readonly (readonly boolean[])[]>;',
        },
      ])('$name', testFn);
    });
  });

  describe('Type predicate', () => {
    test.each([
      {
        name: 'Type predicate for array length',
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
    ])('$name', testFn);
  });

  describe('Type parameter', () => {
    test.each([
      {
        name: 'Mapped type in complex generic function',
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
    ])('$name', testFn);
  });

  describe('Normalize `Readonly` wrappers', () => {
    test.each([
      {
        name: 'Array type wrapped with `Readonly`',
        source: 'type T = Readonly<1[]>;',
        expected: 'type T = readonly 1[];',
      },
      {
        name: 'Readonly array type wrapped with `Readonly`',
        source: 'type T = Readonly<readonly 2[]>;',
        expected: 'type T = readonly 2[];',
      },
      {
        name: 'Readonly tuple type wrapped with `Readonly`',
        source: 'type T = Readonly<readonly [1, 2, 3]>;',
        expected: 'type T = readonly [1, 2, 3];',
      },
      {
        name: 'Nested Readonly wrapper',
        source: 'type T = Readonly<Readonly<{ x: 3 }>>;',
        expected: 'type T = Readonly<{ x: 3 }>;',
      },
      {
        name: 'Deeply nested Readonly wrapper',
        source: 'type T = Readonly<((Readonly<Readonly<(({ x: 4 })[])>>))>;',
        expected: 'type T = readonly Readonly<{ x: 4 }>[];',
      },
      {
        name: 'Intersection within readonly array',
        source:
          'type T = readonly (Readonly<{ x: 1 }> & Readonly<{ y: 2 }>)[];',
        expected: 'type T = readonly Readonly<{ x: 1 } & { y: 2 }>[];',
      },
      {
        name: 'Union within readonly array',
        source:
          'type T = readonly (Readonly<{ x: 1 }> | Readonly<{ y: 2 }>)[];',
        expected: 'type T = readonly Readonly<{ x: 1 } | { y: 2 }>[];',
      },
    ])('$name', testFn);
  });

  describe('Readonly wrapper edge cases', () => {
    test.each([
      {
        name: 'Readonly wrapper on Promise<T[]>',
        source: codeFromStringLines(
          'type Test1 = Readonly<Promise<string[]>>; ',
          'type Test2 = Readonly<Promise<readonly number[]>>',
        ),
        expected: codeFromStringLines(
          'type Test1 = Readonly<Promise<readonly string[]>>; ',
          'type Test2 = Readonly<Promise<readonly number[]>>',
        ),
      },
      {
        name: 'Readonly wrapper on CustomGeneric<T[]>',
        source: codeFromStringLines(
          'type Wrapper<T> = { data: T };',
          'type Test3 = Readonly<Wrapper<Map<string, number[]>>>;',
        ),
        expected: codeFromStringLines(
          'type Wrapper<T> = Readonly<{ data: T }>;',
          'type Test3 = Readonly<Wrapper<ReadonlyMap<string, readonly number[]>>>;',
        ),
      },
      {
        name: 'Nested Readonly simplification with Promise',
        source: 'type Test4 = Readonly<Readonly<Promise<string[]>>>;',
        expected: 'type Test4 = Readonly<Promise<readonly string[]>>;',
      },
    ])('$name', testFn);
  });

  describe('TypeOperators', () => {
    test.each([
      {
        name: 'Keyof type operator',
        source: codeFromStringLines(
          'type Foo = keyof { a: number[]; b: string[] };',
        ),
        expected: codeFromStringLines(
          'type Foo = keyof Readonly<{ a: readonly number[]; b: readonly string[] }>;',
        ),
      },
      {
        name: 'Readonly type operator on nested array',
        source: codeFromStringLines('type Foo = readonly number[][]'),
        expected: codeFromStringLines(
          'type Foo = readonly (readonly number[])[]',
        ),
      },
    ])('$name', testFn);
  });

  describe('Primitive and keyword types', () => {
    test.each([
      {
        name: 'Basic primitive types',
        source:
          'type Primitives = { a: string; b: number; c: boolean; d: bigint; e: symbol; };',
        expected:
          'type Primitives = Readonly<{ a: string; b: number; c: boolean; d: bigint; e: symbol; }>;',
      },
      {
        name: 'Null, undefined, void',
        source: 'type Special = { a: null; b: undefined; c: void };',
        expected:
          'type Special = Readonly<{ a: null; b: undefined; c: void }>;',
      },
      {
        name: 'Any, unknown, never',
        source: 'type AnyNever = { a: any; b: unknown; c: never };',
        expected: 'type AnyNever = Readonly<{ a: any; b: unknown; c: never }>;',
      },
      {
        name: 'Object keyword',
        source: 'type Obj = { a: object };',
        expected: 'type Obj = Readonly<{ a: object }>;',
      },
      {
        name: 'This type in class context',
        source: codeFromStringLines(
          'class MyClass {',
          '  value: number[];',
          '  compare(other: this): boolean { return this.value.length === other.value.length; }',
          '}',
        ),
        expected: codeFromStringLines(
          'class MyClass {',
          '  readonly value: readonly number[];',
          '  compare(other: this): boolean { return this.value.length === other.value.length; }',
          '}',
        ),
      },
    ])('$name', testFn);
  });

  describe('Union and intersection types', () => {
    test.each([
      {
        name: 'Union of arrays',
        source: 'type UnionArr = string[] | number[];',
        expected: 'type UnionArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Union of objects',
        source: 'type UnionObj = { a: string[] } | { b: number[] };',
        expected:
          'type UnionObj = Readonly<{ a: readonly string[] } | { b: readonly number[] }>;',
      },
      {
        name: 'Union including non-object/array',
        source: 'type UnionMixed = { a: string[] } | number[];',
        expected:
          'type UnionMixed = Readonly<{ a: readonly string[] }> | readonly number[];',
      },
      {
        name: 'Union where only some become Readonly<*>',
        source: 'type UnionPartialReadonly = Readonly<string[]> | number[];',
        expected:
          'type UnionPartialReadonly = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection of arrays (less common)',
        source: 'type IntersectArr = string[] & number[];',
        expected: 'type IntersectArr = readonly string[] & readonly number[];',
      },
      {
        name: 'Intersection of objects',
        source: 'type IntersectObj = { a: string[] } & { b: number[] };',
        expected:
          'type IntersectObj = Readonly<{ a: readonly string[] } & { b: readonly number[] }>;',
      },
      {
        name: 'Intersection including non-object/array',
        source: 'type IntersectMixed = { a: string[] } & string[];',
        expected:
          'type IntersectMixed = Readonly<{ a: readonly string[] }> & readonly string[];',
      },
      {
        name: 'Intersection where only some become Readonly<*>',
        source:
          'type IntersectPartialReadonly = Readonly<{ a: 1 }> & { b: number[] };',
        expected:
          'type IntersectPartialReadonly = Readonly<{ a: 1 } & { b: readonly number[] }>;',
      },
      {
        name: 'Nested union/intersection',
        source:
          'type Nested = (string[] | { x: Map<string, number[]> }) & { y: Set<boolean[]> };',
        expected:
          'type Nested = (readonly string[] | Readonly<{ x: ReadonlyMap<string, readonly number[]> }>) & Readonly<{ y: ReadonlySet<readonly boolean[]> }>;',
      },
      {
        name: 'Union collapse with Array types',
        source: 'type UArr = Readonly<string[]> | Readonly<number[]>;',
        expected: 'type UArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection collapse with Array types',
        source: 'type IArr = Readonly<string[]> & Readonly<number[]>;',
        expected: 'type IArr = readonly string[] & readonly number[];',
      },
      {
        name: 'Union of readonly arrays in Readonly',
        source: 'type UArr = Readonly<readonly string[] | readonly number[]>;',
        expected: 'type UArr = readonly string[] | readonly number[];',
      },
      {
        name: 'Intersection of readonly arrays in Readonly',
        source: 'type UArr = Readonly<readonly string[] & readonly number[]>;',
        expected: 'type UArr = readonly string[] & readonly number[];',
      },
    ])('$name', testFn);
  });

  describe('Function and constructor types', () => {
    test.each([
      {
        name: 'Function type alias',
        source: 'type MyFunc = (arg: number[]) => string[];',
        expected:
          'type MyFunc = (arg: readonly number[]) => readonly string[];',
      },
      {
        name: 'Function type variable',
        source: 'let fn: (map: Map<string, number>) => Set<string[]>;',
        expected:
          'let fn: (map: ReadonlyMap<string, number>) => ReadonlySet<readonly string[]>;',
      },
      {
        name: 'Constructor type alias',
        source:
          'type MyConstructor = new (arg: string[]) => { prop: number[] };',
        expected:
          'type MyConstructor = new (arg: readonly string[]) => Readonly<{ prop: readonly number[] }>;',
      },
    ])('$name', testFn);
  });

  describe('Advanced types', () => {
    test.each([
      {
        name: 'Typeof on array variable',
        source: codeFromStringLines(
          'const arr = [1, 2];',
          'type ArrType = typeof arr;',
        ),
        expected: codeFromStringLines(
          'const arr = [1, 2];',
          'type ArrType = typeof arr;',
        ),
      },
      {
        name: 'Typeof on object variable',
        source: codeFromStringLines(
          'const obj = { data: [1] };',
          'type ObjType = typeof obj;',
        ),
        expected: codeFromStringLines(
          'const obj = { data: [1] };',
          'type ObjType = typeof obj;',
        ),
      },
      {
        name: 'Indexed access type',
        source: codeFromStringLines(
          'type PropType<T, K extends keyof T> = T[K];',
          'type A = PropType<{ p: number[] }, "p">;',
        ),
        expected: codeFromStringLines(
          'type PropType<T, K extends keyof T> = T[K];',
          'type A = PropType<Readonly<{ p: readonly number[] }>, "p">;',
        ),
      },
      {
        name: 'Indexed access type with array/tuple',
        source:
          'type ElementType<T extends any[]> = T[number]; type B = ElementType<string[][]>;',
        expected:
          'type ElementType<T extends readonly any[]> = T[number]; type B = ElementType<readonly (readonly string[])[]>;',
      },
      {
        name: 'Indexed access type deeper',
        source:
          'type DeepAccess = { a: { b: { c: number[] } } }["a"]["b"]["c"];',
        expected:
          'type DeepAccess = Readonly<{ a: Readonly<{ b: Readonly<{ c: readonly number[] }> }> }>["a"]["b"]["c"];',
      },
      {
        name: 'Conditional type',
        source:
          'type Check<T> = T extends string[] ? { value: T } : { error: Error }; type C = Check<number[][]>;',
        expected:
          'type Check<T> = T extends readonly string[] ? Readonly<{ value: T }> : Readonly<{ error: Error }>; type C = Check<readonly (readonly number[])[]>;',
      },
      {
        name: 'Conditional type with complex branches',
        source:
          'type ComplexCondition<T> = T extends Map<string, number[]> ? Set<T>[] : Array<Map<string, T>>;',
        expected:
          'type ComplexCondition<T> = T extends ReadonlyMap<string, readonly number[]> ? readonly ReadonlySet<T>[] : readonly ReadonlyMap<string, T>[];',
      },
      {
        name: 'Conditional type with infer',
        source:
          'type InferArrayItem<T> = T extends (infer I)[] ? { item: I[] } : never; type D = InferArrayItem<Date[]>;',
        expected:
          'type InferArrayItem<T> = T extends readonly (infer I)[] ? Readonly<{ item: readonly I[] }> : never; type D = InferArrayItem<readonly Date[]>;',
      },
      {
        name: 'Conditional type with infer in return position',
        source: 'type UnwrapArray<T> = T extends Array<infer U> ? U[] : T;',
        expected:
          'type UnwrapArray<T> = T extends readonly (infer U)[] ? readonly U[] : T;',
      },
      {
        name: 'Conditional type with infer used in object',
        source:
          'type InferToObject<T> = T extends Set<infer I> ? { item: I[] } : never;',
        expected:
          'type InferToObject<T> = T extends ReadonlySet<infer I> ? Readonly<{ item: readonly I[] }> : never;',
      },
    ])('$name', testFn);
  });

  describe('Parenthesized types', () => {
    test.each([
      {
        name: 'Parenthesized readonly array',
        source: 'type ParenReadonlyArr = (readonly string[]);',
        expected: 'type ParenReadonlyArr = readonly string[];',
      },
      {
        name: 'Parenthesized readonly tuple',
        source: 'type ParenReadonlyTup = (readonly [string, number]);',
        expected: 'type ParenReadonlyTup = readonly [string, number];',
      },
      {
        name: 'Parenthesized type literal',
        source: 'type ParenObj = ({ a: number[] });',
        expected: 'type ParenObj = Readonly<{ a: readonly number[] }>;',
      },
      {
        name: 'Parenthesized type with union/intersection',
        source: 'type Paren = ({ a: string[] } | { b: number[] })[];',
        expected:
          'type Paren = readonly Readonly<{ a: readonly string[] } | { b: readonly number[] }>[]',
      },
    ])('$name', testFn);
  });

  describe('Other syntax elements', () => {
    test.each([
      {
        name: 'Type assertion <T>',
        source: 'let x = <Map<string, number[]>>{};',
        expected: 'let x = <ReadonlyMap<string, readonly number[]>>{};',
      },
      {
        name: 'Recursive type alias (linked list)',
        source: codeFromStringLines(
          'type List<T> = { value: T, next: List<T> | null };',
          'let list: List<number[]>;',
        ),
        expected: codeFromStringLines(
          'type List<T> = Readonly<{ value: T, next: List<T> | null }>;',
          'let list: List<readonly number[]>;',
        ),
      },
      {
        name: 'Recursive type alias (tree)',
        source:
          'type Tree<T> = { value: T; children: Tree<T>[] }; let tree: Tree<{ id: number[] }>;',
        expected:
          'type Tree<T> = Readonly<{ value: T; children: readonly Tree<T>[] }>; let tree: Tree<Readonly<{ id: readonly number[] }>>;',
      },
      {
        name: 'Code with comments near types',
        source: codeFromStringLines(
          '// Single line comment',
          'type /* Block Comment */ WithComments = {',
          '  prop1: string[]; // Trailing comment',
          '  /* Another block */',
          '  prop2: number[];',
          '};',
        ),
        expected: codeFromStringLines(
          '// Single line comment',
          'type /* Block Comment */ WithComments = Readonly<{',
          '  prop1: readonly string[]; // Trailing comment',
          '  /* Another block */',
          '  prop2: readonly number[];',
          '}>;',
        ),
      },
      {
        name: 'Class implements clause',
        source: codeFromStringLines(
          'interface IBox<T> { value: T[]; }',
          'class BoxImpl implements IBox<string[]> {',
          '  value: string[];',
          '  constructor() { this.value = []; }',
          '}',
        ),
        expected: codeFromStringLines(
          'interface IBox<T> { readonly value: readonly T[]; }',
          'class BoxImpl implements IBox<readonly string[]> {',
          '  readonly value: readonly string[];',
          '  constructor() { this.value = []; }',
          '}',
        ),
      },
      {
        name: 'Class extends with generics',
        source: codeFromStringLines(
          'class Base<T> { item: T[] }',
          'class Derived extends Base<string[]> {}',
        ),
        expected: codeFromStringLines(
          'class Base<T> { readonly item: readonly T[] }',
          'class Derived extends Base<readonly string[]> {}',
        ),
      },
      {
        name: 'Function type variable',
        source: 'let foo: () => number;',
        expected: 'let foo: () => number;',
      },
      {
        name: 'Destructuring assignment with tuple type',
        source: 'const [x, y]: [number[], number[]] = [[1, 2, 3], [4, 5, 6]];',
        expected:
          'const [x, y]: readonly [readonly number[], readonly number[]] = [[1, 2, 3], [4, 5, 6]];',
      },
      {
        name: 'Namespace containing type alias',
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
        name: 'Module containing type alias',
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
      // { // This test case seems more about linting/ignoring based on name, not transformation
      //   name: 'ignore mutable identifiers',
      //   source: 'let mut_Foo: string[] = [];',
      //   expected: 'let mut_Foo: string[] = [];',
      // },
    ])('$name', testFn);
  });

  // describe('test', () => {
  //   test.each([])('$name', testFn);
  // });
});

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
    convertToReadonlyType,
    source,
    expected,
    debug ?? false,
  );

  expect(result).toBe(expectedFormatted);
};
