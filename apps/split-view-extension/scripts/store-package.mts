import * as fs from 'node:fs';
import * as path from 'node:path';
import { isRecord } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { workspaceRootPath } from './workspace-root-path.mjs';

/**
 * Stages `dist/` as the Chrome Web Store wants it, and says which version it
 * is.
 *
 * Two things have to come off on the way, which is why the package is a copy
 * rather than `dist/` itself:
 *
 * - **`key` in the manifest.** The store assigns an id from the key it holds
 *   and refuses a manifest that names one. It stays in `public/manifest.json`
 *   all the same: that is what pins the id of the *unpacked* build, so that a
 *   checkout loaded from another path is still the same extension with the
 *   same storage.
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

  const { key, ...withoutKey } = manifest;

  if (key === undefined) {
    throw new Error(
      'No `key` in the manifest. It is what pins the unpacked build’s id; put it back in public/manifest.json.',
    );
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.resolve(stagingPath, 'manifest.json'),
    `${JSON.stringify(withoutKey, undefined, 2)}\n`,
  );

  if (typeof key !== 'string') {
    throw new TypeError('The manifest `key` is not a string.');
  }

  return { version, manifestKey: key };
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
