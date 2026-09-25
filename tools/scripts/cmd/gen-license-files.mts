import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Json, Result, unknownToString } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Writes each package's LICENSE from the license its own `package.json`
 * declares, and refuses to write anything it cannot state exactly.
 *
 * **The `license` field decides, not the file.** A LICENSE file is a copy of
 * a text; the field is the claim npm shows and the one a consumer reads
 * first. Deriving the file from the field is what keeps them from saying
 * different things — a package cannot end up shipping this Apache-2.0 text
 * under a manifest that says MIT, because the text it gets is the text its
 * own declaration names.
 *
 * Three guarantees, and only the last needs a pinned constant:
 *
 * - **Every published package has one.** The target list comes from the
 *   workspace, so a package added tomorrow is covered without anyone
 *   remembering. A publishable package with no `license` field fails rather
 *   than being given one — which license it is under is not this script's to
 *   decide.
 * - **No copy can drift.** They are generated, so a typo or a tool's
 *   reformatting is undone by the next run. `style-check.yml` runs this and
 *   then asserts a clean repository, the arrangement `gen:deps-graph` has, so
 *   a drifted copy fails there naming the file.
 * - **The source cannot drift either.** A generator that copied whatever it
 *   found would propagate a typo rather than catch it, so the root LICENSE is
 *   held to {@link CANONICAL_LICENSE_SHA256} before anything is written. A
 *   hash is what makes "unchanged" mean unchanged: no diff algorithm, no
 *   normalisation, no whitespace judgement.
 *
 * **It knows one license, on purpose.** Every package here is Apache-2.0 and
 * the root LICENSE is its verified text, so that text is the whole of
 * {@link licenseTextsFrom}. A package declaring anything else fails, naming
 * what supporting it would take — storing that license's text and pinning its
 * hash — rather than being quietly given the wrong file. Teaching this a
 * second license is a change to make when there is a second license, against
 * a real example.
 *
 * None of it needs the network. `--verify-upstream` is how the pinned
 * constant is re-derived from apache.org by hand; CI never runs it, because a
 * check that fetches is a check that fails when the fetch does.
 *
 * Not to be confused with `check:root:licenses`
 * (`tools/scripts/cmd/check-licenses.mts`), which reads the licenses of the
 * *dependencies*. This one is about the license this repository publishes.
 */
export const genLicenseFiles = async (): Promise<
  Result<GenSummary, string>
> => {
  const rootLicense = await readRootLicense();

  if (Result.isErr(rootLicense)) {
    return rootLicense;
  }

  const manifests = readWorkspaceManifests();

  if (Result.isErr(manifests)) {
    return manifests;
  }

  const rootDeclaration = checkRootDeclaration(manifests.value);

  if (Result.isErr(rootDeclaration)) {
    return rootDeclaration;
  }

  const trackedLicenseFiles = listTrackedLicenseFiles();

  if (Result.isErr(trackedLicenseFiles)) {
    return trackedLicenseFiles;
  }

  const licenseTexts = licenseTextsFrom(rootLicense.value);

  const violations = collectViolations(
    manifests.value,
    collectOrphanLicenseFiles(manifests.value, trackedLicenseFiles.value),
    new Set(licenseTexts.keys()),
  );

  if (Arr.isNonEmpty(violations)) {
    return Result.err(formatViolations(violations));
  }

  const targets = collectLicenseTargets(manifests.value);

  const mut_written: string[] = [];

  for (const target of targets) {
    const text = licenseTexts.get(target.license);

    // `collectViolations` has refused every license with no text, so this
    // cannot be missing; the lookup is what proves it.
    if (text === undefined) {
      continue;
    }

    if (await writeIfDifferent(target.path, text)) {
      mut_written.push(target.path);
    }
  }

  return Result.ok({ targetCount: targets.length, written: mut_written });
};

/**
 * Which packages carry a LICENSE, and which license each one's is.
 *
 * **A file exists exactly where a tarball carries one**, which is to say at
 * every publishable package and nowhere else. That is the whole of the rule,
 * and it is a property of the manifests rather than of the working tree.
 *
 * A LICENSE earns its place by travelling with the artifact. npm puts one in
 * the tarball, so a published package needs it. A private package is
 * conveyed to nobody by npm, and where its output *is* distributed — a served
 * site, an extension's zip — what governs is whether the license is inside
 * that artifact, which a file sitting in the source directory does not
 * achieve. Putting one there would be decoration, in a public repository
 * whose root LICENSE already governs everything in it. So private packages
 * get none, and {@link collectViolations} reports one that has appeared.
 *
 * A package with no `license` field yields no target and is reported there
 * too: the field is the declaration, and guessing it is the one thing this
 * script must not do.
 */
