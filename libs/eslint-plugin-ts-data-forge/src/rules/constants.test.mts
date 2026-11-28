import { RuleTester } from '@typescript-eslint/rule-tester';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { hasKey, isRecord } from 'ts-data-forge';
import { NAMESPACE_SUBPATHS } from './constants.mjs';

test('every rule test also runs importing the shared exports from the other package', () => {
  // `configs/module-parity.setup.mts`, a Vitest setup file, marks the patched
  // class with this key (`installedMark` in
  // `tools/configs/eslint-rule-module-parity.mts`).
  const prototype: unknown = RuleTester.prototype;

  assert.isTrue(
    isRecord(prototype) &&
      hasKey(prototype, Symbol.for('eslint-rule-module-parity.installed')),
  );
});

test('every namespace subpath is a module ts-data-forge exports, holding the export', async () => {
  // Read from the installed package, by file: this package's tests map
  // \`ts-data-forge\` to its source entry, which has no subpaths.
  const installed = path.join(
    import.meta.dirname,
    '../../node_modules/ts-data-forge',
  );

  const manifest: unknown = JSON.parse(
    await fs.readFile(path.join(installed, 'package.json'), 'utf8'),
  );

  const exportsMap =
    isRecord(manifest) &&
    hasKey(manifest, 'exports') &&
    isRecord(manifest.exports)
      ? manifest.exports
      : ({} as const);

  const root: unknown = await import('ts-data-forge');

  for (const { exportName, moduleName } of NAMESPACE_SUBPATHS) {
    const entry = exportsMap[`.${moduleName.slice('ts-data-forge'.length)}`];

    const declared =
      isRecord(entry) && isRecord(entry['import'])
        ? entry['import']['default']
        : undefined;

    const file = typeof declared === 'string' ? declared : '';

    assert.isNotEmpty(file);

    // eslint-disable-next-line no-await-in-loop -- two subpaths, one after the other
    const subpath: unknown = await import(
      pathToFileURL(path.join(installed, file)).href
    );

    const whole = isRecord(root) ? root[exportName] : undefined;

    // Each entry is read as \`import * as <exportName> from '<moduleName>'\`:
    // the subpath must be the export, function for function.
    assert.deepStrictEqual(
      Object.keys(isRecord(subpath) ? subpath : {}).toSorted(),
      Object.keys(isRecord(whole) ? whole : {}).toSorted(),
    );
  }
});
