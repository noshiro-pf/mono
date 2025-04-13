/* eslint-disable vitest/expect-expect */
import * as prettier from 'prettier';
import { dedent } from '../utils/index.mjs';
import {
  convertToReadonlyTypeTransformer,
  type ReadonlyTransformerOptions,
} from './convert-to-readonly-type.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const testFn = async ({
  source,
  expected,
  debug,
  options,
  isTsx = false,
}: Readonly<{
  source: string;
  expected: string;
  debug?: boolean;
  options?: ReadonlyTransformerOptions;
  isTsx?: boolean;
}>): Promise<void> => {
  if (debug !== true) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'trace').mockImplementation(() => {});
  }

  const transformedCodeRaw = await formatter(
    transformSourceCode(source, isTsx, [
      convertToReadonlyTypeTransformer(options),
    ]),
  );

  const expectedFormatted = await formatter(expected);

  expect(transformedCodeRaw).toBe(expectedFormatted);
};

/**
 * Normalizes whitespace in a code string, primarily for comparing AST structure outputs.
 * - Preserves newlines immediately following line comments (`//`).
 * - Collapses other sequences of whitespace (including newlines) into a single space.
 * - WARNING: Does NOT handle Automatic Semicolon Insertion (ASI) correctly.
 *            Code relying on ASI may break if this function is used for general transformation.
 * - WARNING: Does NOT preserve formatting within block comments or template literals.
 *
 * @param code The input TypeScript code string.
 * @returns The code string with normalized whitespace.
 */
const normalizeWhitespaceForComparison = (code: string): string => {
  // Use a placeholder unlikely to appear in the code
  const placeholder = '___LINE_COMMENT_NEWLINE_PLACEHOLDER___';

  // 1. Protect newlines immediately following line comments
  const protectedCode = code.replaceAll(/(\/\/.*?)\r?\n/gu, `$1${placeholder}`);

  // 2. Collapse multiple whitespace characters (including unprotected newlines) into a single space
  const collapsedCode = protectedCode.replaceAll(/\s+/gu, ' ');

  // 3. Restore the newlines after line comments
  const finalCode = collapsedCode.replaceAll(placeholder, '\n');

  // 4. Trim leading/trailing whitespace
  return finalCode.trim();
};

const formatter = async (code: string): Promise<string> => {
  const formatOnce = await prettier.format(code, {
    parser: 'typescript',
  });

  const whitespaceNormalized = normalizeWhitespaceForComparison(formatOnce);

  return prettier.format(whitespaceNormalized, {
    parser: 'typescript',
  });
};

