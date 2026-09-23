import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Json, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Writes every LICENSE file in the repository from the one at the root, and
 * refuses to write any of them unless that root file is the canonical
 * Apache-2.0 text to the byte.
 *
 * Two different things are being guaranteed, and only the second needs a
 * pinned constant:
 *
 * - **The copies cannot drift.** They are generated, so a typo or a tool's
 *   reformatting in `libs/ts-data-forge/LICENSE` is undone by the next run.
 *   `style-check.yml` runs this and then asserts a clean repository, the same
 *   arrangement `gen:deps-graph` has, so a drifted copy fails there.
 * - **The root cannot drift either.** A generator that copies whatever it
 *   finds would propagate a typo rather than catch it, so the root file is
 *   held to {@link CANONICAL_LICENSE_SHA256} before anything is written. A
 *   hash is what makes "unchanged" mean unchanged: no diff algorithm, no
 *   normalisation, no whitespace judgement.
 *
 * Neither guarantee needs the network. `--verify-upstream` is how the pinned
 * constant is re-derived from apache.org by hand; CI never runs it, because a
 * check that fetches is a check that fails when the fetch does.
 *
 * Not to be confused with `check:root:licenses`
 * (`tools/scripts/cmd/check-licenses.mts`), which reads the licenses of the
 * *dependencies*. This one is about the license this repository itself
 * publishes.
 */
export const genLicenseFiles = async (): Promise<
  Result<GenSummary, string>
