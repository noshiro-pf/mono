import * as fs from 'node:fs';
import * as path from 'node:path';
import { isRecord } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Stages `dist/` as the Chrome Web Store wants it, and says which version it
 * is.
 *
 * The package is a copy rather than `dist/` itself, because two things have to
 * come off on the way:
 *
 * - **The source maps**, which are ten times the size of what they map and of
 *   no use to anyone who has only the package.
 * - **`key` in the manifest**, if there is one. The store assigns an id from
 *   the key it holds and refuses a manifest that names one.
 *
 * `dist/` is left exactly as the build made it, and goes on being loadable
 * unpacked.
 *
 * Unlike `split-view-extension`, whose staging step this follows, a `key` here
 * is optional rather than required. That extension pins the id of its unpacked
 * build so that a checkout loaded from another path keeps the layouts it saved
 * in `chrome.storage`; this one stores nothing at all, so there is nothing for
 * a changing id to lose. Add a `key` to `public/manifest.json` if the unpacked
 * build and the published one should be the same extension anyway — the
 * packaging handles both.
 */
export const stageForStore = (): Readonly<{
  version: string;
  /** The `key` taken out of the copy, when the manifest named one. */
  manifestKey: string | undefined;
}> => {
  assertBuildIsPresent();

  const manifest = readManifest();

  const version = versionOf(manifest);

  fs.rmSync(stagingPath, { recursive: true, force: true });

  fs.cpSync(distPath, stagingPath, {
    recursive: true,
    filter: (source) => !source.endsWith('.map'),
  });

  const { key, ...withoutKey } = manifest;

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.resolve(stagingPath, 'manifest.json'),
    `${JSON.stringify(withoutKey, undefined, 2)}\n`,
  );

  if (key !== undefined && typeof key !== 'string') {
    throw new TypeError('The manifest `key` is not a string.');
  }

  return { version, manifestKey: key };
};

export const distPath = path.resolve(workspaceRootPath, 'dist');

/** Where everything that gets uploaded is written. Not tracked. */
export const packPath = path.resolve(workspaceRootPath, 'pack');

export const stagingPath = path.resolve(packPath, 'unpacked');

/** What the packaged files are named after, version aside. */
export const packageName = 'github-diff-defaults-extension';

const assertBuildIsPresent = (): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(path.resolve(distPath, 'manifest.json'))) {
    throw new Error(`No build at ${distPath}. Run \`pnpm run build\` first.`);
  }
};

const readManifest = (): UnknownRecord => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const text = fs.readFileSync(path.resolve(distPath, 'manifest.json'), 'utf8');

  const parsed: unknown = JSON.parse(text);

  if (!isRecord(parsed)) {
    throw new TypeError('The built manifest is not an object.');
  }

  return parsed;
};

const versionOf = (manifest: UnknownRecord): string => {
  const version = manifest['version'];

  if (typeof version !== 'string') {
    throw new TypeError('The manifest has no version.');
  }

  return version;
};
