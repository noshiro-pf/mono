import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  digestMeasuredCode,
  readDependencyClosure,
} from './measured-inputs.mjs';

const writeManifest = (directory: string, manifest: unknown): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
  fs.mkdirSync(directory, { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
  fs.writeFileSync(
    path.join(directory, 'package.json'),
    JSON.stringify(manifest),
  );
};

/** Installs `name@version` in the store, with its manifest's other fields. */
const install = (
  root: string,
  name: string,
  version: string,
  fields: ReadonlyRecord<string, unknown>,
): string => {
  const directory = path.join(
    root,
    `node_modules/.pnpm/${name}@${version}/node_modules/${name}`,
  );

  writeManifest(directory, { name, version, ...fields });

  return directory;
};

/** Links `dependency` beside `dependent`, as pnpm does. */
const link = (dependent: string, name: string, dependency: string): void => {
  const at = path.join(path.dirname(dependent), name);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
  fs.symlinkSync(path.relative(path.dirname(at), dependency), at, 'dir');
};

/**
 * Two libraries laid out the way pnpm installs them:
 *
 * - `a` depends on `c`, on the types-only `t` and on `@types/x` (not installed),
 *   takes `react` as a peer, which only the hoisted store has, and the optional
 *   `o` (installed), `p` (listed in `dependencies` too, not installed), `n`
 *   (installed, for one operating system only, depending on `m`) and `q` (not
 *   installed for `a`, though the hoisted store has it).
 * - `c` depends on `d` 1.0.0; `e` depends on `d` 2.0.0, on `i`, which declares
 *   only `types` but ships an `index.js`, on `g`, whose `exports` name files
 *   with no extension, on `w`, which installs on every operating system but
 *   Windows, and on three CPUs, and on `b`, which it bundles in its own
 *   `node_modules`.
 */
const makeStore = (): Readonly<{
  root: string;
  libraries: readonly string[];
}> => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'measured-inputs-test-'));

  const a = install(root, 'a', '1.0.0', {
    main: './index.js',
    dependencies: {
      c: '^3.0.0',
      t: '^2.0.0',
      u: '^2.0.0',
      '@types/x': '^1.0.0',
      p: '^1.0.0',
    },
    optionalDependencies: {
      o: '^1.0.0',
      p: '^1.0.0',
      n: '^1.0.0',
      q: '^1.0.0',
    },
    peerDependencies: { react: '*' },
  });

  const o = install(root, 'o', '1.0.0', { main: './index.js' });

  const n = install(root, 'n', '1.0.0', {
    main: './index.js',
    os: ['linux'],
    dependencies: { m: '^1.0.0' },
  });

  const m = install(root, 'm', '1.0.0', {});

  const c = install(root, 'c', '3.0.0', {
    exports: './index.js',
    dependencies: { d: '^1.0.0' },
  });

  const t = install(root, 't', '2.0.0', { types: './index.d.ts' });

  const u = install(root, 'u', '2.0.0', {
    exports: {
      '.': { types: './index.d.ts' },
      './package.json': './package.json',
    },
  });

  const d1 = install(root, 'd', '1.0.0', { module: './index.mjs' });

  const d2 = install(root, 'd', '2.0.0', {});

  const e = install(root, 'e', '1.0.0', {
    dependencies: {
      d: '^2.0.0',
      i: '^1.0.0',
      w: '^1.0.0',
      b: '^4.0.0',
      g: '^1.0.0',
    },
  });

  const g = install(root, 'g', '1.0.0', { exports: { './*': './lib/*' } });

  const i = install(root, 'i', '1.0.0', { types: './index.d.ts' });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
  fs.writeFileSync(path.join(i, 'index.js'), '');

  const w = install(root, 'w', '1.0.0', {
    os: ['!win32'],
    cpu: ['x64', 'arm64', 'ia32'],
  });

  for (const name of ['react', 'q']) {
    writeManifest(path.join(root, `node_modules/.pnpm/node_modules/${name}`), {
      name,
      version: '19.0.0',
    });
  }

  link(a, 'c', c);

  link(a, 't', t);

  link(a, 'u', u);

  link(a, 'o', o);

  link(a, 'n', n);

  link(n, 'm', m);

  link(c, 'd', d1);

  link(e, 'd', d2);

  link(e, 'i', i);

  link(e, 'g', g);

  link(e, 'w', w);

  writeManifest(path.join(e, 'node_modules/b'), {
    name: 'b',
    version: '4.0.0',
  });

  return {
    root,
    libraries: [a, e].map((library) => path.join(library, 'package.json')),
  };
};

