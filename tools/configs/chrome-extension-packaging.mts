import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, hasKey, isRecord, Obj } from 'ts-data-forge';
import type { StrictPick, UnknownRecord } from 'ts-type-forge';

/** Copies the build for upload, omitting source maps and unpacked-only fields. */
export const stageForStore = (
  options: ExtensionPackageOptions,
): Readonly<{
  version: string;
  /** The public half of the unpacked id, when the manifest pins one. */
  manifestKey: string | undefined;
  /** The manifest fields the staged copy left out, for the report. */
  removedFields: readonly string[];
}> => {
  const { distPath, stagingPath } = extensionPackagePaths(options.packageRoot);

  assertBuildIsPresent(distPath);

  const manifest = readManifest(distPath);

  const version = versionOf(manifest);

  // Before the staging copy is touched, so a manifest the store would refuse
  // never sits in `pack/unpacked` looking like a package.
  const { manifest: forStore, key } = storeManifestOf(manifest, options);

  fs.rmSync(stagingPath, { recursive: true, force: true });

  fs.cpSync(distPath, stagingPath, {
    recursive: true,
    filter: (source) => !source.endsWith('.map'),
  });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(
    path.resolve(stagingPath, 'manifest.json'),
    `${JSON.stringify(forStore, undefined, 2)}\n`,
  );

  return {
    version,
    manifestKey: key,
    removedFields: Object.keys(manifest).filter(
      (name) => !hasKey(forStore, name),
    ),
  };
};

/** Removes the store-incompatible key and the extension's unpacked-only fields. */
export const storeManifestOf = (
  manifest: UnknownRecord,
  policy: StoreManifestPolicy,
): Readonly<{ manifest: UnknownRecord; key: string | undefined }> => {
  const { key, ...withoutKey } = manifest;

  const forStore = Obj.filter(
    withoutKey,
    (_value, name) => !policy.stripManifestKeys.includes(name),
  );

  if (key === undefined && policy.requireManifestKey) {
    throw new Error(
      'No `key` in the manifest. It is what pins the unpacked build’s id; put it back in public/manifest.json.',
    );
  }

  if (key !== undefined && typeof key !== 'string') {
    throw new TypeError('The manifest `key` is not a string.');
  }

  return { manifest: forStore, key };
};

/** Packs the staged build into a zip whose root is the extension's root. */
export const packExtensionZip = (options: ExtensionPackageOptions): void => {
  const { packPath, stagingPath } = extensionPackagePaths(options.packageRoot);

  const { version, removedFields } = stageForStore(options);

  const zipName = `${options.packageName}-${version}.zip` as const;

  const zipPath = path.resolve(packPath, zipName);

  // `zip` adds to an archive that is already there rather than replacing it.
  fs.rmSync(zipPath, { force: true });

  // The store wants the files at the root of the archive, not a directory
  // holding them, so this zips `.` from inside the staging copy. `-X` leaves
  // out the extra file attributes, which are noise in a package.
  execFileSync('zip', ['-r', '-X', '-q', zipPath, '.'], { cwd: stagingPath });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const { size } = fs.statSync(zipPath);

  console.log(`${zipPath}  (${Math.round(size / 1024).toString()} kB)`);

  reportStaging(removedFields);
};

/**
 * Packs the same staging copy as `packExtensionZip`, signed, as a `.crx`.
 *
 * An item with **verified CRX upload** turned on will not take a zip: every
 * upload has to be a CRX signed with the key whose public half is registered on
 * the account.
 *
 * The signing is done by Chrome itself — `--pack-extension`, the reference
 * implementation of the format — rather than by assembling a CRX3 header here.
 * The caller passes the Chromium that Playwright has already downloaded for its
 * browser tests, so this needs nothing installed that the package did not need
 * anyway. It opens no window: `--pack-extension` packs and exits, so this wants
 * no display.
 *
 * The key is **not** in the repository and must never be: it comes out of
 * `pass`, and `readSigningKey` will not read it from anywhere else. Losing it
 * means losing the ability to publish an update at all, once the store has the
 * public half on file.
 */
