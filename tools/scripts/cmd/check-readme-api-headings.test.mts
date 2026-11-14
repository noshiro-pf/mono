import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findHeadingMismatches,
  readReadme,
  signatureHeadings,
  type Mismatch,
} from './check-readme-api-headings.mjs';

describe(signatureHeadings, () => {
  test('reads the headings whose first code span is a call, outside fences', () => {
    assert.deepStrictEqual(
      signatureHeadings(
        dedent`
          # pkg

          ## \`cli-command\`

          ### \`f(a)\` — what it does

          #### \`g<T>(x: T): T\`

          ### \`Namespace\`

          ### \`Result<T, E>\`

          ### \`Fn<(x: number) => void>\`

          ### \`Arr.seq(n)\`

          ### \`h<T extends () => void>(x: T)\`

          ### \`k<T extends A<B>>(x)\`

          ### \`G<T>\`

          ### \`u<T extends '𝒳'>(x)\`

          ### \`q<T extends '<'>(x)\`

          ### \`r<T extends '>'>(x)\`

          ### \`string(x)\`

          ### \`of(...xs)\`

          ### \`t<T extends A<B<<U>() => U>>>(x)\`

          ### \`Fn<T> & (A | B)\`

          ### \`k<A<B>>(x): R\`

          ### \`unique(xs)\`

          ### \`a < b\`

          ### \`Set<T>.has\`

          \`\`\`md
          ### \`h(x)\`
          \`\`\`

          Text \`k(x)\`
        `,
      ),
      [
        { line: 5, signature: 'f(a)' },
        { line: 7, signature: 'g<T>(x: T): T' },
        { line: 17, signature: 'h<T extends () => void>(x: T)' },
        { line: 19, signature: 'k<T extends A<B>>(x)' },
        { line: 23, signature: "u<T extends '𝒳'>(x)" },
        { line: 25, signature: "q<T extends '<'>(x)" },
        { line: 27, signature: "r<T extends '>'>(x)" },
        { line: 29, signature: 'string(x)' },
        { line: 31, signature: 'of(...xs)' },
        { line: 33, signature: 't<T extends A<B<<U>() => U>>>(x)' },
        { line: 37, signature: 'k<A<B>>(x): R' },
        { line: 39, signature: 'unique(xs)' },
      ],
    );
  });
});

