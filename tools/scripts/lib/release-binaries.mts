import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { rmSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Binaries a command runs that npm does not distribute, pinned in
 * `tools/configs/release-binaries.json` and fetched from GitHub Releases.
 *
 * Each asset is checked against the pinned SHA-256 before it is kept, and again
 * every time it is used, so an archive that changed after it was cached fails
 * as loudly as a download that never matched; neither is ever run. The binary
 * is extracted afresh from the verified archive on every use, into a directory
 * of this process's own, so that a concurrent run cannot swap or remove it
 * underneath.
 *
 * The pins are moved by `mature-updates.mts release-binaries` from
 * `pnpm-update.yml`, under `minimumReleaseAge`; that file's header says how far
 * they move on their own.
 */
export const releaseBinaryPinsPath = path.resolve(
  projectRootPath,
  'tools/configs/release-binaries.json',
);

/**
 * Under the root `node_modules/`, which the root `.gitignore` covers, so the
 * cache is per checkout and goes with a clean install. CI keeps `archives/`
 * between runs with `actions/cache`, keyed on the pin file.
 */
export const releaseBinaryCacheDir = path.resolve(
  projectRootPath,
  'node_modules/.cache/release-binaries',
);

/**
 * The pins, checked beyond their shape: a `version` is `X.Y.Z`, a `sha256` 64
 * lowercase hex digits, a `repository` `owner/name`, and an asset name or a
 * `binary` a relative path that stays where it is put, since all of them are
 * spliced into a URL, a path or `tar`'s arguments. `pnpm-update.yml` lets an
 * automated update change the first two and nothing else.
 */
export const parseReleaseBinaryPins = (
  raw: unknown,
): Result<ReadonlyRecord<string, ReleaseBinaryPin>, string> => {
  const pins = ReleaseBinaryPinsSchema.validate(raw);

  if (Result.isErr(pins)) {
    return Result.err(
      Arr.toUnshifted(`❌ ${pinsFileName} is not in the shape it should be:`)(
        t.validationErrorsToMessages(pins.value),
      ).join('\n'),
    );
  }

  const malformed = Object.entries(pins.value).flatMap(([name, pin]) => [
    ...(/^\d+\.\d+\.\d+$/u.test(pin.version)
      ? []
      : [`${name}.version is not X.Y.Z`]),
    ...(/^[\w.-]+\/[\w.-]+$/u.test(pin.repository)
      ? []
      : [`${name}.repository is not owner/name`]),
    ...(isContainedPath(pin.binary)
      ? []
      : [`${name}.binary is not a relative path inside the archive`]),
    ...Object.entries(pin.assets)
      .filter(([, asset]) => !/^[\w{}.-]+$/u.test(asset.name))
      .map(
        ([platform]) => `${name}.assets.${platform}.name is not a file name`,
      ),
    ...Object.entries(pin.assets)
      .filter(([, asset]) => !/^[0-9a-f]{64}$/u.test(asset.sha256))
      .map(
        ([platform]) =>
          `${name}.assets.${platform}.sha256 is not 64 lowercase hex digits`,
      ),
  ]);

  return Arr.isNonEmpty(malformed)
    ? Result.err(`❌ ${pinsFileName}: ${malformed.join('; ')}.`)
    : Result.ok(pins.value);
};

/** `<process.platform>-<process.arch>`, the keys of a pin's `assets`. */
export const platformKey = (platform: string, arch: string): string =>
  `${platform}-${arch}` as const;

/**
 * The path of `name`'s binary for `platform`, extracted from its pinned archive
 * under `cacheDir` — downloaded first when it is not there yet. A
 * file-system failure (a read-only or full disk) comes back as an error like
 * any other, not as a rejection.
 */
export const installReleaseBinary = async (
  args: InstallArgs,
): Promise<Result<string, string>> => {
  const result = await Result.fromPromise(install(args));

  return Result.isErr(result)
    ? Result.err(
        `❌ Could not install ${args.name}: ${unknownToString(result.value)}`,
      )
    : result.value;
};

/**
 * `fetch`, following the redirect GitHub answers a release download with. A
 * stalled response is cut off after a minute, and a failure worth repeating —
 * no answer, a 5xx, a 429 — is tried twice more, a second and then three
 * seconds later; a 404 is not. It honours `HTTPS_PROXY` only under
 * `NODE_USE_ENV_PROXY=1`, which the `check:root:actionlint` script sets.
 */
export const downloadWithFetch = async (url: string): Promise<Uint8Array> => {
  const attempt = async (): Promise<
    Result<Uint8Array, Readonly<{ message: string; retry: boolean }>>
  > => {
    const response = await Result.fromPromise(
      fetch(url, { signal: AbortSignal.timeout(downloadTimeoutMs) }),
    );

    if (Result.isErr(response)) {
      return Result.err({
        message: describeFetchError(response.value),
        retry: true,
      });
    }

    if (!response.value.ok) {
      // Read off and dropped, so that its connection is not held until the body
      // is collected.
      await Result.fromPromise(
        response.value.body?.cancel() ?? Promise.resolve(),
      );

      return Result.err({
        message: `${response.value.status} ${response.value.statusText}`,
        retry: response.value.status >= 500 || response.value.status === 429,
      });
    }

    // The body is read under the same timeout and retried like the rest: a
    // transfer can stall or reset after the headers came back fine.
    const body = await Result.fromPromise(response.value.arrayBuffer());

    return Result.isErr(body)
      ? Result.err({ message: unknownToString(body.value), retry: true })
      : Result.ok(new Uint8Array(body.value));
  };

  const tryWith = async (delays: readonly number[]): Promise<Uint8Array> => {
    const result = await attempt();

    if (Result.isOk(result)) {
      return result.value;
    }

    const [delay, ...rest] = delays;

    if (delay === undefined || !result.value.retry) {
      throw new Error(result.value.message);
    }

    await sleep(delay);

    return tryWith(rest);
  };

  return tryWith(retryDelaysMs);
};

type InstallArgs = Readonly<{
  name: string;
  pin: ReleaseBinaryPin;
  platform: string;
  cacheDir: string;
  download: (url: string) => Promise<Uint8Array>;
}>;

/**
 * One tool: a repository whose release `v<version>` carries one archive per
 * platform, keyed by {@link platformKey}. `{version}` in an asset name or in
 * `binary`, the path inside the archive, stands for `version`.
 */
const ReleaseBinaryPinSchema = t.record({
  repository: t.string(),
  version: t.string(),
  binary: t.string(),
  assets: t.keyValueRecord(
    t.string(),
    t.record({ name: t.string(), sha256: t.string() }),
  ),
});

export type ReleaseBinaryPin = t.TypeOf<typeof ReleaseBinaryPinSchema>;

const ReleaseBinaryPinsSchema = t.keyValueRecord(
  t.string(),
  ReleaseBinaryPinSchema,
);

const downloadTimeoutMs = 60_000;

const retryDelaysMs = [1000, 3000] as const;

const pinsFileName = path.relative(projectRootPath, releaseBinaryPinsPath);

/**
 * This process's extraction directories, removed by one exit handler rather
 * than one listener per install.
 */
const mut_extractedDirs = new Set<string>();

process.once('exit', () => {
  for (const dir of mut_extractedDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/**
 * `fetch failed` and the reason under it — a refused connection, a name that
 * does not resolve, a proxy or TLS error — which `fetch` keeps in `cause`.
 */
const describeFetchError = (error: unknown): string =>
  Error.isError(error) && error.cause !== undefined
    ? (`${error.message}: ${unknownToString(error.cause)}` as const)
    : unknownToString(error);

/**
 * Removes what an earlier run that never reached its exit handler — killed by a
 * signal — left under `bin/`: an extraction is in use for one run, and none
 * takes an hour.
 */
const pruneStaleExtractions = async (binDir: string): Promise<void> => {
  const cutoff = Date.now() - staleExtractionMs;

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the cache directory.
  const entries = await fs.readdir(binDir);

  await Promise.all(
    entries.map(async (entry) => {
      const dir = path.join(binDir, entry);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the cache directory.
      const stat = await Result.fromPromise(fs.stat(dir));

      // Best effort: one that cannot be removed now is left for a later run,
      // not a reason to fail this one.
      if (Result.isOk(stat) && stat.value.mtimeMs < cutoff) {
        await Result.fromPromise(fs.rm(dir, { recursive: true, force: true }));
      }
    }),
  );
};

const staleExtractionMs = 60 ** 2 * 1000;

/** Relative, with no `..` segment and no leading `-` that `tar` would read as an option. */
const isContainedPath = (value: string): boolean =>
  value !== '' &&
  !value.startsWith('/') &&
  !value.startsWith('-') &&
  !value.split('/').includes('..');

/** `-z` for gzip, `-J` for xz, nothing for a plain tar. */
const compressionFlag = (bytes: Readonly<Uint8Array>): readonly string[] =>
  bytes[0] === 0x1f && bytes[1] === 0x8b
    ? (['-z'] as const)
    : bytes[0] === 0xfd && bytes[1] === 0x37 && bytes[2] === 0x7a
      ? (['-J'] as const)
      : ([] as const);

const render = (template: string, version: string): string =>
  template.replaceAll('{version}', () => version);

const checkCachedDigest = (
  digest: string,
  archivePath: string,
  sha256: string,
): Result<undefined, string> =>
  digest === sha256
    ? Result.ok(undefined)
    : Result.err(
        [
          `❌ The cached ${archivePath} has SHA-256 ${digest}, and ${pinsFileName} pins ${sha256}.`,
          '   It was verified when it was saved, so it changed afterwards. Nothing was run;',
          '   find out what changed it, then delete it to download it again (in CI, delete',
          '   the `release-binaries-…` entry under Actions → Caches, which restores it).',
        ].join('\n'),
      );

const downloadVerified = async ({
  url,
  archivePath,
  sha256,
  download,
}: Readonly<{
  url: string;
  archivePath: string;
  sha256: string;
  download: (from: string) => Promise<Uint8Array>;
}>): Promise<Result<Uint8Array, string>> => {
  const downloaded = await Result.fromPromise(download(url));

  if (Result.isErr(downloaded)) {
    return Result.err(
      `❌ Could not download ${url}: ${unknownToString(downloaded.value)}`,
    );
  }

  const digest = createHash('sha256').update(downloaded.value).digest('hex');

  if (digest !== sha256) {
    return Result.err(
      [
        `❌ ${url}`,
        `   has SHA-256 ${digest}, and ${pinsFileName} pins ${sha256}.`,
        '   Nothing was kept or run. A version edited by hand without its digests: put',
        '   back the version last pinned, then move it with',
        '   `pnpm run update-release-binaries -- --to <tool>@<x.y.z>`, which fills in',
        "   every platform's digest. A release asset that changed after it was pinned",
        '   is worth reporting, not re-pinning.',
      ].join('\n'),
    );
  }

  // Written aside and renamed, so an interrupted run leaves no partial archive
  // under the name a later run trusts.
  const partial = `${archivePath}.partial-${process.pid}` as const;

  const saved = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the cache directory.
    fs
      .writeFile(partial, downloaded.value)
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the cache directory.
      .then(() => fs.rename(partial, archivePath)),
  );

  if (Result.isErr(saved)) {
    await fs.rm(partial, { force: true });

    return Result.err(
      `❌ Could not save ${archivePath}: ${unknownToString(saved.value)}`,
    );
  }

  return Result.ok(downloaded.value);
};

const install = async ({
  name,
  pin,
  platform,
  cacheDir,
  download,
}: InstallArgs): Promise<Result<string, string>> => {
  const asset = pin.assets[platform];

  if (asset === undefined) {
    return Result.err(
      `❌ ${pinsFileName} has no asset for ${platform} in "${name}"; it pins ${Object.keys(pin.assets).join(', ')}.`,
    );
  }

  const assetName = render(asset.name, pin.version);

  // Keyed by the digest as well as the name, so that a pin that moves — or an
  // asset whose name carries no version — never meets an archive verified for
  // another digest.
  const archivesDir = path.join(cacheDir, 'archives', asset.sha256);

  const archivePath = path.join(archivesDir, assetName);

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the cache directory.
  await fs.mkdir(archivesDir, { recursive: true });

  const cached = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the cache directory.
    fs.readFile(archivePath),
  );

  const verified = Result.isOk(cached)
    ? Result.map(
        checkCachedDigest(
          createHash('sha256').update(cached.value).digest('hex'),
          archivePath,
          asset.sha256,
        ),
        () => cached.value,
      )
    : await downloadVerified({
        url: `https://github.com/${pin.repository}/releases/download/v${pin.version}/${assetName}`,
        archivePath,
        sha256: asset.sha256,
        download,
      });

  if (Result.isErr(verified)) {
    return verified;
  }

  const binDir = path.join(cacheDir, 'bin');

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the cache directory.
  await fs.mkdir(binDir, { recursive: true });

  await pruneStaleExtractions(binDir);

  // This process's own, so a concurrent run's extraction never touches the
  // binary this one is about to run. Removed again when the process exits.
  const extractDir = await fs.mkdtemp(path.join(binDir, `${name}-`));

  mut_extractedDirs.add(extractDir);

  const binary = render(pin.binary, pin.version);

  // The bytes just verified go to `tar` on stdin, rather than the file being
  // read a second time, so what is extracted is what was hashed. GNU tar cannot
  // tell the compression of a pipe, so it is named from the magic bytes: gzip
  // or xz, the two a release ships.
  const extracted = spawnSync(
    'tar',
    [...compressionFlag(verified.value), '-xf', '-', '-C', extractDir, binary],
    { input: verified.value, encoding: 'utf8' },
  );

  if (extracted.error !== undefined || extracted.status !== 0) {
    return Result.err(
      `❌ Could not extract ${binary} from ${archivePath}: ${extracted.error?.message ?? extracted.stderr}`,
    );
  }

  return Result.ok(path.join(extractDir, binary));
};
