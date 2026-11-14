import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { moduleReader, readLintImports, resolveModule } from './packages.mjs';

describe('readLintImports', () => {
  const modules = new Map<string, readonly string[]>([
    [
      '/repo/pkg/eslint.config.mts',
      [
        'eslint-config-typed',
        './configs/rules.mjs',
        '../../shared.mjs',
        './configs/more.mjs',
        '#configs/subpath',
        './configs/unresolved.mjs',
      ],
    ],
    ['/repo/pkg/configs/rules.mts', ['@sumi-lang/cli/configs', 'node:path']],
    ['/shared.mjs', ['eslint-plugin-x', './repo/pkg/eslint.config.mts']],
    // A second module importing it, read once.
    ['/repo/pkg/configs/more.mts', ['../../../shared.mjs']],
    ['/repo/pkg/other.mts', ['not-a-config']],
  ]);

  // Stands in for TypeScript's resolution: what `modules` holds, a `.mjs` as
  // its `.mts` first.
  const resolve = (specifier: string, importer: string): string | undefined => {
    const resolved = path.posix.resolve(
      path.posix.dirname(toFixturePath(importer)),
      specifier,
    );

    return [resolved.replace(/\.mjs$/u, '.mts'), resolved].find((file) =>
      modules.has(file),
    );
  };

  test('follows the modules a config reaches, each read once', async () => {
    const mut_reads: string[] = [];

    const readModule = (
      file: string,
    ): Promise<readonly string[] | undefined> => {
      const posix = toFixturePath(file);

      mut_reads.push(posix);

      return Promise.resolve(modules.get(posix));
    };

    assert.deepStrictEqual(
      Array.from(
        await readLintImports(
          '/repo/pkg',
          ['eslint.config.mts', 'other.mts', 'package.json'],
          { readModule, resolve },
        ),
      ),
      ['eslint-config-typed', '@sumi-lang/cli', 'eslint-plugin-x'],
    );

    const distinct = new Set(mut_reads);

    assert.strictEqual(distinct.size, mut_reads.length);
  });
});

describe('readLintImports with the real resolution and reader', () => {
  test('two members share one read of a module both configs reach', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'lint-imports-'));

    try {
      const files = [
        ['a/eslint.config.mts', "import '../shared/rules.mjs';"],
        ['b/eslint.config.mts', "export * from '../shared/rules.mjs';"],
        ['shared/rules.mts', "import plugin from 'eslint-plugin-x';"],
      ] as const;

      for (const [file, source] of files) {
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixture in a fresh temporary directory
        await fs.mkdir(path.dirname(path.join(root, file)), {
          recursive: true,
        });

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixture in a fresh temporary directory
        await fs.writeFile(path.join(root, file), source);
      }

      const mut_reads: string[] = [];

      const readModule = moduleReader((file) => {
        mut_reads.push(path.relative(root, file));

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixture in a fresh temporary directory
        return fs.readFile(file, 'utf8');
      });

      for (const member of ['a', 'b'] as const) {
        assert.deepStrictEqual(
          Array.from(
            await readLintImports(
              path.join(root, member),
              ['eslint.config.mts'],
              { readModule, resolve: resolveModule },
            ),
          ),
          ['eslint-plugin-x'],
        );
      }

      assert.deepStrictEqual(
        mut_reads.map((file) => file.split(path.sep).join('/')),
        ['a/eslint.config.mts', 'shared/rules.mts', 'b/eslint.config.mts'],
      );
    } finally {
      await fs.rm(root, { recursive: true });
    }
  });
});

describe('resolveModule', () => {
  test('resolves a .mjs to the .mts it is built from', async () => {
    assert.strictEqual(
      await resolveIn(['rules.mts'], './rules.mjs'),
      'rules.mts',
    );
  });

  test('resolves a .mjs to itself, not to a .d.mts beside it', async () => {
    assert.strictEqual(
      await resolveIn(['typed.mjs', 'typed.d.mts'], './typed.mjs'),
      'typed.mjs',
    );
  });

  test('resolves a .jsx to itself, not to a .d.ts beside it', async () => {
    assert.strictEqual(
      await resolveIn(['v.jsx', 'v.d.ts'], './v.jsx'),
      'v.jsx',
    );
  });

  test('a .d.mts named is no module that runs', async () => {
    assert.isUndefined(await resolveIn(['types.d.mts'], './types.d.mts'));
  });

  test.each([
    [['rules.mts'], './rules.mts'],
    [['plain.mjs'], './plain.mjs'],
  ] as const)('%j, %s resolves to itself', async (files, specifier) => {
    assert.strictEqual(await resolveIn(files, specifier), files[0]);
  });

  test('resolves a .js to the .tsx it is built from', async () => {
    assert.strictEqual(await resolveIn(['view.tsx'], './view.js'), 'view.tsx');
  });

  test.each([
    [['data.json'], './data.json'],
    [['typed.d.mts'], './typed.mjs'],
    [[], './missing.mjs'],
  ] as const)('%j, %s is no module that runs', async (files, specifier) => {
    assert.isUndefined(await resolveIn(files, specifier));
  });
});

describe('moduleReader', () => {
  test('a file gone is no module file', async () => {
    assert.isUndefined(
      await moduleReader(async () => failWith('ENOENT'))('/m'),
    );
  });

  test('another read error fails', async () => {
    await expect(
      moduleReader(async () => failWith('EACCES'))('/m'),
    ).rejects.toThrow('EACCES');
  });

  test('reads each file once', async () => {
    const mut_reads: string[] = [];

    const readModule = moduleReader((file) => {
      mut_reads.push(file);

      return Promise.resolve("import { a } from 'a';");
    });

    assert.deepStrictEqual(await readModule('/m'), ['a']);

    assert.deepStrictEqual(await readModule('/m'), ['a']);

    assert.deepStrictEqual(mut_reads, ['/m']);
  });

  test('callers at once share one read', async () => {
    const mut_reads: string[] = [];

    const readModule = moduleReader((file) => {
      mut_reads.push(file);

      return Promise.resolve("import { a } from 'a';");
    });

    await Promise.all([readModule('/m'), readModule('/m')]);

    assert.deepStrictEqual(mut_reads, ['/m']);
  });

  test('parses JSX in a .tsx module', async () => {
    const readModule = moduleReader(() =>
      Promise.resolve(dedent`
        const view = <div>{'<'}</div>;
        export const load = async () => import('eslint-plugin-jsx');
      `),
    );

    assert.deepStrictEqual(await readModule('/view.tsx'), [
      'eslint-plugin-jsx',
    ]);
  });
});

const failWith = (code: string): Promise<string> =>
  Promise.reject(Object.assign(new Error(code), { code }));

/** Where `resolveModule` takes `specifier`, among `files` in a new directory. */
const resolveIn = async (
  files: readonly string[],
  specifier: string,
): Promise<string | undefined> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'resolve-module-'));

  try {
    await Promise.all(
      files.map(async (file) =>
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixture in a fresh temporary directory
        fs.writeFile(path.join(dir, file), ''),
      ),
    );

    const resolved = resolveModule(
      specifier,
      path.join(dir, 'eslint.config.mts'),
    );

    return resolved === undefined ? undefined : path.relative(dir, resolved);
  } finally {
    await fs.rm(dir, { recursive: true });
  }
};

/** A path as the fixtures name it: `/` separators, no Windows drive. */
const toFixturePath = (file: string): string =>
  file
    .split(path.sep)
    .join('/')
    .replace(/^[a-z]:/iu, '');
