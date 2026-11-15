import { createHash } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { splitViewExtensionId, splitViewPresencePath } from 'split-view-link';
import { Arr, hasKey, isRecord, isString } from 'ts-data-forge';

describe('splitViewPresencePath', () => {
  // `github-view-defaults-extension` fetches this file to tell whether Split
  // View is installed, and shows its "Split view" button only when it answers;
  // a manifest that stopped listing it would hide the button and fail nowhere
  // else.
  test('is listed for every extension to fetch, and is in the build', async () => {
    const manifest = await readManifest();

    const resources =
      isRecord(manifest) &&
      hasKey(manifest, 'web_accessible_resources') &&
      Arr.isArray(manifest.web_accessible_resources)
        ? manifest.web_accessible_resources
        : ([] as const);

    assert.isTrue(
      resources.some(
        (entry) =>
          isRecord(entry) &&
          hasKey(entry, 'resources') &&
          Arr.isArray(entry.resources) &&
          entry.resources.includes(splitViewPresencePath) &&
          hasKey(entry, 'extension_ids') &&
          Arr.isArray(entry.extension_ids) &&
          entry.extension_ids.includes('*'),
      ),
    );

    await fs.access(
      path.resolve(import.meta.dirname, '../public', splitViewPresencePath),
    );
  });
});

describe('splitViewExtensionId', () => {
  // The PR Manager links to `chrome-extension://<id>/split.html` with this id,
  // so a new `key` in the manifest would leave every link pointing at nothing
  // and fail nowhere else.
  test('is the id the manifest key gives an unpacked build', async () => {
    const manifest = await readManifest();

    const key =
      isRecord(manifest) && hasKey(manifest, 'key') && isString(manifest.key)
        ? manifest.key
        : '';

    assert.notStrictEqual(key, '');

    expect(extensionIdOfKey(key)).toBe(splitViewExtensionId);
  });
});

const readManifest = async (): Promise<unknown> =>
  JSON.parse(
    await fs.readFile(
      path.resolve(import.meta.dirname, '../public/manifest.json'),
      'utf8',
    ),
  );

/**
 * Chrome's id for an extension with this public key: the first 128 bits of the
 * key's SHA-256, each hex digit `0`–`f` written as `a`–`p`.
 */
const extensionIdOfKey = (key: string): string =>
  Array.from(
    createHash('sha256').update(key, 'base64').digest('hex').slice(0, 32),
    (digit) => String.fromCodePoint(0x61 + Number.parseInt(digit, 16)),
  ).join('');
