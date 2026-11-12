import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { parse } from 'yaml';
import {
  memberManifestGlobs,
  parseWorkspacePackages,
  PNPM_WORKSPACE_FILE_NAME,
  readPnpmWorkspaceFile,
} from '../lib/workspace-globs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a workspace manifest names a dependency with a specifier the
 * repository's rules do not allow:
 *
 * 1. A workspace member in `devDependencies` is `workspace:*`.
 * 2. A workspace member in `dependencies` or `optionalDependencies` is
 *    `workspace:^`, `workspace:~` or `workspace:*`.
 * 3. A `devDependencies` entry that has an entry in the default catalog of
 *    `pnpm-workspace.yaml` is `catalog:` (`catalog:default` or a named
 *    catalog, `catalog:<name>`, follows a catalog too).
 * 4. A published package (not `private`) names nothing `catalog:` outside
 *    `devDependencies`.
 *
 * Each breach installs, builds and passes everything else: a literal
 * devDependency version beside a catalog entry silently stops following the
 * catalog, and a `catalog:` in a published field puts the catalog's exact pin
 * into what consumers install. Rules 1 and 2 leave a workspace member in
 * `peerDependencies` alone: a literal range there is the published contract,
 * and `workspace:^` is not wrong either. The root manifest is read too, as pnpm
 * counts it a member.
 */
export const checkDependencySpecifiers = async (): Promise<
  Result<string, string>
> => {
  const workspace = await readPnpmWorkspaceFile();

  if (Result.isErr(workspace)) {
    return Result.err(`❌ ${workspace.value}`);
  }

  const catalogNames = parseCatalogNames(workspace.value);

  if (Result.isErr(catalogNames)) {
    return Result.err(`❌ ${catalogNames.value}`);
  }

  // The globs go through the shared reader every guard uses, so that this one
  // lists the same members as the rest; the YAML parse above reads the catalog.
  const memberGlobs = parseWorkspacePackages(workspace.value);

  if (Result.isErr(memberGlobs)) {
    return Result.err(`❌ ${memberGlobs.value}`);
  }

  const files = await glob(
    Arr.toUnshifted('package.json')(memberManifestGlobs(memberGlobs.value)),
    {
      cwd: projectRootPath,
      ignore: ['**/node_modules/**'],
      absolute: true,
    },
  );

  if (Result.isErr(files)) {
    return Result.err(
      `❌ Failed to list package.json files: ${unknownToString(files.value)}`,
    );
  }

  const read = await Promise.all(
    files.value.toSorted().map(async (absolutePath) => {
      const relativePath = path
        .relative(projectRootPath, absolutePath)
        .split(path.sep)
        .join('/');

      const content = await Result.fromPromise(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(absolutePath, 'utf8'),
      );

      return Result.isErr(content)
        ? Result.err(`${relativePath}: ${unknownToString(content.value)}`)
        : parseManifest(relativePath, content.value);
    }),
  );

  const unreadable = read.filter(Result.isErr).map(({ value }) => value);

  if (Arr.isNonEmpty(unreadable)) {
    return Result.err(
      ['❌ Failed to read workspace manifests:', ...unreadable].join('\n  '),
    );
  }

  const manifests = read.filter(Result.isOk).map(({ value }) => value);

  const { findings, unusedExemptions, exemptedCount } =
    findDependencySpecifierProblems({
      manifests,
      catalogNames: catalogNames.value,
      exemptions: EXEMPTIONS,
    });

  if (Arr.isNonEmpty(findings) || Arr.isNonEmpty(unusedExemptions)) {
    return Result.err(
      [
        ...(Arr.isNonEmpty(findings)
          ? [
              `❌ ${findings.length} dependency specifier(s) break the workspace's rules:`,
              '',
              ...findings.map((finding) => `  ${finding}`),
              '',
              'Write the specifier expected. A deliberate exception is an entry in',
              'EXEMPTIONS in tools/scripts/cmd/check-dependency-specifiers.mts, with',
              'its reason.',
            ]
          : []),
        // An exemption is listed here when it covers no specifier the rules
        // refuse and no finding names it (see findDependencySpecifierProblems).
        // That has several causes, each with its own fix (among them: its
        // entries follow the rules now or are gone, its manifest pattern went
        // stale, the catalog no longer has the entry that brings it under rule
        // 3), so the message states the fact and names none.
        ...(Arr.isNonEmpty(unusedExemptions)
          ? [
              ...(Arr.isNonEmpty(findings) ? [''] : []),
              `❌ ${unusedExemptions.length} exemption(s) in tools/scripts/cmd/check-dependency-specifiers.mts cover no specifier the rules refuse:`,
              '',
              ...unusedExemptions.flatMap(
                ({ manifest, field, dependency, specifier, reason }) => [
                  `  \`${manifest.source}\` ${field}.${dependency}, exempting specifiers that match \`${specifier.source}\``,
                  `    (${reason})`,
                ],
              ),
              '',
              'An exemption has to cover a specifier the rules refuse.',
            ]
          : []),
      ].join('\n'),
    );
  }

  return Result.ok(
    `${manifests.length} manifest(s) checked against ${catalogNames.value.size} catalog entries; ${exemptedCount} exempt specifier(s); none breaks the rules.`,
  );
};