describe(readDependencyClosure, () => {
  test('records what the libraries run on, each version of a name joined', async () => {
    const { root, libraries } = makeStore();

    try {
      assert.deepStrictEqual(await readDependencyClosure(libraries), {
        b: '4.0.0',
        c: '3.0.0',
        d: '1.0.0, 2.0.0',
        g: '1.0.0',
        i: '1.0.0',
        o: '1.0.0',
        w: '1.0.0',
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on a dependency that is not installed', async () => {
    const { root, libraries } = makeStore();

    try {
      fs.rmSync(path.join(root, 'node_modules/.pnpm/c@3.0.0'), {
        recursive: true,
      });

      await expect(readDependencyClosure(libraries)).rejects.toThrow(
        /c does not resolve/u,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

const write = (root: string, file: string, text: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
  fs.writeFileSync(path.join(root, file), text);
};

/**
 * A directory whose entry `src/main.mts` calls `used` from `src/lib.mts`, which
 * also exports `unused`, and imports `src/harness.mts`, which the digest is
 * told to leave out, and the third-party `rxjs`, installed, beside a copy of
 * where `expectType` is declared.
 */
const makeProject = (): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'measured-code-test-'));

  write(
    root,
    'src/main.mts',
    dedent`
      import { of } from 'rxjs';
      import { record } from './harness.mjs';
      import { used } from './lib.mjs';

      record(used(of(1)));
    `,
  );

  write(
    root,
    'src/lib.mts',
    dedent`
      export const used = (x: unknown): unknown => [x];

      export const unused = (x: number): number => x * 2;
    `,
  );

  write(root, 'src/harness.mts', 'export const record = console.log;\n');

  writeManifest(path.join(root, 'node_modules/rxjs'), {
    name: 'rxjs',
    version: '7.0.0',
  });

  write(
    root,
    'libs/ts-std-forge/src/expect-type.mts',
    'export const expectType = <A, B>(_: string): void => undefined;\n',
  );

  return root;
};

const digestOf = (root: string): Promise<string> =>
  digestMeasuredCode(
    root,
    [path.join(root, 'src/main.mts')],
    new Set<string>(['src/harness.mts']),
  );

describe(digestMeasuredCode, () => {
  test.each([
    [
      'a comment and a type',
      'src/lib.mts',
      dedent`
        // A comment.
        type X = unknown;

        export const used = (x: X): X => [x];

        export const unused = (x: number): number => x * 2;
      `,
    ],
    [
      'a function nothing measured calls',
      'src/lib.mts',
      dedent`
        export const used = (x: unknown): unknown => [x];

        export const unused = (x: number): number => x * 3;
      `,
    ],
    [
      'the file it is told to leave out',
      'src/harness.mts',
      'export const record = console.info;\n',
    ],
    [
      'an in-source test and a type test',
      'src/lib.mts',
      dedent`
        import { expectType } from '../libs/ts-std-forge/src/expect-type.mjs';

        export const used = (x: unknown): unknown => [x];

        export const unused = (x: number): number => x * 2;

        expectType<number, number>('=');

        if (import.meta.vitest !== undefined) {
          console.log(used(1));
        }
      `,
    ],
  ] as const)('keeps its value over %s', async (_, file, text) => {
    const root = makeProject();

    try {
      const before = await digestOf(root);

      write(root, file, text);

      assert.strictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('keeps its value over CRLF line endings, inside a template literal too', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/lib.mts',
        'export const used = (x: unknown): unknown => [x, `\na\n`];\n',
      );

      const before = await digestOf(root);

      write(
        root,
        'src/lib.mts',
        'export const used = (x: unknown): unknown => [x, `\r\na\r\n`];\r\n',
      );

      assert.strictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('keeps its value over CRLF line endings in JavaScript', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        "import { view } from './view.jsx';\n\nconsole.log(view);\n",
      );

      write(root, 'src/view.jsx', 'export const view = <p title="a\nb" />;\n');

      const before = await digestOf(root);

      write(
        root,
        'src/view.jsx',
        'export const view = <p title="a\r\nb" />;\r\n',
      );

      assert.strictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('reads a `.jsx` import from its `.tsx` source', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        "import { view } from './view.jsx';\n\nconsole.log(view);\n",
      );

      write(root, 'src/view.tsx', 'export const view = <p title="a" />;\n');

      const before = await digestOf(root);

      write(root, 'src/view.tsx', 'export const view = <p title="b" />;\n');

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('changes with a change to what runs', async () => {
    const root = makeProject();

    try {
      const before = await digestOf(root);

      write(
        root,
        'src/lib.mts',
        dedent`
          export const used = (x: unknown): unknown => [x, x];

          export const unused = (x: number): number => x * 2;
        `,
      );

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('changes with code moved to another file', async () => {
    const root = makeProject();

    try {
      const before = await digestOf(root);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.renameSync(
        path.join(root, 'src/lib.mts'),
        path.join(root, 'src/moved.mts'),
      );

      write(
        root,
        'src/main.mts',
        dedent`
          import { of } from 'rxjs';
          import { record } from './harness.mjs';
          import { used } from './moved.mjs';

          record(used(of(1)));
        `,
      );

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('leaves out a directory named with a trailing slash', async () => {
    const root = makeProject();

    try {
      write(root, 'src/tooling/log.mts', 'export const log = console.log;\n');

      write(
        root,
        'src/main.mts',
        dedent`
          import { log } from './tooling/log.mjs';
          import { used } from './lib.mjs';

          log(used(1));
        `,
      );

      const digest = (): Promise<string> =>
        digestMeasuredCode(
          root,
          [path.join(root, 'src/main.mts')],
          new Set<string>(['src/tooling/']),
        );

      const before = await digest();

      write(root, 'src/tooling/log.mts', 'export const log = console.info;\n');

      assert.strictEqual(await digest(), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('follows a workspace package into the file its `exports` names', async () => {
    const root = makeProject();

    try {
      writeManifest(path.join(root, 'packages/ws'), {
        name: 'ws',
        version: '1.0.0',
        exports: './src/index.mts',
      });

      write(root, 'packages/ws/src/index.mts', 'export const ws = 1;\n');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.symlinkSync(
        '../packages/ws',
        path.join(root, 'node_modules/ws'),
        'dir',
      );

      write(
        root,
        'src/main.mts',
        "import { ws } from 'ws';\n\nconsole.log(ws);\n",
      );

      const before = await digestOf(root);

      write(root, 'packages/ws/src/index.mts', 'export const ws = 2;\n');

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('follows the first condition an import under Node.js matches', async () => {
    const root = makeProject();

    try {
      writeManifest(path.join(root, 'packages/ws'), {
        name: 'ws',
        version: '1.0.0',
        exports: {
          '.': {
            types: './src/types.d.mts',
            import: { node: './src/node.mts', default: './src/other.mts' },
          },
        },
      });

      write(root, 'packages/ws/src/node.mts', 'export const ws = 1;\n');

      write(root, 'packages/ws/src/other.mts', 'export const ws = 1;\n');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.symlinkSync(
        '../packages/ws',
        path.join(root, 'node_modules/ws'),
        'dir',
      );

      write(
        root,
        'src/main.mts',
        "import { ws } from 'ws';\n\nconsole.log(ws);\n",
      );

      const before = await digestOf(root);

      write(root, 'packages/ws/src/other.mts', 'export const ws = 2;\n');

      assert.strictEqual(await digestOf(root), before);

      write(root, 'packages/ws/src/node.mts', 'export const ws = 2;\n');

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('passes over a condition whose own conditions match none', async () => {
    const root = makeProject();

    try {
      writeManifest(path.join(root, 'packages/ws'), {
        name: 'ws',
        version: '1.0.0',
        exports: {
          '.': {
            node: { require: './src/other.mts' },
            'module-sync': './src/node.mts',
          },
        },
      });

      write(root, 'packages/ws/src/node.mts', 'export const ws = 1;\n');

      write(root, 'packages/ws/src/other.mts', 'export const ws = 1;\n');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.symlinkSync(
        '../packages/ws',
        path.join(root, 'node_modules/ws'),
        'dir',
      );

      write(
        root,
        'src/main.mts',
        "import { ws } from 'ws';\n\nconsole.log(ws);\n",
      );

      const before = await digestOf(root);

      write(root, 'packages/ws/src/node.mts', 'export const ws = 2;\n');

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('takes the first entry of a fallback array that resolves', async () => {
    const root = makeProject();

    try {
      writeManifest(path.join(root, 'packages/ws'), {
        name: 'ws',
        version: '1.0.0',
        exports: {
          '.': [{ require: './src/other.mts' }, './src/node.mts'],
        },
      });

      write(root, 'packages/ws/src/node.mts', 'export const ws = 1;\n');

      write(root, 'packages/ws/src/other.mts', 'export const ws = 1;\n');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.symlinkSync(
        '../packages/ws',
        path.join(root, 'node_modules/ws'),
        'dir',
      );

      write(
        root,
        'src/main.mts',
        "import { ws } from 'ws';\n\nconsole.log(ws);\n",
      );

      const before = await digestOf(root);

      write(root, 'packages/ws/src/node.mts', 'export const ws = 2;\n');

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('stops at a null in a fallback array, as not exported', async () => {
    const root = makeProject();

    try {
      writeManifest(path.join(root, 'packages/ws'), {
        name: 'ws',
        version: '1.0.0',
        exports: { '.': [null, './src/node.mts'] },
      });

      write(root, 'packages/ws/src/node.mts', 'export const ws = 1;\n');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.mkdirSync(path.join(root, 'node_modules'), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.symlinkSync(
        '../packages/ws',
        path.join(root, 'node_modules/ws'),
        'dir',
      );

      write(
        root,
        'src/main.mts',
        "import { ws } from 'ws';\n\nconsole.log(ws);\n",
      );

      await expect(digestOf(root)).rejects.toThrow(/names no export/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on a package that does not resolve', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        "import { x } from 'undeclared';\n\nconsole.log(x);\n",
      );

      await expect(digestOf(root)).rejects.toThrow(
        /undeclared, imported by .* does not resolve/u,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('reads a built-in module named without its prefix as one', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        "import { readFileSync } from 'fs';\n\nconsole.log(readFileSync);\n",
      );

      await expect(digestOf(root)).resolves.toMatch(/^[\da-f]{16}$/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on a `node:` module this Node.js does not have', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        "import { x } from 'node:nothing';\n\nconsole.log(x);\n",
      );

      await expect(digestOf(root)).rejects.toThrow(/is no built-in module/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on a subpath import', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        "import { x } from '#x';\n\nconsole.log(x);\n",
      );

      await expect(digestOf(root)).rejects.toThrow(/is a subpath import/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on a declaration of expectType elsewhere', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/expect-type.mts',
        'export const expectType = (): void => undefined;\n',
      );

      write(
        root,
        'src/main.mts',
        "import { expectType } from './expect-type.mjs';\n\nexpectType();\n",
      );

      await expect(digestOf(root)).rejects.toThrow(
        /update EXPECT_TYPE_SOURCE/u,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('passes a comment that quotes a declaration of expectType', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        '/**\n * export const expectType = ...\n */\nconsole.log(1);\n',
      );

      await expect(digestOf(root)).resolves.toMatch(/^[\da-f]{16}$/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on an import of a file that is not there', async () => {
    const root = makeProject();

    try {
      fs.rmSync(path.join(root, 'src/lib.mts'));

      await expect(digestOf(root)).rejects.toThrow(/lib\.mjs, imported by/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('reads a JavaScript file named by the import over its source', async () => {
    const root = makeProject();

    try {
      write(root, 'src/lib.mjs', 'export const used = (x) => x + 1;\n');

      const before = await digestOf(root);

      write(root, 'src/lib.mjs', 'export const used = (x) => x + 2;\n');

      assert.notStrictEqual(await digestOf(root), before);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on an import of a directory, naming the importer', async () => {
    const root = makeProject();

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.mkdirSync(path.join(root, 'src/dir'));

      write(root, 'src/main.mts', "import './dir';\n");

      await expect(digestOf(root)).rejects.toThrow(/dir, imported by/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('passes a string that reads like the lazy-load helper', async () => {
    const root = makeProject();

    try {
      write(root, 'src/main.mts', "console.log('var __esm = 1');\n");

      await expect(digestOf(root)).resolves.toMatch(/^[\da-f]{16}$/u);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('fails on a module of the repository loaded lazily', async () => {
    const root = makeProject();

    try {
      write(
        root,
        'src/main.mts',
        dedent`
          const { used } = await import('./lib.mjs');

          console.log(used(1));
        `,
      );

      await expect(digestOf(root)).rejects.toThrow(
        /^src\/main\.mts loads code of the repository lazily/u,
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('digests a root reached through a symbolic link as the root itself', async () => {
    const root = makeProject();

    const linkedRoot = `${root}-link` as const;

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under the test's own temporary directory
      fs.symlinkSync(root, linkedRoot);

      assert.strictEqual(await digestOf(linkedRoot), await digestOf(root));
    } finally {
      fs.rmSync(linkedRoot, { force: true });

      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
