import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as process from 'node:process';
import {
  packageName,
  packPath,
  stageForStore,
  stagingPath,
} from './store-package.mjs';

/**
 * Packs the same staging copy as `pack.mts`, signed, as a `.crx`.
 *
 * An item with **verified CRX upload** turned on will not take a zip: every
 * upload has to be a CRX signed with the key whose public half is registered
 * on the account.
 *
 * The signing is done by Chrome itself — `--pack-extension`, the reference
 * implementation of the format — rather than by assembling a CRX3 header here.
 * The binary is the one Playwright has already downloaded for the smoke test,
 * so this needs nothing installed that the package did not need anyway. It
 * opens no window: `--pack-extension` packs and exits, so unlike `smoke` this
 * wants no display.
 *
 * The key is **not** in the repository and must never be: it comes out of
 * `pass`, and `readSigningKey` will not read it from anywhere else. Losing it
 * means losing the ability to publish an update at all, once the store has the
 * public half on file.
 */
const main = (): void => {
  const key = readSigningKey();

  try {
    const { version, manifestKey } = stageForStore();

    const crxPath = path.resolve(packPath, `${packageName}-${version}.crx`);

    // Chrome writes `<staging dir>.crx` beside the directory, and refuses to
    // overwrite one that is already there.
    const packedPath = `${stagingPath}.crx` as const;

    fs.rmSync(packedPath, { force: true });

    fs.rmSync(crxPath, { force: true });

    execFileSync(chromium.executablePath(), [
      '--no-sandbox',
      `--pack-extension=${stagingPath}`,
      `--pack-extension-key=${key.path}`,
    ]);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.renameSync(packedPath, crxPath);

    report(crxPath, key, manifestKey);
  } finally {
    key.forget();
  }
};

type SigningKey = Readonly<{
  /** A file, because that is what `--pack-extension-key` takes. */
  path: string;
  /** Where it came from, for the report. Never the key itself. */
  source: string;
  forget: () => void;
}>;

/**
 * The `pass` entry the key is in, unless `GITHUB_DIFF_DEFAULTS_SIGNING_KEY_PASS`
 * says otherwise.
 */
const defaultPassEntry = 'github-view-defaults-extension';

const signingKeyEnvName = 'GITHUB_DIFF_DEFAULTS_SIGNING_KEY_PASS';

/**
 * Reads the signing key out of `pass`.
 *
 * `pass` and nowhere else: a key that can also be sitting in a file is a key
 * that will end up in one. Chrome wants a path, though, so it is written to a
 * file that nothing else can read — `mkdtemp` makes its directory `0700` — and
 * deleted as soon as the packing is over, whether or not it worked.
 *
 * There is no key yet. Making one, and putting it where this will find it:
 *
 * ```sh
 * openssl genrsa 2048 | pass insert --multiline github-view-defaults-extension
 * ```
 */
const readSigningKey = (): SigningKey => {
  const entry = process.env[signingKeyEnvName] ?? defaultPassEntry;

  const pem = passShow(entry);

  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'github-view-defaults-key-'),
  );

  const file = path.join(directory, 'signing-key.pem');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFileSync(file, pem, { mode: 0o600 });

  return {
    path: file,
    source: `pass show ${entry}`,
    forget: () => {
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
};

/**
 * The entry's contents.
 *
 * Neither the key nor anything `pass` said about it goes into the error: what
 * went wrong is worth reporting, and the entry's contents are not.
 */
const passShow = (entry: string): string => {
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

const report = (
  crxPath: string,
  key: SigningKey,
  manifestKey: string | undefined,
): void => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const crx = fs.readFileSync(crxPath);

  if (crx.subarray(0, 4).toString('latin1') !== 'Cr24') {
    throw new Error('That is not a CRX: the file does not start with `Cr24`.');
  }

  const signedId = idFromDer(publicKeyDerOf(key.path));

  console.log(`${crxPath}  (${String(Math.round(crx.length / 1024))} kB)`);

  console.log('  source maps left out');

  console.log(`  signed with ${key.source}`);

  if (manifestKey === undefined) {
    // No `key` in the manifest, which is the state this package ships in —
    // see `store-package.mts`. The unpacked build's id follows its path, so
    // there is nothing here to agree or disagree with.
    console.log(`  id ${signedId}`);

    return;
  }

  const pinnedId = idFromDer(Uint8Array.fromBase64(manifestKey));

  console.log(
    signedId === pinnedId
      ? `  id ${signedId}, the same one the unpacked build has`
      : `  id ${signedId} — the unpacked build's is ${pinnedId}, so the two are different extensions`,
  );
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

const aCodePoint = 'a'.codePointAt(0) ?? 97;

main();