> => {
  const rootLicense = await readRootLicense();

  if (Result.isErr(rootLicense)) return rootLicense;

  const manifests = readWorkspaceManifests();

  if (Result.isErr(manifests)) return manifests;

  const manifestViolations = collectManifestViolations(manifests.value);

  if (Arr.isNonEmpty(manifestViolations)) {
    return Result.err(formatManifestViolations(manifestViolations));
  }

  const trackedLicenseFiles = listTrackedLicenseFiles();

  if (Result.isErr(trackedLicenseFiles)) return trackedLicenseFiles;

  const targets = collectLicenseTargets(
    manifests.value,
    trackedLicenseFiles.value,
  );

  const mut_written: string[] = [];

  for (const target of targets) {
    const absolute = path.resolve(projectRootPath, target);

    const current = await readFileOrUndefined(absolute);

    if (current === rootLicense.value) continue;

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package directory pnpm listed.
    await fs.mkdir(path.dirname(absolute), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(absolute, rootLicense.value);

    mut_written.push(target);
  }

  return Result.ok({ targetCount: targets.length, written: mut_written });
};

/**
 * The repo-relative LICENSE paths this generator owns, sorted.
 *
 * Two sources, because neither alone is the whole set. **Every publishable
 * package needs one** whether or not it has one yet — that file is what the
 * npm tarball carries, and a package added tomorrow should not have to
 * remember. **Every LICENSE already tracked stays in step** even where the
 * package is private, because a copy that exists is a copy somebody can read,
 * and one that quietly says something else is worse than none.
 *
 * `experimental/` is excluded on both counts: its contents are snapshots of
 * other repositories, imported under whatever license they carried, and
 * CLAUDE.md keeps this repository's tooling out of them.
 */
export const collectLicenseTargets = (
  manifests: readonly PackageManifest[],
  trackedLicenseFiles: readonly string[],
): readonly string[] =>
  Arr.uniq([
    ...manifests
      .filter(({ isPrivate }) => !isPrivate)
      .map(({ dir }) => `${dir}/${LICENSE_FILE}`),
    ...trackedLicenseFiles,
  ])
    .filter((target) => target !== LICENSE_FILE && !isExperimental(target))
    .toSorted();

/**
 * Publishable packages whose manifest does not name the license this
 * repository publishes under.
 *
 * The file and the field are two statements about the same package, and npm
 * shows the field. A package shipping this Apache-2.0 text while its manifest
 * says MIT is the mismatch nothing else here would notice — the generator
 * would happily write the file. Private packages are not published, so their
 * field answers to nobody.
 */
export const collectManifestViolations = (
  manifests: readonly PackageManifest[],
): readonly Violation[] =>
  manifests
    .filter(
      ({ isPrivate, license }) => !isPrivate && license !== REPOSITORY_LICENSE,
    )
    .filter(({ dir }) => !isExperimental(dir))
    .map(({ dir, license }) => ({
      subject:
        license === undefined
          ? `${dir} (no \`license\` field)`
          : `${dir} (license: '${license}')`,
      message: MANIFEST_VIOLATION_MESSAGE,
    }));

/** Lowercase hexadecimal SHA-256 of `text` read as UTF-8. */
export const sha256Of = (text: string): string =>
  createHash('sha256').update(text, 'utf8').digest('hex');

/**
 * SHA-256 of the Apache License 2.0 as this repository publishes it: the text
 * served at <https://www.apache.org/licenses/LICENSE-2.0.txt>, without the
 * blank line that file opens with. That is what GitHub's own "Apache License
 * 2.0" template produces, and it is what the root LICENSE has always been.
 *
 * Re-derive it with the network and nothing else:
 *
 * ```sh
 * curl -sS https://www.apache.org/licenses/LICENSE-2.0.txt | tail -n +2 | sha256sum
 * ```
 *
 * or with `pnpm run gen:license-files --verify-upstream`, which does the same
 * fetch and compares it to both this constant and the file.
 *
 * **Changing this constant is changing the license the repository publishes
 * under.** It is not the fix for a failing run: a mismatch means the file
 * moved, and the file is what is wrong.
 */
export const CANONICAL_LICENSE_SHA256 =
  'c71d239df91726fc519c6eb72d318ec65820627232b2f796219e87dcf35d0ab4';

/** What this generator reads of a workspace package's manifest. */
export type PackageManifest = Readonly<{
  /** Repo-relative, POSIX separators. */
  dir: string;
  license: string | undefined;
  isPrivate: boolean;
}>;

export type Violation = Readonly<{
  subject: string;
  message: string;
}>;

type GenSummary = Readonly<{
  targetCount: number;
  written: readonly string[];
}>;

const LICENSE_FILE = 'LICENSE';

const REPOSITORY_LICENSE = 'Apache-2.0';

const EXPERIMENTAL_PREFIX = 'experimental/';

const CANONICAL_LICENSE_URL = 'https://www.apache.org/licenses/LICENSE-2.0.txt';

const VERIFY_UPSTREAM_FLAG = '--verify-upstream';

const MANIFEST_VIOLATION_MESSAGE = [
  'is published, so its `license` field is what npm shows, and it does not say',
  `'${REPOSITORY_LICENSE}' — while the LICENSE file beside it does. Make the`,
  'field agree, or make the package private.',
].join(' ');

const isExperimental = (repoRelativePath: string): boolean =>
  repoRelativePath.startsWith(EXPERIMENTAL_PREFIX);

/**
 * The root LICENSE, or why it cannot be trusted as a source.
 *
 * This is the whole of the typo guard: a hash comparison, before any copy is
 * written, against a constant a tool cannot plausibly update in the same
 * edit.
 */
const readRootLicense = async (): Promise<Result<string, string>> => {
  const absolute = path.resolve(projectRootPath, LICENSE_FILE);

  const text = await readFileOrUndefined(absolute);

  if (text === undefined) {
    return Result.err(
      `${LICENSE_FILE} is missing from the repository root, so there is nothing to generate from.`,
    );
  }

  const actual = sha256Of(text);

  return actual === CANONICAL_LICENSE_SHA256
    ? Result.ok(text)
    : Result.err(
        [
          `${LICENSE_FILE} is not the canonical Apache-2.0 text, so nothing was generated.`,
          '',
          `  expected SHA-256: ${CANONICAL_LICENSE_SHA256}`,
          `  actual SHA-256:   ${actual}`,
          '',
          'Something edited it — a tool, a merge, or a hand. Restore it with',
          `\`git checkout -- ${LICENSE_FILE}\` and run this again;`,
          `\`pnpm run gen:license-files ${VERIFY_UPSTREAM_FLAG}\` confirms the`,
          'restored file against apache.org.',
        ].join('\n'),
      );
};

/**
 * Every workspace package, as `pnpm` enumerates them, with the two manifest
 * fields this reads.
 *
 * `pnpm ls` rather than the workspace globs, so that what counts as a package
 * here is what counts as one everywhere else — the generated bundles each
 * TypeScript minor publishes from `strict-lib` included.
 */
const readWorkspaceManifests = (): Result<
  readonly PackageManifest[],
  string
> => {
  const listed = Result.fromThrowable(() =>
    execFileSync('pnpm', ['ls', '--recursive', '--depth', '-1', '--json'], {
      cwd: projectRootPath,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    }),
  );

  if (Result.isErr(listed)) {
    return Result.err(
      `\`pnpm ls\` failed: ${unknownToString(listed.value)}. Run \`pnpm install\` first.`,
    );
  }

  const parsed = Json.parse(listed.value);

  if (Result.isErr(parsed)) {
    return Result.err(`\`pnpm ls\` returned no JSON: ${parsed.value}`);
  }

  const projects = PNPM_PROJECT_LIST.validate(parsed.value);

  if (Result.isErr(projects)) {
    return Result.err(
      Arr.toUnshifted('`pnpm ls` returned something other than projects:')(
        t.validationErrorsToMessages(projects.value),
      ).join('\n'),
    );
  }

  const mut_manifests: PackageManifest[] = [];

  for (const project of projects.value) {
    const dir = toRepoRelative(project.path);

    // The workspace root is a project too, and the file it would name is the
    // source this generator copies from.
    if (dir === '') continue;

    const manifest = readManifest(project.path);

    if (Result.isErr(manifest)) return manifest;

    mut_manifests.push({
      dir,
      license: manifest.value.license,
      isPrivate: manifest.value.private === true,
    });
  }

  return Result.ok(mut_manifests);
};

const PNPM_PROJECT_LIST = t.array(
  t.record({
    name: t.string(),
    path: t.string(),
  }),
);

const PACKAGE_JSON = t.record({
  license: t.optional(t.string()),
  private: t.optional(t.boolean()),
});

const readManifest = (
  packageDir: string,
): Result<t.TypeOf<typeof PACKAGE_JSON>, string> => {
  const manifestPath = path.join(packageDir, 'package.json');

  const text = Result.fromThrowable(() =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    readFileSync(manifestPath, 'utf8'),
  );

  if (Result.isErr(text)) {
    return Result.err(`Failed to read ${manifestPath}.`);
  }

  const parsed = Json.parse(text.value);

  if (Result.isErr(parsed)) {
    return Result.err(`${manifestPath} is not JSON: ${parsed.value}`);
  }

  const validated = PACKAGE_JSON.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(`${manifestPath} has an unexpected shape.`)
    : Result.ok(validated.value);
};

/**
 * The LICENSE files git knows about.
 *
 * Tracked rather than globbed, which keeps `node_modules` and every untracked
 * scratch copy out without a pattern list, and means a file this generator
 * writes is one a review would have seen.
 */
const listTrackedLicenseFiles = (): Result<readonly string[], string> => {
  const listed = Result.fromThrowable(() =>
    execFileSync('git', ['ls-files', '-z', '--', `*${LICENSE_FILE}`], {
      cwd: projectRootPath,
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    }),
  );

  if (Result.isErr(listed)) {
    return Result.err(
      `\`git ls-files\` failed: ${unknownToString(listed.value)}`,
    );
  }

  return Result.ok(
    listed.value
      .split('\0')
      .filter((entry) => path.posix.basename(entry) === LICENSE_FILE),
  );
};

const toRepoRelative = (absolute: string): string =>
  path.relative(projectRootPath, absolute).split(path.sep).join('/');

const readFileOrUndefined = async (
  absolute: string,
): Promise<string | undefined> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a LICENSE path under a package pnpm listed.
  const read = await Result.fromPromise(fs.readFile(absolute, 'utf8'));

  return Result.isErr(read) ? undefined : read.value;
};

