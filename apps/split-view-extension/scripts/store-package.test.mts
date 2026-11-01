import * as fs from 'node:fs';
import * as path from 'node:path';
import { hasKey, isRecord } from 'ts-data-forge';
import type { UnknownRecord } from 'ts-type-forge';
// eslint-disable-next-line import-x/no-relative-packages, import-x/no-internal-modules -- tools/ is not a package; this is how apps reach its shared scripts
import { storeManifestOf } from '../../../tools/configs/chrome-extension-packaging.mjs';
import { storePackageOptions } from './store-package.mjs';
import { workspaceRootPath } from './workspace-root-path.mjs';

const readManifest = (): UnknownRecord => {
  const source: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- this package's own manifest
    fs.readFileSync(
      path.resolve(workspaceRootPath, 'public/manifest.json'),
      'utf8',
    ),
  );

  assert.isTrue(isRecord(source));

  return source;
};

describe('storePackageOptions on public/manifest.json', () => {
  test('the manifest pins the unpacked id and opens split.html to links', () => {
    const manifest = readManifest();

    assert.isTrue(hasKey(manifest, 'key'));

    assert.isTrue(hasKey(manifest, 'web_accessible_resources'));
  });

  test('the store package has neither the key nor the web-accessible resources', () => {
    const manifest = readManifest();

    const { key: pinned } = manifest;

    const { manifest: forStore, key } = storeManifestOf(
      manifest,
      storePackageOptions,
    );

    assert.isFalse(hasKey(forStore, 'key'));

    assert.isFalse(hasKey(forStore, 'web_accessible_resources'));

    assert.strictEqual(key, pinned);
  });

  test('everything else is left as it is', () => {
    const manifest = readManifest();

    const { manifest: forStore } = storeManifestOf(
      manifest,
      storePackageOptions,
    );

    assert.deepStrictEqual(
      Object.keys(forStore).toSorted(),
      Object.keys(manifest)
        .filter(
          (field) => field !== 'key' && field !== 'web_accessible_resources',
        )
        .toSorted(),
    );
  });
});
