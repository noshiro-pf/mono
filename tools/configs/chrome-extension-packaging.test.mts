import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { hasKey } from 'ts-data-forge';
import {
  packExtensionCrx,
  stageForStore,
  storeManifestOf,
  type ExtensionPackageOptions,
} from './chrome-extension-packaging.mjs';

const splitPolicy = {
  requireManifestKey: true,
  stripManifestKeys: ['web_accessible_resources'],
} as const;

const optionalPolicy = {
  requireManifestKey: false,
  stripManifestKeys: [],
} as const;

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
    const { manifest, key } = storeManifestOf(built, splitPolicy);

    assert.isFalse(hasKey(manifest, 'key'));

    assert.strictEqual(key, built.key);
  });

  test('takes the web-accessible resources off, which only the pinned id can use', () => {
    const { manifest } = storeManifestOf(built, splitPolicy);

    assert.isFalse(hasKey(manifest, 'web_accessible_resources'));
  });

  test('leaves everything else as the build wrote it', () => {
    const { manifest } = storeManifestOf(built, splitPolicy);

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
      () => storeManifestOf(withoutKey, splitPolicy),
      /No `key` in the manifest/u,
    );
  });
});

describe('storeManifestOf with an optional unpacked id', () => {
  test('accepts no key and preserves web-accessible resources', () => {
    const manifest = {
      version: '1.2.3',
      web_accessible_resources: [
        { resources: ['x.js'], matches: ['https://example.com/*'] },
      ],
    } as const;

    assert.deepStrictEqual(storeManifestOf(manifest, optionalPolicy), {
      manifest,
      key: undefined,
    });
  });

  test('removes and returns an optional key', () => {
    assert.deepStrictEqual(
      storeManifestOf({ version: '1.2.3', key: 'public-key' }, optionalPolicy),
      { manifest: { version: '1.2.3' }, key: 'public-key' },
    );
  });

  test.each([splitPolicy, optionalPolicy])(
    'rejects a non-string key with policy %j',
    (policy) => {
      assert.throws(
        () => storeManifestOf({ version: '1.2.3', key: 123 }, policy),
        /not a string/u,
      );
    },
  );
});

