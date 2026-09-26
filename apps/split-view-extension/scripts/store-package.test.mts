import { hasKey } from 'ts-data-forge';
import { storeManifestOf } from './store-package.mjs';

describe('storeManifestOf', () => {
  const built = {
    manifest_version: 3,
    name: 'Split View',
    version: '0.3.0',
    key: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA',
    permissions: ['storage'],
    web_accessible_resources: [
      {
        resources: ['split.html'],
        matches: ['https://noshiro-pf.github.io/*', 'http://localhost:5194/*'],
      },
    ],
  } as const;

  test('takes the key off and hands it back', () => {
    const { manifest, key } = storeManifestOf(built);

    assert.isFalse(hasKey(manifest, 'key'));

    assert.strictEqual(key, built.key);
  });

  test('takes the web-accessible resources off, which only the pinned id can use', () => {
    const { manifest } = storeManifestOf(built);

    assert.isFalse(hasKey(manifest, 'web_accessible_resources'));
  });

  test('leaves everything else as the build wrote it', () => {
    const { manifest } = storeManifestOf(built);

    assert.deepStrictEqual(manifest, {
      manifest_version: 3,
      name: 'Split View',
      version: '0.3.0',
      permissions: ['storage'],
    });
  });

  test('refuses a build with no key, which pins the unpacked id', () => {
    const { key: _, ...withoutKey } = built;

    assert.throws(
      () => storeManifestOf(withoutKey),
      /No `key` in the manifest/u,
    );
  });
});
