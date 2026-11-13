import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';
import { build, parseSync } from 'vite';
import {
  defineViteAppConfig,
  recoveryScript,
  staleBuildRecovery,
  unwrappedDynamicImports,
  writeRouteEntryPages,
} from './vite-app-config.mjs';

/** A build output directory holding `index.html`, removed once `fn` returns. */
const withBuild = (fn: (outDir: string) => void): void => {
  const buildDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vite-app-config-'));

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path.join(buildDir, 'index.html'), '<!doctype html>');

    fn(buildDir);
  } finally {
    fs.rmSync(buildDir, { recursive: true, force: true });
  }
};

describe(writeRouteEntryPages, () => {
  test('writes the page at each route, nested ones included', () => {
    withBuild((outDir) => {
      writeRouteEntryPages(outDir, ['/create/', '/plan/edit/']);

      for (const route of ['create', 'plan/edit']) {
        assert.strictEqual(
          // eslint-disable-next-line security/detect-non-literal-fs-filename
          fs.readFileSync(path.join(outDir, route, 'index.html'), 'utf8'),
          '<!doctype html>',
        );
      }
    });
  });

  test('rejects a route that is not a directory below the root', () => {
    withBuild((outDir) => {
      for (const route of ['/', '/create', 'create/', '/../up/']) {
        assert.throws(() => {
          writeRouteEntryPages(outDir, [route]);
        }, /route/u);
      }
    });
  });

  test('fails when the build wrote no index.html', () => {
    withBuild((outDir) => {
      fs.rmSync(path.join(outDir, 'index.html'));

      assert.throws(() => {
        writeRouteEntryPages(outDir, ['/create/']);
      });
    });
  });
});

/** A one-page app in a directory of its own, removed once `fn` settles. */
const withApp = async (
  main: string,
  fn: (appRoot: string) => Promise<void>,
): Promise<void> => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vite-app-config-app-'));

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(path.join(root, 'src'));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      path.join(root, 'index.html'),
      '<!doctype html><html><head></head><body><script type="module" src="/src/main.js"></script></body></html>',
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(path.join(root, 'src', 'main.js'), main);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      path.join(root, 'src', 'later.js'),
      'export const later = 1;\n',
    );

    await fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

/**
 * Builds the app at `root` with the recovery, and gives the built `index.html`,
 * the entry chunk (the one module script it names) and the recovery script.
 */
const buildApp = async (
  root: string,
): Promise<Readonly<{ html: string; entry: string; recovery: string }>> => {
  await build({
    root,
    base: '/mono/app/',
    logLevel: 'silent',
    configFile: false,
    build: { outDir: path.join(root, 'build'), emptyOutDir: true },
    plugins: [staleBuildRecovery()],
  });

  const read = (file: string): string =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(path.join(root, 'build', file), 'utf8');

  const html = read('index.html');

  const scripts = Array.from(
    html.matchAll(
      /<script type="module" crossorigin src="\/mono\/app\/([^"]+)"/gu,
    ),
    (match) => match[1],
  );

  assert.strictEqual(scripts.length, 1);

  const [entry] = scripts;

  assert.isDefined(entry);

  return {
    html,
    entry: read(entry),
    recovery: read('stale-build-recovery.js'),
  };
};

/** The names of the plugins `config` lists directly. */
const pluginNames = (
  config: Readonly<{ plugins?: readonly unknown[] }>,
): readonly unknown[] =>
  (config.plugins ?? []).map((plugin) =>
    isRecord(plugin) && hasKey(plugin, 'name') ? plugin.name : undefined,
  );

describe(staleBuildRecovery, () => {
  test('loads the recovery first, as a classic script outside the hashed graph', async () => {
    await withApp(
      "console.log('app');\nawait import('./later.js');\n",
      async (root) => {
        const { html, entry, recovery } = await buildApp(root);

        const loaded = html.indexOf(
          '<script src="/mono/app/stale-build-recovery.js"></script>',
        );

        expect(loaded).toBeGreaterThanOrEqual(0);

        expect(loaded).toBeLessThan(html.indexOf('<script type="module"'));

        assert.include(recovery, 'stale-build-reloaded-at:/mono/app/');

        assert.include(recovery, 'vite:preloadError');

        assert.notInclude(entry, 'stale-build-reloaded-at');
      },
    );
  });

  test('fails the build on an import() the recovery does not see', async () => {
    await withApp(
      'const name = location.hash;\nawait import(/* @vite-ignore */ name);\n',
      async (root) => {
        await expect(buildApp(root)).rejects.toThrow(
          /does not wrap these import\(\) calls/u,
        );
      },
    );
  });

  test('is added to every app, on Pages or at the root of its own host', () => {
    const packageRoot = path.resolve(
      import.meta.dirname,
      '../../apps/catan-dice',
    );

    for (const config of [
      defineViteAppConfig({
        packageRoot,
        framework: 'preact',
        base: '/mono/catan-dice/',
      }),
      defineViteAppConfig({ packageRoot, framework: 'preact' }),
    ]) {
      assert.include(
        pluginNames(config),
        'vite-app-config:stale-build-recovery',
      );
    }
  });
});

describe(recoveryScript, () => {
  test('is a classic script that installs the recovery under its key', async () => {
    const script = await recoveryScript('stale-build-reloaded-at:/');

    // A module's `export` or `import` would not parse as a classic script.
    const { errors } = parseSync('recovery.js', script, {
      sourceType: 'script',
    });

    assert.deepStrictEqual(errors, []);

    assert.include(script, '"stale-build-reloaded-at:/"');

    assert.include(script, 'addEventListener("error"');
  });
});

describe(unwrappedDynamicImports, () => {
  test('passes an import() wrapped by the preload helper', () => {
    assert.deepStrictEqual(
      unwrappedDynamicImports(
        'const a = await e(() => import(`./a-x1.js`), __vite__mapDeps([0, 1]));',
      ),
      [],
    );
  });

  test('passes one the helper wraps with its destructuring', () => {
    assert.deepStrictEqual(
      unwrappedDynamicImports(
        'const { f } = await xa(async () => { let { f: e } = await import(`./f-x1.js`); return { f: e }; }, []);',
      ),
      [],
    );
  });

  test('passes one whose module the helper is given converted', () => {
    assert.deepStrictEqual(
      unwrappedDynamicImports(
        'await Up(() => import(`./elk-x1.js`).then((t) => t.default), void 0);',
      ),
      [],
    );
  });

  test('reports a bare import()', () => {
    assert.deepStrictEqual(
      unwrappedDynamicImports('const a = await import(`./a-x1.js`);'),
      ['import(`./a-x1.js`)'],
    );
  });

  test('reports one whose specifier is computed', () => {
    assert.deepStrictEqual(
      unwrappedDynamicImports(
        'const a = await e(() => import(name), __vite__mapDeps([0]));',
      ),
      ['import(name)'],
    );
  });

  test('reports one in a function that is not handed to a helper', () => {
    assert.deepStrictEqual(
      unwrappedDynamicImports(
        'const load = () => import(`./a-x1.js`); obj.run(() => import(`./b-x1.js`), []);',
      ),
      ['import(`./a-x1.js`)', 'import(`./b-x1.js`)'],
    );
  });
});
