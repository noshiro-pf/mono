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

/**
 * Joins lines verbatim. `dedent` drops leading and trailing blank lines,
 * which is exactly what an expected output here is made of.
 */
const lines = (...xs: readonly string[]): string => xs.join('\n');

describe(stripDevOnlyCode, () => {
  test('removes an in-source test block and the imports only it used', () => {
    const source = dedent`
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
    `;

    assert.deepStrictEqual(
      strip(source),
      lines(
        '',
        '',
        'export const f = (x) => x;',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '// trailing comment',
      ),
    );
  });

  test('removes expectType statements and the block they emptied', () => {
    const source = dedent`
      import { expectType } from './expect-type.mjs';
      import { g } from './g.mjs';
      export const f = () => g();
      // --- expectType assertions ---
      {
        expectType('=');
        expectType('<=');
      }
      expectType('=');
    `;

    assert.deepStrictEqual(
      strip(source),
      lines(
        '',
        "import { g } from './g.mjs';",
        'export const f = () => g();',
        '',
        '',
        '',
        '',
        '',
        '',
      ),
    );
  });

  test('removes expectType inside a function body and keeps the rest', () => {
    const source = dedent`
      import { expectType } from 'ts-data-forge';
      export const f = async () => {
        const response = await fetch('x');
        expectType('=');
        return response;
      };
    `;

    assert.deepStrictEqual(
      strip(source),
      lines(
        '',
        'export const f = async () => {',
        "  const response = await fetch('x');",
        '',
        '  return response;',
        '};',
      ),
    );
  });

  test('removes a loop and an if whose bodies became empty', () => {
    const source = dedent`
      export const xs = [1, 2, 3];
      for (const x of xs) {
        expectType('=');
      }
      if (xs.length > 0) expectType('=');
      label: for (;;) {
        expectType('=');
      }
    `;

    assert.deepStrictEqual(
      strip(source),
      lines('export const xs = [1, 2, 3];', '', '', '', '', '', '', ''),
    );
  });

  test('keeps a body that was empty to begin with', () => {
    const source = dedent`
      export const drain = (it) => {
        for (const _ of it) {
        }
      };
    `;

    assert.deepStrictEqual(strip(source), source);
  });

  test('empties the then-branch but keeps an if that has an else', () => {
    const source = dedent`
      export const f = (c) => {
        if (c) {
          expectType('=');
        } else {
          console.log(c);
        }
      };
    `;

    assert.deepStrictEqual(
      strip(source),
      lines(
        'export const f = (c) => {',
        '  if (c) {',
        '',
        '  } else {',
        '    console.log(c);',
        '  }',
        '};',
      ),
    );
  });

  test('unwraps identity casts, keeping the parentheses only where needed', () => {
    const source = dedent`
      import { castDeepMutable, castMutable, Result } from 'ts-data-forge';
      export const f = (a, b) => castMutable(a ?? b).x;
      export const g = (xs) => Result.ok(castDeepMutable(xs));
      export const h = (o) => castMutable(o.p[0]).q;
      export const i = () => castMutable({ a: 1 });
      export const j = (a, b) => castMutable((a ?? b));
      export const k = () => castMutable(/* c */ [1, 2]);
    `;

    assert.deepStrictEqual(
      strip(source),
      lines(
        "import { Result } from 'ts-data-forge';",
        'export const f = (a, b) => (a ?? b).x;',
        'export const g = (xs) => Result.ok(xs);',
        'export const h = (o) => o.p[0].q;',
        'export const i = () => ({ a: 1 });',
        'export const j = (a, b) => (a ?? b);',
        'export const k = () => [1, 2];',
      ),
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

    assert.deepStrictEqual(strip(source), source);
  });

  test('prunes a middle and a last import specifier', () => {
    const source = dedent`
      import { a, expectType, b } from 'x';
      import { c, expectType as e } from 'y';
      import def, { castMutable } from 'z';
      export const f = () => [a, b, c, def];
    `;

    assert.deepStrictEqual(
      strip(source),
      lines(
        "import { a, b } from 'x';",
        "import { c } from 'y';",
        "import def from 'z';",
        'export const f = () => [a, b, c, def];',
      ),
    );
  });

  test('prunes a specifier from a multi-line import list', () => {
    const source = dedent`
      import {
        a,
        expectType,
        b,
      } from 'x';
      export const f = () => [a, b];
    `;

    assert.deepStrictEqual(
      strip(source),
      lines(
        'import {',
        '  a,',
        '',
        '  b,',
        "} from 'x';",
        'export const f = () => [a, b];',
      ),
    );
  });

  test('keeps a side-effect import and an import a property shorthand uses', () => {
    const source = dedent`
      import './polyfill.mjs';
      import { a } from 'x';
      export const o = { a };
    `;

    assert.deepStrictEqual(strip(source), source);
  });

  test('keeps the file header when the first statement is removed', () => {
    const source = dedent`
      // cspell:ignore foo
      expectType('=');
      export const x = 1;
    `;

    assert.deepStrictEqual(
      strip(source),
      lines('// cspell:ignore foo', '', 'export const x = 1;'),
    );
  });

  test('returns the input unchanged when nothing applies', () => {
    const source = dedent`
      export const x = 1;
    `;

    assert.deepStrictEqual(strip(source), source);
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

    assert.deepStrictEqual(result.value, lines('', '', 'export const y = 1;'));
  });

  test('keeps positions right in text with astral characters', () => {
    const source = dedent`
      import { expectType } from 'x';
      export const s = '😀';
      expectType('=');
    `;

    assert.deepStrictEqual(
      strip(source),
      lines('', "export const s = '😀';", ''),
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