describe('convertToReadonlyTypeTransformer', () => {
  describe('TypeReferences', () => {
    describe('Sets', () => {
      test.each([
        {
          name: 'Type alias',
          source: dedent`
            type Foo = Set<string>
          `,
          expected: dedent`
            type Foo = ReadonlySet<string>
          `,
        },
        {
          name: 'Variable declaration with type annotation',
          source: dedent`
            const foo: Set<string> = new Set()
          `,
          expected: dedent`
            const foo: ReadonlySet<string> = new Set()
          `,
        },
        {
          name: 'Variable declaration without type annotation',
          source: dedent`
            const foo = new Set<string>()
          `,
          expected: dedent`
            const foo = new Set<string>()
          `,
        },
        {
          name: 'Type assertion with as',
          source: dedent`
            const foo = new Set() as Set<string>
          `,
          expected: dedent`
            const foo = new Set() as ReadonlySet<string>
          `,
        },
        {
          name: 'Satisfies operator',
          source: dedent`
            const foo = new Set() satisfies Set<string>
          `,
          expected: dedent`
            const foo = new Set() satisfies ReadonlySet<string>
          `,
        },
        {
          name: 'In function args',
          source: dedent`
            function foo(a: Set<number>, b: Promise<Set<number>>) {}
          `,
          expected: dedent`
            function foo(a: ReadonlySet<number>, b: Promise<ReadonlySet<number>>) {}
          `,
        },
      ])('$name', testFn);
    });

    describe('Maps', () => {
      test.each([
        {
          name: 'Type alias',
          source: dedent`
            type Foo = Map<string, string>
          `,
          expected: dedent`
            type Foo = ReadonlyMap<string, string>
          `,
        },
        {
          name: 'Variable declaration with type annotation',
          source: dedent`
            const foo: Map<string, string> = new Map()
          `,
          expected: dedent`
            const foo: ReadonlyMap<string, string> = new Map()
          `,
        },
        {
          name: 'Variable declaration without type annotation',
          source: dedent`
            const foo = new Map<string, string>()
          `,
          expected: dedent`
            const foo = new Map<string, string>()
          `,
        },
        {
          name: 'Type assertion with as',
          source: dedent`
            const foo = new Map() as Map<string, string>
          `,
          expected: dedent`
            const foo = new Map() as ReadonlyMap<string, string>
          `,
        },
        {
          name: 'Satisfies operator',
          source: dedent`
            const foo = new Map() satisfies Map<string, string>
          `,
          expected: dedent`
            const foo = new Map() satisfies ReadonlyMap<string, string>;
          `,
        },
        {
          name: 'In function args',
          source: dedent`
            function foo(a: Map<string, number>, b: Promise<Map<string, number>>) {}
          `,
          expected: dedent`
            function foo(a: ReadonlyMap<string, number>, b: Promise<ReadonlyMap<string, number>>) {}
          `,
        },
      ])('$name', testFn);
    });

    describe('Normalize `Readonly` wrappers', () => {
      test.each([
        {
          name: 'Array type wrapped with `Readonly`',
          source: dedent`
            type T = Readonly<1[]>
          `,
          expected: dedent`
            type T = readonly 1[];
          `, // Readonly<T[]> -> readonly T[]
        },
        {
          name: 'Readonly array type wrapped with `Readonly`',
          source: dedent`
            type T = Readonly<readonly 2[]>
          `,
          expected: dedent`
            type T = readonly 2[];
          `, // Readonly<readonly T[]> -> readonly T[]
        },
        {
          name: 'Tuple type wrapped with `Readonly`',
          source: dedent`
            type T = Readonly<[1, 2]>
          `,
          expected: dedent`
            type T = readonly [1, 2];
          `, // Readonly<[T]> -> readonly [T]
        },
        {
          name: 'Readonly tuple type wrapped with `Readonly`',
          source: dedent`
            type T = Readonly<readonly [1, 2, 3]>
          `,
          expected: dedent`
            type T = readonly [1, 2, 3];
          `, // Readonly<readonly [T]> -> readonly [T]
        },
        {
          name: 'Nested Readonly wrapper',
          source: dedent`
            type T = Readonly<Readonly<{ x: 3 }>>
          `,
          expected: dedent`
            type T = Readonly<{ x: 3 }>;
          `, // Readonly<Readonly<T>> -> Readonly<T>
        },
        {
          name: 'Deeply nested Readonly wrapper',
          source: dedent`
            type T = Readonly<Readonly<Readonly<{ x: 2 }>>>
          `,
          expected: dedent`
            type T = Readonly<{ x: 2 }>
          `,
        },
        {
          name: 'Deeply nested Readonly wrapper with array/parens',
          source: dedent`
            type T = Readonly<((Readonly<Readonly<(({ x: 4 })[])>>))>
          `,
          // Readonly<( (Readonly<Readonly<({ x: 4 }[])>>) )>
          // -> Readonly<Readonly<Readonly<({ x: 4 }[])>>>  (remove ParenthesizedTypeNode)
          // -> Readonly<Readonly<({ x: 4 }[])>>            (Readonly<Readonly<T>> -> Readonly<T>)
          // -> Readonly<({ x: 4 }[])>                      (Readonly<Readonly<T>> -> Readonly<T>)
          // -> readonly { x: 4 }[]                         (Readonly<T[]> -> readonly T[])
          expected: dedent`
            type T = readonly Readonly<{ x: 4 }>[]
          `,
        },
        {
          name: 'Intersection within readonly array',
          source: dedent`
            type T = readonly (Readonly<{ x: 1 }> & Readonly<{ y: 2 }>)[];
          `,
          // readonly (Readonly<A> & Readonly<B>)[]
          // -> readonly Readonly<A & B>[] (Inner Intersection Collapse)
          expected: dedent`
            type T = readonly Readonly<{ x: 1 } & { y: 2 }>[]
          `,
        },
        {
          name: 'Union within readonly array',
          source: dedent`
            type T = readonly (Readonly<{ x: 1 }> | Readonly<{ y: 2 }>)[];
          `,
          // readonly (Readonly<A> | Readonly<B>)[]
          // -> readonly Readonly<A | B>[] (Inner Union Collapse)
          expected: dedent`
            type T = readonly Readonly<{ x: 1 } | { y: 2 }>[]
          `,
        },
      ])('$name', testFn);
    });

    describe('Readonly wrapper edge cases', () => {
      test.each([
        {
          name: 'Readonly wrapper on Promise<T[]>',
          source: dedent`
            type Test1 = Readonly<Promise<string[]>>;
            type Test2 = Readonly<Promise<readonly number[]>>
          `,
          expected: dedent`
            type Test1 = Readonly<Promise<readonly string[]>>;
            type Test2 = Readonly<Promise<readonly number[]>>
          `,
        },
        {
          name: 'Readonly wrapper on CustomGeneric<T[]>',
          source: dedent`
            type Wrapper<T> = { data: T };
            type Test3 = Readonly<Wrapper<Map<string, number[]>>>; // Map and Array are not targets
          `,
          expected: dedent`
            type Wrapper<T> = Readonly<{ data: T }>;
            type Test3 = Readonly<Wrapper<ReadonlyMap<string, readonly number[]>>>; // Map and Array are not targets
          `,
        },
        {
          name: 'Nested Readonly simplification with Promise',
          source: dedent`
            type Test4 = Readonly<Readonly<Promise<string[]>>>
          `,
          // Readonly<Readonly<T>> -> Readonly<T>
          expected: dedent`
            type Test4 = Readonly<Promise<readonly string[]>>
          `,
        },
      ])('$name', testFn);
    });

    describe('DeepReadonly', () => {
      test.each([
        {
          name: 'Basic DeepReadonly usage',
          source: dedent`
            type T = DeepReadonly<{ a: number; b: string[] }>
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number; b: string[] }>
          `,
        },
        {
          name: 'DeepReadonly with nested objects',
          source: dedent`
            type T = DeepReadonly<{ a: number; b: { c: string[]; d: number } }>;
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number; b: { c: string[]; d: number } }>;
          `,
        },
        {
          name: 'DeepReadonly with arrays',
          source: dedent`
            type T = DeepReadonly<string[]>
          `,
          expected: dedent`
            type T = readonly string[]
          `,
        },
        {
          name: 'DeepReadonly with nested arrays',
          source: dedent`
            type T = DeepReadonly<string[][]>
          `,
          expected: dedent`
            type T = DeepReadonly<string[][]>
          `,
        },
        {
          name: 'DeepReadonly with Map',
          source: dedent`
            type T = DeepReadonly<Map<string, number[]>>
          `,
          expected: dedent`
            type T = DeepReadonly<ReadonlyMap<string, number[]>>
          `,
        },
        {
          name: 'DeepReadonly with Set',
          source: dedent`
            type T = DeepReadonly<Set<string[]>>
          `,
          expected: dedent`
            type T = DeepReadonly<ReadonlySet<string[]>>
          `,
        },
        {
          name: 'DeepReadonly with redundant Readonly wrapper',
          source: dedent`
            type T = DeepReadonly<Readonly<{ a: number; b: string[] }>>
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number; b: string[] }>
          `,
        },
        {
          name: 'DeepReadonly with redundant readonly array',
          source: dedent`
            type T = DeepReadonly<readonly string[]>
          `,
          expected: dedent`
            type T = readonly string[]
          `,
        },
        {
          name: 'DeepReadonly with redundant readonly properties',
          source: dedent`
            type T = DeepReadonly<{ readonly a: number; readonly b: readonly string[] }>;
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number; b: string[] }>
          `,
        },
        {
          name: 'Nested DeepReadonly',
          source: dedent`
            type T = DeepReadonly<DeepReadonly<{ a: number; b: string[] }>>;
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number; b: string[] }>
          `,
        },
        {
          name: 'DeepReadonly with union types',
          source: dedent`
            type T = DeepReadonly<{ a: number } | { b: string[] }>
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number } | { b: string[] }>;
          `,
        },
        {
          name: 'DeepReadonly with intersection types',
          source: dedent`
            type T = DeepReadonly<{ a: number } & { b: string[] }>
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number } & { b: string[] }>;
          `,
        },
        {
          name: 'DeepReadonly with complex nested structure',
          source: dedent`
            type T = DeepReadonly<{ a: number; b: { c: string[]; d: Map<string, { e: number[] }> } }>;
          `,
          expected: dedent`
            type T = DeepReadonly<{ a: number; b: { c: string[]; d: ReadonlyMap<string, { e: number[] }> } }>;
          `,
        },
        {
          name: 'DeepReadonly in function parameter',
          source: dedent`
            function process<T>(data: DeepReadonly<{ items: T[] }>): T { return data.items[0]; }
          `,
          expected: dedent`
            function process<T>(data: DeepReadonly<{ items: T[] }>): T { return data.items[0]; }
          `,
        },
        {
          name: 'DeepReadonly in function return type',
          source: dedent`
            function getData(): DeepReadonly<{ config: string[]; data: number[] }> { return { config: [], data: [] }; }
          `,
          expected: dedent`
            function getData(): DeepReadonly<{ config: string[]; data: number[] }> { return { config: [], data: [] }; }
          `,
        },
      ])('$name', testFn);
    });
  });

  describe('Arrays', () => {
    test.each([
      {
        name: 'Mutable array types in type alias (non-generic)',
        source: dedent`
          type Foo = number[];
        `,
        expected: dedent`
          type Foo = readonly number[];
        `,
      },
      {
        name: 'Mutable array types in function args (non-generic)',
        source: dedent`
          function foo(a: number[], b: Promise<number[]>) {}
        `,
        expected: dedent`
          function foo(a: readonly number[], b: Promise<readonly number[]>) {}
        `,
      },
      {
        name: 'Mutable array types in function args (generic)',
        source: dedent`
          function foo(a: Array<number>, b: Promise<Array<number>>) {}
        `,
        expected: dedent`
          function foo(a: readonly number[], b: Promise<readonly number[]>) {}
        `,
      },
      {
        name: 'Mutable array types in interface',
        source: dedent`
          interface SimpleInterface {
            a: number[];
          }
        `,
        expected: dedent`
          interface SimpleInterface {
            readonly a: readonly number[];
          }
        `,
      },
      {
        name: 'Mutable nested array types (non-generic)',
        source: dedent`
          function foo(a: number[][], b: Promise<number[][]>) {}
        `,
        expected: dedent`
          function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}
        `,
      },
      {
        name: 'Mutable nested array types (generic)',
        source: dedent`
          function foo(a: Array<Array<number>>, b: Promise<Array<Array<number>>>) {}
        `,
        expected: dedent`
          function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}
        `,
      },
      {
        name: 'Mutable nested array types (generic & non-generic combined)',
        source: dedent`
          function foo(a: Array<number[]>, b: Promise<Array<number>[]>) {}
        `,
        expected: dedent`
          function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}
        `,
      },
      {
        name: 'Mutable nested array types (readonly & non-readonly combined)',
        source: dedent`
          function foo(a: readonly number[][], b: Promise<  (readonly number[])[]>) {}
        `,
        expected: dedent`
          function foo(a: readonly (readonly number[])[], b: Promise<readonly (readonly number[])[]>) {}
        `,
      },
      {
        name: 'Mutable arrays nested within objects',
        source: dedent`
          function foo(
              a: { p: number[] }[],
              b: Promise<number[][]>
          ) {}
        `,
        expected: dedent`
          function foo(
            a: readonly Readonly<{ p: readonly number[] }>[],
            b: Promise<readonly (readonly number[])[]>
          ) {}
        `,
      },
      {
        name: 'No type annotations',
        source: dedent`
          const foo = [1, 2, 3];
          function bar(param = [1, 2, 3]) {}
        `,
        expected: dedent`
          const foo = [1, 2, 3];
          function bar(param = [1, 2, 3]) {}
        `,
      },
      {
        name: 'Local types within function',
        source: dedent`
          function foo() {
            type Foo = ReadonlyArray<string>;
            type Bar = Array<string>;
          }
        `,
        expected: dedent`
          function foo() {
            type Foo = readonly string[];
            type Bar = readonly string[];
          }
        `,
      },
      {
        name: 'Mutable variable declarations (generic)',
        source: dedent`
          const foo: Array<string> = []
        `,
        expected: dedent`
          const foo: readonly string[] = []
        `,
      },
      {
        name: 'Mutable variable declarations (non-generic)',
        source: dedent`
          const foo: string[] = []
        `,
        expected: dedent`
          const foo: readonly string[] = []
        `,
      },
      {
        name: 'Readonly variable declarations (generic)',
        source: dedent`
          const foo: ReadonlyArray<string> = []
        `,
        expected: dedent`
          const foo: readonly string[] = []
        `,
      },
      {
        name: 'Readonly variable declarations (non-generic)',
        source: dedent`
          const foo: readonly string[] = []
        `,
        expected: dedent`
          const foo: readonly string[] = []
        `,
      },
      {
        name: 'No type annotation',
        source: dedent`
          const foo = []
        `,
        expected: dedent`
          const foo = []
        `,
      },
      {
        name: 'No type annotation with as const',
        source: dedent`
          const numbers = [1, 2, 3] as const
        `,
        expected: dedent`
          const numbers = [1, 2, 3] as const
        `,
      },
    ])('$name', testFn);
  });

  describe('Tuples', () => {
    test.each([
      {
        name: 'Mutable tuples in type alias',
        source: dedent`
          type Foo = [string, string]
        `,
        expected: dedent`
          type Foo = readonly [string, string]
        `,
      },
      {
        name: 'Variable declaration with type annotation',
        source: dedent`
          const foo: [string, string] = [foo, bar];
        `,
        expected: dedent`
          const foo: readonly [string, string] = [foo, bar];
        `,
      },
      {
        name: 'Variable declaration without type annotation',
        source: dedent`
          const foo = [foo, bar];
        `,
        expected: dedent`
          const foo = [foo, bar];
        `,
      },
      {
        name: 'Type assertion with as',
        source: dedent`
          const foo = [foo, bar] as [string, string];
        `,
        expected: dedent`
          const foo = [foo, bar] as readonly [string, string];
        `,
      },
      {
        name: 'Satisfies operator',
        source: dedent`
          const foo = [foo, bar] satisfies [string, string];
        `,
        expected: dedent`
          const foo = [foo, bar] satisfies readonly [string, string];
        `,
      },
      {
        name: 'Nested mutable tuple',
        source: dedent`
          const foo = (tuple: [number, string, [number[], { x: string }]]) => {
            console.log(tuple);
          }
        `,
        expected: dedent`
          const foo = (tuple: readonly [number, string, readonly [readonly number[], Readonly<{ x: string }>]]) => {
            console.log(tuple);
          }
        `,
      },
      {
        name: 'Already readonly tuple',
        source: dedent`
          const foo = (tuple: readonly [number, string, readonly [number, string]]) => {
            console.log(tuple);
          }
        `,
        expected: dedent`
          const foo = (tuple: readonly [number, string, readonly [number, string]]) => {
            console.log(tuple);
          }
        `,
      },
      {
        name: 'Tuple with optional element',
        source: dedent`
          type OptionalTuple = [string, number?]
        `,
        expected: dedent`
          type OptionalTuple = readonly [string, number?]
        `,
      },
    ])('$name', testFn);

    describe('Rest types', () => {
      test.each([
        {
          name: 'Tuple with rest element',
          source: dedent`
            type RestTuple = [string, ...number[]]
          `,
          expected: dedent`
            type RestTuple = readonly [string, ...number[]];
          `,
        },
        {
          name: 'Tuple with rest element nested',
          source: dedent`
            type RestTuple = [string, ...[boolean, ...number[]]];
          `,
          expected: dedent`
            type RestTuple = readonly [string, ...[boolean, ...number[]]];
          `,
        },
        {
          name: 'Tuple with rest element nested (already readonly)',
          source: dedent`
            type RestTuple = readonly [string, ...readonly [boolean, ...readonly number[]]];
          `,
          expected: dedent`
            type RestTuple = readonly [string, ...[boolean, ...number[]]];
          `,
        },
        {
          name: 'Tuple with optional and rest elements',
          source: dedent`
            type OptionalRestTuple = [string?, ...Map<string, number>[]];
          `,
          expected: dedent`
            type OptionalRestTuple = readonly [string?, ...ReadonlyMap<string, number>[]];
          `,
        },
      ])('$name', testFn);
    });

    describe('Named tuples', () => {
      test.each([
        {
          name: 'Named tuples',
          source: dedent`
            type T = [names: string[], values: number[]];
          `,
          expected: dedent`
            type T = readonly [names: readonly string[], values: readonly number[]];
          `,
        },
        {
          name: 'NamedTupleMember with "mut_" prefix',
          source: dedent`
            type T = [names: string[], mut_values: number[]];
          `,
          expected: dedent`
            type T = readonly [names: readonly string[], mut_values: number[]];
          `,
        },
      ])('$name', testFn);
    });
  });

  describe('TypeOperators', () => {
    test.each([
      {
        name: 'Keyof type operator',
        source: dedent`
          type Foo = keyof { a: number[]; b: string[] };
        `,
        expected: dedent`
          type Foo = keyof Readonly<{ a: readonly number[]; b: readonly string[] }>;
        `,
      },
      {
        name: 'Readonly type operator on nested array',
        source: dedent`
          type Foo = readonly number[][]
        `,
        expected: dedent`
          type Foo = readonly (readonly number[])[]
        `,
      },
    ])('$name', testFn);
  });

  describe('Type literals', () => {
    test.each([
      {
        name: 'Type literal with one readonly member (unchanged)',
        source: dedent`
          type T = { readonly a: number; b: string }
        `,
        expected: dedent`
          type T = Readonly<{ a: number; b: string }>
        `,
      },
      {
        name: 'Type literal with no readonly members',
        source: dedent`
          type T = { a: number; b: string }
        `,
        expected: dedent`
          type T = Readonly<{ a: number; b: string }>
        `,
      },
      {
        name: 'Type literal with all members readonly (normalized)',
        source: dedent`
          type T = { readonly a: number; readonly b: string }
        `,
        // All members readonly -> Normalized to Readonly<{...}> (inner readonly removed)
        expected: dedent`
          type T = Readonly<{ a: number; b: string }>
        `,
      },
      {
        name: 'Readonly type literal (canonical form, unchanged)',
        source: dedent`
          type T = Readonly<{ a: number; b: string }>
        `,
        expected: dedent`
          type T = Readonly<{ a: number; b: string }>;
        `, // Unchanged (already canonical form)
      },
      {
        name: 'In function args',
        source: dedent`
          function foo(a: { p: number[], readonly q: boolean[] }) {}
        `,
        expected: dedent`
          function foo(a: Readonly<{ p: readonly number[], q: readonly boolean[] }>) {}
        `,
      },
      {
        name: 'Nested, in function args',
        source: dedent`
          function foo(a: { readonly p: string[], q: bigint[] }[]) {}
        `,
        expected: dedent`
          function foo(a: readonly Readonly<{ p: readonly string[], q: readonly bigint[] }>[]) {}
        `,
      },
      {
        name: 'In type alias',
        source: dedent`
          type TypeAlias = {
            a: number[]
          };
        `,
        expected: dedent`
          type TypeAlias = Readonly<{
            a: readonly number[]
          }>;
        `,
      },
      {
        name: 'Type literals without readonly modifiers',
        source: dedent`
          let foo: {
            a: number,
            b: ReadonlyArray<string>,
            c: () => string,
            d: { readonly [key: string]: string[] },
            [key: string]: string[],
            readonly e: {
              a: number,
              b: ReadonlyArray<string>,
              c: () => string,
              d: { readonly [key: string]: string[] },
              [key: string]: string[],
            }
          };
        `,
        expected: dedent`
          let foo: Readonly<{
            a: number,
            b: readonly string[],
            c: () => string,
            d: Readonly<{ [key: string]: readonly string[] }>,
            [key: string]: readonly string[],
            e: Readonly<{
              a: number,
              b: readonly string[],
              c: () => string,
              d: Readonly<{ [key: string]: readonly string[] }>,
              [key: string]: readonly string[],
            }>
          }>;
        `,
      },
      {
        name: 'Type literal elements with a readonly modifier in an array',
        source: dedent`
          type foo = ReadonlyArray<{ readonly type: string, readonly code: string }>;
        `,
        expected: dedent`
          type foo = readonly Readonly<{ type: string, code: string }>[];
        `,
      },
      {
        name: 'Type literals with readonly on members',
        source: dedent`
          let foo: {
            readonly a: number,
            readonly b: ReadonlyArray<string>,
            readonly c: () => string,
            readonly d: { readonly [key: string]: string[] },
            readonly [key: string]: string[]
          };
        `,
        expected: dedent`
          let foo: Readonly<{
            a: number,
            b: readonly string[],
            c: () => string,
            d: Readonly<{ [key: string]: readonly string[] }>,
            [key: string]: readonly string[]
          }>;
        `,
      },
      {
        name: 'Empty type literal',
        source: dedent`
          type foo = {};
          type bar = Readonly<{}>;
        `,
        expected: dedent`
          type foo = {};
          type bar = Readonly<{}>;
        `,
      },
      {
        name: 'Empty type literal with ignoreEmptyObjectTypes = false',
        source: dedent`
          type foo = {};
          type bar = Readonly<{}>;
        `,
        expected: dedent`
          type foo = Readonly<{}>;
          type bar = Readonly<{}>;
        `,
        options: {
          ignoreEmptyObjectTypes: false,
        },
      },
    ])('$name', testFn);
  });

  describe('Index signatures', () => {
    test.each([
      {
        name: 'Index signature with array value',
        source: dedent`
          interface Foo {
            [key: string]: string[]
          }
        `,
        expected: dedent`
          interface Foo {
            readonly [key: string]: readonly string[]
          }
        `,
      },
      {
        name: 'Index signature with readonly key modifier',
        source: dedent`
          interface Bar {
            readonly [key: string]: string[]
          }
        `,
        expected: dedent`
          interface Bar {
            readonly [key: string]: readonly string[]
          }
        `,
      },
      {
        name: 'Index signature with readonly key and mutable object value',
        source: dedent`
          interface Foo {
            readonly [key: string]: {
              a: Array<string>;
              readonly b: Promise<Array<string>>;
            };
          }
        `,
        expected: dedent`
          interface Foo {
            readonly [key: string]: Readonly<{
              a: readonly string[];
              b: Promise<readonly string[]>;
            }>;
          }
        `,
      },
      {
        name: 'Index signature in type alias',
        source: dedent`
          type Foo = {
            readonly [key: string]: string[]
          }
        `,
        expected: dedent`
          type Foo = Readonly<{
            [key: string]: readonly string[]
          }>
        `,
      },
      {
        name: 'Nested index signature in interface',
        source: dedent`
          interface NestedIndexSignatureInterface {
            [key: string]: {
              [subkey: string]: string[]
            }
          }
        `,
        expected: dedent`
          interface NestedIndexSignatureInterface {
            readonly [key: string]: Readonly<{
              [subkey: string]: readonly string[]
            }>
          }
        `,
      },
      {
        name: 'Nested index signature in type alias',
        source: dedent`
          type NestedIndexSignatureTypeAlias = {
            [key: string]: {
              [subkey: string]: string[]
            }
          }
        `,
        expected: dedent`
          type NestedIndexSignatureTypeAlias = Readonly<{
            [key: string]: Readonly<{
              [subkey: string]: readonly string[]
            }>
          }>
        `,
      },
      {
        name: 'Variable declaration with index signature type',
        source: dedent`
          let foo: { readonly [key: string]: number }
        `,
        expected: dedent`
          let foo: Readonly<{ [key: string]: number }>
        `,
      },
    ])('$name', testFn);
  });

  describe('Mapped types', () => {
    test.each([
      {
        name: 'Mapped type in type alias',
        source: dedent`
          type T = { [key in string]: number[] }
        `,
        expected: dedent`
          type T = Readonly<{ [key in string]: readonly number[] }>
        `,
      },
      {
        name: 'Mapped type in type alias (PlusToken)',
        source: dedent`
          type T = {+readonly [key in string]: number[] }
        `,
        expected: dedent`
          type T = Readonly<{ [key in string]: readonly number[] }>
        `,
      },
      {
        name: 'Mapped type in type alias (MinusToken)',
        source: dedent`
          type T = { -readonly [key in string]-?: number[] }
        `,
        expected: dedent`
          type T = Readonly<{ [key in string]-?: readonly number[] }>
        `,
      },
      {
        name: 'Mapped type in type alias (ReadonlyKeyword)',
        source: dedent`
          type T = { readonly [key in string]?: number[] }
        `,
        expected: dedent`
          type T = Readonly<{ [key in string]?: readonly number[] }>
        `,
      },
      {
        name: 'Mapped type in function arguments with readonly',
        source: dedent`
          const func = (x: { readonly [key in string]: number[] }) => {}
        `,
        expected: dedent`
          const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}
        `,
      },
      {
        name: 'Mapped type in function arguments without readonly',
        source: dedent`
          const func = (x: { [key in string]: number[] }) => {}
        `,
        expected: dedent`
          const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}
        `,
      },
      {
        name: 'Mapped type in function arguments with Readonly<*>',
        source: dedent`
          const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}
        `,
        expected: dedent`
          const func = (x: Readonly<{ [key in string]: readonly number[] }>) => {}
        `,
      },
    ])('$name', testFn);
  });

  describe('Interfaces', () => {
    test.each([
      {
        name: 'Mutable & readonly properties',
        source: dedent`
          interface Foo {
            bar: Array<string>;
            readonly baz: Promise<string[]>;
          }
        `,
        expected: dedent`
          interface Foo {
            readonly bar: readonly string[];
            readonly baz: Promise<readonly string[]>;
          }
        `,
      },
      {
        name: 'Interface with various readonly members',
        source: dedent`
          interface Foo {
            readonly a: number,
            readonly b: ReadonlyArray<string>,
            readonly c: () => string,
            readonly d: { readonly [key: string]: string[] },
            readonly [key: string]: string[],
          }
        `,
        expected: dedent`
          interface Foo {
            readonly a: number,
            readonly b: readonly string[],
            readonly c: () => string,
            readonly d: Readonly<{ [key: string]: readonly string[] }>,
            readonly [key: string]: readonly string[],
          }
        `,
      },
      {
        name: 'Interface with nested readonly members',
        source: dedent`
          interface Foo {
            readonly a: number,
            readonly b: ReadonlyArray<string>,
            readonly c: () => string,
            readonly d: { readonly [key: string]: readonly string[] },
            readonly [key: string]: readonly string[],
            readonly e: {
              readonly a: number,
              readonly b: ReadonlyArray<string>,
              readonly c: () => string,
              readonly d: { readonly [key: string]: readonly string[] },
              readonly [key: string]: readonly string[],
            }
          }
        `,
        expected: dedent`
          interface Foo {
            readonly a: number,
            readonly b: readonly string[],
            readonly c: () => string,
            readonly d: Readonly<{ [key: string]: readonly string[] }>,
            readonly [key: string]: readonly string[],
            readonly e: Readonly<{
              a: number,
              b: readonly string[],
              c: () => string,
              d: Readonly<{ [key: string]: readonly string[] }>,
              [key: string]: readonly string[],
            }>
          }
        `,
      },
      {
        name: 'Interface with nested non-readonly members',
        source: dedent`
          interface Foo {
            a: number,
            b: ReadonlyArray<string>,
            c: () => string,
            d: { [key: string]: string[] },
            [key: string]: string[],
            e: {
              a: number,
              b: ReadonlyArray<string>,
              c: () => string,
              d: { [key: string]: string[] },
              [key: string]: string[],
            }
          }
        `,
        expected: dedent`
          interface Foo {
            readonly a: number,
            readonly b: readonly string[],
            readonly c: () => string,
            readonly d: Readonly<{ [key: string]: readonly string[] }>,
            readonly [key: string]: readonly string[],
            readonly e: Readonly<{
              a: number,
              b: readonly string[],
              c: () => string,
              d: Readonly<{ [key: string]: readonly string[] }>,
              [key: string]: readonly string[],
            }>
          }
        `,
      },
      {
        name: 'Interface with call signatures and method signatures',
        source: dedent`
          interface Foo {
            (): void;
            foo(): void;
          }
        `,
        expected: dedent`
          interface Foo {
            (): void;
            foo(): void;
          }
        `,
      },
      {
        name: 'Interface extends clause',
        source: dedent`
          interface Foo extends Box<[X[]]> {}
        `,
        expected: dedent`
          interface Foo extends Box<readonly [readonly X[]]> {}
        `,
      },
      {
        name: 'Interface multiple extends',
        source: dedent`
          interface A { a: string[]; }
          interface B { b: number[]; }
          interface C extends A, B { c: boolean[]; }
        `,
        expected: dedent`
          interface A { readonly a: readonly string[]; }
          interface B { readonly b: readonly number[]; }
          interface C extends A, B { readonly c: readonly boolean[]; }
        `,
      },
      {
        name: 'Interface with call/construct signatures',
        source: dedent`
          interface CallableConstructable {
            (arg: number[]): string[];
            new (arg: Map<string, number>): Set<boolean[]>;
            prop: string[];
          }
        `,
        expected: dedent`
          interface CallableConstructable {
            (arg: readonly number[]): readonly string[];
            new (arg: ReadonlyMap<string, number>): ReadonlySet<readonly boolean[]>;
            readonly prop: readonly string[];
          }
        `,
      },

      {
        name: 'Symbol',
        source: dedent`
          interface FileSystemDirectoryHandle {
            [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]>;
            entries(): FileSystemDirectoryHandleAsyncIterator<[string, FileSystemHandle]>;
            keys(): FileSystemDirectoryHandleAsyncIterator<string>;
            values(): FileSystemDirectoryHandleAsyncIterator<FileSystemHandle>;
          }
        `,
        expected: dedent`
          interface FileSystemDirectoryHandle {
            [Symbol.asyncIterator](): FileSystemDirectoryHandleAsyncIterator<readonly [string, FileSystemHandle]>;
            entries(): FileSystemDirectoryHandleAsyncIterator<readonly [string, FileSystemHandle]>;
            keys(): FileSystemDirectoryHandleAsyncIterator<string>;
            values(): FileSystemDirectoryHandleAsyncIterator<FileSystemHandle>;
          }
        `,
      },
    ])('$name', testFn);
  });

  describe('Classes', () => {
    describe('Property declarations', () => {
      test.each([
        {
          name: 'Basic property types',
          source: dedent`
            class Foo {
              a: number[];
              b: Array<string>;
              c: readonly boolean[];
              d: ReadonlyArray<bigint>;
            }
          `,
          expected: dedent`
            class Foo {
              readonly a: readonly number[];
              readonly b: readonly string[];
              readonly c: readonly boolean[];
              readonly d: readonly bigint[];
            }
          `,
        },
        {
          name: 'Properties with various modifiers',
          source: dedent`
            class Klass {
              foo: number;
              private bar: number;
              static baz: number;
              protected static qux: number;
            }
          `,
          expected: dedent`
            class Klass {
              readonly foo: number;
              private readonly bar: number;
              static readonly baz: number;
              protected static readonly qux: number;
            }
          `,
        },
        {
          name: 'Static property',
          source: dedent`
            class Foo {
              static a: number[];
            }
          `,
          expected: dedent`
            class Foo {
              static readonly a: readonly number[];
            }
          `,
        },
        {
          name: 'Class private identifier field',
          source: dedent`
            class HashField {
              #data: string[] = [];
              getData() { return this.#data; }
            }
          `,
          expected: dedent`
            class HashField {
              readonly #data: readonly string[] = [];
              getData() { return this.#data; }
            }
          `,
        },
      ])('$name', testFn);
    });

    describe('Methods', () => {
      test.each([
        {
          name: 'Mutable arrays in class method body',
          source: dedent`
            class Foo {
              a() {
                const b: number[] = [];
                console.log(b);
              }
            }
          `,
          expected: dedent`
            class Foo {
              a() {
                const b: readonly number[] = [];
                console.log(b);
              }
            }
          `,
        },
        {
          name: 'Mutable arrays in class method parameters',
          source: dedent`
            class Foo {
              a(s: string[], p: { x: number }) {}
            }
          `,
          expected: dedent`
            class Foo {
              a(s: readonly string[], p: Readonly<{ x: number }>) {}
            }
          `,
        },
        {
          name: 'Getter and Setter types',
          source: dedent`
            class Foo {
              get a(): number[] { return []; }
              set a(s: string[], p: { x: number }) {}
            }
          `,
          expected: dedent`
            class Foo {
              get a(): readonly number[] { return []; }
              set a(s: readonly string[], p: Readonly<{ x: number }>) {}
            }
          `,
        },
        {
          name: 'Class static method return/params',
          source: dedent`
            class Util {
              static process(data: Map<string, number[]>): Set<string>[] { return []; }
            }
          `,
          expected: dedent`
            class Util {
              static process(data: ReadonlyMap<string, readonly number[]>): readonly ReadonlySet<string>[] { return []; }
            }
          `,
        },
      ])('$name', testFn);
    });

    describe('Parameter properties', () => {
      test.each([
        {
          name: 'Non-readonly class parameter properties',
          source: dedent`
            class Klass {
              constructor (
                prop: string,
                public publicProp: string,
                protected protectedProp: string,
                private privateProp: string,
              ) { }
            }
          `,
          expected: dedent`
            class Klass {
              constructor (
                prop: string,
                public readonly publicProp: string,
                protected readonly protectedProp: string,
                private readonly privateProp: string,
              ) { }
            }
          `,
        },
        {
          name: 'Already readonly class parameter properties',
          source: dedent`
            class Klass {
              constructor (
                readonly prop: string,
                public readonly publicProp: string,
                protected readonly protectedProp: string,
                private readonly privateProp: string,
              ) { }
            }
          `,
          expected: dedent`
            class Klass {
              constructor (
                readonly prop: string,
                public readonly publicProp: string,
                protected readonly protectedProp: string,
                private readonly privateProp: string,
              ) { }
            }
          `,
        },
        {
          name: 'Object or array parameter properties',
          source: dedent`
            class Klass {
              constructor (
                prop: string,
                public publicProp: Array<string>,
                protected protectedProp: { a: string },
                private privateProp: string[],
              ) { }
            }
          `,
          expected: dedent`
            class Klass {
              constructor (
                prop: string,
                public readonly publicProp: readonly string[],
                protected readonly protectedProp: Readonly<{ a: string }>,
                private readonly privateProp: readonly string[],
              ) { }
            }
          `,
        },
      ])('$name', testFn);
    });

    describe('Index signature', () => {
      test.each([
        {
          name: 'Index signature in class',
          source: dedent`
            class Klass {
              [key: string]: string[]
            }
          `,
          expected: dedent`
            class Klass {
              readonly [key: string]: readonly string[]
            }
          `,
        },
        {
          name: 'Class with property and index signature',
          source: dedent`
            class Klass {
              x: number[] = [];
              [key: string]: string[] | number[]
            }
          `,
          expected: dedent`
            class Klass {
              readonly x: readonly number[] = [];
              readonly [key: string]: readonly string[] | readonly number[]
            }
          `,
        },
      ])('$name', testFn);
    });

    describe('Type Assertions in Initializers', () => {
      test.each([
        {
          name: 'Type Assertions in Property Initializers',
          source: dedent`
            class Foo {
              a: number[] = [] as number[];
              b: Array<string> = [] as Array<string>;
              c: readonly boolean[] = [] as readonly boolean[];
              d: ReadonlyArray<bigint> = [] as ReadonlyArray<bigint>;
            }
          `,
          expected: dedent`
            class Foo {
              readonly a: readonly number[] = [] as readonly number[];
              readonly b: readonly string[] = [] as readonly string[];
              readonly c: readonly boolean[] = [] as readonly boolean[];
              readonly d: readonly bigint[] = [] as readonly bigint[];
            }
          `,
        },
      ])('$name', testFn);
    });
  });

  describe('Functions', () => {
    describe('Spread syntax (Rest parameters)', () => {
      test.each([
        {
          name: 'Rest parameter with explicit ReadonlyArray type',
          source: dedent`
            function foo(...a: ReadonlyArray<number>) {}
          `,
          expected: dedent`
            function foo(...a: readonly number[]) {}
          `,
        },
        {
          name: 'Rest parameter with explicit readonly array type',
          source: dedent`
            const foo = (...a: readonly number[]) => {}
          `,
          expected: dedent`
            const foo = (...a: readonly number[]) => {}
          `,
        },
        {
          name: 'Rest parameter with mutable array type',
          source: dedent`
            const foo = (...a: unknown[]) => {}
          `,
          expected: dedent`
            const foo = (...a: readonly unknown[]) => {}
          `,
        },
        {
          name: 'Rest parameter with Readonly',
          source: dedent`
            const foo = (...a: Readonly<unknown[]>) => {}
          `,
          expected: dedent`
            const foo = (...a: readonly unknown[]) => {}
          `,
        },
      ])('$name', testFn);
    });

    describe('Return types', () => {
      test.each([
        {
          name: 'Mutable return types (function declaration)',
          source: dedent`
            declare function f1(...numbers: ReadonlyArray<number>): Array<number>;
            declare function f2(...numbers: readonly number[]): number[];
            declare function f3(...numbers: ReadonlyArray<number>): Promise<Array<number>>;
            declare function f4(...numbers: number[]): Promise<number[]>;
            declare function f5(...numbers: Array<number>): Promise<Foo<Array<number>>>;
            declare function f6(...numbers: Readonly<number[]>): Promise<Foo<number[]>>;
          `,
          expected: dedent`
            declare function f1(...numbers: readonly number[]): readonly number[];
            declare function f2(...numbers: readonly number[]): readonly number[];
            declare function f3(...numbers: readonly number[]): Promise<readonly number[]>;
            declare function f4(...numbers: readonly number[]): Promise<readonly number[]>;
            declare function f5(...numbers: readonly number[]): Promise<Foo<readonly number[]>>;
            declare function f6(...numbers: readonly number[]): Promise<Foo<readonly number[]>>;
          `,
        },
        {
          name: 'Mutable return types (function expression)',
          source: dedent`
            const foo = (...numbers: ReadonlyArray<number>): Array<number> => {}
            const bar = (...numbers: readonly number[]): number[] => {}
          `,
          expected: dedent`
            const foo = (...numbers: readonly number[]): readonly number[] => {}
            const bar = (...numbers: readonly number[]): readonly number[] => {}
          `,
        },
        {
          name: 'Mutable return types (class method)',
          source: dedent`
            class Foo {
              foo(...numbers: ReadonlyArray<number>): Array<number> {}
            }
            class Bar {
              foo(...numbers: number[]): number[] {}
            }
          `,
          expected: dedent`
            class Foo {
              foo(...numbers: readonly number[]): readonly number[] {}
            }
            class Bar {
              foo(...numbers: readonly number[]): readonly number[] {}
            }
          `,
        },
        {
          name: 'Mutable return types (intersection)',
          source: dedent`
            declare function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } & { readonly b: string[] }
          `,
          expected: dedent`
            declare function foo(...numbers: readonly number[]): Readonly<{ a: readonly number[] } & { b: readonly string[] }>
          `,
        },
        {
          name: 'Mutable return types (union)',
          source: dedent`
            declare function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } | { readonly b: string[] }
          `,
          expected: dedent`
            declare function foo(...numbers: readonly number[]): Readonly<{ a: readonly number[] } | { b: readonly string[] }>
          `,
        },
        {
          name: 'Mutable return types (wrapped in another type)',
          source: dedent`
            type Foo<T> = { readonly x: T; };
            declare function func1(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>>
            declare function func2(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>>
          `,
          expected: dedent`
            type Foo<T> = Readonly<{ x: T; }>;
            declare function func1(...numbers: readonly number[]): Promise<Foo<readonly number[]>>
            declare function func2(...numbers: readonly number[]): Promise<Foo<readonly number[]>>
          `,
        },
        {
          name: 'Mutable return types (conditional)',
          source: dedent`
            declare function foo<T>(x: T): T extends Array<number> ? string : number[]
          `,
          expected: dedent`
            declare function foo<T>(x: T): T extends readonly number[] ? string : readonly number[]
          `,
        },
        {
          name: 'Mutable return type with type assertion',
          source: dedent`
            function foo(bar: string): { baz: number } {
              return {} as { baz: number };
            }
          `,
          expected: dedent`
            function foo(bar: string): Readonly<{ baz: number }> {
              return {} as Readonly<{ baz: number }>;
            }
          `,
        },
        {
          name: 'Already readonly return type (generic)',
          source: dedent`
            function foo(): ReadonlyArray<number> {
              return [1, 2, 3];
            }
          `,
          expected: dedent`
            function foo(): readonly number[] {
              return [1, 2, 3];
            }
          `,
        },
        {
          name: 'Already readonly return type (non-generic)',
          source: dedent`
            const foo = (): readonly number[] => {
              return [1, 2, 3];
            }
          `,
          expected: dedent`
            const foo = (): readonly number[] => {
              return [1, 2, 3];
            }
          `,
        },
        {
          name: 'Implicit readonly return type in function (as const)',
          source: dedent`
            function foo() {
              return [1, 2, 3] as const;
            }
          `,
          expected: dedent`
            function foo() {
              return [1, 2, 3] as const;
            }
          `,
        },
        {
          name: 'Implicit readonly return type in arrow function (as const)',
          source: dedent`
            const foo = () => {
              return [1, 2, 3] as const;
            };
          `,
          expected: dedent`
            const foo = () => {
              return [1, 2, 3] as const;
            };
          `,
        },
      ])('$name', testFn);
    });

    describe('Local variables', () => {
      test.each([
        {
          name: 'Mutable local variables',
          source: dedent`
            function foo() {
              let foo: {
                a: number,
                b: ReadonlyArray<string>,
                c: () => string,
                d: { [key: string]: string[] },
                e: { [key: string]: string[] },
                readonly f: {
                  a: number,
                  b: ReadonlyArray<string>,
                  c: () => string,
                  d: { [key: string]: string[] },
                  [key: string]: string[],
                }
              }
            };
          `,
          expected: dedent`
            function foo() {
              let foo: Readonly<{
                a: number,
                b: readonly string[],
                c: () => string,
                d: Readonly<{ [key: string]: readonly string[] }>,
                e: Readonly<{ [key: string]: readonly string[] }>,
                f: Readonly<{
                  a: number,
                  b: readonly string[],
                  c: () => string,
                  d: Readonly<{ [key: string]: readonly string[] }>,
                  [key: string]: readonly string[],
                }>
              }>
            };
          `,
        },
      ])('$name', testFn);
    });

    describe('Generics', () => {
      test.each([
        {
          name: 'Generic constraint',
          source: dedent`
            function process<T extends { data: string[] }>(input: T): T { return input; }
          `,
          expected: dedent`
            function process<T extends Readonly<{ data: readonly string[] }>>(input: T): T { return input; }
          `,
        },
        {
          name: 'Generic default type',
          source: dedent`
            type Container<T = Map<string, number[]>> = { item: T }; type E = Container;
          `,
          expected: dedent`
            type Container<T = ReadonlyMap<string, readonly number[]>> = Readonly<{ item: T }>; type E = Container;
          `,
        },
        {
          name: 'Generic function using type parameter in array',
          source: dedent`
            function wrapArray<T>(input: T): T[] { return [input]; }
          `,
          expected: dedent`
            function wrapArray<T>(input: T): readonly T[] { return [input]; }
          `,
        },
        {
          name: 'Generic function using type parameter in map/set',
          source: dedent`
            function wrapMap<T>(input: T): Map<string, T[]> { return new Map([["key", [input]]]); }
          `,
          expected: dedent`
            function wrapMap<T>(input: T): ReadonlyMap<string, readonly T[]> { return new Map([["key", [input]]]); }
          `,
        },
        {
          name: 'Generic constraint with conditional type',
          source: dedent`
            type Constrained<T extends string[] | number[]> = T extends string[] ? { s: T } : { n: T }; type G = Constrained<boolean[][]>;
          `,
          expected: dedent`
            type Constrained<T extends readonly string[] | readonly number[]> = T extends readonly string[] ? Readonly<{ s: T }> : Readonly<{ n: T }>; type G = Constrained<readonly (readonly boolean[])[]>;
          `,
        },
      ])('$name', testFn);
    });
  });

  describe('Type predicate', () => {
    test.each([
      {
        name: 'Type predicate for array length',
        source: dedent`
          const isArrayOfLength1 = <A,>(
            array: A[],
          ): array is [A, ...A[]] => array.length >= 1;
        `,
        expected: dedent`
          const isArrayOfLength1 = <A,>(
            array: readonly A[],
          ): array is readonly [A, ...A[]] => array.length >= 1;
        `,
      },
    ])('$name', testFn);
  });

  describe('Type parameter', () => {
    test.each([
      {
        name: 'Mapped type in complex generic function',
        source: dedent`
          const tupleMap = <const T extends unknown[], const B>(
            tpl: T,
            mapFn: (a: T[number], index: number) => B,
          ): { [K in keyof T]: B } =>
            tpl.map(mapFn as (a: unknown, index: number) => B) as {
              [K in keyof T]: B;
            };
        `,
        expected: dedent`
          const tupleMap = <const T extends readonly unknown[], const B>(
            tpl: T,
            mapFn: (a: T[number], index: number) => B,
          ): Readonly<{ [K in keyof T]: B }> =>
            tpl.map(mapFn as (a: unknown, index: number) => B) as Readonly<{
              [K in keyof T]: B;
            }>;
        `,
      },
    ])('$name', testFn);
  });

  describe('Primitive and keyword types', () => {
    test.each([
      {
        name: 'Basic primitive types',
        source: dedent`
          type Primitives = { a: string; b: number; c: boolean; d: bigint; e: symbol; };
        `,
        expected: dedent`
          type Primitives = Readonly<{ a: string; b: number; c: boolean; d: bigint; e: symbol; }>;
        `,
      },
      {
        name: 'Null, undefined, void',
        source: dedent`
          type Special = { a: null; b: undefined; c: void }
        `,
        expected: dedent`
          type Special = Readonly<{ a: null; b: undefined; c: void }>;
        `,
      },
      {
        name: 'Any, unknown, never',
        source: dedent`
          type AnyNever = { a: any; b: unknown; c: never }
        `,
        expected: dedent`
          type AnyNever = Readonly<{ a: any; b: unknown; c: never }>
        `,
      },
      {
        name: 'Object keyword',
        source: dedent`
          type Obj = { a: object }
        `,
        expected: dedent`
          type Obj = Readonly<{ a: object }>
        `,
      },
      {
        name: 'This type in class context',
        source: dedent`
          class MyClass {
            value: number[];
            compare(other: this): boolean { return this.value.length === other.value.length; }
          }
        `,
        expected: dedent`
          class MyClass {
            readonly value: readonly number[];
            compare(other: this): boolean { return this.value.length === other.value.length; }
          }
        `,
      },
    ])('$name', testFn);
  });

  describe('Union and intersection types', () => {
    test.each([
      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} of arrays`,
        testCase: (op) => ({
          source: `type Arr =  string[] ${op} readonly number[];`,
          expected: `type Arr = readonly string[] ${op} readonly number[];`,
        }),
      }),

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} of objects`,
        testCase: (op) => ({
          source: `type Obj = { a: string[] } ${op} { b: readonly number[] };`,
          expected: `type Obj = Readonly<{ a: readonly string[] } ${op} { b: readonly number[] }>;`,
        }),
      }),

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} including non-object/array`,
        testCase: (op) => ({
          source: `type Obj = { a: readonly string[] } ${op} readonly number[];`,
          expected: `type Obj = Readonly<{ a: readonly string[] }> ${op} readonly number[];`,
        }),
      }),

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} where only one part is normalized`,
        testCase: (op) => ({
          source: `type PartialReadonlyType = Readonly<string[]> ${op} number[];`,
          expected: `type PartialReadonlyType = readonly string[] ${op} readonly number[];`,
        }),
      }),

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} of Readonly objects`,
        testCase: (op) => ({
          source: `type Obj = Readonly<{ a: string[] }> ${op} Readonly<{ b: readonly number[] }>;`,
          // Readonly<A> | Readonly<B> -> Readonly<A | B> (Collapse)
          // Inner types are not normalized (string[], readonly number[])
          expected: `type Obj = Readonly<{ a: readonly string[] } ${op} { b: readonly number[] }>;`,
        }),
      }),

      {
        name: 'Union of generic and non-generic readonly objects',
        source: dedent`
          type IntersectMixed = { readonly a: string[] } & Readonly<{ b: readonly number[] }>;
        `,
        expected: dedent`
          type IntersectMixed = Readonly<{ a: readonly string[] } & { b: readonly number[] }>;
        `,
      },
      {
        name: 'Intersection of readonly object and non-readonly object',
        source: dedent`
          type IntersectMixed = { readonly a: string[] } & { b: readonly number[] };
        `,
        expected: dedent`
          type IntersectMixed = Readonly<{ a: readonly string[] } & { b: readonly number[] }>;
        `,
      },
      {
        name: 'Nested union/intersection',
        source: dedent`
          type Nested = (string[] | { x: Map<string, number[]> }) & { y: Set<boolean[]> };
        `,
        // Each part is not a normalization target, so unchanged
        expected: dedent`
          type Nested = (readonly string[] | Readonly<{ x: ReadonlyMap<string, readonly number[]> }>)
            & Readonly<{ y: ReadonlySet<readonly boolean[]> }>;
        `,
      },
      {
        name: 'Nested union/intersection 2',
        source: dedent`
          type Nested = ({ x: number[] } | { y: string[] }) & { z: boolean[] };
        `,
        // Each part is not a normalization target, so unchanged
        expected: dedent`
          type Nested = Readonly<
            ({ x: readonly number[] } | { y: readonly string[] }) & { z: readonly boolean[] }
          >;
        `,
      },

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} where only some become Readonly<*>`,
        testCase: (op) => ({
          source: `type PartialReadonly = Readonly<string[]> ${op} number[];`,
          expected: `type PartialReadonly = readonly string[] ${op} readonly number[];`,
        }),
      }),

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} collapse with Array types`,
        testCase: (op) => ({
          source: `type Arr = Readonly<string[]> ${op} Readonly<number[]>;`,
          // Readonly<A[]> | Readonly<B[]> -> readonly A[] | readonly B[]
          // Readonly<A[]> & Readonly<B[]> -> readonly A[] & readonly B[]
          expected: `type Arr = readonly string[] ${op} readonly number[];`,
        }),
      }),

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} of readonly arrays in Readonly`,
        testCase: (op) => ({
          source: `type Arr = Readonly<readonly string[] ${op} readonly number[]>;`,
          expected: `type Arr = readonly string[] ${op} readonly number[];`,
        }),
      }),

      ...toUnionAndIntersectionTestCase({
        title: (op) => `${op} of primitives`,
        testCase: (op) => ({
          source: `type Arr = Readonly<number ${op} boolean ${op} string>;`,
          expected: `type Arr = number ${op} boolean ${op} string;`,
        }),
      }),

      ...[
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<Readonly<{ x: string }> ${op} readonly number[]>;`,
          expected: `type Mixed = Readonly<{ x: string }> ${op} readonly number[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<{ x: string } ${op} readonly number[]>;`,
          expected: `type Mixed = Readonly<{ x: string }> ${op} readonly number[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<{ x: string }> ${op} Readonly<number[]>;`,
          expected: `type Mixed = Readonly<{ x: string }> ${op} readonly number[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<{ x: string } ${op} Readonly<number[]>>;`,
          expected: `type Mixed = Readonly<{ x: string }> ${op} readonly number[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<{ x: string }> ${op} readonly number[];`,
          expected: `type Mixed = Readonly<{ x: string }> ${op} readonly number[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<{ x: string } ${op} readonly number[] ${op} { y: number } ${op} readonly string[]>;`,
          expected: `type Mixed = Readonly<{ x: string } ${op} { y: number }> ${op} readonly number[] ${op} readonly string[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<{ x: string } ${op} readonly number[] ${op} { y: number } ${op} readonly string[]>;`,
          expected: `type Mixed = Readonly<{ x: string } ${op} { y: number }> ${op} readonly number[] ${op} readonly string[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<{ x: string } ${op} number[] ${op} Readonly<{ y: number }> ${op} readonly string[]>;`,
          expected: `type Mixed = Readonly<{ x: string } ${op} { y: number }> ${op} readonly number[] ${op} readonly string[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Mixed = Readonly<unknown ${op} { x: string } ${op} number[] ${op} Readonly<{ y: number }> ${op} readonly string[]>;`,
          expected: `type Mixed = unknown ${op} Readonly<{ x: string } ${op} { y: number }> ${op} readonly number[] ${op} readonly string[];`,
        }),
        (op: '|' | '&') => ({
          source: `type Primitive = Readonly<number ${op} boolean ${op} string>;`,
          expected: `type Primitive = number ${op} boolean ${op} string;`,
        }),
      ].flatMap((t, i) =>
        toUnionAndIntersectionTestCase({
          title: (op) => `${op} of mixed types ${i}`,
          testCase: t,
        }),
      ),

      {
        name: 'Union with mixed array and object types',
        source: dedent`
          type MixedUnion = string[] | { a: number; }
        `,
        expected: dedent`
          type MixedUnion = readonly string[] | Readonly<{ a: number; }>;
        `,
      },
      {
        name: 'Intersection with mixed array and object types',
        source: dedent`
          type MixedIntersection = { id: string; } & { data: number[]; };
        `,
        expected: dedent`
          type MixedIntersection = Readonly<{ id: string; } & { data: readonly number[]; }>;
        `,
      },
      {
        name: 'Nested unions',
        source: dedent`
          type NestedUnion = (string[] | number[]) | { a: boolean[]; }
        `,
        expected: dedent`
          type NestedUnion = (readonly string[] | readonly number[]) | Readonly<{ a: readonly boolean[]; }>;
        `,
      },
      {
        name: 'Nested intersections',
        source: dedent`
          type NestedIntersection = ({ a: string; } & { b: number; }) & { c: boolean[]; };
        `,
        expected: dedent`
          type NestedIntersection = Readonly<({ a: string; } & { b: number; }) & { c: readonly boolean[]; }>;
        `,
      },
      {
        name: 'Union with generic types',
        source: dedent`
          type GenericUnion<T> = T[] | { value: T; }
        `,
        expected: dedent`
          type GenericUnion<T> = readonly T[] | Readonly<{ value: T; }>;
        `,
      },
      {
        name: 'Intersection with generic types',
        source: dedent`
          type GenericIntersection<T> = { id: string; } & { data: T[]; };
        `,
        expected: dedent`
          type GenericIntersection<T> = Readonly<{ id: string; } & { data: readonly T[]; }>;
        `,
      },
      {
        name: 'Union with DeepReadonly',
        source: dedent`
          type DeepReadonlyUnion = DeepReadonly<{ a: number; }> | string[];
        `,
        expected: dedent`
          type DeepReadonlyUnion = DeepReadonly<{ a: number; }> | readonly string[];
        `,
      },
      {
        name: 'Complex union with multiple types',
        source: dedent`
          type ComplexUnion = string | number[] | { a: boolean; } | Map<string, number[]>;
        `,
        expected: dedent`
          type ComplexUnion = string | readonly number[] | Readonly<{ a: boolean; }> | ReadonlyMap<string, readonly number[]>;
        `,
      },
      {
        name: 'Union with function types',
        source: dedent`
          type FunctionUnion = ((a: string[]) => void) | { handler: (b: number[]) => boolean; };
        `,
        expected: dedent`
          type FunctionUnion = ((a: readonly string[]) => void) | Readonly<{ handler: (b: readonly number[]) => boolean; }>;
        `,
      },
      {
        // The case where the entire intersection member directly under Readonly has been converted with replaceWithText
        name: 'Union with Readonly',
        source: dedent`
          type ReadonlyUnion = Readonly<{ a: string[]; } | { b: number[]; }>;
        `,
        expected: dedent`
          type ReadonlyUnion = Readonly<{ a: readonly string[]; } | { b: readonly number[]; }>;
        `,
      },
    ])('$name', testFn);
  });

  describe('Parenthesized types', () => {
    test.each([
      {
        name: 'Parenthesized readonly array',
        source: dedent`
          type ParenReadonlyArr = (readonly string[])
        `,
        expected: dedent`
          type ParenReadonlyArr = readonly string[]
        `,
      },
      {
        name: 'Parenthesized nested readonly array',
        source: dedent`
          type ParenNestedReadonlyArr = readonly (readonly string[])[]
        `,
        expected: dedent`
          type ParenNestedReadonlyArr = readonly (readonly string[])[];
        `,
      },
      {
        name: 'Parenthesized readonly tuple',
        source: dedent`
          type ParenReadonlyTup = (readonly [string, number])
        `,
        expected: dedent`
          type ParenReadonlyTup = readonly [string, number]
        `,
      },
      {
        name: 'Parenthesized type literal',
        source: dedent`
          type ParenObj = ({ a: number[] })
        `,
        expected: dedent`
          type ParenObj = Readonly<{ a: readonly number[] }>
        `,
      },
      {
        name: 'Parenthesized type with union/intersection',
        source: dedent`
          type Paren = ({ a: string[] } | { b: number[] })[]
        `,
        expected: dedent`
          type Paren = readonly Readonly<{ a: readonly string[] } | { b: readonly number[] }>[]
        `,
      },
      {
        name: 'Nested Parentheses Removal',
        source: dedent`
          type NestedParen = ((readonly number[]))
        `,
        // ((readonly T[])) -> (readonly T[]) -> readonly T[]
        expected: dedent`
          type NestedParen = readonly number[]
        `,
      },
      {
        name: 'Parentheses around primitive',
        source: dedent`
          type ParenPrim = (number)
        `,
        expected: dedent`
          type ParenPrim = number;
        `, // Parentheses removed
      },
      {
        name: 'Parentheses around Readonly<T>',
        source: dedent`
          type ParenReadonly = (Readonly<{ a: number }>)
        `,
        // (Readonly<T>) -> Readonly<T> (Parentheses removed because inner type is TypeReference)
        expected: dedent`
          type ParenReadonly = Readonly<{ a: number }>
        `,
      },
    ])('$name', testFn);
  });

  describe('IndexedAccessTypeNode', () => {
    test.each([
      {
        name: 'FlatArray',
        source: dedent`
          type FlatArray<Arr, Depth extends number> = {
            done: Arr;
            recur: Arr extends ReadonlyArray<infer InnerArr>
              ? FlatArray<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
              : Arr;
          }[Depth extends -1 ? 'done' : 'recur'];
        `,
        expected: dedent`
          type FlatArray<Arr, Depth extends number> = {
            done: Arr;
            recur: Arr extends readonly (infer InnerArr)[]
              ? FlatArray<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
              : Arr;
          }[Depth extends -1 ? 'done' : 'recur'];
        `,
      },
      {
        name: 'FlatArray (already readonly)',
        source: dedent`
          type FlatArray<Arr, Depth extends number> = Readonly<{
            done: Arr;
            recur: Arr extends ReadonlyArray<infer InnerArr>
              ? FlatArray<InnerArr, (readonly [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])[Depth]>
              : Arr;
          }>[Depth extends -1 ? 'done' : 'recur'];
        `,
        expected: dedent`
          type FlatArray<Arr, Depth extends number> = {
            done: Arr;
            recur: Arr extends readonly (infer InnerArr)[]
              ? FlatArray<InnerArr, [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20][Depth]>
              : Arr;
          }[Depth extends -1 ? 'done' : 'recur'];
        `,
      },
      {
        name: 'Indexed access type deeper',
        source: dedent`
          type DeepAccess = {
            a: { b: { c: number[] } }
          }["a"]["b"]["c"];
        `,
        expected: dedent`
          type DeepAccess = {
            a: { b: { c: readonly number[] } }
          }["a"]["b"]["c"];
        `,
      },
      {
        name: 'Indexed access type deeper (mixed)',
        source: dedent`
          type DeepAccess = {
            a: [{ b: number[] }, { c: number[] }]
          }["a"][1]["c"];
        `,
        expected: dedent`
          type DeepAccess = {
            a: [{ b: readonly number[] }, { c: readonly number[] }]
          }["a"][1]["c"];
        `,
      },
      {
        name: 'Indexed access type deeper (mixed, not sequent)',
        source: dedent`
          type DeepAccess = {
            a: {
              x: [{ b: number[] }, { c: number[] }][1]["c"]
            }
          }["a"];
        `,
        expected: dedent`
          type DeepAccess = {
            a: Readonly<{
              x: [{ b: readonly number[] }, { c: readonly number[] }][1]["c"]
            }>
          }["a"];
        `,
      },
      {
        name: 'Indexed access type deeper (mixed, not sequent 2)',
        source: dedent`
          type DeepAccess = {
            a: [
              { x: string[] },
              { y: { c: number[] }["c"] }["y"],
            ]
          }["a"][1];
        `,
        expected: dedent`
          type DeepAccess = {
            a: [
              Readonly<{ x: readonly string[] }>,
              { y: { c: readonly number[] }["c"] }["y"],
            ]
          }["a"][1];
        `,
      },
      {
        name: 'Array',
        source: dedent`
          type DeepAccess = {
            a: { y: { c: number[] }["c"] }["y"][]
          }["a"][1];
        `,
        expected: dedent`
          type DeepAccess = {
            a: { y: { c: readonly number[] }["c"] }["y"][]
          }["a"][1];
        `,
      },
      {
        name: 'MappedType',
        source: dedent`
          type Obj = { a: number, b: number, c: number };
          type IndexAccessOnMappedType = { [key in keyof Obj]: number[] }["a"];
        `,
        expected: dedent`
          type Obj = Readonly<{ a: number, b: number, c: number }>;
          type IndexAccessOnMappedType = { [key in keyof Obj]: readonly number[] }["a"];
        `,
      },
      // DeepReadonly pattern tests
      {
        name: 'DeepReadonly with IndexedAccessType',
        source: dedent`
          type DeepObj = DeepReadonly<{ a: { b: number[] } }>;
          type AccessDeep = DeepObj["a"]["b"];
        `,
        expected: dedent`
          type DeepObj = DeepReadonly<{ a: { b: number[] } }>;
          type AccessDeep = DeepObj["a"]["b"];
        `,
      },
      {
        name: 'DeepReadonly with nested IndexedAccessType',
        source: dedent`
          type Config = {
            settings: {
              options: { values: number[] }
            }
          };
          type DeepConfig = DeepReadonly<Config>;
          type AccessDeepNested = DeepConfig["settings"]["options"]["values"];
        `,
        expected: dedent`
          type Config = Readonly<{
            settings: Readonly<{
              options: Readonly<{ values: readonly number[] }>
            }>
          }>;
          type DeepConfig = DeepReadonly<Config>;
          type AccessDeepNested = DeepConfig["settings"]["options"]["values"];
        `,
      },
      // Union/Intersection with IndexedAccessType
      {
        name: 'Union with IndexedAccessType (inline)',
        source: dedent`
          type UnionAccess = ({ x: number[] } | { x: string[] })["x"];
        `,
        expected: dedent`
          type UnionAccess = ({ x: readonly number[] } | { x: readonly string[] })["x"];
        `,
      },
      {
        name: 'Intersection with IndexedAccessType (inline)',
        source: dedent`
          type IntersectionAccess = ({ x: number[]; shared: boolean[] } & { y: string[]; shared: boolean[] })["shared"];
        `,
        expected: dedent`
          type IntersectionAccess = ({ x: readonly number[]; shared: readonly boolean[] } & { y: readonly string[]; shared: readonly boolean[] })["shared"];
        `,
      },
      {
        name: 'Complex Union/Intersection with IndexedAccessType (inline)',
        source: dedent`
          type ComplexAccess = (({ x: number[] } | { y: string[] }) & ({ z: boolean[] } | { w: object[] }))["z" | "w"];
        `,
        expected: dedent`
          type ComplexAccess = (({ x: readonly number[] } | { y: readonly string[] }) & ({ z: readonly boolean[] } | { w: readonly object[] }))["z" | "w"];
        `,
      },
      // Named tuple with IndexedAccessType
      {
        name: 'Named tuple with IndexedAccessType (inline)',
        source: dedent`
          type AccessNamedTuple = [first: string, second: number[], third: { x: boolean[] }][1];
        `,
        expected: dedent`
          type AccessNamedTuple = [first: string, second: readonly number[], third: Readonly<{ x: readonly boolean[] }>][1];
        `,
      },
      {
        name: 'Complex named tuple with IndexedAccessType (inline)',
        source: dedent`
          type AccessComplexTuple = [
            id: string,
            data: { values: number[] }[],
            metadata: [owner: string, permissions: string[]]
          ][2][1];
        `,
        expected: dedent`
          type AccessComplexTuple = [
            id: string,
            data: Readonly<{ values: readonly number[] }>[],
            metadata: [owner: string, permissions: readonly string[]]
          ][2][1];
        `,
      },
      // Additional patterns
      {
        name: 'Conditional type with IndexedAccessType (inline)',
        source: dedent`
          type Result = ({ data: number[] } extends { data: infer U } ? U : never);
        `,
        expected: dedent`
          type Result = (Readonly<{ data: readonly number[] }> extends Readonly<{ data: infer U }> ? U : never);
        `,
      },
      {
        name: 'Template literal with IndexedAccessType (inline)',
        source: dedent`
          type UserParams = {
            "/users": { params: string[] },
            "/posts": { params: number[] }
          }["/users"]["params"];
        `,
        expected: dedent`
          type UserParams = {
            "/users": { params: readonly string[] },
            "/posts": { params: readonly number[] }
          }["/users"]["params"];
        `,
      },
    ])('$name', testFn);
  });

  describe('Function and constructor types', () => {
    test.each([
      {
        name: 'Function type alias',
        source: dedent`
          type MyFunc = (arg: number[]) => string[]
        `,
        expected: dedent`
          type MyFunc = (arg: readonly number[]) => readonly string[];
        `,
      },
      {
        name: 'Function type variable',
        source: dedent`
          let fn: (map: Map<string, number>) => Set<string[]>
        `,
        expected: dedent`
          let fn: (map: ReadonlyMap<string, number>) => ReadonlySet<readonly string[]>;
        `,
      },
      {
        name: 'Constructor type alias',
        source: dedent`
          type MyConstructor = new (arg: string[]) => { prop: number[] };
        `,
        expected: dedent`
          type MyConstructor = new (arg: readonly string[]) => Readonly<{ prop: readonly number[] }>;
        `,
      },
    ])('$name', testFn);
  });

  describe('Generic Types', () => {
    test.each([
      {
        name: 'Generic type parameter in interface',
        source: dedent`
          interface GenericInterface<T> { data: T[]; }
        `,
        expected: dedent`
          interface GenericInterface<T> { readonly data: readonly T[]; }
        `,
      },
      {
        name: 'Generic type parameter in type alias',
        source: dedent`
          type GenericType<T> = { data: T[]; }
        `,
        expected: dedent`
          type GenericType<T> = Readonly<{ data: readonly T[]; }>
        `,
      },
      {
        name: 'Multiple generic type parameters',
        source: dedent`
          type Pair<K, V> = { key: K; value: V[]; }
        `,
        expected: dedent`
          type Pair<K, V> = Readonly<{ key: K; value: readonly V[]; }>;
        `,
      },
      {
        name: 'Generic type with constraints',
        source: dedent`
          type NumberContainer<T extends number> = { values: T[]; }
        `,
        expected: dedent`
          type NumberContainer<T extends number> = Readonly<{ values: readonly T[]; }>;
        `,
      },
      {
        name: 'Generic type with default',
        source: dedent`
          type Container<T = string> = { items: T[]; }
        `,
        expected: dedent`
          type Container<T = string> = Readonly<{ items: readonly T[]; }>;
        `,
      },
      {
        name: 'Nested generic types',
        source: dedent`
          type NestedContainer<T> = { outer: Array<{ inner: T[] }>; }
        `,
        expected: dedent`
          type NestedContainer<T> = Readonly<{ outer: readonly Readonly<{ inner: readonly T[]; }>[]; }>;
        `,
      },
      {
        name: 'Generic type with union',
        source: dedent`
          type Result<T, E> = { data: T; } | { error: E; }
        `,
        expected: dedent`
          type Result<T, E> = Readonly<{ data: T; } | { error: E; }>
        `,
      },
      {
        name: 'Generic type with intersection',
        source: dedent`
          type WithId<T> = { id: string; } & T
        `,
        expected: dedent`
          type WithId<T> = Readonly<{ id: string; }> & T
        `,
      },
      {
        name: 'Generic DeepReadonly usage',
        source: dedent`
          type DeepReadonlyGeneric<T> = DeepReadonly<T>
        `,
        expected: dedent`
          type DeepReadonlyGeneric<T> = DeepReadonly<T>
        `,
      },
      {
        name: 'Complex generic with conditional types',
        source: dedent`
          type MaybeArray<T> = T extends any[] ? T : T[]
        `,
        expected: dedent`
          type MaybeArray<T> = T extends readonly any[] ? T : readonly T[];
        `,
      },
    ])('$name', testFn);
  });

  describe('Canonical readonly forms are stable', () => {
    // Verify canonical forms are stable
    test.each([
      {
        name: 'readonly T[] is unchanged',
        source: dedent`
          type T = readonly string[]
        `,
        expected: dedent`
          type T = readonly string[]
        `,
      },
      {
        name: 'readonly [T1, T2] is unchanged',
        source: dedent`
          type T = readonly [string, number]
        `,
        expected: dedent`
          type T = readonly [string, number]
        `,
      },
      {
        name: 'readonly [T1, ...T2[]] is unchanged',
        source: dedent`
          type T = readonly [string, ...number[]]
        `,
        expected: dedent`
          type T = readonly [string, ...number[]]
        `,
      },
      {
        name: 'ReadonlySet<T> is unchanged',
        source: dedent`
          type T = ReadonlySet<number>
        `,
        expected: dedent`
          type T = ReadonlySet<number>
        `,
      },
      {
        name: 'ReadonlyMap<K, V> is unchanged',
        source: dedent`
          type T = ReadonlyMap<string, boolean>
        `,
        expected: dedent`
          type T = ReadonlyMap<string, boolean>
        `,
      },
      {
        name: 'Readonly<{ a: T }> is unchanged',
        source: dedent`
          type T = Readonly<{ a: string }>
        `,
        expected: dedent`
          type T = Readonly<{ a: string }>
        `,
      },
      {
        name: 'Interface with readonly member is unchanged // Interface itself should not be transformed',
        source: dedent`
          interface I { readonly prop: number; }
        `,
        expected: dedent`
          interface I { readonly prop: number; }
        `,
      },
      {
        name: 'Complex nested readonly is unchanged',
        source: dedent`
          type T = ReadonlyMap<string, readonly Readonly<{ p: readonly boolean[] }>[]>;
        `,
        expected: dedent`
          type T = ReadonlyMap<string, readonly Readonly<{ p: readonly boolean[] }>[]>;
        `,
      },
    ])('$name', testFn);
  });

  describe('Other syntax elements', () => {
    test.each([
      {
        name: 'Typeof on array variable',
        source: dedent`
          const arr = [1, 2];
          type ArrType = typeof arr;
        `,
        expected: dedent`
          const arr = [1, 2];
          type ArrType = typeof arr;
        `,
      },
      {
        name: 'Typeof on object variable',
        source: dedent`
          const obj = { data: [1] };
          type ObjType = typeof obj;
        `,
        expected: dedent`
          const obj = { data: [1] };
          type ObjType = typeof obj;
        `,
      },
      {
        name: 'Indexed access type',
        source: dedent`
          type PropType<T, K extends keyof T> = T[K];
          type A = PropType<{ p: number[] }, "p">;
        `,
        expected: dedent`
          type PropType<T, K extends keyof T> = T[K];
          type A = PropType<Readonly<{ p: readonly number[] }>, "p">;
        `,
      },
      {
        name: 'Indexed access type with array/tuple',
        source: dedent`
          type ElementType<T extends any[]> = T[number]; type B = ElementType<string[][]>;
        `,
        expected: dedent`
          type ElementType<T extends readonly any[]> = T[number]; type B = ElementType<readonly (readonly string[])[]>;
        `,
      },
      {
        name: 'Conditional type',
        source: dedent`
          type Check<T> = T extends string[] ? { value: T } : { error: Error }; type C = Check<number[][]>;
        `,
        expected: dedent`
          type Check<T> = T extends readonly string[] ? Readonly<{ value: T }> : Readonly<{ error: Error }>; type C = Check<readonly (readonly number[])[]>;
        `,
      },
      {
        name: 'Conditional type with complex branches',
        source: dedent`
          type ComplexCondition<T> = T extends Map<string, number[]> ? Set<T>[] : Array<Map<string, T>>;
        `,
        expected: dedent`
          type ComplexCondition<T> = T extends ReadonlyMap<string, readonly number[]> ? readonly ReadonlySet<T>[] : readonly ReadonlyMap<string, T>[];
        `,
      },
      {
        name: 'Conditional type with infer',
        source: dedent`
          type InferArrayItem<T> = T extends (infer I)[] ? { item: I[] } : never; type D = InferArrayItem<Date[]>;
        `,
        expected: dedent`
          type InferArrayItem<T> = T extends readonly (infer I)[] ? Readonly<{ item: readonly I[] }> : never; type D = InferArrayItem<readonly Date[]>;
        `,
      },
      {
        name: 'Conditional type with infer in return position',
        source: dedent`
          type UnwrapArray<T> = T extends Array<infer U> ? U[] : T
        `,

        expected: dedent`
          type UnwrapArray<T> = T extends readonly (infer U)[] ? readonly U[] : T;
        `,
      },
      {
        name: 'Conditional type with infer used in object',
        source: dedent`
          type InferToObject<T> = T extends Set<infer I> ? { item: I[] } : never;
        `,
        expected: dedent`
          type InferToObject<T> = T extends ReadonlySet<infer I> ? Readonly<{ item: readonly I[] }> : never;
        `,
      },
      {
        name: 'Type assertion <T>',
        source: dedent`
          let x = <Map<string, number[]>>{}
        `,
        expected: dedent`
          let x = <ReadonlyMap<string, readonly number[]>>{}
        `,
      },
      {
        name: 'Recursive type alias (linked list)',
        source: dedent`
          type List<T> = { value: T, next: List<T> | null };
          let list: List<number[]>;
        `,
        expected: dedent`
          type List<T> = Readonly<{ value: T, next: List<T> | null }>;
          let list: List<readonly number[]>;
        `,
      },
      {
        name: 'Recursive type alias (tree)',
        source: dedent`
          type Tree<T> = { value: T; children: Tree<T>[] }; let tree: Tree<{ id: number[] }>;
        `,
        expected: dedent`
          type Tree<T> = Readonly<{ value: T; children: readonly Tree<T>[] }>; let tree: Tree<Readonly<{ id: readonly number[] }>>;
        `,
      },
      {
        name: 'Code with comments near types',
        source: dedent`
          // Single line comment
          type /* Block Comment */ WithComments = {
            prop1: string[]; // Trailing comment
            /* Another block */
            prop2: /* member type comment */ Readonly< /* member type inner comment */ number[]>;
            /* End block */
          };
        `,
        expected: dedent`
          // Single line comment
          type /* Block Comment */ WithComments = Readonly<{
            prop1: readonly string[]; // Trailing comment
            /* Another block */
            prop2: /* member type comment */ readonly /* member type inner comment */ number[];
            /* End block */
          }>;
        `,
      },

      {
        name: 'Class implements clause',
        source: dedent`
          interface IBox<T> { value: T[]; }
          class BoxImpl implements IBox<string[]> {
            value: string[];
            constructor() { this.value = []; }
          }
        `,
        expected: dedent`
          interface IBox<T> { readonly value: readonly T[]; }
          class BoxImpl implements IBox<readonly string[]> {
            readonly value: readonly string[];
            constructor() { this.value = []; }
          }
        `,
      },
      {
        name: 'Class extends with generics',
        source: dedent`
          class Base<T> { item: T[] }
          class Derived extends Base<string[]> {}
        `,
        expected: dedent`
          class Base<T> { readonly item: readonly T[] }
          class Derived extends Base<readonly string[]> {}
        `,
      },
      {
        name: 'Function type variable',
        source: dedent`
          let foo: () => number
        `,
        expected: dedent`
          let foo: () => number
        `,
      },
      {
        name: 'Destructuring assignment with tuple type',
        source: dedent`
          const [x, y]: [number[], number[]] = [[1, 2, 3], [4, 5, 6]]
        `,
        expected: dedent`
          const [x, y]: readonly [readonly number[], readonly number[]] = [[1, 2, 3], [4, 5, 6]];
        `,
      },
      {
        name: 'Namespace containing type alias',
        source: dedent`
          namespace X {
            type TypeAlias = {
              a: number[]
            };
          }
        `,
        expected: dedent`
          namespace X {
            type TypeAlias = Readonly<{
              a: readonly number[]
            }>;
          }
        `,
      },
      {
        name: 'Module containing type alias',
        source: dedent`
          module X {
            type TypeAlias = {
              a: number[]
            };
          }
        `,
        expected: dedent`
          module X {
            type TypeAlias = Readonly<{
              a: readonly number[]
            }>;
          }
        `,
      },
    ])('$name', testFn);
  });

  describe('ignorePrefixes option', () => {
    test.each([
      {
        name: 'Variable declarations',
        source: dedent`
          const mut_foo: string[] = []
        `,
        expected: dedent`
          const mut_foo: string[] = []
        `,
      },
      {
        name: 'Function declarations',
        source: dedent`
          function mut_foo(a: readonly number[], b: Promise<number[]>) {}
        `,
        expected: dedent`
          function mut_foo(a: readonly number[], b: Promise<number[]>) {}
        `,
      },
      {
        name: 'Type aliases',
        source: dedent`
          type mut_Foo = number[]
        `,
        expected: dedent`
          type mut_Foo = number[]
        `,
      },
      {
        name: 'Ignore variable with prefix',
        source: dedent`
          type T = { mut_value: number[]; normalValue: string[] }
        `,
        expected: dedent`
          type T = Readonly<{
            mut_value: number[];
            normalValue: readonly string[];
          }>;
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Multiple ignore prefixes',
        source: dedent`
          type T = { mut_value: number[]; mutable_data: string[]; normalValue: boolean[] };
        `,
        expected: dedent`
          type T = Readonly<{
            mut_value: number[];
            mutable_data: string[];
            normalValue: readonly boolean[];
          }>;
        `,
        options: { ignorePrefixes: ['mut_', 'mutable_'] },
      },
      {
        name: 'Ignore prefix in nested properties',
        source: dedent`
          type T = {
            data: {
              mut_items: number[];
              items: string[];
            };
          };
        `,
        expected: dedent`
          type T = Readonly<{
            data: Readonly<{
              mut_items: number[];
              items: readonly string[];
            }>;
          }>;
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Ignore prefix in interface',
        source: dedent`
          interface User {
            mut_permissions: string[];
            roles: string[];
          }
        `,
        expected: dedent`
          interface User {
            mut_permissions: string[];
            readonly roles: readonly string[];
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Ignore prefixes for various name node types in interface',
        source: dedent`
          interface I {
            mut_a: string[]; // Identifier
            #mut_x: string[]; // PrivateIdentifier
            "mut_b": string[]; // StringLiteral
            ['mut_c']: string[]; // ComputedPropertyName with StringLiteral
            ['mu'  + 't_d']: string[]; // ComputedPropertyName
          }
        `,
        expected: dedent`
          interface I {
            mut_a: string[]; // Identifier
            #mut_x: string[]; // PrivateIdentifier
            "mut_b": string[]; // StringLiteral
            ['mut_c']: string[]; // ComputedPropertyName with StringLiteral
            readonly ['mu'  + 't_d']: readonly string[]; // ComputedPropertyName
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Ignore prefix with index signature',
        source: dedent`
          type T = {
            mut_items: {
              [key: string]: number[];
            };
          };
        `,
        expected: dedent`
          type T = Readonly<{
            mut_items: {
              [key: string]: number[];
            };
          }>;
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Index signature in ignored property',
        source: dedent`
          interface Store {
            mut_data: {
              [key: string]: string[];
            };
          }
        `,
        expected: dedent`
          interface Store {
            mut_data: {
              [key: string]: string[];
            };
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Type alias with ignored prefix',
        source: dedent`
          type mut_Config = {
            items: string[];
          };
        `,
        expected: dedent`
          type mut_Config = {
            items: string[];
          };
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Function with ignored prefix',
        source: dedent`
          function mut_process(data: string[]): number[] { return []; }
        `,
        expected: dedent`
          function mut_process(data: string[]): number[] { return []; }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Class with ignored prefix',
        source: dedent`
          class mut_Store {
            items: string[] = [];
          }
        `,
        expected: dedent`
          class mut_Store {
            items: string[] = [];
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Variable declaration with ignored prefix',
        source: dedent`
          const mut_items: string[] = []
        `,
        expected: dedent`
          const mut_items: string[] = []
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Generic type with ignored prefix',
        source: dedent`
          type mut_List<T> = {
            items: T[]
          }
        `,
        expected: dedent`
          type mut_List<T> = {
            items: T[];
          };
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Union type with ignored prefix members',
        source: dedent`
          type Result = mut_Success | Error;
          type mut_Success = {
            data: string[]
          };
        `,
        expected: dedent`
          type Result = mut_Success | Error;
          type mut_Success = {
            data: string[];
          };
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Property with ignored prefix in class',
        source: dedent`
          class Store {
            mut_items: string[] = [];
            items: number[] = [];
          }
        `,
        expected: dedent`
          class Store {
            mut_items: string[] = [];
            readonly items: readonly number[] = [];
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Method parameter with ignored prefix',
        source: dedent`
          class Store {
            process(mut_data: string[], data: number[]) {}
          }
        `,
        expected: dedent`
          class Store {
            process(mut_data: string[], data: readonly number[]) {}
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Function expression with ignored prefix',
        source: dedent`
          const fn = function mut_process(data: string[]): number[] { return []; }
        `,
        expected: dedent`
          const fn = function mut_process(data: string[]): number[] { return []; }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Array binding pattern in variable declaration (not implemented)',
        source: dedent`
          const [mut_first, mut_second]: [string[], number[]] = [[], []];
        `,
        expected: dedent`
          const [mut_first, mut_second]: readonly [readonly string[], readonly number[]] = [[], []];
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Object binding pattern in variable declaration (not implemented)',
        source: dedent`
          const { mut_arr, mut_obj }: { mut_arr: string[], mut_obj: number[] } = { mut_arr: [], mut_obj: [] };
        `,
        expected: dedent`
          const { mut_arr, mut_obj }: Readonly<{ mut_arr: string[], mut_obj: number[] }> = { mut_arr: [], mut_obj: [] };
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Parameter with ignored prefix in class constructor',
        source: dedent`
          class Example {
            constructor(mut_config: string[]) {}
          }
        `,
        expected: dedent`
          class Example {
            constructor(mut_config: string[]) {}
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Parameter with ignored prefix in type literal method',
        source: dedent`
          type Handler = {
            process(mut_data: string[]): void;
          }
        `,
        expected: dedent`
          type Handler = Readonly<{
            process(mut_data: string[]): void;
          }>;
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Multiple parameters with ignored prefix',
        source: dedent`
          interface API {
            update(mut_id: string, mut_data: object[], data: string[]): void;
          }
        `,
        expected: dedent`
          interface API {
            update(mut_id: string, mut_data: object[], data: readonly string[]): void;
          }
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
      {
        name: 'Arrow function with ignored prefix parameters',
        source: dedent`
          const handler = (mut_event: Event[], event: CustomEvent[]) => {};
        `,
        expected: dedent`
          const handler = (mut_event: Event[], event: readonly CustomEvent[]) => {};
        `,
        options: { ignorePrefixes: ['mut_'] },
      },
    ])('$name', testFn);
  });

  describe('Disable comment handling', () => {
    test.each([
      {
        name: 'Skip Array type with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          type Foo = number[]; // Should not change to readonly number[]
        `,
        expected: dedent`
          // transformer-ignore-next-line
          type Foo = number[]; // Should not change to readonly number[]
        `,
      },
      {
        name: 'Skip Generic Array type with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          type Bar = Array<string>; // Should not change to readonly string[]
        `,
        expected: dedent`
          // transformer-ignore-next-line
          type Bar = Array<string>; // Should not change to readonly string[]
        `,
      },
      {
        name: 'Skip Tuple type with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          type Baz = [number, string]; // Should not change to readonly [...]
        `,
        expected: dedent`
          // transformer-ignore-next-line
          type Baz = [number, string]; // Should not change to readonly [...]
        `,
      },
      {
        name: 'Skip Set type with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          type Qux = Set<number>; // Should not change to ReadonlySet
        `,
        expected: dedent`
          // transformer-ignore-next-line
          type Qux = Set<number>; // Should not change to ReadonlySet
        `,
      },
      {
        name: 'Skip Map type with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          type Quux = Map<string, boolean>; // Should not change to ReadonlyMap
        `,
        expected: dedent`
          // transformer-ignore-next-line
          type Quux = Map<string, boolean>; // Should not change to ReadonlyMap
        `,
      },
      {
        name: 'Skip Interface property with disable comment',
        source: dedent`
          interface MyInterface {
            // transformer-ignore-next-line
            prop: string[]; // This specific property should be skipped
            anotherProp: number[]; // This should still be transformed
          }
        `,
        expected: dedent`
          interface MyInterface {
            // transformer-ignore-next-line
            prop: string[]; // This specific property should be skipped
            readonly anotherProp: readonly number[]; // This should still be transformed
          }
        `,
      },
      {
        name: 'Skip whole Interface with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          interface MyInterface {
            prop: string[]; // Should not change
            anotherProp: number[]; // Should not change
          }
        `,
        expected: dedent`
          // transformer-ignore-next-line
          interface MyInterface {
            prop: string[]; // Should not change
            anotherProp: number[]; // Should not change
          }
        `,
      },
      {
        name: 'Skip Class property with disable comment',
        source: dedent`
          class MyClass {
            // transformer-ignore-next-line
            prop: number[] = []; // This specific property should be skipped
            another: boolean[] = []; // This should still be transformed
          }
        `,
        expected: dedent`
          class MyClass {
            // transformer-ignore-next-line
            prop: number[] = []; // This specific property should be skipped
            readonly another: readonly boolean[] = []; // This should still be transformed
          }
        `,
      },
      {
        name: 'Skip whole Class with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          class MyClass {
            prop: number[] = []; // Should not change
            another: boolean[] = []; // Should not change
          }
        `,
        expected: dedent`
          // transformer-ignore-next-line
          class MyClass {
            prop: number[] = []; // Should not change
            another: boolean[] = []; // Should not change
          }
        `,
      },
      {
        name: 'Skip Function parameter type with disable comment',
        source: dedent`
          function myFunc(
            a: string[], // Should be transformed
            // transformer-ignore-next-line
            b: Map<string, number>, // Should be skipped
            c: Set<boolean> // Should be transformed
          ) {}
        `,
        expected: dedent`
          function myFunc(
            a: readonly string[], // Should be transformed
            // transformer-ignore-next-line
            b: Map<string, number>, // Should be skipped
            c: ReadonlySet<boolean> // Should be transformed
          ) {}
        `,
      },
      {
        name: 'Skip whole Function declaration with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          function myFunc(a: string[], b: Map<string, number>): Set<boolean>[] {} // Should not change
        `,
        expected: dedent`
          // transformer-ignore-next-line
          function myFunc(a: string[], b: Map<string, number>): Set<boolean>[] {} // Should not change
        `,
      },
      {
        name: 'Skip Function return type with disable comment',
        source: dedent`
          function myFunc(
            a: string[] // Param should be transformed
          ):
            // transformer-ignore-next-line
            Set<number>[] {} // Return type should be skipped
        `,
        expected: dedent`
          function myFunc(
            a: readonly string[] // Param should be transformed
          ):
            // transformer-ignore-next-line
            Set<number>[] {} // Return type should be skipped
        `,
      },
      {
        name: 'Skip Type literal with disable comment',
        source: dedent`
          // transformer-ignore-next-line
          type Corge = { x: number[] }; // Should not change to Readonly<{...}>
        `,
        expected: dedent`
          // transformer-ignore-next-line
          type Corge = { x: number[] }; // Should not change to Readonly<{...}>
        `,
      },
      {
        name: 'Disable comment only affects next line (mixed constructs)',
        source: dedent`
          type A = number[]; // Should be transformed
          // transformer-ignore-next-line
          type B = string[]; // Should be skipped
          type C = boolean[]; // Should be transformed
        `,
        expected: dedent`
          type A = readonly number[]; // Should be transformed
          // transformer-ignore-next-line
          type B = string[]; // Should be skipped
          type C = readonly boolean[]; // Should be transformed
        `,
      },
      {
        name: 'File scope transformer-ignore',
        source: dedent`
          /* transformer-ignore */
          type A = number[]; // Should be skipped
          type B = string[]; // Should be skipped
          type C = boolean[]; // Should be skipped
        `,
        expected: dedent`
          /* transformer-ignore */
          type A = number[]; // Should be skipped
          type B = string[]; // Should be skipped
          type C = boolean[]; // Should be skipped
        `,
      },
    ])('$name', testFn);
  });

  describe('Error Cases', () => {
    test('Invalid DeepReadonlyTypeName', () => {
      expect(() => {
        // eslint-disable-next-line vitest/no-restricted-vi-methods
        vi.spyOn(console, 'debug').mockImplementation(() => {});

        // eslint-disable-next-line vitest/no-restricted-vi-methods
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const source = dedent`
          type T = number[];
        `;

        transformSourceCode(source, false, [
          convertToReadonlyTypeTransformer({
            DeepReadonly: {
              typeName: 'Readonly',
            },
          }),
        ]);
      }).toThrow(
        'Invalid DeepReadonly typeName "Readonly" passed to convertToReadonlyType',
      );
    });

    test('Unexpected number of type arguments for Array', () => {
      expect(() => {
        // eslint-disable-next-line vitest/no-restricted-vi-methods
        vi.spyOn(console, 'debug').mockImplementation(() => {});

        // eslint-disable-next-line vitest/no-restricted-vi-methods
        vi.spyOn(console, 'log').mockImplementation(() => {});

        const source = dedent`
          type T = Array<number, string>;
        `; // Invalid Array usage

        transformSourceCode(source, false, [
          convertToReadonlyTypeTransformer(),
        ]);
      }).toThrow('Unexpected number of type arguments');
    });
  });
});

const toUnionAndIntersectionTestCase = ({
  title,
  testCase,
}: Readonly<{
  title: (op: 'Union' | 'Intersection') => string;
  testCase: (op: '|' | '&') => Readonly<{
    source: string;
    expected: string;
    debug?: boolean;
  }>;
}>): readonly Readonly<{
  name: string;
  source: string;
  expected: string;
}>[] =>
  (['|', '&'] as const).map((op) => ({
    name: title(op === '&' ? 'Intersection' : 'Union'),
    ...testCase(op),
  }));
