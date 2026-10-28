import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  compareOutputs,
  optsIntoStrictLib,
} from './check-dist-lib-replacement.mjs';

describe(optsIntoStrictLib, () => {
  test('accepts `true`', () => {
    assert.isTrue(
      optsIntoStrictLib(dedent`
        {
          "compilerOptions": {
            // A comment, since these files are JSONC.
            "libReplacement": true
          }
        }
      `),
    );
  });

  test('rejects `false`', () => {
    assert.isFalse(
      optsIntoStrictLib(dedent`
        {
          "compilerOptions": { "libReplacement": false }
        }
      `),
    );
  });

  test('rejects a commented-out `true`', () => {
    assert.isFalse(
      optsIntoStrictLib(dedent`
        {
          "compilerOptions": {
            // "libReplacement": true
          }
        }
      `),
    );
  });

  test('rejects a file without `compilerOptions`', () => {
    assert.isFalse(optsIntoStrictLib('{ "include": ["./src"] }'));
  });
});

describe(compareOutputs, () => {
  const mut_dirs: string[] = [];

  const makeDir = async (
    files: ReadonlyRecord<string, string>,
  ): Promise<string> => {
    const dir = await fs.mkdtemp(
      path.join(os.tmpdir(), 'check-dist-lib-replacement-test-'),
    );

    mut_dirs.push(dir);

    await Promise.all(
      Object.entries(files).map(async ([file, content]) => {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(path.dirname(path.join(dir, file)), {
          recursive: true,
        });

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(path.join(dir, file), content);
      }),
    );

    return dir;
  };

  afterEach(async () => {
    await Promise.all(
      mut_dirs
        .splice(0)
        .map((dir) => fs.rm(dir, { recursive: true, force: true })),
    );
  });

  test('reports nothing for identical trees', async () => {
    const files = {
      'index.mjs': 'export {};\n',
      'a/b.d.mts': 'export declare const b: string[];\n',
    } as const;

    assert.deepStrictEqual(
      await compareOutputs(await makeDir(files), await makeDir(files)),
      [],
    );
  });

  test('reports a file whose content differs, by its relative path', async () => {
    assert.deepStrictEqual(
      await compareOutputs(
        await makeDir({
          'a/b.d.mts': 'export declare const b: ("x" | (string & {}))[];\n',
        }),
        await makeDir({ 'a/b.d.mts': 'export declare const b: string[];\n' }),
      ),
      [{ file: path.join('a', 'b.d.mts'), kind: 'content' }],
    );
  });

  test('reports a file emitted on one side only', async () => {
    assert.deepStrictEqual(
      await compareOutputs(
        await makeDir({ 'a.mjs': '', 'b.mjs': '' }),
        await makeDir({ 'a.mjs': '', 'c.mjs': '' }),
      ),
      [
        { file: 'b.mjs', kind: 'strict-only' },
        { file: 'c.mjs', kind: 'stock-only' },
      ],
    );
  });
});