/**
 * The specifiers in `manifests` that break a rule and no exemption allows, as
 * one message each; the exemptions that allowed none and that no message names;
 * and how many specifiers an exemption allowed.
 */
export const findDependencySpecifierProblems = ({
  manifests,
  catalogNames,
  exemptions,
}: Readonly<{
  manifests: readonly Readonly<{ relativePath: string; manifest: unknown }>[];
  catalogNames: ReadonlySet<string>;
  exemptions: readonly DependencySpecifierExemption[];
}>): Readonly<{
  findings: readonly string[];
  unusedExemptions: readonly DependencySpecifierExemption[];
  exemptedCount: number;
}> => {
  const memberNames = new Set(
    Arr.generate(function* () {
      for (const { manifest } of manifests) {
        if (
          isRecord(manifest) &&
          hasKey(manifest, 'name') &&
          isString(manifest.name)
        ) {
          yield manifest.name;
        }
      }
    }),
  );

  const breaches = manifests.flatMap(({ relativePath, manifest }) => {
    if (!isRecord(manifest)) {
      return [];
    }

    const published = !(
      hasKey(manifest, 'private') && manifest.private === true
    );

    return DEPENDENCY_FIELDS.flatMap((field) => {
      const entries =
        hasKey(manifest, field) && isRecord(manifest[field])
          ? Object.entries(manifest[field])
          : ([] as const);

      return entries.flatMap(([dependency, specifier]) => {
        if (!isString(specifier)) {
          return [];
        }

        const expected = expectedSpecifier({
          field,
          specifier,
          isMember: memberNames.has(dependency),
          hasCatalogEntry: catalogNames.has(dependency),
          published,
        });

        return expected === undefined
          ? []
          : [{ relativePath, field, dependency, specifier, expected }];
      });
    });
  });

  // The exemption that names a breach's entry (manifest, field, dependency)
  // either allows it, when the specifier keeps the exemption's form, or is
  // named by its finding, since the fix is then the form or the exemption, not
  // the rule's specifier alone. No two exemptions name one entry, so the first
  // that does is the one.
  const judged = breaches.map((breach) => {
    const named = exemptions.find(
      ({ manifest, field, dependency }) =>
        manifest.test(breach.relativePath) &&
        field === breach.field &&
        dependency === breach.dependency,
    );

    return {
      breach,
      named,
      allowed: named?.specifier.test(breach.specifier) === true,
    };
  });

  // Every exemption that allowed a specifier or that a finding names; the rest
  // are reported unused.
  const usedExemptions = new Set<DependencySpecifierExemption>(
    Arr.generate(function* () {
      for (const { named } of judged) {
        if (named !== undefined) {
          yield named;
        }
      }
    }),
  );

  const findings = judged
    .filter(({ allowed }) => !allowed)
    .map(
      ({
        breach: { relativePath, field, dependency, specifier, expected },
        named,
      }) =>
        named === undefined
          ? `${relativePath}: ${field}.${dependency} is "${specifier}"; expected ${expected}`
          : `${relativePath}: ${field}.${dependency} is "${specifier}"; expected ${named.form}, the form an exemption keeps (${named.reason}); or, if that reason no longer holds for it, ${expected}, with the exemption narrowed or deleted`,
    );

  return {
    findings,
    unusedExemptions: exemptions.filter(
      (exemption) => !usedExemptions.has(exemption),
    ),
    exemptedCount: judged.length - findings.length,
  };
};

/**
 * The dependency names the default catalog of `pnpm-workspace.yaml` has an
 * entry for: `catalog`, or `catalogs.default`, which pnpm reads as the same.
 */
export const parseCatalogNames = (
  content: string,
): Result<ReadonlySet<string>, string> => {
  const result = Result.fromThrowable((): unknown => parse(content));

  if (Result.isErr(result)) {
    return Result.err(
      `Failed to parse ${PNPM_WORKSPACE_FILE_NAME}: ${unknownToString(result.value)}`,
    );
  }

  const parsed = result.value;

  if (!isRecord(parsed)) {
    return Result.err(`${PNPM_WORKSPACE_FILE_NAME} is not a mapping.`);
  }

  const catalogs = [
    ...(hasKey(parsed, 'catalog') ? [parsed.catalog] : []),
    ...(hasKey(parsed, 'catalogs') &&
    isRecord(parsed.catalogs) &&
    hasKey(parsed.catalogs, 'default')
      ? [parsed.catalogs.default]
      : []),
  ].filter(isRecord);

  return Arr.isNonEmpty(catalogs)
    ? Result.ok(new Set<string>(catalogs.flatMap((c) => Object.keys(c))))
    : Result.err(`${PNPM_WORKSPACE_FILE_NAME} has no default catalog.`);
};

