/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import * as typescriptEslintParser from '@typescript-eslint/parser';
import dedent from 'dedent';
import { Linter } from 'eslint';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import { Result } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  enableExplicitFunctionReturnTypeTransformer,
  parseEnableExplicitFunctionReturnTypeTransformerOptions,
  type EnableExplicitFunctionReturnTypeTransformerOptions,
} from './enable-explicit-function-return-type.mjs';
import {
  createProjectTransformer,
  transformSourceCode,
} from './transform-source-code.mjs';

/**
 * One in-memory project for every case, as in the tests of
 * `enable-no-unchecked-indexed-access`: building one per case would parse and
 * check the default library from scratch each time.
 */
const project = new tsm.Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    target: tsm.ts.ScriptTarget.ESNext,
    module: tsm.ts.ModuleKind.ESNext,
    moduleResolution: tsm.ts.ModuleResolutionKind.Bundler,
    lib: ['lib.es2015.d.ts'],
    strict: true,
  },
});

/** Writes `files` (path to text) to {@link project}, then transforms `main.ts`. */
const transformInProject = (
  files: ReadonlyRecord<string, string>,
  options?: EnableExplicitFunctionReturnTypeTransformerOptions,
): string => {
  for (const [filePath, text] of Object.entries(files)) {
    project.createSourceFile(filePath, text, { overwrite: true });
  }

  const main = project.getSourceFileOrThrow('main.ts');

  enableExplicitFunctionReturnTypeTransformer(options).transform(main);

  return main.getFullText();
};

const format = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

const expectTransformed = async ({
  source,
  expected,
  options,
  others = {},
}: Readonly<{
  source: string;
  expected: string;
  options?: EnableExplicitFunctionReturnTypeTransformerOptions;
  others?: ReadonlyRecord<string, string>;
}>): Promise<void> => {
  const transformed = transformInProject(
    { ...others, 'main.ts': source },
    options,
  );

  await expect(format(transformed)).resolves.toBe(await format(expected));
};

// ---------------------------------------------------------------------------
// Parity with the rule
// ---------------------------------------------------------------------------

/**
 * Code exercising every branch of the rule's decision, written so that every
 * function it reports has a return type the transformer can write. Each
 * option set below is checked against it.
 */
const corpus = dedent`
  declare function takesCallback(cb: () => number): void;
  declare class Box { constructor(cb: () => number); }
  type Fn = () => number;
  type Obj = { readonly f: () => number; readonly nested: { readonly g: () => number } };

  export function declaration() { return 1; }
  export function higherOrder() { return () => 1; }
  export function higherOrderBlock() { return function () { return 1; }; }
  export function typedDeclaration(): number { return 1; }
  export function genericDeclaration<T>(x: T) { return x; }

  export const arrow = () => 1;
  export const arrowWithParam = (x: number) => x;
  export const arrowNoParens = async x => 1;
  export const arrowBlock = () => { return 'a'; };
  export const arrowReturningArrow = () => () => 1;
  export const arrowConst = () => ({ a: 1 }) as const;
  export const arrowSatisfiesConst = () => ([1] satisfies readonly number[]) as const;
  export const arrowVoid = () => void takesCallback(() => 1);
  export const functionExpression = function () { return true; };
  export const namedFunctionExpression = function named() { return true; };
  export const typedVariable: Fn = () => 1;
  export const asserted = (() => 1) as Fn;
  export const typedObject: Obj = { f: () => 1, nested: { g: () => 1 } };
  export const untypedObject = { f: () => 1, method() { return 1; }, get getter() { return 1; } };
  export const iife = (() => 1)();
  export const iifeFunction = (function () { return 1; })();

  takesCallback(() => 1);
  new Box(() => 1);
  [1, 2].map((x) => x * 2);
  export const conditional = Math.random() > 0.5 ? () => 1 : () => 2;

  export function withTypedDefault(cb: Fn = () => 1) { return cb; }

  export function returnsObjectOfArrows(): { readonly f: () => number } {
    return { f: () => 1 };
  }

  export default () => 1;

  export class Widget {
    constructor() {}
    method() { return 1; }
    get getter() { return 1; }
    set setter(_: number) {}
    arrowProperty = () => 1;
    typedProperty: Fn = () => 1;
    static staticMethod() { return 'a'; }
    #privateMethod() { return 1; }
    usePrivate() { return this.#privateMethod(); }
  }

  export function isNumber(x: unknown) { return typeof x === 'number'; }
  export function* generator() { yield 1; }
  export async function asyncDeclaration() { return 1; }
`;

