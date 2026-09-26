import * as fs from 'node:fs';
import * as path from 'node:path';
import { isRecord } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Stages `dist/` as the Chrome Web Store wants it, and says which version it
 * is.
 *
 * Three things have to come off on the way, which is why the package is a
 * copy rather than `dist/` itself:
 *
 * - **`key` in the manifest.** The store assigns an id from the key it holds
 *   and refuses a manifest that names one. It stays in `public/manifest.json`
 *   all the same: that is what pins the id of the *unpacked* build, so that a
 *   checkout loaded from another path is still the same extension with the
 *   same storage.
 * - **`web_accessible_resources`**, for the same reason from the other side.
 *   It lets the pr-manager-app open `split.html` from a link, and that link
 *   names the pinned id, which a store install does not have — so in the
 *   package it would reach nobody, and would only let every page it lists
 *   tell that the extension is installed.
 * - **The source maps**, which are three quarters of the build and of no use
 *   to anyone who has only the package.
 *
 * `dist/` is left exactly as the build made it, and goes on being loadable
 * unpacked under the pinned id.
 */
export const stageForStore = (): Readonly<{
  version: string;
  /** The `key` taken out of the copy: the public half of the pinned id. */
  manifestKey: string;
}> => {
  assertBuildIsPresent();

  const manifest = readManifest();

  const version = versionOf(manifest);

  fs.rmSync(stagingPath, { recursive: true, force: true });

  fs.cpSync(distPath, stagingPath, {
    recursive: true,
    filter: (source) => !source.endsWith('.map'),
  });

  const { manifest: forStore, key } = storeManifestOf(manifest);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.resolve(stagingPath, 'manifest.json'),
    `${JSON.stringify(forStore, undefined, 2)}\n`,
  );

  return { version, manifestKey: key };
};

/**
 * The built manifest as the store takes it: without `key` and
 * `web_accessible_resources`, which only the unpacked build under the pinned
 * id has any use for. `key` is handed back, for `pack:crx` to report which id
 * it implies.
 */
export const storeManifestOf = (
  manifest: UnknownRecord,
): Readonly<{ manifest: UnknownRecord; key: string }> => {
  const {
    key,
    web_accessible_resources: _webAccessibleResources,
    ...forStore
  } = manifest;

  if (key === undefined) {
    throw new Error(
      'No `key` in the manifest. It is what pins the unpacked build’s id; put it back in public/manifest.json.',
    );
  }

  if (typeof key !== 'string') {
    throw new TypeError('The manifest `key` is not a string.');
  }

  return { manifest: forStore, key };
};

export const distPath = path.resolve(workspaceRootPath, 'dist');

/**
 * Where everything that gets uploaded is written. Not cleared wholesale by
 * anything here: the screenshots live beside the packages and take a browser
 * to make.
 */
export const packPath = path.resolve(workspaceRootPath, 'pack');

export const stagingPath = path.resolve(packPath, 'unpacked');

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
