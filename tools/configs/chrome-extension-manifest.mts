import * as fs from 'node:fs';
import * as path from 'node:path';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import { type UnknownRecord } from 'ts-type-forge';
import { type Plugin as VitePlugin } from 'vite';

/**
 * Gives a Chrome extension's built manifest the version in its `package.json`.
 *
 * **The version of a Chrome extension is its `package.json` version**, and a
 * changeset is what raises it, as it is for a library: the extension is a
 * private workspace member, and `privatePackages.version` in
 * `.changeset/config.json` has changesets version it all the same. The
 * `public/manifest.json` Vite copies declares no `version`; this writes it into
 * the copy under `outDir` once the bundle is written, so that `dist/` is
 * loadable unpacked and packable for the store as it stands.
 *
 * A `version` left in `public/manifest.json` fails the build rather than being
 * overwritten. Two sources would drift, and the one that won would not be the
 * one somebody had just edited.
 */
export const writeManifestVersion = ({
  packageRoot,
  outDir,
}: Readonly<{
  /** The directory holding the extension's `package.json`. */
  packageRoot: string;
  /** Vite's `build.outDir`, where `manifest.json` has been copied to. */
  outDir: string;
}>): VitePlugin => ({
  name: 'chrome-extension:manifest-version',
  writeBundle: (): void => {
    const manifestPath = path.resolve(outDir, 'manifest.json');

    const packageJson = readJson(path.resolve(packageRoot, 'package.json'));

    const version = isRecord(packageJson) ? packageJson['version'] : undefined;

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(manifestWithVersion(readJson(manifestPath), version), undefined, 2)}\n`,
    );
  },
});

/**
 * `manifest` with `version` added, or an error saying why it cannot be.
 *
 * `version` is checked against what Chrome loads — one to four dot-separated
 * integers, each 0 to 65535 with no leading zero — because Chrome's own error
 * comes only when the extension is loaded, long after the build that could
 * have said so. A changesets prerelease version (`1.2.3-next.0`) is one it
 * refuses.
 */
export const manifestWithVersion = (
  manifest: unknown,
  version: unknown,
): UnknownRecord => {
  if (!isRecord(manifest)) {
    throw new TypeError('The manifest is not a JSON object.');
  }

  if (hasKey(manifest, 'version')) {
    throw new Error(
      'public/manifest.json declares a `version`. Remove it: the version comes from package.json, which a changeset raises.',
    );
  }

  if (typeof version !== 'string' || !isChromeVersion(version)) {
    throw new Error(
      `package.json has version ${JSON.stringify(version)}, which Chrome does not accept as an extension version.`,
    );
  }

  return { ...manifest, version };
};

/**
 * One to four dot-separated integers, each 0 to 65535 with no leading zero.
 *
 * The five-digit parts are held to 65535 by comparing strings, which for
 * strings of one length is comparing them as numbers.
 */
const isChromeVersion = (version: string): boolean => {
  const parts = version.split('.');

  return (
    Arr.isMaxLengthArray(4, parts) &&
    parts.every(
      (part) =>
        versionPartPattern.test(part) &&
        (part.length < maxVersionPart.length || part <= maxVersionPart),
    )
  );
};

const versionPartPattern = /^(?:0|[1-9]\d{0,4})$/u;

const maxVersionPart = '65535';

const readJson = (filePath: string): unknown =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  JSON.parse(fs.readFileSync(filePath, 'utf8'));
