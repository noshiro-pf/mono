/* eslint-disable tree-shakable/import-star */
/* eslint-disable vitest/expect-expect */
import dedent from 'dedent';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import * as prettierPluginTypeScript from 'prettier/plugins/typescript';
import * as prettier from 'prettier/standalone';
import * as tsm from 'ts-morph';
import { enableNoUncheckedIndexedAccessTransformer } from './enable-no-unchecked-indexed-access.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

/**
 * Declarations every case is prefixed with, so that each `source` can be a
 * single expression statement. `declare const` keeps them free of index
 * accesses of their own.
 *
 * `console` is among them because {@link project} loads only the libraries
 * these cases need, and the one that declares `console` is not one of them.
 */
const preamble = dedent`
  declare const console: { log: (...args: readonly unknown[]) => void };
  declare const xs: readonly number[];
  declare const mut_ys: number[];
  declare const pair: readonly [number, number];
  declare const rest: readonly [number, number, ...(readonly number[])];
  declare const known: { readonly a: number };
  declare const rec: Record<string, number>;
  declare const loose: { readonly a: number; readonly [k: string]: number };
  declare const nested: Record<string, readonly number[]>;
  declare const sparse: readonly (number | undefined)[];
  declare const fns: readonly ((x: number) => void)[];
  declare const ctors: readonly (new () => object)[];
  declare const str: string;
  declare const i: number;
  declare const k: string;
`;

const testFn = async ({
  source,
  expected,
  options,
  debug,
}: Readonly<{
  source: string;
  expected: string;
  options?: Parameters<typeof enableNoUncheckedIndexedAccessTransformer>[0];
  debug?: boolean;
}>): Promise<void> => {
  if (debug !== true) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
  }

  const transformed = await formatter(
    transformInProject(`${preamble}\n\n${source}`, { ...options, debug }),
  );

  const expectedFormatted = await formatter(`${preamble}\n\n${expected}`);

  expect(transformed).toBe(expectedFormatted);
};

/**
 * Runs the transformer over `code` in {@link project}, and returns what it
 * made of it.
 */
const transformInProject = (
  code: string,
  options?: Parameters<typeof enableNoUncheckedIndexedAccessTransformer>[0],
): string => {
  const sourceAst = project.createSourceFile('source.ts', code, {
    overwrite: true,
  });

  enableNoUncheckedIndexedAccessTransformer(options).transform(sourceAst);

  return sourceAst.getFullText();
};

/**
 * The one project every case is checked in, rather than one project per case.
 *
 * `transformSourceCode` builds a project per call, and this transformer checks
 * the file twice — once with `noUncheckedIndexedAccess` on and once with it
 * off. A case that went through it therefore paid for the whole default
 * library, `lib.esnext.full.d.ts` with the DOM inside it, being parsed and
 * checked from scratch: ~300 ms a case, of which the file under test was a
 * fraction of a millisecond. Sixty of those took `test:cov` past Vitest's
 * timeout on CI.
 *
 * Reusing the project is half of the answer and the smaller half — measured,
 * it takes a case from ~300 ms to ~260 ms, because what an edit invalidates is
 * the program, not the parsed library behind it. Naming the libraries the
 * cases actually need is the rest: together they bring a case to ~25 ms.
 *
 * What that leaves out — `transformSourceCode` itself, and the transformer
 * against the full library — is what the tests at the bottom of this file
 * still cover.
 */
const project = new tsm.Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    target: tsm.ts.ScriptTarget.ESNext,
    module: tsm.ts.ModuleKind.ESNext,
    // `es2015` rather than `es5` for `Symbol.iterator`, which the spread and
    // `for-of` cases need at this target.
    lib: ['lib.es2015.d.ts'],
  },
});

const formatter = (code: string): Promise<string> =>
  prettier.format(code, {
    parser: 'typescript',
    plugins: [prettierPluginTypeScript, prettierPluginEstree],
  });

