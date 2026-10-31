import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import {
  installReleaseBinary,
  parseReleaseBinaryPins,
  platformKey,
  type ReleaseBinaryPin,
} from './release-binaries.mjs';

const mut_tempDirs: string[] = [];

const newTempDir = (prefix: string): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));

  mut_tempDirs.push(dir);

  return dir;
};

afterAll(() => {
  for (const dir of mut_tempDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

/** A `.tar.gz` holding `tool-v1.2.3/tool`, as a release would. */
const makeArchive = (): Uint8Array => {
  const dir = newTempDir('release-binary-src-');

  const inner = path.join(dir, 'tool-v1.2.3');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.mkdirSync(inner);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(path.join(inner, 'tool'), '#!/bin/sh\necho tool\n', {
    mode: 0o755,
  });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(path.join(inner, 'README.txt'), 'not extracted\n');

  const archivePath = path.join(dir, 'tool.tar.gz');

  spawnSync('tar', ['-czf', archivePath, '-C', dir, 'tool-v1.2.3']);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  return fs.readFileSync(archivePath);
};

const archive = makeArchive();

const archiveDigest = createHash('sha256').update(archive).digest('hex');

const serveArchive = (_url: string): Promise<Uint8Array> =>
  Promise.resolve(archive);

const pinFor = (digest: string): ReleaseBinaryPin =>
  ({
    repository: 'owner/tool',
    version: '1.2.3',
    binary: 'tool-v{version}/tool',
    assets: {
      'linux-x64': {
        name: 'tool-v{version}.linux.x86_64.tar.gz',
        sha256: digest,
      },
    },
  }) as const;

const pin = pinFor(archiveDigest);

const newCacheDir = (): string => newTempDir('release-binary-cache-');

describe('parseReleaseBinaryPins', () => {
  test('reads the shape tools/configs/release-binaries.json has', () => {
    const result = parseReleaseBinaryPins({ tool: pin });

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, { tool: pin });
  });

  test.each([
    [[]],
    [{ tool: { ...pin, version: 1 } }],
    // Spliced into the download URL and the cache path.
    [{ tool: { ...pin, version: '1.2.3/../../../evil/tool' } }],
    [{ tool: { ...pin, repository: 'owner/tool/../../evil' } }],
    [{ tool: { ...pin, binary: '../../outside' } }],
    [{ tool: { ...pin, binary: '--to-command=sh' } }],
    [
      {
        tool: {
          ...pin,
          assets: {
            'linux-x64': { name: '../x.tar.gz', sha256: archiveDigest },
          },
        },
      },
    ],
    [{ tool: { ...pin, assets: { 'linux-x64': { name: 'x' } } } }],
    [
      {
        tool: { ...pin, assets: { 'linux-x64': { name: 'x', sha256: 'AB' } } },
      },
    ],
  ] as const)('refuses %j', (raw) => {
    assert.isTrue(Result.isErr(parseReleaseBinaryPins(raw)));
  });
});

describe('platformKey', () => {
  test('names a platform by Node’s platform and arch', () => {
    assert.strictEqual(platformKey('linux', 'x64'), 'linux-x64');

    assert.strictEqual(platformKey('darwin', 'arm64'), 'darwin-arm64');
  });
});

describe('installReleaseBinary', () => {
  test('downloads, verifies and extracts the binary, then reuses the archive', async () => {
    const cacheDir = newCacheDir();

    const download = vi.fn(serveArchive);

    const first = await installReleaseBinary({
      name: 'tool',
      pin,
      platform: 'linux-x64',
      cacheDir,
      download,
    });

    assert.isTrue(Result.isOk(first));

    expect(download).toHaveBeenCalledExactlyOnceWith(
      'https://github.com/owner/tool/releases/download/v1.2.3/tool-v1.2.3.linux.x86_64.tar.gz',
    );

    assert.strictEqual(
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.readFileSync(first.value, 'utf8'),
      '#!/bin/sh\necho tool\n',
    );

    assert.strictEqual(spawnSync(first.value).stdout.toString(), 'tool\n');

    const second = await installReleaseBinary({
      name: 'tool',
      pin,
      platform: 'linux-x64',
      cacheDir,
      download,
    });

    assert.isTrue(Result.isOk(second));

    expect(download).toHaveBeenCalledOnce();

    // Each use extracts into a directory of its own, so a concurrent run cannot
    // remove the binary another is running.
    assert.notStrictEqual(second.value, first.value);

    assert.strictEqual(spawnSync(first.value).stdout.toString(), 'tool\n');
  });

  test('refuses a download whose digest is not the pinned one, and keeps none of it', async () => {
    const cacheDir = newCacheDir();

    const result = await installReleaseBinary({
      name: 'tool',
      pin: pinFor('0'.repeat(64)),
      platform: 'linux-x64',
      cacheDir,
      download: serveArchive,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'tool-v1.2.3.linux.x86_64.tar.gz');

    assert.include(result.value, `has SHA-256 ${archiveDigest}`);

    assert.include(result.value, `pins ${'0'.repeat(64)}`);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    assert.deepStrictEqual(fs.readdirSync(cacheDir, { recursive: true }), [
      'archives',
      path.join('archives', '0'.repeat(64)),
    ]);
  });

  test('refuses a cached archive that no longer matches, without downloading', async () => {
    const cacheDir = newCacheDir();

    const download = vi.fn(serveArchive);

    await installReleaseBinary({
      name: 'tool',
      pin,
      platform: 'linux-x64',
      cacheDir,
      download,
    });

    const cached = path.join(
      cacheDir,
      'archives',
      archiveDigest,
      'tool-v1.2.3.linux.x86_64.tar.gz',
    );

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.appendFileSync(cached, 'tampered');

    const result = await installReleaseBinary({
      name: 'tool',
      pin,
      platform: 'linux-x64',
      cacheDir,
      download,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, cached);

    expect(download).toHaveBeenCalledOnce();
  });

  test('names the platforms it has when this one is not pinned', async () => {
    const result = await installReleaseBinary({
      name: 'tool',
      pin,
      platform: 'win32-x64',
      cacheDir: newCacheDir(),
      download: serveArchive,
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'no asset for win32-x64');

    assert.include(result.value, 'linux-x64');
  });

  test('reports a failed download', async () => {
    const result = await installReleaseBinary({
      name: 'tool',
      pin,
      platform: 'linux-x64',
      cacheDir: newCacheDir(),
      download: () => Promise.reject(new Error('404 Not Found')),
    });

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '404 Not Found');
  });
});