/**
 * The manifest `content` read from `relativePath`, or why it cannot be read,
 * naming the file.
 */
export const parseManifest = (
  relativePath: string,
  content: string,
): Result<Readonly<{ relativePath: string; manifest: unknown }>, string> => {
  const manifest = Json.parse(content);

  return Result.isErr(manifest)
    ? Result.err(`${relativePath}: ${unknownToString(manifest.value)}`)
    : Result.ok({ relativePath, manifest: manifest.value });
};

/** A specifier the rules refuse, allowed in the manifests a pattern matches. */
export type DependencySpecifierExemption = Readonly<{
  /** Matched against the manifest's repository-relative path. */
  manifest: RegExp;
  field: DependencyField;
  dependency: string;
  /**
   * The form the exempted specifier has to keep. In another form the rules
   * refuse, it is a finding again, and the finding names this exemption.
   */
  specifier: RegExp;
  /** {@link specifier} in words, for the messages. */
  form: string;
  reason: string;
}>;

/**
 * An exact version as the repository writes one, `X.Y.Z` or `X.Y.Z-<pre>`. A
 * pin written otherwise (`=X.Y.Z`, build metadata) is refused. Within these two
 * spellings the pattern is loose and no semver check: it takes `07.0.2` and
 * `7.0.2-a..b`. It is written with `$` in each branch because
 * `security/detect-unsafe-regex` refuses the optional group `(?:-…)?$`.
 */
export const EXACT_VERSION = {
  specifier: /^\d+\.\d+\.\d+(?:$|-[\d.A-Za-z-]+$)/u,
  form: 'an exact version (X.Y.Z or X.Y.Z-<pre>)',
} as const;

/**
 * The specifiers that break a rule on purpose. An entry that no longer exempts
 * anything fails the guard, so the list cannot outlive its reason.
 */
export const EXEMPTIONS: readonly DependencySpecifierExemption[] = [
  // The form alone is held: which version a harness pins is its own concern.
  {
    manifest: /^strict-lib\/v\d+\.\d+\/package\.json$/u,
    field: 'devDependencies',
    dependency: 'typescript',
    ...EXACT_VERSION,
    reason:
      'each strict-lib harness pins the TypeScript minor it converts, so it cannot follow the catalog',
  },
  {
    manifest: /^strict-lib\/scripts-common\/package\.json$/u,
    field: 'devDependencies',
    dependency: 'typescript',
    ...EXACT_VERSION,
    reason:
      'the converter parses the lib files with the TypeScript it pins, so moving the catalog does not change the committed strict-lib output',
  },
  {
    manifest: /^strict-lib\/v\d+\.\d+\/output\/lib\/package\.json$/u,
    field: 'dependencies',
    dependency: 'ts-type-forge',
    specifier: /^\^\d+\.0\.0$/u,
    form: 'a ^<major>.0.0 range',
    reason:
      'the bundle manifests are generated by strict-lib:gen:packages with a ^<major>.0.0 range',
  },
] as const;

// Every field a dependency specifier sits in, listed here rather than taken
// from RUNTIME_DEPENDENCY_FIELDS, whose list follows what changesets bumps.
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

type DependencyField = (typeof DEPENDENCY_FIELDS)[number];

/**
 * What the rules expect in place of `specifier`, worded for the message, or
 * `undefined` when `specifier` follows them.
 */
const expectedSpecifier = ({
  field,
  specifier,
  isMember,
  hasCatalogEntry,
  published,
}: Readonly<{
  field: DependencyField;
  specifier: string;
  isMember: boolean;
  hasCatalogEntry: boolean;
  published: boolean;
}>): string | undefined => {
  if (isMember && field === 'devDependencies') {
    return specifier === 'workspace:*'
      ? undefined
      : '"workspace:*" (a workspace member in devDependencies)';
  }

  if (
    isMember &&
    (field === 'dependencies' || field === 'optionalDependencies')
  ) {
    return /^workspace:[*^~]$/u.test(specifier)
      ? undefined
      : '"workspace:^", "workspace:~" or "workspace:*" (a workspace member)';
  }

  // Only devDependencies have to follow the catalog: an app's runtime
  // dependency may keep a range of its own, as pnpm-workspace.yaml's header
  // makes the catalog "the versions of shared devDependencies".
  if (!isMember && hasCatalogEntry && field === 'devDependencies') {
    // `catalog:default` and a named catalog follow a catalog too.
    return specifier.startsWith('catalog:')
      ? undefined
      : '"catalog:" (pnpm-workspace.yaml has a catalog entry for it)';
  }

  if (
    published &&
    field !== 'devDependencies' &&
    specifier.startsWith('catalog:')
  ) {
    return 'a literal range (a published package states its own ranges)';
  }

  return undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDependencySpecifiers().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