export const collectLicenseTargets = (
  manifests: readonly PackageManifest[],
): readonly LicenseTarget[] =>
  manifests
    .filter(({ dir }) => !isRoot(dir) && !isExperimental(dir))
    .filter(({ isPrivate }) => !isPrivate)
    .flatMap(({ dir, license }) =>
      license === undefined
        ? []
        : [{ path: `${dir}/${LICENSE_FILE}`, license }],
    )
    .toSorted((a, b) => compareStrings(a.path, b.path));

/**
 * Every way the declarations and the files fail to be one statement.
 *
 * **Every package declares a license, private ones included.** Nothing else
 * asks: measured on npm 11 and pnpm 12, a missing `license` field is not a
 * warning at `install`, at `pack` or at `publish` — the registry simply shows
 * the package as having none. It is the field a consumer reads first, and for
 * a package that is private today it is the statement that is already right
 * when it stops being private.
 *
 * `experimental/` is exempt throughout: its contents are snapshots of other
 * repositories, imported under whatever license they carried.
 */
export const collectViolations = (
  manifests: readonly PackageManifest[],
  orphanLicenseFiles: readonly string[],
  knownLicenses: ReadonlySet<string>,
): readonly Violation[] => {
  const packages = manifests.filter(
    ({ dir }) => !isRoot(dir) && !isExperimental(dir),
  );

  return [
    ...packages.flatMap(({ dir, license, isPrivate, hasLicenseFile }) => [
      ...(license === undefined
        ? [{ subject: dir, message: REASONS['no-field'] }]
        : // Only a published package has a file written for it, so only there
          // does the declaration have to be one this can write the text of. A
          // private package's names itself and nothing else.
          !isPrivate && !knownLicenses.has(license)
          ? [
              {
                subject: `${dir} (license: '${license}')`,
                message: unknownLicenseMessage(knownLicenses),
              },
            ]
          : []),

      ...(isPrivate && hasLicenseFile
        ? [{ subject: dir, message: REASONS['private-file'] }]
        : []),
    ]),

    ...orphanLicenseFiles.map((file) => ({
      subject: file,
      message: REASONS.orphan,
    })),
  ];
};

/**
 * The license texts this script can write, by SPDX identifier.
 *
 * One entry, and the root LICENSE is it. A second means storing that
 * license's text where this can read it and pinning its hash the way
 * {@link CANONICAL_LICENSE_SHA256} pins this one — an unverified copy is the
 * problem this script exists to prevent, not a shortcut it may take.
 */
export const licenseTextsFrom = (
  rootLicenseText: string,
): ReadonlyMap<string, string> =>
  new Map([[REPOSITORY_LICENSE, rootLicenseText]]);

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

/** What this generator reads of a workspace package. */
export type PackageManifest = Readonly<{
  /** Repo-relative with POSIX separators; `''` for the workspace root. */
  dir: string;
  license: string | undefined;
  isPrivate: boolean;
  hasLicenseFile: boolean;
}>;