const formatManifestViolations = (violations: readonly Violation[]): string =>
  [
    `${violations.length} package(s) publish under a license this repository does not:`,
    '',
    ...violations.map(({ subject, message }) => `  ${subject} ${message}`),
    '',
    'Nothing was generated.',
  ].join('\n');

/**
 * Fetches the canonical text and reports it against both the pinned constant
 * and the file. Run by a person, never by CI.
 */
const verifyUpstream = async (): Promise<Result<string, string>> => {
  const response = await Result.fromPromise(fetch(CANONICAL_LICENSE_URL));

  if (Result.isErr(response) || !response.value.ok) {
    return Result.err(`Could not fetch ${CANONICAL_LICENSE_URL}.`);
  }

  const body = await Result.fromPromise(response.value.text());

  if (Result.isErr(body)) {
    return Result.err(`Could not read ${CANONICAL_LICENSE_URL}.`);
  }

  // apache.org serves the text with one blank line before the title; the
  // form this repository publishes (and GitHub's template writes) has it
  // removed, and nothing else differs.
  const upstream = body.value.startsWith('\n')
    ? body.value.slice(1)
    : body.value;

  const upstreamHash = sha256Of(upstream);

  if (upstreamHash !== CANONICAL_LICENSE_SHA256) {
    return Result.err(
      [
        `${CANONICAL_LICENSE_URL} no longer hashes to the pinned constant.`,
        '',
        `  pinned:   ${CANONICAL_LICENSE_SHA256}`,
        `  upstream: ${upstreamHash}`,
        '',
        'Either the served text changed, or the constant is wrong. Read the',
        'two before touching either.',
      ].join('\n'),
    );
  }

  const rootLicense = await readRootLicense();

  return Result.isErr(rootLicense)
    ? rootLicense
    : Result.ok(
        [
          `${CANONICAL_LICENSE_URL} matches the pinned constant, and`,
          `${LICENSE_FILE} matches both.`,
        ].join(' '),
      );
};

if (isDirectlyExecuted(import.meta.url)) {
  if (process.argv.includes(VERIFY_UPSTREAM_FLAG)) {
    const result = await verifyUpstream();

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }

    console.info(result.value);
  } else {
    const result = await genLicenseFiles().catch((error: unknown) =>
      Result.err(unknownToString(error)),
    );

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(1);
    }

    console.info(
      Arr.isNonEmpty(result.value.written)
        ? Arr.toUnshifted(
            `Wrote ${result.value.written.length} of ${result.value.targetCount} LICENSE file(s):`,
          )(result.value.written.map((target) => `  ${target}`)).join('\n')
        : `${result.value.targetCount} LICENSE file(s) are the canonical Apache-2.0 text already.`,
    );
  }
}
