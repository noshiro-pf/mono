import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import {
  stripDevOnlyCode,
  stripDevOnlyCodeInDir,
} from './strip-dev-only-code.mjs';

const strip = (source: string): string => {
  const result = stripDevOnlyCode(source, 'file.mjs');

  assert.isTrue(Result.isOk(result));

  return result.value;
};

const lineCount = (text: string): number => text.split('\n').length;

/** Removes the blank lines at both ends, which `dedent` does not produce. */
const trimBlankLines = (text: string): string =>
  text.replace(/^\n+/u, '').replace(/\n+$/u, '');

/**
 * Strips `source`, checks that the line count is unchanged, and returns the
 * result without the blank lines at either end. Those lines stand where
 * removed code was, and a `dedent` literal cannot express them, so a test
 * compares what is left against a `dedent` literal.
 */
const stripKeepingLines = (source: string): string => {
  const stripped = strip(source);

  assert.deepStrictEqual(lineCount(stripped), lineCount(source));

  return trimBlankLines(stripped);
};

describe(stripDevOnlyCode, () => {
  test('removes an in-source test block and the imports only it used', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          import { source } from './source.mjs';
          import { withInitialValue } from './with-initial-value.mjs';
          export const f = (x) => x;
          if (import.meta.vitest !== undefined) {
            test('type test', () => {
              expect(1).toBe(1);
            });
            {
              const s = source();
              const _d = s.pipe(withInitialValue(0));
            }
          }
          // trailing comment
        `,
      ),
      dedent`
        export const f = (x) => x;









        // trailing comment
      `,
    );
  });

  test('removes expectType statements and the block they emptied', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          import { expectType } from './expect-type.mjs';
          import { g } from './g.mjs';
          export const f = () => g();
          // --- expectType assertions ---
          {
            expectType('=');
            expectType('<=');
          }
          expectType('=');
        `,
      ),
      dedent`
        import { g } from './g.mjs';
        export const f = () => g();
      `,
    );
  });

  test('removes expectType inside a function body and keeps the rest', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          import { expectType } from 'ts-data-forge';
          export const f = async () => {
            const response = await fetch('x');
            expectType('=');
            return response;
          };
        `,
      ),
      dedent`
        export const f = async () => {
          const response = await fetch('x');

          return response;
        };
      `,
    );
  });

  test('removes a loop and an if whose bodies became empty', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          export const xs = [1, 2, 3];
          for (const x of xs) {
            expectType('=');
          }
          if (xs.length > 0) expectType('=');
          label: for (;;) {
            expectType('=');
          }
        `,
      ),
      dedent`
        export const xs = [1, 2, 3];
      `,
    );
  });

  test('keeps a body that was empty to begin with', () => {
    const source = dedent`
      export const drain = (it) => {
        for (const _ of it) {
        }
      };
    `;

    assert.deepStrictEqual(stripKeepingLines(source), source);
  });

  test('empties the then-branch but keeps an if that has an else', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          export const f = (c) => {
            if (c) {
              expectType('=');
            } else {
              console.log(c);
            }
          };
        `,
      ),
      dedent`
        export const f = (c) => {
          if (c) {

          } else {
            console.log(c);
          }
        };
      `,
    );
  });

  test('unwraps identity casts, keeping the parentheses only where needed', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          import { castDeepMutable, castMutable, Result } from 'ts-data-forge';
          export const f = (a, b) => castMutable(a ?? b).x;
          export const g = (xs) => Result.ok(castDeepMutable(xs));
          export const h = (o) => castMutable(o.p[0]).q;
          export const i = () => castMutable({ a: 1 });
          export const j = (a, b) => castMutable((a ?? b));
          export const k = () => castMutable(/* c */ [1, 2]);
        `,
      ),
      dedent`
        import { Result } from 'ts-data-forge';
        export const f = (a, b) => (a ?? b).x;
        export const g = (xs) => Result.ok(xs);
        export const h = (o) => o.p[0].q;
        export const i = () => ({ a: 1 });
        export const j = (a, b) => (a ?? b);
        export const k = () => [1, 2];
      `,
    );
  });

  test('leaves a member call, an optional call and a two-argument call alone', () => {
    const source = dedent`
      import { castMutable } from 'ts-data-forge';
      export const a = (ns, x) => ns.castMutable(x);
      export const b = (x) => castMutable?.(x);
      export const c = (x, y) => castMutable(x, y);
      export const d = (xs) => xs.map(castMutable);
    `;

    assert.deepStrictEqual(stripKeepingLines(source), source);
  });

  test('prunes a middle and a last import specifier', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          import { a, expectType, b } from 'x';
          import { c, expectType as e } from 'y';
          import def, { castMutable } from 'z';
          export const f = () => [a, b, c, def];
        `,
      ),
      dedent`
        import { a, b } from 'x';
        import { c } from 'y';
        import def from 'z';
        export const f = () => [a, b, c, def];
      `,
    );
  });

  test('prunes a specifier from a multi-line import list', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          import {
            a,
            expectType,
            b,
          } from 'x';
          export const f = () => [a, b];
        `,
      ),
      dedent`
        import {
          a,

          b,
        } from 'x';
        export const f = () => [a, b];
      `,
    );
  });

  test('keeps a side-effect import and an import a property shorthand uses', () => {
    const source = dedent`
      import './polyfill.mjs';
      import { a } from 'x';
      export const o = { a };
    `;

    assert.deepStrictEqual(stripKeepingLines(source), source);
  });

  test('keeps the file header when the first statement is removed', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          // cspell:ignore foo
          expectType('=');
          export const x = 1;
        `,
      ),
      dedent`
        // cspell:ignore foo

        export const x = 1;
      `,
    );
  });

  test('returns the input unchanged when nothing applies', () => {
    const source = dedent`
      export const x = 1;
    `;

    assert.deepStrictEqual(strip(source), source);
  });

  test('keeps every line break, so the source map stays valid by line', () => {
    assert.deepStrictEqual(
      strip(
        dedent`
          import { expectType } from 'x';
          export const a = 1;
          expectType('=');
          export const b = 2;
        `,
      ),
      ['', 'export const a = 1;', '', 'export const b = 2;'].join('\n'),
    );
  });

  test('fails on a removable call that is not a statement', () => {
    const result = stripDevOnlyCode(
      dedent`
        export const f = () => expectType('=');
      `,
      'file.mjs',
    );

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      result.value,
      'file.mjs:1:24: a call to `expectType` is not a statement on its own and cannot be removed',
    );
  });

  test('fails on import.meta.vitest outside the guard', () => {
    const result = stripDevOnlyCode(
      dedent`
        export const isTest = import.meta.vitest !== undefined;
      `,
      'file.mjs',
    );

    assert.isTrue(Result.isErr(result));

    assert.deepStrictEqual(
      result.value,
      'file.mjs:1:23: `import.meta.vitest` is used outside an `if (import.meta.vitest !== undefined) { ... }` guard',
    );
  });

  test('honours the option lists', () => {
    const result = stripDevOnlyCode(
      dedent`
        import { assertType, id } from 'x';
        assertType('=');
        export const y = id(1);
      `,
      'file.mjs',
      { removeCallStatements: ['assertType'], unwrapIdentityCalls: ['id'] },
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(
      trimBlankLines(result.value),
      dedent`
        export const y = 1;
      `,
    );
  });

  test('keeps positions right in text with astral characters', () => {
    assert.deepStrictEqual(
      stripKeepingLines(
        dedent`
          import { expectType } from 'x';
          export const s = '😀';
          expectType('=');
        `,
      ),
      dedent`
        export const s = '😀';
      `,
    );
  });
});

describe(stripDevOnlyCodeInDir, () => {
  const withTestDir = async (
    run: (testDir: string) => Promise<void>,
  ): Promise<void> => {
    const dir = path.join(
      process.cwd(),
      `test-strip-dev-only-code-${crypto.randomUUID()}`,
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(path.join(dir, 'nested'), { recursive: true });

    try {
      await run(dir);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
  };

  const writeTestFile = (filePath: string, content: string): Promise<void> =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFile(filePath, content);

  const readTestFile = (filePath: string): Promise<string> =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(filePath, 'utf8');

  test('rewrites the files that change and counts them', async () => {
    await withTestDir(async (testDir) => {
      await writeTestFile(
        path.join(testDir, 'a.mjs'),
        "import { expectType } from 'x';\nexpectType('=');\n",
      );

      await writeTestFile(
        path.join(testDir, 'nested', 'b.mjs'),
        'export const b = 1;\n',
      );

      const result = await stripDevOnlyCodeInDir(testDir);

      assert.isTrue(Result.isOk(result));

      assert.deepStrictEqual(result.value, { changedFiles: 1 });

      assert.deepStrictEqual(
        await readTestFile(path.join(testDir, 'a.mjs')),
        '\n\n',
      );

      assert.deepStrictEqual(
        await readTestFile(path.join(testDir, 'nested', 'b.mjs')),
        'export const b = 1;\n',
      );
    });
  });

  test('reports the file that cannot be stripped', async () => {
    await withTestDir(async (testDir) => {
      await writeTestFile(
        path.join(testDir, 'nested', 'bad.mjs'),
        "export const f = () => expectType('=');\n",
      );

      const result = await stripDevOnlyCodeInDir(testDir);

      assert.isTrue(Result.isErr(result));

      assert.deepStrictEqual(
        result.value,
        'nested/bad.mjs:1:24: a call to `expectType` is not a statement on its own and cannot be removed',
      );
    });
  });
});