describe(enableNoUncheckedIndexedAccessTransformer, () => {
  describe('accesses the option widens with undefined', () => {
    test.each([
      {
        name: 'array with a literal index',
        source: 'console.log(xs[0].toFixed());',
        expected: 'console.log(xs[0]!.toFixed());',
      },
      {
        name: 'array with a computed index',
        source: 'console.log(xs[i] + 1);',
        expected: 'console.log(xs[i]! + 1);',
      },
      {
        name: 'index signature record',
        source: "console.log(rec['a'].toFixed());",
        expected: "console.log(rec['a']!.toFixed());",
      },
      {
        name: 'index signature record with a computed key',
        source: 'console.log(rec[k].toFixed());',
        expected: 'console.log(rec[k]!.toFixed());',
      },
      {
        name: 'dotted read of an index signature',
        source: 'console.log(rec.a.toFixed());',
        expected: 'console.log(rec.a!.toFixed());',
      },
      {
        name: 'dotted read of an undeclared key of a type with an index signature',
        source: 'console.log(loose.b.toFixed());',
        expected: 'console.log(loose.b!.toFixed());',
      },
      {
        name: 'string index',
        source: 'console.log(str[0].charCodeAt(0));',
        expected: 'console.log(str[0]!.charCodeAt(0));',
      },
      {
        name: 'tuple index past its fixed part',
        source: 'console.log(rest[9].toFixed());',
        expected: 'console.log(rest[9]!.toFixed());',
      },
      {
        name: 'chained accesses are asserted at every step',
        source: "console.log(nested['k'][0].toFixed());",
        expected: "console.log(nested['k']![0]!.toFixed());",
      },
      {
        name: 'callee position',
        source: 'fns[0](1);',
        expected: 'fns[0]!(1);',
      },
      {
        name: 'constructor position',
        source: 'console.log(new ctors[0]());',
        expected: 'console.log(new ctors[0]!());',
      },
      {
        name: 'spread element',
        source: "console.log(...nested['k']);",
        expected: "console.log(...nested['k']!);",
      },
      {
        name: 'for-of iterable',
        source: "for (const v of nested['k']) { console.log(v); }",
        expected: "for (const v of nested['k']!) { console.log(v); }",
      },
      {
        name: 'unary minus operand',
        source: 'console.log(-xs[0]);',
        expected: 'console.log(-xs[0]!);',
      },
      {
        name: 'index argument of another access',
        source: 'console.log(rec[String(xs[0])].toFixed());',
        expected: 'console.log(rec[String(xs[0]!)]!.toFixed());',
      },
      {
        name: 'initializer of an untyped const, where the error surfaces later',
        source: dedent`
          const head = xs[0];
          console.log(head.toFixed());
        `,
        expected: dedent`
          const head = xs[0]!;
          console.log(head.toFixed());
        `,
      },
    ])('$name', testFn);
  });

  describe('indices whose presence the type guarantees', () => {
    test.each([
      {
        name: 'tuple index within its length',
        source: 'console.log(pair[1].toFixed());',
        expected: 'console.log(pair[1].toFixed());',
      },
      {
        name: 'fixed part of a tuple with a rest element',
        source: 'console.log(rest[1].toFixed());',
        expected: 'console.log(rest[1].toFixed());',
      },
      {
        name: 'declared property of an object without an index signature',
        source: "console.log(known['a'].toFixed());",
        expected: "console.log(known['a'].toFixed());",
      },
      {
        name: 'declared property of a type that also has an index signature',
        source: 'console.log(loose.a.toFixed());',
        expected: 'console.log(loose.a.toFixed());',
      },
      {
        name: 'ordinary property access',
        source: 'console.log(known.a.toFixed());',
        expected: 'console.log(known.a.toFixed());',
      },
      {
        name: 'element type that already contained undefined',
        source: 'console.log(sparse[0]?.toFixed());',
        expected: 'console.log(sparse[0]?.toFixed());',
      },
      {
        name: 'access already narrowed by a guard',
        source: dedent`
          if (xs[0] !== undefined) {
            console.log(xs[0].toFixed());
          }
        `,
        expected: dedent`
          if (xs[0] !== undefined) {
            console.log(xs[0].toFixed());
          }
        `,
      },
      {
        name: 'value of unresolvable type',
        source: dedent`
          import { imported } from './other.mjs';

          console.log(imported[0].toFixed());
        `,
        expected: dedent`
          import { imported } from './other.mjs';

          console.log(imported[0].toFixed());
        `,
      },
    ])('$name', testFn);
  });

  describe('positions that cannot take an assertion', () => {
    test.each([
      {
        name: 'assignment target',
        source: 'mut_ys[0] = 1;',
        expected: 'mut_ys[0] = 1;',
      },
      {
        name: 'compound assignment target',
        source: 'mut_ys[0] += 1;',
        expected: 'mut_ys[0] += 1;',
      },
      {
        name: 'logical assignment target',
        source: 'mut_ys[0] ??= 1;',
        expected: 'mut_ys[0] ??= 1;',
      },
      {
        name: 'increment target',
        source: 'mut_ys[0]++;',
        expected: 'mut_ys[0]++;',
      },
      {
        name: 'decrement target',
        source: '--mut_ys[0];',
        expected: '--mut_ys[0];',
      },
      {
        name: 'delete target',
        source: "delete rec['a'];",
        expected: "delete rec['a'];",
      },
      {
        name: 'dotted delete target',
        source: 'delete rec.a;',
        expected: 'delete rec.a;',
      },
      {
        name: 'destructuring assignment target',
        source: '[mut_ys[0]] = [1];',
        expected: '[mut_ys[0]] = [1];',
      },
      {
        name: 'for-of loop target',
        source: 'for (mut_ys[0] of xs) { break; }',
        expected: 'for (mut_ys[0] of xs) { break; }',
      },
    ])('$name', testFn);
  });

  describe('positions that already account for undefined', () => {
    test.each([
      {
        name: 'existing non-null assertion',
        source: 'console.log(xs[0]!.toFixed());',
        expected: 'console.log(xs[0]!.toFixed());',
      },
      {
        name: 'type assertion',
        source: 'console.log((xs[0] as number).toFixed());',
        expected: 'console.log((xs[0] as number).toFixed());',
      },
      {
        name: 'optional property access',
        source: 'console.log(xs[0]?.toFixed());',
        expected: 'console.log(xs[0]?.toFixed());',
      },
      {
        name: 'property access further along an optional chain',
        source: 'console.log(nested?.k[0]);',
        expected: 'console.log(nested?.k[0]);',
      },
      {
        name: 'optional call',
        source: 'fns[0]?.(1);',
        expected: 'fns[0]?.(1);',
      },
      {
        name: 'nullish coalescing',
        source: 'console.log(xs[0] ?? 0);',
        expected: 'console.log(xs[0] ?? 0);',
      },
      {
        name: 'logical and',
        source: 'console.log(xs[0] && 1);',
        expected: 'console.log(xs[0] && 1);',
      },
      {
        name: 'typeof',
        source: 'console.log(typeof xs[0]);',
        expected: 'console.log(typeof xs[0]);',
      },
      {
        name: 'equality against undefined',
        source: 'console.log(xs[0] === undefined);',
        expected: 'console.log(xs[0] === undefined);',
      },
      {
        name: 'if condition',
        source: 'if (xs[0]) { console.log(1); }',
        expected: 'if (xs[0]) { console.log(1); }',
      },
      {
        name: 'while condition',
        source: 'while (xs[0]) { break; }',
        expected: 'while (xs[0]) { break; }',
      },
      {
        name: 'negation',
        source: 'console.log(!xs[0]);',
        expected: 'console.log(!xs[0]);',
      },
      {
        name: 'switch subject, where an asserted subject would reject `case undefined`',
        source: 'switch (xs[0]) { case undefined: break; default: break; }',
        expected: 'switch (xs[0]) { case undefined: break; default: break; }',
      },
      {
        name: 'ternary condition',
        source: 'console.log(xs[0] ? 1 : 2);',
        expected: 'console.log(xs[0] ? 1 : 2);',
      },
    ])('$name', testFn);
  });

  describe('applyLevel: "avoidWhereUndefinedIsAllowed"', () => {
    test.each([
      {
        name: 'skips an annotation that accepts undefined',
        source: 'const a: number | undefined = xs[0];',
        expected: 'const a: number | undefined = xs[0];',
        options: { applyLevel: 'avoidWhereUndefinedIsAllowed' },
      },
      {
        name: 'keeps an annotation that does not',
        source: 'const a: number = xs[0];',
        expected: 'const a: number = xs[0]!;',
        options: { applyLevel: 'avoidWhereUndefinedIsAllowed' },
      },
      {
        name: 'keeps a position with no contextual type',
        source: 'console.log(xs[0].toFixed());',
        expected: 'console.log(xs[0]!.toFixed());',
        options: { applyLevel: 'avoidWhereUndefinedIsAllowed' },
      },
      {
        name: 'the default level asserts even where undefined is allowed',
        source: 'const a: number | undefined = xs[0];',
        expected: 'const a: number | undefined = xs[0]!;',
      },
    ] as const)('$name', testFn);
  });

  describe('ignore comments', () => {
    test.each([
      {
        name: 'transformer-ignore-next-line above the statement',
        source: dedent`
          // transformer-ignore-next-line
          console.log(xs[0].toFixed());
        `,
        expected: dedent`
          // transformer-ignore-next-line
          console.log(xs[0].toFixed());
        `,
      },
      {
        name: 'transformer-ignore-next-line naming this transformer',
        source: dedent`
          // transformer-ignore-next-line enable-no-unchecked-indexed-access
          console.log(xs[0].toFixed());
        `,
        expected: dedent`
          // transformer-ignore-next-line enable-no-unchecked-indexed-access
          console.log(xs[0].toFixed());
        `,
      },
      {
        name: 'transformer-ignore-next-line naming a different transformer',
        source: dedent`
          // transformer-ignore-next-line append-as-const
          console.log(xs[0].toFixed());
        `,
        expected: dedent`
          // transformer-ignore-next-line append-as-const
          console.log(xs[0]!.toFixed());
        `,
      },
    ])('$name', testFn);
  });

  test('a file-level transformer-ignore comment skips the file', () => {
    const source = dedent`
      /* transformer-ignore */
      declare const xs: readonly number[];

      console.log(xs[0].toFixed());
    `;

    expect(
      transformSourceCode(source, false, [
        enableNoUncheckedIndexedAccessTransformer(),
      ]),
    ).toBe(source);
  });

  test('the surrounding formatting is left byte-for-byte alone', () => {
    const source = [
      'declare const xs: readonly number[];',
      '',
      'const   value   =    xs[ 0 ]  .  toFixed( ) ; // trailing comment',
      '',
      '/* a block comment */',
      'console.log(value);',
      '',
    ].join('\n');

    expect(
      transformSourceCode(source, false, [
        enableNoUncheckedIndexedAccessTransformer(),
      ]),
    ).toBe(source.replace('xs[ 0 ]', 'xs[ 0 ]!'));
  });

  test('JSX files are transformed as well', () => {
    const source = dedent`
      declare const xs: readonly (readonly number[])[];

      export const C = (): JSX.Element => <div>{xs[0].length}</div>;
    `;

    expect(
      transformSourceCode(source, true, [
        enableNoUncheckedIndexedAccessTransformer(),
      ]),
    ).toBe(source.replace('xs[0]', 'xs[0]!'));
  });

  test('the errors the option introduces are gone from the result', () => {
    const source = dedent`
      declare const console: { log: (...args: readonly unknown[]) => void };

      const parseRoute = (path: string): string => {
        const parts = path.split('/');

        const head = parts[0];

        return head.toUpperCase() + parts[parts.length - 1].toLowerCase();
      };

      const counts: Record<string, number> = {};

      const bump = (key: string): void => {
        counts[key] = (counts[key] ?? 0) + 1;
      };

      const table: readonly (readonly string[])[] = [['a']];

      const cell = (r: number, c: number): string => table[r][c];

      const pair: readonly [number, number] = [1, 2];

      const sum = pair[0] + pair[1];

      console.log(parseRoute, bump, cell, sum);
    `;

    expect(diagnosticsUnderTheOption(source).length).toBeGreaterThan(0);

    assert.deepStrictEqual(
      diagnosticsUnderTheOption(transformInProject(source)),
      [],
    );
  });

  test('array destructuring is left alone, since `!` has nowhere to go there', () => {
    const source = dedent`
      declare const xs: readonly number[];

      const [head] = xs;

      console.log(head);
    `;

    expect(
      transformSourceCode(source, false, [
        enableNoUncheckedIndexedAccessTransformer(),
      ]),
    ).toBe(source);
  });

  test('the compiler options it overrides are restored afterwards', () => {
    const mut_seen: {
      noUncheckedIndexedAccess: boolean | undefined;
      strictNullChecks: boolean | undefined;
    }[] = [];

    transformSourceCode(
      'declare const xs: readonly number[];\nconsole.log(xs[0]);\n',
      false,
      [
        enableNoUncheckedIndexedAccessTransformer(),
        {
          name: 'record-compiler-options',
          transform: (sourceAst) => {
            const compilerOptions = sourceAst.getProject().getCompilerOptions();

            mut_seen.push({
              noUncheckedIndexedAccess:
                compilerOptions.noUncheckedIndexedAccess,
              strictNullChecks: compilerOptions.strictNullChecks,
            });
          },
        },
      ],
    );

    assert.deepStrictEqual(mut_seen, [
      { noUncheckedIndexedAccess: undefined, strictNullChecks: undefined },
    ]);
  });
});

/** The compiler's own verdict on the code, with the option this transformer prepares for turned on. */
const diagnosticsUnderTheOption = (code: string): readonly string[] =>
  diagnosticsProject
    .createSourceFile('source.ts', code, { overwrite: true })
    .getPreEmitDiagnostics()
    .map((diagnostic) => diagnostic.getMessageText())
    .map((messageText) =>
      typeof messageText === 'string'
        ? messageText
        : messageText.getMessageText(),
    );

/**
 * A second project, because {@link project} has to start with the option off,
 * and reused for the reason that one is. `getPreEmitDiagnostics` checks the
 * whole program rather than one expression, so the library it is pointed at
 * costs more here than anywhere else in this file.
 */
const diagnosticsProject = new tsm.Project({
  useInMemoryFileSystem: true,
  compilerOptions: {
    target: tsm.ts.ScriptTarget.ESNext,
    module: tsm.ts.ModuleKind.ESNext,
    lib: ['lib.es2015.d.ts'],
    strict: true,
    noUncheckedIndexedAccess: true,
  },
});