const ruleOptionSets: readonly Readonly<{
  name: string;
  options: EnableExplicitFunctionReturnTypeTransformerOptions;
}>[] = [
  { name: 'the defaults', options: {} },
  { name: 'allowExpressions', options: { allowExpressions: true } },
  {
    name: 'no allowTypedFunctionExpressions',
    options: { allowTypedFunctionExpressions: false },
  },
  {
    name: 'no allowHigherOrderFunctions',
    options: { allowHigherOrderFunctions: false },
  },
  {
    name: 'no allowDirectConstAssertionInArrowFunctions',
    options: { allowDirectConstAssertionInArrowFunctions: false },
  },
  {
    name: 'allowConciseArrowFunctionExpressionsStartingWithVoid',
    options: { allowConciseArrowFunctionExpressionsStartingWithVoid: true },
  },
  {
    name: 'allowFunctionsWithoutTypeParameters',
    options: { allowFunctionsWithoutTypeParameters: true },
  },
  { name: 'allowIIFEs', options: { allowIIFEs: true } },
  {
    name: 'allowedNames',
    options: {
      allowedNames: ['declaration', 'arrow', 'method', 'f', 'arrowProperty'],
    },
  },
  {
    name: 'every allowance off but expressions',
    options: {
      allowExpressions: true,
      allowTypedFunctionExpressions: false,
      allowHigherOrderFunctions: false,
      allowDirectConstAssertionInArrowFunctions: false,
    },
  },
] as const;

/**
 * typescript-eslint types its rules against its own `RuleContext`, which
 * ESLint's `Plugin` type does not accept; as in the tests of
 * `eslint-plugin-ts-restrictions`.
 */
const asLinterConfig = (config: unknown): Linter.Config =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- a flat config object, which `Linter` reads and never mutates
  config as Linter.Config;

const lintReturnTypes = (
  code: string,
  options: EnableExplicitFunctionReturnTypeTransformerOptions,
): readonly Linter.LintMessage[] => {
  const { debug: _, ...ruleOptions } = options;

  const linter = new Linter({ configType: 'flat' });

  return linter.verify(
    code,
    [
      asLinterConfig({
        files: ['**/*.ts'],
        languageOptions: { parser: typescriptEslintParser },
        plugins: { '@typescript-eslint': typescriptEslintPlugin },
        rules: {
          '@typescript-eslint/explicit-function-return-type': [
            'error',
            ruleOptions,
          ],
        },
      }),
    ],
    { filename: 'main.ts' },
  );
};

describe('parity with @typescript-eslint/explicit-function-return-type', () => {
  test.each(ruleOptionSets)(
    'annotates exactly what the rule reports, with $name',
    ({ options }) => {
      const reported = lintReturnTypes(corpus, options);

      assert.isTrue(reported.every((message) => message.fatal !== true));

      const transformed = transformInProject({ 'main.ts': corpus }, options);

      assert.deepStrictEqual(lintReturnTypes(transformed, options), []);

      // None is added where the rule had nothing to report.
      const annotationsAdded =
        countAnnotatedFunctions(transformed) - countAnnotatedFunctions(corpus);

      expect(annotationsAdded).toBe(reported.length);
    },
  );
});

