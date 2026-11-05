import { createHash } from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { splitViewExtensionId } from 'split-view-link';
import { hasKey, isRecord, isString } from 'ts-data-forge';

describe('splitViewExtensionId', () => {
  // The PR Manager links to `chrome-extension://<id>/split.html` with this id,
  // so a new `key` in the manifest would leave every link pointing at nothing
  // and fail nowhere else.
  test('is the id the manifest key gives an unpacked build', async () => {
    const manifest: unknown = JSON.parse(
      await fs.readFile(
        path.resolve(import.meta.dirname, '../public/manifest.json'),
        'utf8',
      ),
    );

    const key =
      isRecord(manifest) && hasKey(manifest, 'key') && isString(manifest.key)
        ? manifest.key
        : '';

    assert.notStrictEqual(key, '');

    expect(extensionIdOfKey(key)).toBe(splitViewExtensionId);
  });
});

/**
 * Chrome's id for an extension with this public key: the first 128 bits of the
 * key's SHA-256, each hex digit `0`–`f` written as `a`–`p`.
 */
const extensionIdOfKey = (key: string): string =>
  Array.from(
    createHash('sha256').update(key, 'base64').digest('hex').slice(0, 32),
    (digit) => String.fromCodePoint(0x61 + Number.parseInt(digit, 16)),
  ).join('');
