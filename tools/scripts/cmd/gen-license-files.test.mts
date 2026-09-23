import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { projectRootPath } from '../project-root-path.mjs';
import {
  CANONICAL_LICENSE_SHA256,
  collectLicenseTargets,
  collectManifestViolations,
  sha256Of,
  type PackageManifest,
} from './gen-license-files.mjs';

const manifestOf = (
  dir: string,
  license: string | undefined,
  isPrivate = false,
): PackageManifest => ({ dir, license, isPrivate }) as const;

describe(collectLicenseTargets, () => {
  test('every publishable package gets one, whether or not it has one', () => {
    assert.deepStrictEqual(
      collectLicenseTargets(
        [
          manifestOf('libs/a', 'Apache-2.0'),
          manifestOf('libs/b', 'Apache-2.0'),
        ],
        [],
      ),
      ['libs/a/LICENSE', 'libs/b/LICENSE'],
    );
  });

  test('a file that is already tracked is kept in step, private or not', () => {
    assert.deepStrictEqual(
      collectLicenseTargets(
        [manifestOf('libs/a', 'Apache-2.0')],
        ['apps/docs/LICENSE'],
      ),
      ['apps/docs/LICENSE', 'libs/a/LICENSE'],
    );
  });

  test('the root LICENSE is the source, never a target', () => {
    assert.deepStrictEqual(collectLicenseTargets([], ['LICENSE']), []);
  });

  test('experimental/ is left alone — its imports carry their own licenses', () => {
    assert.deepStrictEqual(
      collectLicenseTargets(
        [manifestOf('experimental/old-pkg', 'MIT')],
        ['experimental/imported-repo/LICENSE'],
      ),
      [],
    );
  });

  test('a package that is both publishable and tracked appears once', () => {
    assert.deepStrictEqual(
      collectLicenseTargets(
        [manifestOf('libs/a', 'Apache-2.0')],
        ['libs/a/LICENSE'],
      ),
      ['libs/a/LICENSE'],
    );
  });

  test('a private package with no LICENSE of its own is left without one', () => {
    assert.deepStrictEqual(
      collectLicenseTargets([manifestOf('apps/x', undefined, true)], []),
      [],
    );
  });
});

describe(collectManifestViolations, () => {
  test('a publishable package under the repository license passes', () => {
    assert.deepStrictEqual(
      collectManifestViolations([manifestOf('libs/a', 'Apache-2.0')]),
      [],
    );
  });

  test('a publishable package claiming another license fails', () => {
    const violations = collectManifestViolations([
      manifestOf('libs/a', 'MIT'),
      manifestOf('libs/b', undefined),
    ]);

    assert.deepStrictEqual(
      violations.map(({ subject }) => subject),
      ["libs/a (license: 'MIT')", 'libs/b (no `license` field)'],
    );
  });

  test('a private package is not published, so its field is its own business', () => {
    assert.deepStrictEqual(
      collectManifestViolations([manifestOf('apps/x', 'MIT', true)]),
      [],
    );
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