/* eslint-disable security/detect-non-literal-fs-filename -- paths here are fixtures under the test's own temporary directory */
describe('stageForStore', () => {
  test('refreshes staging without maps and preserves the build and other packages', () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), 'extension-package-test-'),
    );

    try {
      fs.mkdirSync(path.join(root, 'dist/nested'), { recursive: true });

      fs.mkdirSync(path.join(root, 'pack/unpacked'), { recursive: true });

      fs.writeFileSync(
        path.join(root, 'dist/manifest.json'),
        JSON.stringify({
          version: '1.2.3',
          key: 'public-key',
          web_accessible_resources: [],
        }),
      );

      fs.writeFileSync(
        path.join(root, 'dist/nested/script.js'),
        'console.log(1);',
      );

      fs.writeFileSync(path.join(root, 'dist/nested/script.js.map'), '{}');

      fs.writeFileSync(path.join(root, 'pack/unpacked/stale.js'), 'stale');

      fs.writeFileSync(path.join(root, 'pack/previous.zip'), 'keep');

      const options = {
        packageRoot: root,
        packageName: 'fixture',
        ...splitPolicy,
        signingKeyPassEnv: 'FIXTURE_SIGNING_KEY_PASS',
        defaultPassEntry: 'fixture',
      } as const satisfies ExtensionPackageOptions;

      assert.deepStrictEqual(stageForStore(options), {
        version: '1.2.3',
        manifestKey: 'public-key',
        removedFields: ['key', 'web_accessible_resources'],
      });

      assert.strictEqual(
        fs.readFileSync(path.join(root, 'pack/unpacked/manifest.json'), 'utf8'),
        '{\n  "version": "1.2.3"\n}\n',
      );

      assert.strictEqual(
        fs.readFileSync(
          path.join(root, 'pack/unpacked/nested/script.js'),
          'utf8',
        ),
        'console.log(1);',
      );

      assert.isFalse(
        fs.existsSync(path.join(root, 'pack/unpacked/nested/script.js.map')),
      );

      assert.isFalse(fs.existsSync(path.join(root, 'pack/unpacked/stale.js')));

      assert.isTrue(
        fs.existsSync(path.join(root, 'dist/nested/script.js.map')),
      );

      assert.include(
        fs.readFileSync(path.join(root, 'dist/manifest.json'), 'utf8'),
        'public-key',
      );

      assert.strictEqual(
        fs.readFileSync(path.join(root, 'pack/previous.zip'), 'utf8'),
        'keep',
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('reports nothing removed from a manifest that pins no id', () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), 'extension-package-test-'),
    );

    try {
      fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

      fs.writeFileSync(
        path.join(root, 'dist/manifest.json'),
        JSON.stringify({ version: '1.2.3', web_accessible_resources: [] }),
      );

      assert.deepStrictEqual(
        stageForStore({
          packageRoot: root,
          packageName: 'fixture',
          ...optionalPolicy,
          signingKeyPassEnv: 'FIXTURE_SIGNING_KEY_PASS',
          defaultPassEntry: 'fixture',
        }),
        { version: '1.2.3', manifestKey: undefined, removedFields: [] },
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('leaves the previous staging copy alone when the manifest is refused', () => {
    const root = fs.mkdtempSync(
      path.join(os.tmpdir(), 'extension-package-test-'),
    );

    try {
      fs.mkdirSync(path.join(root, 'dist'), { recursive: true });

      fs.mkdirSync(path.join(root, 'pack/unpacked'), { recursive: true });

      fs.writeFileSync(
        path.join(root, 'dist/manifest.json'),
        JSON.stringify({ version: '1.2.4', key: 123 }),
      );

      fs.writeFileSync(
        path.join(root, 'pack/unpacked/manifest.json'),
        '{"version":"1.2.3"}',
      );

      assert.throws(
        () =>
          stageForStore({
            packageRoot: root,
            packageName: 'fixture',
            ...optionalPolicy,
            signingKeyPassEnv: 'FIXTURE_SIGNING_KEY_PASS',
            defaultPassEntry: 'fixture',
          }),
        /not a string/u,
      );

      assert.strictEqual(
        fs.readFileSync(path.join(root, 'pack/unpacked/manifest.json'), 'utf8'),
        '{"version":"1.2.3"}',
      );
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test('names the build command when no build exists', () => {
    assert.throws(
      () =>
        stageForStore({
          packageRoot: '/missing-extension-build',
          packageName: 'fixture',
          ...optionalPolicy,
          signingKeyPassEnv: 'FIXTURE_SIGNING_KEY_PASS',
          defaultPassEntry: 'fixture',
        }),
      /pnpm run build/u,
    );
  });
});

/* eslint-enable security/detect-non-literal-fs-filename */

describe('packExtensionCrx', () => {
  test('names the browser install command before reading any signing key', async () => {
    await expect(
      packExtensionCrx(
        {
          packageRoot: '/missing-extension-build',
          packageName: 'fixture',
          ...optionalPolicy,
          signingKeyPassEnv: 'FIXTURE_SIGNING_KEY_PASS',
          defaultPassEntry: 'fixture',
        },
        '/missing-playwright-chromium',
      ),
    ).rejects.toThrow(/pnpm exec playwright install chromium/u);
  });

  test('checks the build before reading any signing key', async () => {
    await expect(
      packExtensionCrx(
        {
          packageRoot: '/missing-extension-build',
          packageName: 'fixture',
          ...optionalPolicy,
          // An entry that does not exist: reaching `pass` would fail differently.
          signingKeyPassEnv: 'FIXTURE_SIGNING_KEY_PASS',
          defaultPassEntry: 'fixture-entry-that-does-not-exist',
        },
        // Any file that exists stands in for the browser here.
        process.execPath,
      ),
    ).rejects.toThrow(/pnpm run build/u);
  });
});