export const packExtensionCrx = (
  options: ExtensionPackageOptions,
  chromiumExecutable: string,
): void => {
  // Before the key: a missing browser, build or manifest field must say what to
  // fix without asking `pass` to decrypt anything first.
  const chrome = assertChromiumPresent(chromiumExecutable);

  const { packPath, stagingPath } = extensionPackagePaths(options.packageRoot);

  const { version, manifestKey, removedFields } = stageForStore(options);

  const key = readSigningKey(options);

  try {
    const crxPath = path.resolve(
      packPath,
      `${options.packageName}-${version}.crx`,
    );

    // Chrome writes `<staging dir>.crx` beside the directory, and refuses to
    // overwrite one that is already there.
    const packedPath = `${stagingPath}.crx` as const;

    fs.rmSync(packedPath, { force: true });

    fs.rmSync(crxPath, { force: true });

    execFileSync(chrome, [
      '--no-sandbox',
      `--pack-extension=${stagingPath}`,
      `--pack-extension-key=${key.path}`,
    ]);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.renameSync(packedPath, crxPath);

    report(crxPath, key, manifestKey, removedFields);
  } finally {
    key.forget();
  }
};

/** Where an extension's build, its packages and their staging copy live. */
export const extensionPackagePaths = (
  packageRoot: string,
): Readonly<{ distPath: string; packPath: string; stagingPath: string }> => {
  const packPath = path.resolve(packageRoot, 'pack');

  return {
    distPath: path.resolve(packageRoot, 'dist'),
    packPath,
    stagingPath: path.resolve(packPath, 'unpacked'),
  };
};

/** The data in an extension's packaging call site; no credentials live here. */
export type ExtensionPackageOptions = Readonly<{
  packageRoot: string;
  packageName: string;
  /**
   * Refuse a manifest without `key`, for an extension whose unpacked build has
   * to keep one id wherever it is loaded from. The call site says why.
   */
  requireManifestKey: boolean;
  /** Extra unpacked-only fields; the store-incompatible key is always removed. */
  stripManifestKeys: readonly string[];
  signingKeyPassEnv: string;
  defaultPassEntry: string;
}>;

type StoreManifestPolicy = StrictPick<
  ExtensionPackageOptions,
  'requireManifestKey' | 'stripManifestKeys'
>;

type SigningKey = Readonly<{
  /** A file, because that is what `--pack-extension-key` takes. */
  path: string;
  /** Where it came from, for the report. Never the key itself. */
  source: string;
  forget: () => void;
}>;

const aCodePoint = 'a'.codePointAt(0) ?? 97;

/** `a`, `a and b`, `a, b, and c`. */
const fieldList = new Intl.ListFormat('en');

/** Unlike launch(), executablePath() does not check that the revision exists. */
const assertChromiumPresent = (executable: string): string => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(executable)) {
    throw new Error(
      [
        `Playwright's Chromium is not installed: ${executable} does not exist.`,
        'Download the revision this Playwright version expects with `pnpm exec playwright install chromium`.',
      ].join('\n'),
    );
  }

  return executable;
};

const reportStaging = (removedFields: readonly string[]): void => {
  console.log(
    Arr.isNonEmpty(removedFields)
      ? `  manifest ${fieldList.format(
          removedFields.map((name) => `\`${name}\``),
        )} removed, source maps left out`
      : '  source maps left out',
  );
};

/**
 * The entry's contents.
 *
 * Neither the key nor anything `pass` said about it goes into the error: what
 * went wrong is worth reporting, and the entry's contents are not.
 */
const passShow = (entry: string, signingKeyEnvName: string): string => {
  const pem = ((): string | undefined => {
    try {
      return execFileSync('pass', ['show', entry], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      return undefined;
    }
  })();

  if (pem === undefined) {
    throw new Error(
      [
        `\`pass show ${entry}\` produced nothing.`,
        `The signing key belongs in that entry; name another with ${signingKeyEnvName}.`,
        `To make one: openssl genrsa 2048 | pass insert --multiline ${entry}`,
      ].join('\n'),
    );
  }

  if (!pem.includes('-----BEGIN')) {
    throw new Error(
      `\`pass show ${entry}\` is not a PEM key. Check that the entry holds the private key itself.`,
    );
  }

  return pem;
};