export type LicenseTarget = Readonly<{
  /** Repo-relative path of the file to write. */
  path: string;
  /** The SPDX identifier its package declares. */
  license: string;
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

const MANIFEST_FILE = 'package.json';

const REPOSITORY_LICENSE = 'Apache-2.0';

const EXPERIMENTAL_PREFIX = 'experimental/';

const CANONICAL_LICENSE_URL = 'https://www.apache.org/licenses/LICENSE-2.0.txt';

const VERIFY_UPSTREAM_FLAG = '--verify-upstream';

const REASONS = {
  'no-field': [
    `needs a \`license\` field in its ${MANIFEST_FILE}. Nothing else asks for`,
    'one — npm and pnpm neither warn nor fail without it — and it is what a',
    'consumer reads first, so every package here declares one, private ones',
    'included. For a published package it also decides which text is written',
    'beside it, and which license that is is not this script’s to guess.',
  ].join(' '),

  'private-file': [
    `is private, so it carries a ${LICENSE_FILE} to nobody: npm publishes no`,
    'tarball for it, and a file in the source directory is in no artifact it',
    'deploys either. The root LICENSE governs the whole repository. Delete it,',
    'or publish the package.',
  ].join(' '),

  orphan: [
    `is a ${LICENSE_FILE} beside no ${MANIFEST_FILE}, so no declaration owns it`,
    'and nothing keeps it true. Move it into a package, or delete it.',
  ].join(' '),
} as const;

const unknownLicenseMessage = (knownLicenses: ReadonlySet<string>): string =>
  [
    'declares a license this script cannot write the text of. It knows',
    `${Array.from(knownLicenses).toSorted(compareStrings).join(', ')}, because`,
    'that text is in the repository and pinned to a hash. Supporting another',
    'means storing its text the same way — an unverified copy is what this',
    'script exists to prevent. Until then, the declaration is what to change.',
  ].join(' ');

const isRoot = (dir: string): boolean => dir === '';

const isExperimental = (repoRelativePath: string): boolean =>
  repoRelativePath.startsWith(EXPERIMENTAL_PREFIX);

const compareStrings = (a: string, b: string): number =>
  a < b ? -1 : a > b ? 1 : 0;

/**
 * The root LICENSE, or why it cannot be trusted as a source.
 *
 * This is the whole of the typo guard: a hash comparison, before any copy is
 * written, against a constant a tool cannot plausibly update in the same edit.
 */
const readRootLicense = async (): Promise<Result<string, string>> => {
  const text = await readFileOrUndefined(LICENSE_FILE);

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
 * The root declares the license whose text it stores.
 *
 * Checked apart from the rest because the root LICENSE is the source rather
 * than a generated copy: nothing would otherwise compare the one declaration
 * that decides what every copy says.
 */
const checkRootDeclaration = (
  manifests: readonly PackageManifest[],
): Result<undefined, string> => {
  const root = manifests.find(({ dir }) => isRoot(dir));

  return root === undefined || root.license === REPOSITORY_LICENSE
    ? Result.ok(undefined)
    : Result.err(
        [
          `The root ${MANIFEST_FILE} declares`,
          root.license === undefined ? 'no license' : `'${root.license}'`,
          `while the root ${LICENSE_FILE} beside it is the ${REPOSITORY_LICENSE}`,
          'text. One of the two is wrong, and nothing was generated.',
        ].join(' '),
      );
};

/**
 * Every workspace package, with the `package.json` fields this reads and
 * whether a LICENSE sits beside it.
 *
 * `pnpm ls` rather than a glob for manifests, so that what counts as a
 * package here is what counts as one everywhere else. A glob would also reach
 * the per-group manifests the strict-lib bundles generate beside their
 * declarations, which name no package anyone installs and are kept out of the
 * tarball on purpose.
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
    const manifest = readManifest(project.path);

    if (Result.isErr(manifest)) {
      return manifest;
    }

    mut_manifests.push({
      dir: toRepoRelative(project.path),
      license: manifest.value.license,
      isPrivate: manifest.value.private === true,
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package directory pnpm listed.
      hasLicenseFile: existsSync(path.join(project.path, LICENSE_FILE)),
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
  const manifestPath = path.join(packageDir, MANIFEST_FILE);

  const text = Result.fromThrowable(() =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package directory pnpm listed.
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
 * Tracked LICENSE files that sit in no package.
 *
 * Finding these is the only thing the file list is used for. What gets
 * written is decided by the declarations alone — a file's existence must not
 * be what makes it correct, or a stray copy would keep itself alive.
 */
const collectOrphanLicenseFiles = (
  manifests: readonly PackageManifest[],
  trackedLicenseFiles: readonly string[],
): readonly string[] => {
  const packageDirs = new Set(manifests.map(({ dir }) => dir));

  return trackedLicenseFiles
    .filter((file) => !isExperimental(file))
    .filter((file) => !packageDirs.has(dirnameOf(file)));
};

/** `''` for a file at the repository root, matching {@link PackageManifest.dir}. */
const dirnameOf = (repoRelativePath: string): string => {
  const parent = path.posix.dirname(repoRelativePath);

  return parent === '.' ? '' : parent;
};

/**
 * The LICENSE files git knows about.
 *
 * Tracked rather than globbed, which keeps `node_modules` and every untracked
 * scratch copy out without a pattern list.
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

/** `true` when the file was written, `false` when it already said this. */
const writeIfDifferent = async (
  repoRelativePath: string,
  text: string,
): Promise<boolean> => {
  if ((await readFileOrUndefined(repoRelativePath)) === text) {
    return false;
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under a package pnpm listed.
  await fs.writeFile(path.resolve(projectRootPath, repoRelativePath), text);

  return true;
};

const readFileOrUndefined = async (
  repoRelativePath: string,
): Promise<string | undefined> => {
  const read = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path under a package pnpm listed.
    fs.readFile(path.resolve(projectRootPath, repoRelativePath), 'utf8'),
  );

  return Result.isErr(read) ? undefined : read.value;
};

const toRepoRelative = (absolute: string): string =>
  path.relative(projectRootPath, absolute).split(path.sep).join('/');

const formatViolations = (violations: readonly Violation[]): string =>
  [
    `${violations.length} package(s) or file(s) do not state one license:`,
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

  // apache.org serves the text with one blank line before the title; the form
  // this repository publishes (and GitHub's template writes) has it removed,
  // and nothing else differs.
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
            `Wrote ${result.value.written.length} of ${result.value.targetCount} ${LICENSE_FILE} file(s):`,
          )(result.value.written.map((target) => `  ${target}`)).join('\n')
        : [
            `${result.value.targetCount} ${LICENSE_FILE} file(s) already say what`,
            'their package declares.',
          ].join(' '),
    );
  }
}
