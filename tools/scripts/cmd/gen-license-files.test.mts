import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { projectRootPath } from '../project-root-path.mjs';
import {
  CANONICAL_LICENSE_SHA256,
  collectLicenseTargets,
  collectViolations,
  licenseTextsFrom,
  sha256Of,
  type PackageManifest,
} from './gen-license-files.mjs';

const known = new Set(['Apache-2.0']);

const manifestOf = (
  dir: string,
  overrides: Partial<PackageManifest> = {},
): PackageManifest =>
  ({
    dir,
    license: 'Apache-2.0',
    isPrivate: false,
    hasLicenseFile: true,
    ...overrides,
  }) as const;

const subjectsOf = (
  manifests: readonly PackageManifest[],
  orphans: readonly string[] = [],
): readonly string[] =>
  collectViolations(manifests, orphans, known).map(({ subject }) => subject);

describe(collectLicenseTargets, () => {
  test('a publishable package gets one whether or not it has one', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([
        manifestOf('libs/b'),
        manifestOf('libs/a', { hasLicenseFile: false }),
      ]),
      [
        { path: 'libs/a/LICENSE', license: 'Apache-2.0' },
        { path: 'libs/b/LICENSE', license: 'Apache-2.0' },
      ],
    );
  });

  test('the license written is the one the package declares', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([manifestOf('libs/a', { license: 'MIT' })]),
      [{ path: 'libs/a/LICENSE', license: 'MIT' }],
    );
  });

  test('a private package with no file of its own is left without one', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([
        manifestOf('apps/x', { isPrivate: true, hasLicenseFile: false }),
      ]),
      [],
    );
  });

  test('a private package gets none even where one exists today', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([manifestOf('apps/docs', { isPrivate: true })]),
      [],
    );
  });

  test('a package declaring nothing gets nothing — the field decides', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([manifestOf('libs/a', { license: undefined })]),
      [],
    );
  });

  test('the root is the source, never a target', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([manifestOf('', { isPrivate: true })]),
      [],
    );
  });

  test('experimental/ is left alone', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([
        manifestOf('experimental/old', { license: 'MIT' }),
      ]),
      [],
    );
  });
});

describe(collectViolations, () => {
  test('a publishable package under a known license passes', () => {
    assert.deepStrictEqual(subjectsOf([manifestOf('libs/a')]), []);
  });

  test('a publishable package with no `license` field fails', () => {
    assert.deepStrictEqual(
      subjectsOf([manifestOf('libs/a', { license: undefined })]),
      ['libs/a'],
    );
  });

  test('a private package with no `license` field fails too', () => {
    assert.deepStrictEqual(
      subjectsOf([
        manifestOf('apps/x', {
          isPrivate: true,
          hasLicenseFile: false,
          license: undefined,
        }),
      ]),
      ['apps/x'],
    );
  });

  test('a private package carrying a LICENSE fails — it ships to nobody', () => {
    assert.deepStrictEqual(
      subjectsOf([manifestOf('apps/docs', { isPrivate: true })]),
      ['apps/docs'],
    );
  });

  test('a license whose text this cannot write fails, named', () => {
    const violations = collectViolations(
      [manifestOf('libs/a', { license: 'MIT' })],
      [],
      known,
    );

    assert.deepStrictEqual(
      violations.map(({ subject }) => subject),
      ["libs/a (license: 'MIT')"],
    );

    assert.isTrue(violations[0]?.message.includes('Apache-2.0') === true);
  });

  test('a private package may declare a license this cannot write', () => {
    assert.deepStrictEqual(
      subjectsOf([
        manifestOf('apps/x', {
          isPrivate: true,
          hasLicenseFile: false,
          license: 'MIT',
        }),
      ]),
      [],
    );
  });

  test('a LICENSE beside no package is an orphan', () => {
    assert.deepStrictEqual(subjectsOf([], ['docs/LICENSE']), ['docs/LICENSE']);
  });

  test('neither the root nor experimental/ is judged', () => {
    assert.deepStrictEqual(
      subjectsOf([
        manifestOf('', { isPrivate: true }),
        manifestOf('experimental/old', { license: 'MIT' }),
      ]),
      [],
    );
  });
});

describe(licenseTextsFrom, () => {
  test('knows the repository license, and only it', () => {
    const texts = licenseTextsFrom('APACHE TEXT');

    assert.deepStrictEqual(Array.from(texts.keys()), ['Apache-2.0']);

    assert.strictEqual(texts.get('Apache-2.0'), 'APACHE TEXT');
  });
});

describe(sha256Of, () => {
  test('hashes the bytes it is given', () => {
    assert.strictEqual(
      sha256Of(''),
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
  });
});

describe('the repository LICENSE', () => {
  test('is the canonical Apache-2.0 text, to the byte', async () => {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the repository root, resolved.
    const text = await fs.readFile(
      path.resolve(projectRootPath, 'LICENSE'),
      'utf8',
    );

    assert.strictEqual(sha256Of(text), CANONICAL_LICENSE_SHA256);
  });
});