/**
 * Reads the signing key out of `pass`.
 *
 * `pass` and nowhere else: a key that can also be sitting in a file is a key
 * that will end up in one. Chrome wants a path, though, so it is written to a
 * file that nothing else can read — `mkdtemp` makes its directory `0700` — and
 * deleted as soon as the packing is over, whether or not it worked.
 */
const readSigningKey = (options: ExtensionPackageOptions): SigningKey => {
  const fromEnv = process.env[options.signingKeyPassEnv];

  // Empty counts as unset: `pass show ''` lists the whole store instead.
  const entry =
    fromEnv === undefined || fromEnv === ''
      ? options.defaultPassEntry
      : fromEnv;

  const pem = passShow(entry, options.signingKeyPassEnv);

  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), `${options.packageName}-key-`),
  );

  const file = path.join(directory, 'signing-key.pem');

  const forget = (): void => {
    fs.rmSync(directory, { recursive: true, force: true });
  };

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.writeFileSync(file, pem, { mode: 0o600 });
  } catch (error) {
    // A write that failed part way may still have left some of the key behind.
    forget();

    throw error;
  }

  return {
    path: file,
    source: `pass show ${entry}`,
    forget,
  };
};

const publicKeyDerOf = (keyPath: string): Buffer =>
  execFileSync(
    'openssl',
    ['rsa', '-in', keyPath, '-pubout', '-outform', 'DER'],
    // `openssl rsa` says "writing RSA key" on the way past, which is not
    // something this report needs to pass on.
    { stdio: ['ignore', 'pipe', 'ignore'] },
  );

/**
 * The id Chrome derives from a public key: the first half of its SHA-256, with
 * each nibble written as a letter from `a`.
 */
const idFromDer = (der: Readonly<Uint8Array>): string =>
  Array.from(createHash('sha256').update(der).digest().subarray(0, 16))
    .flatMap((byte) => [byte >> 4, byte & 0xf])
    .map((nibble) => String.fromCodePoint(aCodePoint + nibble))
    .join('');

const report = (
  crxPath: string,
  key: SigningKey,
  manifestKey: string | undefined,
  removedFields: readonly string[],
): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const crx = fs.readFileSync(crxPath);

  if (crx.subarray(0, 4).toString('latin1') !== 'Cr24') {
    throw new Error('That is not a CRX: the file does not start with `Cr24`.');
  }

  const signedId = idFromDer(publicKeyDerOf(key.path));

  console.log(`${crxPath}  (${Math.round(crx.length / 1024).toString()} kB)`);

  reportStaging(removedFields);

  console.log(`  signed with ${key.source}`);

  if (manifestKey === undefined) {
    // Without a pinned key the unpacked id follows its path.
    console.log(`  id ${signedId}`);

    return;
  }

  const pinnedId = idFromDer(Buffer.from(manifestKey, 'base64'));

  console.log(
    signedId === pinnedId
      ? `  id ${signedId}, the same one the unpacked build has`
      : `  id ${signedId} — the unpacked build's is ${pinnedId}, so the two are different extensions`,
  );
};

const assertBuildIsPresent = (distPath: string): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  if (!fs.existsSync(path.resolve(distPath, 'manifest.json'))) {
    throw new Error(`No build at ${distPath}. Run \`pnpm run build\` first.`);
  }
};

const readManifest = (distPath: string): UnknownRecord => {
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