describe(findHeadingMismatches, () => {
  const mut_dirs: string[] = [];

  afterAll(async () => {
    await Promise.all(
      mut_dirs.map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  const mismatchesIn = async (
    readmeHeadings: readonly string[],
    files: ReadonlyRecord<string, string>,
  ): Promise<readonly Mismatch[]> => {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'check-readme-api-headings-test-'),
    );

    mut_dirs.push(dir);

    await Promise.all(
      Object.entries(files).map(async ([file, content]) => {
        const target = path.join(dir, file);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(path.dirname(target), { recursive: true });

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(target, content);
      }),
    );

    return findHeadingMismatches(
      dir,
      readmeHeadings.map((heading) => `### \`${heading}\``).join('\n\n'),
    );
  };

  const source = dedent`
    export * from './impl.mjs';
  `;

  const impl = dedent`
    export const f = (a: string, b?: number): Promise<void> =>
      Promise.resolve();

    export const withDefault = (
      /** the count */
      n: number = 3,
    ): readonly Readonly<{ code?: number }>[] => [];

    export const destructured = <C, O>({
      run,
    }: Readonly<{ run: (c: C) => O }>): ((config: C) => O) => run;

    export function over(command: string, options?: string): string;

    export function over(command: string, options: number): number;

    export function over(command: string, options?: string | number): string | number {
      return options ?? command;
    }

    export function plain(...args: readonly string[]): number {
      return args.length;
    }

    export const notAFunction = 1;

    export const inferred = (label = 'x') => label.length;

    const make =
      () =>
      (config: string): Promise<void> =>
        Promise.resolve();

    export const made = make();

    type Fn = (a: number, b: string) => void;

    export const annotated: Fn = () => {};

    export const asserted = (() => {}) as Fn;

    export function bound(this: Date, fn: () => void): void {
      fn.call(this);
    }

    export const defaultFirst = (a = 1, b: number): number => a + b;

    const makeGeneric =
      () =>
      <T extends string>({ value }: Readonly<{ value: T }>): T =>
        value;

    export const madeGeneric = makeGeneric();

    const makeBound =
      <U,>() =>
      <T extends U>(x: T): T =>
        x;

    export const madeBound = makeBound<string>();

    export const optional: (x?: number) => void = () => {};

    export const parenthesized: ((x: number) => void) = () => {};

    export const doubled = (): (((x: number) => void)) => () => {};

    export const nonNull = ((x: number): number => x)!;

    export const cast = ((x: number): number => x) as unknown as (y: string) => void;

    export type { f as typeOnly };

    export const { run } = { run: (n: number): number => n };
  `;

  const filesWith = (entry: string): ReadonlyRecord<string, string> =>
    ({
      [entry]: source,
      'src/impl.mts': impl,
    }) as const;

  test('passes headings that give the name and parameters, or the whole signature', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(
        [
          'f(a, b?)',
          'f(a: string, b?: number): Promise<void>',
          'f(a, b?): Promise<void>',
          'withDefault(n?)',
          'withDefault(n?: number): readonly Readonly<{ code?: number }>[]',
          'destructured(options)',
          'destructured<C, O>(options): (config: C) => O',
          'over(command, options?)',
          'over(command: string, options: number): number',
          'plain(...args)',
          'inferred(label?)',
          'made(config)',
          'annotated(a, b)',
          'asserted(a, b)',
          'bound(fn)',
          'bound(this: Date, fn): void',
          'defaultFirst(a, b: number): number',
          'madeGeneric(options)',
          'madeBound(x)',
          'optional(x?: number): void',
          'parenthesized(x: number): void',
          'doubled(): (x: number) => void',
          'nonNull(x: number): number',
          'cast(y)',
          'run(n)',
        ],
        filesWith('src/index.mts'),
      ),
      [],
    );
  });

  test('reads a function a .tsx module exports', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(['Comp(props: Readonly<{ label: string }>)'], {
        'src/index.mts': "export * from './comp.js';",
        'src/comp.tsx': dedent`
          export const Comp = (props: Readonly<{ label: string }>): string =>
            props.label;
        `,
      }),
      [],
    );
  });

  test('reads src/entry-point.mts before src/index.mts', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(['f(a, b?)'], {
        ...filesWith('src/entry-point.mts'),
        'src/index.mts': 'export const other = 1;',
      }),
      [],
    );
  });

  test('fails a heading whose parameters differ, with both texts', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(
        ['f(a)', 'f(x, b?)', 'f(a, b)', 'withDefault(n)', 'plain(args)'],
        filesWith('src/index.mts'),
      ),
      [
        {
          line: 1,
          heading: 'f(a)',
          problem: 'has 1 parameter, the declaration 2',
          declared: ['f(a: string, b?: number): Promise<void>'],
        },
        {
          line: 3,
          heading: 'f(x, b?)',
          problem: 'parameter 1 is `x`, the declaration names it `a`',
          declared: ['f(a: string, b?: number): Promise<void>'],
        },
        {
          line: 5,
          heading: 'f(a, b)',
          problem:
            'parameter `b` is optional in the declaration, not in the heading',
          declared: ['f(a: string, b?: number): Promise<void>'],
        },
        {
          line: 7,
          heading: 'withDefault(n)',
          problem:
            'parameter `n` is optional in the declaration, not in the heading',
          declared: [
            'withDefault(n?: number): readonly Readonly<{ code?: number; }>[]',
          ],
        },
        {
          line: 9,
          heading: 'plain(args)',
          problem:
            'parameter `args` is a rest parameter in the declaration, not in the heading',
          declared: ['plain(...args: readonly string[]): number'],
        },
      ],
    );
  });

  test('fails a heading whose types or return type differ', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(
        [
          'f(a: number, b?): Promise<void>',
          'f(a, b?): Promise<string>',
          'destructured<O>(options)',
          'made(options)',
          'parenthesized(x: string)',
        ],
        filesWith('src/index.mts'),
      ),
      [
        {
          line: 1,
          heading: 'f(a: number, b?): Promise<void>',
          problem: 'parameter `a` has type `number`, the declaration `string`',
          declared: ['f(a: string, b?: number): Promise<void>'],
        },
        {
          line: 3,
          heading: 'f(a, b?): Promise<string>',
          problem: 'returns `Promise<string>`, the declaration `Promise<void>`',
          declared: ['f(a: string, b?: number): Promise<void>'],
        },
        {
          line: 5,
          heading: 'destructured<O>(options)',
          problem: 'has type parameters `<O>`, the declaration `<C, O>`',
          declared: [
            'destructured<C, O>({ run, }: Readonly<{ run: (c: C) => O; }>): (config: C) => O',
          ],
        },
        {
          line: 7,
          heading: 'made(options)',
          problem:
            'parameter 1 is `options`, the declaration names it `config`',
          declared: ['made(config)'],
        },
        {
          line: 9,
          heading: 'parenthesized(x: string)',
          problem: 'parameter `x` has type `string`, the declaration `number`',
          declared: ['parenthesized(x: number): void'],
        },
      ],
    );
  });

  test('fails a heading that matches none of the overloads, naming each', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(
        ['over(command, options): boolean'],
        filesWith('src/index.mts'),
      ),
      [
        {
          line: 1,
          heading: 'over(command, options): boolean',
          problem:
            'matches none of the 2 overloads: parameter `options` is optional in the declaration, not in the heading; returns `boolean`, the declaration `number`',
          declared: [
            'over(command: string, options?: string): string',
            'over(command: string, options: number): number',
          ],
        },
      ],
    );
  });

  test('fails a type the declaration does not write, and a wrong `this`', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(
        [
          'inferred(label?: string)',
          'made(config): Promise<void>',
          'madeGeneric<T>(options)',
          'defaultFirst(a: number | undefined, b)',
          'bound(this: string, fn)',
          'f(this: Date, a, b?)',
        ],
        filesWith('src/index.mts'),
      ),
      [
        {
          line: 1,
          heading: 'inferred(label?: string)',
          problem:
            'parameter `label` has type `string`, the declaration gives none the check reads (it is inferred, read from a type, or that of a default before a required parameter)',
          declared: ['inferred(label?)'],
        },
        {
          line: 3,
          heading: 'made(config): Promise<void>',
          problem:
            'returns `Promise<void>`, the declaration gives none the check reads (it is inferred, or read from a type)',
          declared: ['made(config)'],
        },
        {
          line: 5,
          heading: 'madeGeneric<T>(options)',
          problem:
            'has type parameters `<T>`, the declaration gives none the check reads (it is inferred, or read from a type)',
          declared: ['madeGeneric({ value })'],
        },
        {
          line: 7,
          heading: 'defaultFirst(a: number | undefined, b)',
          problem:
            'parameter `a` has type `number | undefined`, the declaration gives none the check reads (it is inferred, read from a type, or that of a default before a required parameter)',
          declared: ['defaultFirst(a, b: number): number'],
        },
        {
          line: 9,
          heading: 'bound(this: string, fn)',
          problem: 'parameter `this` has type `string`, the declaration `Date`',
          declared: ['bound(this: Date, fn: () => void): void'],
        },
        {
          line: 11,
          heading: 'f(this: Date, a, b?)',
          problem: 'has a `this` parameter, the declaration none',
          declared: ['f(a: string, b?: number): Promise<void>'],
        },
      ],
    );
  });

  test('fails a heading that is not one function TypeScript can read', async () => {
    const mismatches = await mismatchesIn(
      ['k<A<B>>(x)', 'f(a, b?) {}', 'f<T>(a, b?'],
      filesWith('src/index.mts'),
    );

    const problems = mismatches.map(({ heading, problem }) => ({
      heading,
      unreadable: problem.startsWith('is not a signature TypeScript can read'),
    }));

    assert.deepStrictEqual(problems, [
      { heading: 'k<A<B>>(x)', unreadable: true },
      { heading: 'f(a, b?) {}', unreadable: true },
      { heading: 'f<T>(a, b?', unreadable: true },
    ]);
  });

  test('fails a function from another package or typed `any`, and a type', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(['made(x)', 'reexported(x)', 'F(x)', 'g(x)'], {
        'src/index.mts': dedent`
          import { make } from 'not-built-package';

          export { reexported } from 'other-package';

          export const made = make();

          export type F = (x: number) => void;

          export const g: any = (x: number) => x;
        `,
      }),
      [
        {
          line: 1,
          heading: 'made(x)',
          problem:
            'names an export whose type the check cannot read (it comes from another package, from a module that does not resolve or from re-exports that go round in a circle, or it is `any`): give the export a written signature in this package, or the heading no signature',
          declared: [],
        },
        {
          line: 3,
          heading: 'reexported(x)',
          problem:
            'names an export whose type the check cannot read (it comes from another package, from a module that does not resolve or from re-exports that go round in a circle, or it is `any`): give the export a written signature in this package, or the heading no signature',
          declared: [],
        },
        {
          line: 5,
          heading: 'F(x)',
          problem: 'names an export that is not declared as a function',
          declared: [],
        },
        {
          line: 7,
          heading: 'g(x)',
          problem:
            'names an export whose type the check cannot read (it comes from another package, from a module that does not resolve or from re-exports that go round in a circle, or it is `any`): give the export a written signature in this package, or the heading no signature',
          declared: [],
        },
      ],
    );
  });

  test('fails a function exported only as a type, and one that goes round in a circle', async () => {
    const mismatches = await mismatchesIn(
      [
        'viaImport(a, b?)',
        'viaInline(a, b?)',
        'withDefault(n?)',
        'f(a, b?)',
        'cycle(a)',
      ],
      {
        'src/index.mts': dedent`
          import type { f as viaImport } from './impl.mjs';

          export { viaImport };

          export { type f as viaInline } from './impl.mjs';

          export { cycle } from './cycle.mjs';

          export * from './middle.mjs';
        `,
        'src/middle.mts': "export type * from './impl.mjs';",
        'src/impl.mts': impl,
        'src/cycle.mts': "export { cycle } from './index.mjs';",
      },
    );

    assert.deepStrictEqual(
      mismatches.map(({ heading, problem }) => ({ heading, problem })),
      [
        {
          heading: 'viaImport(a, b?)',
          problem:
            'names an export that is type-only (`export type` or `import type` on its way), which a caller cannot call: export the value, or give the heading no signature',
        },
        {
          heading: 'viaInline(a, b?)',
          problem:
            'names an export that is type-only (`export type` or `import type` on its way), which a caller cannot call: export the value, or give the heading no signature',
        },
        {
          heading: 'withDefault(n?)',
          problem:
            'names an export that is type-only (`export type` or `import type` on its way), which a caller cannot call: export the value, or give the heading no signature',
        },
        {
          heading: 'f(a, b?)',
          problem:
            'names an export that is type-only (`export type` or `import type` on its way), which a caller cannot call: export the value, or give the heading no signature',
        },
        {
          heading: 'cycle(a)',
          problem:
            'names an export whose type the check cannot read (it comes from another package, from a module that does not resolve or from re-exports that go round in a circle, or it is `any`): give the export a written signature in this package, or the heading no signature',
        },
      ],
    );
  });

  test('fails a name the package does not export as a function', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(
        ['missing(a)', 'notAFunction()', 'f(a, b?', 'typeOnly(a, b?)'],
        filesWith('src/index.mts'),
      ),
      [
        {
          line: 1,
          heading: 'missing(a)',
          problem: 'names nothing src/index.mts exports',
          declared: [],
        },
        {
          line: 3,
          heading: 'notAFunction()',
          problem: 'names an export that is not declared as a function',
          declared: [],
        },
        {
          line: 5,
          heading: 'f(a, b?',
          problem: "is not a signature TypeScript can read: ',' expected.",
          declared: [],
        },
        {
          line: 7,
          heading: 'typeOnly(a, b?)',
          problem:
            'names an export that is type-only (`export type` or `import type` on its way), which a caller cannot call: export the value, or give the heading no signature',
          declared: [],
        },
      ],
    );
  });

  test('fails signature headings in a package with no entry point', async () => {
    assert.deepStrictEqual(
      await mismatchesIn(['f(a)'], { 'src/other.mts': impl }),
      [
        {
          line: 1,
          heading: 'f(a)',
          problem:
            'has no declaration to be read: the package has neither src/entry-point.mts nor src/index.mts',
          declared: [],
        },
      ],
    );
  });
});

describe(readReadme, () => {
  test('reads a missing README as none, and fails one it cannot read', async () => {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'check-readme-api-headings-read-'),
    );

    try {
      assert.deepStrictEqual(
        await readReadme(path.join(dir, 'README.md')),
        Result.ok(undefined),
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(path.join(dir, 'README.md'));

      const unreadable = await readReadme(path.join(dir, 'README.md'));

      assert.isTrue(Result.isErr(unreadable));

      assert.include(unreadable.value, 'Could not read');
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
