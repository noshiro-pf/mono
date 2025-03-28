[
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
    name: 'inside interfaces',
    source: codeFromStringLines(
      'interface Foo {',
      '  readonly bar: Array<string>;',
      '  readonly baz: Promise<Array<string>>;',
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
    name: 'index signatures',
    source: codeFromStringLines(
      'interface Foo {',
      '  readonly [key: string]: {',
      '    readonly a: Array<string>;',
      '    readonly b: Promise<Array<string>>;',
      '  };',
      '}',
      'interface Bar {',
      '  [key: string]: string',
      '}',
      'interface Baz {',
      '  [key: string]: { prop: string }',
      '}',
    ),
    expected: codeFromStringLines(
      'interface Foo {',
      '  readonly [key: string]: {',
      '    readonly a: readonly string[];',
      '    readonly b: Promise<readonly string[]>;',
      '  };',
      '}',
      'interface Bar {',
      '  readonly [key: string]: string',
      '}',
      'interface Baz {',
      '  readonly [key: string]: { readonly prop: string }',
      '}',
    ),
  },
  {
    name: 'non-readonly class properties',
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
      '  foo: number;',
      '  private bar: number;',
      '  static baz: number;',
      '  private static qux: number;',
      '}',
    ),
  },
  {
    name: 'non-readonly class parameter properties',
    source: codeFromStringLines(
      'class Klass {',
      '  constructor (',
      '    public publicProp: string,',
      '    protected protectedProp: string,',
      '    private privateProp: string,',
      '  ) { }',
      '}',
    ),
    expected: codeFromStringLines(
      'class Klass {',
      '  constructor (',
      '    public readonly publicProp: string,',
      '    protected readonly protectedProp: string,',
      '    private readonly privateProp: string,',
      '  ) { }',
      '}',
    ),
  },
  {
    name: 'literals without readonly modifiers',
    source: codeFromStringLines(
      'let foo: {',
      '  a: number,',
      '  b: ReadonlyArray<string>,',
      '  c: () => string,',
      '  d: { readonly [key: string]: string },',
      '  [key: string]: string,',
      '  readonly e: {',
      '    a: number,',
      '    b: ReadonlyArray<string>,',
      '    c: () => string,',
      '    d: { readonly [key: string]: string },',
      '    [key: string]: string,',
      '  }',
      '};',
    ),
    expected: codeFromStringLines(
      'let foo: {',
      '  a: number,',
      '  b: ReadonlyArray<string>,',
      '  c: () => string,',
      '  d: { readonly [key: string]: string },',
      '  [key: string]: string,',
      '  readonly e: {',
      '    a: number,',
      '    b: ReadonlyArray<string>,',
      '    c: () => string,',
      '    d: { readonly [key: string]: string },',
      '    [key: string]: string,',
      '  }',
      '};',
    ),
  },
  {
    name: 'mapped types',
    source: 'const func = (x: { [key in string]: number }) => {}',
    expected: 'const func = (x: { readonly [key in string]: number }) => {}',
  },
  {
    name: 'explicit readonly parameter types',
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
  {
    name: 'explicit readonly parameter types (generic)',
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
  {
    name: 'explicit readonly return types (generic)',
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
    name: 'explicit readonly return types (non-generic)',
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
    name: 'implicit readonly arrays',
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
    name: 'readonly local types',
    source: codeFromStringLines(
      'function foo() {',
      '  type Foo = ReadonlyArray<string>;',
      '}',
    ),
    expected: codeFromStringLines(
      'function foo() {',
      '  type Foo = readonly string[];',
      '}',
    ),
  },
  {
    name: 'mutable variable declarations (generic)',
    source: 'const foo: Array<string> = [];',
    expected: 'const foo: string[] = [];',
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
    name: 'interfaces with readonly modifiers',
    source: codeFromStringLines(
      'interface Foo {',
      '  readonly a: number,',
      '  readonly b: ReadonlyArray<string>,',
      '  readonly c: () => string,',
      '  readonly d: { readonly [key: string]: string },',
      '  readonly [key: string]: string,',
      '}',
    ),
    expected: codeFromStringLines(
      'interface Foo {',
      '  readonly a: number,',
      '  readonly b: ReadonlyArray<string>,',
      '  readonly c: () => string,',
      '  readonly d: { readonly [key: string]: string },',
      '  readonly [key: string]: string,',
      '}',
    ),
  },
];

it("doesn't report interfaces with readonly modifiers", () => {
  valid(dedent`
        interface Foo {
          readonly a: number,
          readonly b: ReadonlyArray<string>,
          readonly c: () => string,
          readonly d: { readonly [key: string]: string },
          readonly [key: string]: string,
          readonly e: {
            readonly a: number,
            readonly b: ReadonlyArray<string>,
            readonly c: () => string,
            readonly d: { readonly [key: string]: string },
            readonly [key: string]: string,
          }
        }
      `);
});

it("doesn't report call signatures and method signatures", () => {
  valid(dedent`
        interface Foo {
          (): void
          foo(): void
        }
      `);
});

it("doesn't report literal with readonly index signature", () => {
  valid(dedent`
        let foo: { readonly [key: string]: number };
      `);
});

it("doesn't report type literals elements with a readonly modifer in an array", () => {
  valid(dedent`
        type foo = ReadonlyArray<{ readonly type: string, readonly code: string }>;
      `);
});

it("doesn't report type literals with readonly on members", () => {
  valid(dedent`
        let foo: {
          readonly a: number,
          readonly b: ReadonlyArray<string>,
          readonly c: () => string,
          readonly d: { readonly [key: string]: string }
          readonly [key: string]: string
        };
      `);
});

it("doesn't report class parameter properties", () => {
  valid(dedent`
        class Klass {
          constructor (
            nonParameterProp: string,
            readonly readonlyProp: string,
            public readonly publicReadonlyProp: string,
            protected readonly protectedReadonlyProp: string,
            private readonly privateReadonlyProp: string,
          ) { }
        }
      `);
});

it("doesn't report mapped types with readonly on members", () => {
  valid(dedent`
        const func = (x: { readonly [key in string]: number }) => {}
      `);
});

it("doesn't report mutable return types", () => {
  valid({
    code: dedent`
              function foo(...numbers: ReadonlyArray<number>): Array<number> {}
              function bar(...numbers: readonly number[]): number[] {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              const foo = (...numbers: ReadonlyArray<number>): Array<number> =>  {}
              const bar = (...numbers: readonly number[]): number[] =>  {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              class Foo {
                foo(...numbers: ReadonlyArray<number>): Array<number> {
                }
              }
              class Bar {
                foo(...numbers: readonly number[]): number[] {
                }
              }
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              function foo(...numbers: ReadonlyArray<number>): Promise<Array<number>> {}
              function foo(...numbers: ReadonlyArray<number>): Promise<number[]> {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              function foo(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>> {}
              function foo(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>> {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } | { readonly b: string[] } {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              type Foo<T> = { readonly x: T; };
              function foo(...numbers: ReadonlyArray<number>): Promise<Foo<Array<number>>> {}
              function foo(...numbers: ReadonlyArray<number>): Promise<Foo<number[]>> {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              function foo(...numbers: ReadonlyArray<number>): { readonly a: Array<number> } & { readonly b: string[] } {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              function foo<T>(x: T): T extends Array<number> ? string : number[] {}
            `,
    options: [{ allowMutableReturnType: true }],
  });

  valid({
    code: dedent`
              function foo(bar: string): { baz: number } {
                return 1 as any;
              }
            `,
    options: [{ allowMutableReturnType: true }],
  });
});

it("doesn't report implicit readonly array variables", () => {
  valid({
    code: dedent`
              const numbers = [1, 2, 3] as const;
            `,
    options: [{ checkImplicit: true }],
  });
});

it("doesn't report implicit readonly return types", () => {
  valid({
    code: dedent`
              function foo() {
                return [1, 2, 3] as const;
              }
            `,
    options: [{ checkImplicit: true }],
  });

  valid({
    code: dedent`
              const foo = () => {
                return [1, 2, 3] as const;
              };
            `,
    options: [{ checkImplicit: true }],
  });
});

it("doesn't report classes", () => {
  valid({
    code: dedent`
              class Klass {
                foo: number;
                private bar: number;
                static baz: number;
                private static qux: number;
              }
            `,
    options: [{ ignoreClass: true }],
  });
});

it("doesn't report classes - fieldsOnly", () => {
  valid({
    code: dedent`
              class Klass {
                foo: number;
                private bar: number;
                static baz: number;
                private static qux: number;
              }
            `,
    options: [{ ignoreClass: 'fieldsOnly' }],
  });
});

it('reports non-field issues in classes - fieldsOnly', () => {
  const invalidResult = invalid({
    code: dedent`
              class Klass {
                foo: number;
                private bar: number;
                static baz: number;
                private static qux: number;

                foo() {
                  let bar: {
                    foo: number;
                  };
                }
              }
            `,
  });
});

it("doesn't report interfaces", () => {
  valid({
    code: dedent`
              interface Foo {
                foo: number,
                bar: ReadonlyArray<string>,
                baz: () => string,
                qux: { [key: string]: string }
              }
            `,
  });
});

it("doesn't report matching identifiers", () => {
  valid({
    code: dedent`
              let mutableFoo: string[] = [];
            `,
  });
});

it("doesn't report mutable local variables", () => {
  valid({
    code: dedent`
              function foo() {
                let foo: {
                  a: number,
                  b: ReadonlyArray<string>,
                  c: () => string,
                  d: { [key: string]: string },
                  [key: string]: string,
                  readonly d: {
                    a: number,
                    b: ReadonlyArray<string>,
                    c: () => string,
                    d: { [key: string]: string },
                    [key: string]: string,
                  }
                }
              };
            `,
  });
});

it("doesn't report mutable arrays", () => {
  valid({
    code: dedent`
              type Foo = Array<string>;
            `,
  });

  valid({
    code: dedent`
              const foo: number[] = [];
            `,
  });

  valid({
    code: dedent`
              const foo = [];
            `,
  });
});

it("doesn't report mutable tuples", () => {
  valid({
    code: dedent`
              type Foo = [string, string];
            `,
  });

  valid({
    code: dedent`
              const foo: [string, string] = ['foo', 'bar'];
            `,
  });

  valid({
    code: dedent`
              const foo = ['foo', 'bar'];
            `,
  });
});

it("doesn't report mutable sets", () => {
  valid({
    code: dedent`
              type Foo = Set<string, string>;
            `,
  });

  valid({
    code: dedent`
              const foo: Set<string, string> = new Set();
            `,
  });
});

it("doesn't report mutable maps", () => {
  valid({
    code: dedent`
              type Foo = Map<string, string>;
            `,
  });

  valid({
    code: dedent`
              const foo: Map<string, string> = new Map();
            `,
  });
});
