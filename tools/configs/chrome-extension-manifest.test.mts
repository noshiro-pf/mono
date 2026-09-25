import { manifestWithVersion } from './chrome-extension-manifest.mjs';

describe('manifestWithVersion', () => {
  const manifest = {
    manifest_version: 3,
    name: 'An extension',
  } as const;

  test('writes the version into a manifest that has none', () => {
    assert.deepStrictEqual(manifestWithVersion(manifest, '0.4.0'), {
      ...manifest,
      version: '0.4.0',
    });
  });

  test.each(['1', '1.2', '1.2.3', '1.2.3.4', '0.0.0', '65535.0.10'])(
    'accepts %s, which Chrome accepts',
    (version) => {
      assert.deepStrictEqual(
        manifestWithVersion(manifest, version)['version'],
        version,
      );
    },
  );

  test.each([
    ['a prerelease', '1.2.3-next.0'],
    ['build metadata', '1.2.3+abc'],
    ['five parts', '1.2.3.4.5'],
    ['a leading zero', '1.02.3'],
    ['a part above 65535', '1.65536.0'],
    ['nothing', ''],
  ])('rejects %s, which Chrome refuses to load', (_name, version) => {
    assert.throws(() => manifestWithVersion(manifest, version), /version/u);
  });

  test('rejects a package.json version that is not a string', () => {
    assert.throws(() => manifestWithVersion(manifest, undefined), /version/u);
  });

  test('rejects a manifest that declares a version of its own', () => {
    // Two sources would drift: the one changesets bumps, and the one a
    // person remembers to edit.
    assert.throws(
      () => manifestWithVersion({ ...manifest, version: '0.3.0' }, '0.4.0'),
      /package\.json/u,
    );
  });

  test('rejects a manifest that is not an object', () => {
    assert.throws(() => manifestWithVersion([], '0.4.0'), /manifest/u);
  });
});