/** The number of functions with a body and a return type annotation. */
const countAnnotatedFunctions = (code: string): number => {
  const sourceFile = tsm.ts.createSourceFile(
    'main.ts',
    code,
    tsm.ts.ScriptTarget.ESNext,
    true,
  );

  let mut_count = 0;

  const visit = (node: tsm.ts.Node): void => {
    if (
      (tsm.ts.isArrowFunction(node) ||
        tsm.ts.isFunctionDeclaration(node) ||
        tsm.ts.isFunctionExpression(node) ||
        tsm.ts.isMethodDeclaration(node) ||
        tsm.ts.isGetAccessorDeclaration(node)) &&
      node.body !== undefined &&
      node.type !== undefined
    ) {
      mut_count += 1;
    }

    tsm.ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return mut_count;
};

// ---------------------------------------------------------------------------
// What is written
// ---------------------------------------------------------------------------

describe(enableExplicitFunctionReturnTypeTransformer, () => {
  test('a declaration and an arrow function', async () => {
    await expectTransformed({
      source: dedent`
        export function f(x: number) { return x > 0 ? 'a' : undefined; }
        export const g = (x: number) => [x];
      `,
      expected: dedent`
        export function f(x: number): "a" | undefined { return x > 0 ? 'a' : undefined; }
        export const g = (x: number): number[] => [x];
      `,
    });
  });

  test('an arrow function whose parameter has no parentheses gets them', async () => {
    await expectTransformed({
      source: 'export const f = async x => 1;',
      expected: 'export const f = async (x): Promise<number> => 1;',
    });
  });

  test('a type predicate is kept a type predicate', async () => {
    await expectTransformed({
      source: dedent`
        export const isString = (x: unknown) => typeof x === 'string';
      `,
      expected: dedent`
        export const isString = (x: unknown): x is string => typeof x === 'string';
      `,
    });
  });

  test('methods, getters and class properties', async () => {
    await expectTransformed({
      source: dedent`
        export class A {
          m() { return 1; }
          get g() { return 'a'; }
          p = () => true;
          self() { return this; }
        }
      `,
      expected: dedent`
        export class A {
          m(): number { return 1; }
          get g(): string { return 'a'; }
          p = (): boolean => true;
          self(): this { return this; }
        }
      `,
    });
  });

  test('a type parameter is written as it is named', async () => {
    await expectTransformed({
      source: 'export const id = <T,>(x: T) => [x] as const;',
      expected: 'export const id = <T,>(x: T): readonly [T] => [x] as const;',
      options: { allowDirectConstAssertionInArrowFunctions: false },
    });
  });

  test('a generic function type names its own type parameter', async () => {
    await expectTransformed({
      source: dedent`
        export const f = () => <T,>(x: T) => [x];
      `,
      expected: dedent`
        export const f = (): (<T>(x: T) => T[]) => <T,>(x: T) => [x];
      `,
      options: { allowHigherOrderFunctions: false, allowExpressions: true },
    });
  });

  test('`| undefined` is dropped from an optional parameter', async () => {
    await expectTransformed({
      source: 'export const f = () => (x?: number) => x;',
      expected:
        'export const f = (): ((x?: number) => number | undefined) => (x?: number): number | undefined => x;',
      options: { allowHigherOrderFunctions: false },
    });
  });

  test('a type from another module is imported', async () => {
    await expectTransformed({
      others: {
        'point.ts': dedent`
          export type Point = { readonly x: number };
          export const origin = (): Point => ({ x: 0 });
        `,
      },
      source: dedent`
        import { origin } from './point';

        export const f = () => origin();
      `,
      expected: dedent`
        import { origin } from './point';
        import type { Point } from './point';

        export const f = (): Point => origin();
      `,
    });
  });

  test('an import of the same module with inline types gets another inline type', async () => {
    await expectTransformed({
      others: {
        'point.ts': dedent`
          export type Point = { readonly x: number };
          export type Unit = 'm';
          export const origin = (): Point => ({ x: 0 });
        `,
      },
      source: dedent`
        import { origin, type Unit } from './point';

        export const unit: Unit = 'm';
        export const f = () => origin();
      `,
      expected: dedent`
        import { origin, type Unit, type Point } from './point';

        export const unit: Unit = 'm';
        export const f = (): Point => origin();
      `,
    });
  });

  test('an alias of a `Readonly` instantiation is printed as the alias', async () => {
    await expectTransformed({
      others: {
        'point.ts': dedent`
          export type Point = Readonly<{ x: number }>;
          export const origin = (): Point => ({ x: 0 });
        `,
      },
      source: dedent`
        import { origin } from './point';

        export const f = () => [origin()];
      `,
      expected: dedent`
        import { origin } from './point';
        import type { Point } from './point';

        export const f = (): Point[] => [origin()];
      `,
    });
  });

  test('an alias that is not exported is not restored', async () => {
    await expectTransformed({
      others: {
        'hidden-alias.ts': dedent`
          type Point = Readonly<{ x: number }>;
          export const origin = (): Point => ({ x: 0 });
        `,
      },
      source: dedent`
        import { origin } from './hidden-alias';

        export const f = () => origin();
      `,
      expected: dedent`
        import { origin } from './hidden-alias';

        export const f = (): Readonly<{ x: number }> => origin();
      `,
    });
  });

  test('an alias the file itself declares is printed there, exported or not', async () => {
    await expectTransformed({
      source: dedent`
        type State = Readonly<{ a: number }>;
        const initial: State = { a: 0 };
        export const f = () => initial;
      `,
      expected: dedent`
        type State = Readonly<{ a: number }>;
        const initial: State = { a: 0 };
        export const f = (): State => initial;
      `,
    });
  });

  test('an alias a test file exports is printed in that file', () => {
    project.createSourceFile(
      'fixture.test.ts',
      dedent`
        export type Fixture = Readonly<{ id: string }>;
        const fixture: Fixture = { id: 'a' };
        export const make = () => fixture;
      `,
      { overwrite: true },
    );

    const testFile = project.getSourceFileOrThrow('fixture.test.ts');

    enableExplicitFunctionReturnTypeTransformer().transform(testFile);

    expect(testFile.getFullText()).toContain(
      'export const make = (): Fixture => fixture;',
    );
  });

  test('an alias exported by an export declaration is restored', async () => {
    await expectTransformed({
      others: {
        'late-export.ts': dedent`
          type Point = Readonly<{ x: number }>;
          export const origin = (): Point => ({ x: 0 });
          export type { Point };
        `,
      },
      source: dedent`
        import { origin } from './late-export';

        export const f = () => origin();
      `,
      expected: dedent`
        import { origin } from './late-export';
        import type { Point } from './late-export';

        export const f = (): Point => origin();
      `,
    });
  });

  test('an alias exported by a mock module is not restored', async () => {
    await expectTransformed({
      others: {
        'mocks/point.mock.ts': dedent`
          export type MockPoint = Readonly<{ readonly x: number }>;
        `,
        'point.ts': dedent`
          export const origin = (): Readonly<{ readonly x: number }> => ({ x: 0 });
        `,
      },
      source: dedent`
        import { origin } from './point';

        export const f = () => origin();
      `,
      expected: dedent`
        import { origin } from './point';

        export const f = (): Readonly<{ readonly x: number; }> => origin();
      `,
    });
  });

  test('a global is not taken for a type declared in a long function body', () => {
    // Long enough for the body to span the offset at which lib.es5.d.ts
    // declares `Readonly`.
    const padding = '  const unused = 0;\n'.repeat(20_000);

    const transformed = transformInProject({
      'main.ts': `export function f(x: { a: number }) {\n${padding}  return x as Readonly<{ a: number }>;\n}\n`,
    });

    expect(transformed).toContain(
      'export function f(x: { a: number }): Readonly<{ a: number; }> {',
    );
  });

  test('a global the file never mentions may be shadowed by an import', async () => {
    await expectTransformed({
      others: {
        'globals.d.ts':
          'declare namespace Shadowed { interface T { readonly n: number } }',
        'shadowed.ts': dedent`
          export namespace Shadowed { export interface T { readonly s: string } }
          export const make = (): Shadowed.T => ({ s: 'a' });
        `,
      },
      source: dedent`
        import { make } from './shadowed';

        export const f = () => make();
      `,
      expected: dedent`
        import { make } from './shadowed';
        import type { Shadowed } from './shadowed';

        export const f = (): Shadowed.T => make();
      `,
    });
  });

  describe('left for a human', () => {
    test.each<
      Readonly<{
        name: string;
        others: ReadonlyRecord<string, string>;
        source: string;
      }>
    >([
      {
        name: 'a type containing `any`',
        others: {},
        source: 'export const f = (x: any) => [x];',
      },
      {
        name: 'a name already declared in the file',
        others: {
          'point.ts': dedent`
            export type Point = { readonly x: number };
            export const origin = (): Point => ({ x: 0 });
          `,
        },
        source: dedent`
          import { origin } from './point';

          const Point = 1;
          export const f = () => origin();
          export const g = Point;
        `,
      },
      {
        name: 'a global the file mentions',
        others: {
          'globals.d.ts':
            'declare namespace Shadowed { interface T { readonly n: number } }',
          'shadowed.ts': dedent`
            export namespace Shadowed { export interface T { readonly s: string } }
            export const make = (): Shadowed.T => ({ s: 'a' });
          `,
        },
        source: dedent`
          import { make } from './shadowed';

          export const n: Shadowed.T = { n: 1 };
          export const f = () => make();
        `,
      },
      {
        name: 'a name the annotation also needs as the global it is',
        others: {
          'globals.d.ts': 'interface Event { readonly global: true }',
          'events.ts': dedent`
            export type Event<T> = { readonly native: T };
            export const wrap = (e: globalThis.Event): Event<globalThis.Event> => ({ native: e });
          `,
        },
        source: dedent`
          import { wrap } from './events';

          export const f = (e: globalThis.Event) => wrap(e);
        `,
      },
      {
        name: 'a type declared in the function body',
        others: {},
        source: dedent`
          export function f() {
            interface Local { readonly a: number }
            const x: Local = { a: 1 };
            return x;
          }
        `,
      },
      {
        name: 'a type that is not exported',
        others: {
          'hidden.ts': dedent`
            class Hidden { private readonly secret = 1; }
            export const make = () => new Hidden();
          `,
        },
        source: dedent`
          import { make } from './hidden';

          export const f = () => make();
        `,
      },
    ])('$name', ({ others, source }) => {
      expect(transformInProject({ ...others, 'main.ts': source })).toBe(source);
    });
  });

  test('an ignore comment leaves the function alone', async () => {
    await expectTransformed({
      source: dedent`
        // transformer-ignore-next-line enable-explicit-function-return-type
        export const f = () => 1;
        export const g = () => 1;
      `,
      expected: dedent`
        // transformer-ignore-next-line enable-explicit-function-return-type
        export const f = () => 1;
        export const g = (): number => 1;
      `,
    });
  });

  test('a JavaScript file is left alone', () => {
    const sourceFile = project.createSourceFile(
      'main.js',
      'export const f = () => 1;',
      { overwrite: true },
    );

    enableExplicitFunctionReturnTypeTransformer().transform(sourceFile);

    expect(sourceFile.getFullText()).toBe('export const f = () => 1;');
  });
});

describe('through transformSourceCode', () => {
  test('infers with strictNullChecks on, so that `undefined` is kept', () => {
    expect(
      transformSourceCode(
        'export const f = (x: number) => (x > 0 ? x : undefined);',
        false,
        [enableExplicitFunctionReturnTypeTransformer()],
      ),
    ).toBe(
      'export const f = (x: number): number | undefined => (x > 0 ? x : undefined);',
    );
  });

  test('leaves alone a function whose type comes from an unresolved import', () => {
    const source = dedent`
      import { make } from './elsewhere';

      export const f = () => make();
    `;

    expect(
      transformSourceCode(source, false, [
        enableExplicitFunctionReturnTypeTransformer(),
      ]),
    ).toBe(source);
  });
});

describe(createProjectTransformer, () => {
  test('resolves types from the other files of the project', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-codemod-lib-'));

    try {
      fs.writeFileSync(
        path.join(dir, 'tsconfig.json'),
        JSON.stringify({
          compilerOptions: {
            strict: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            target: 'esnext',
            lib: ['es2015'],
          },
          include: ['*.ts'],
        }),
      );

      fs.writeFileSync(
        path.join(dir, 'point.ts'),
        dedent`
          export type Point = Readonly<{ x: number }>;
          export const origin = (): Point => ({ x: 0 });
        `,
      );

      const mainPath = path.join(dir, 'main.ts');

      const source = dedent`
        import { origin } from './point';

        export const f = () => origin();
      `;

      fs.writeFileSync(mainPath, source);

      const transform = createProjectTransformer(
        path.join(dir, 'tsconfig.json'),
        [enableExplicitFunctionReturnTypeTransformer()],
      );

      expect(transform(mainPath, source)).toBe(dedent`
        import { origin } from './point';
        import type { Point } from './point';

        export const f = (): Point => origin();
      `);

      // Nothing is written to disk.
      expect(fs.readFileSync(mainPath, 'utf8')).toBe(source);

      let mut_shouldFail = true;

      const failingOnce = createProjectTransformer(
        path.join(dir, 'tsconfig.json'),
        [
          {
            name: 'failing-once',
            transform: (sourceFile) => {
              if (!mut_shouldFail) {
                return;
              }

              mut_shouldFail = false;

              sourceFile.insertText(0, '// half-made\n');

              throw new Error('failed');
            },
          },
        ],
      );

      expect(() => failingOnce(mainPath, source)).toThrow('failed');

      // The project went back to the file as it was, not the half-made edit.
      expect(failingOnce(mainPath, source)).toBe(source);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe(parseEnableExplicitFunctionReturnTypeTransformerOptions, () => {
  test('reads the rule options', () => {
    assert.deepStrictEqual(
      parseEnableExplicitFunctionReturnTypeTransformerOptions({
        allowExpressions: true,
        allowedNames: ['a'],
      }),
      Result.ok({ allowExpressions: true, allowedNames: ['a'] }),
    );
  });

  test.each([
    { value: null, error: 'The options must be an object.' },
    {
      value: { allowExpressions: 1 },
      error: '`allowExpressions` must be a boolean.',
    },
    {
      value: { allowedNames: [1] },
      error: '`allowedNames` must be an array of strings.',
    },
    {
      value: { allowExpression: true },
      error: 'Unknown option `allowExpression`.',
    },
  ])('rejects $value', ({ value, error }) => {
    assert.deepStrictEqual(
      parseEnableExplicitFunctionReturnTypeTransformerOptions(value),
      Result.err(error),
    );
  });
});
