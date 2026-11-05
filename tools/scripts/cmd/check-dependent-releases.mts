import { assembleReleasePlan } from '@changesets/assemble-release-plan';
import type { NewChangeset } from '@changesets/types';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, glob, isDirectlyExecuted } from 'ts-repo-utils';
import type { DeepReadonly, ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  CHANGESETS_CONFIG_FILE,
  isBreaking,
  isBreakingRelease,
  listChangesetBumps,
  readChangesets,
  readChangesetsConfigFile,
  readReleaseConfig,
  toChangesetsWorkspace,
  type Bump,
  type ChangesetBump,
  type ChangesetFile,
} from '../lib/changesets.mjs';
import { RUNTIME_DEPENDENCY_FIELDS } from '../lib/dependency-fields.mjs';
import { plural } from '../lib/plural.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Holds a breaking release of a workspace package until every published package
 * that re-exports it, or that names it in `peerDependencies` and is released
 * with it, is given a breaking release too, and lists the other dependents for
 * review.
 *
 * changesets releases the dependents of a released package as a dependency
 * update, with a `patch` — even when the dependency's release is a major, and
 * whether the edge is in `dependencies`, `optionalDependencies` or
 * `peerDependencies`. Whatever of the dependency's break the dependent lets
 * through thereby reaches its own consumers in a patch, with nothing in its
 * changelog to say so. Only a `linked` group raises that patch
 * (`check:prose:linked-releases`), and `linked` cannot join packages whose
 * versions are on different lines.
 *
 * What is asked of a dependent that has no breaking changeset of its own:
 *
 * - **peer** — it names the dependency in `peerDependencies`, and is released
 *   with it. Releasing the dependent moves the peer range to the dependency's
 *   new version (`workspace:^` is published as `^<version>`, `>=6.2.1` becomes
 *   `>=<version>`), and consumers install the peer themselves, so updating the
 *   dependent alone asks them to take the dependency's break. That follows
 *   from the edge, whatever `src/` does with it, so the check fails as for a
 *   re-export. Whether the dependent is released is what `changeset version`
 *   would decide: the release plan `@changesets/assemble-release-plan` makes of
 *   the changesets and `.changeset/config.json`, which releases a dependent
 *   whose range the dependency's next version leaves (`workspace:^`,
 *   `^6.2.1`), one another released dependency reaches, and the members of a
 *   `fixed` group. A peer edge the plan does not release, such as `>=6.2.1` on
 *   a dependent nothing else releases, moves nothing, and is read as any other
 *   edge. No override applies to a peer edge any breaking release of the
 *   dependency releases.
 * - **re-export** — its `src/` exports a binding it imports from the
 *   dependency, as such or as an alias ({@link findReExportedPackages}), read
 *   as TypeScript syntax. The dependency's break is, nearly always, the
 *   dependent's, so the check fails until a changeset gives the dependent a
 *   breaking bump whose text is what its consumers read.
 * - **review** — any other runtime dependency. Some of the break may still
 *   get through — a type in the dependent's signatures, the behavior of a
 *   function or a CLI built on the dependency — but whether it does depends on
 *   what broke, which no reading of the edge can tell. These are listed,
 *   grouped by dependency, without holding the release; those the plan does
 *   not release apart, since where a range of theirs admits the new version,
 *   their consumers get it with no release of theirs. The dependents' own
 *   tests run against the new dependency in the same pull request, which
 *   catches the behavior they cover; the list is for what they do not.
 *
 * Every edge that is not a re-export is reviewed, rather than only those
 * declared to expose something, so that an edge nobody thought to declare is
 * not silently passed.
 *
 * A package's breaking release, the dependency's or the dependent's, is read
 * from its own changesets and from the `fixed` and `linked` groups in
 * `.changeset/config.json` (as `@changesets/config` reads it, globs expanded):
 * a breaking bump of any member counts for every member. For `linked` that is
 * what `check:prose:linked-releases` already requires the changesets to say.
 *
 * A breaking bump is `major`, or `minor` while the package is still `0.x`.
 * The dependents checked are the published workspace packages, other than the
 * strict standard library bundles: a changeset never names one (they release
 * through their `-source` harnesses, see CLAUDE.md), so no advice here could be
 * followed for them.
 *
 * Where detection is wrong, {@link OVERRIDES} corrects it. The check fails on
 * an override that has gone stale: an edge that is no longer a runtime
 * dependency of a checked package, or one that says what detection already
 * finds.
 *
 * It is a `check:prose` guard because a changeset is Markdown, and
 * `code-check.yml` skips a diff of Markdown alone.
 * It reads `src/` as syntax only, so it needs no build.
 */
export const checkDependentReleases = ({
  changesets,
  config,
  packages,
  reExports,
  overrides,
}: Readonly<{
  changesets: readonly ChangesetFile[];
  /** `.changeset/config.json`, parsed as JSON. */
  config: unknown;
  packages: readonly WorkspacePackage[];
  /**
   * Per dependent, the packages its `src/` re-exports from, each with the files
   * that do.
   */
  reExports: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>;
  overrides: readonly ExposureOverride[];
}>): Result<Summary, string> => {
  const versions = new Map(
    packages.map(({ name, version }) => [name, version]),
  );

  const bumps = listChangesetBumps(changesets);

  const workspace = toChangesetsWorkspace(packages);

  const validated = readReleaseConfig(config, packages);

  if (Result.isErr(validated)) {
    return validated;
  }

  const changesetsConfig = validated.value;

  const groups: readonly ReleaseGroup[] = [
    ...changesetsConfig.fixed.map((members) => ({
      kind: 'fixed' as const,
      members,
    })),
    ...changesetsConfig.linked.map((members) => ({
      kind: 'linked' as const,
      members,
    })),
  ] as const;

  /**
   * What `changeset version` releases of `planned`: each package it releases,
   * by name, with the version it moves from and to.
   */
  const planReleases = (
    planned: readonly ChangesetBump[],
  ): Result<ReadonlyMap<string, PlannedRelease>, string> =>
    Result.mapErr(
      Result.fromThrowable(
        () =>
          new Map(
            assembleReleasePlan(
              Array.from(toNewChangesets(planned)),
              workspace,
              changesetsConfig,
              undefined,
            )
              .releases.filter(({ type }) => type !== 'none')
              // From the version in the manifest: the plan reports a member of
              // a release group as moving from the group's version, which a
              // lagging member never had.
              .map(
                ({ name, oldVersion, newVersion }) =>
                  [
                    name,
                    {
                      from: versions.get(name) ?? oldVersion ?? '',
                      to: newVersion ?? '',
                    },
                  ] as const,
              ),
          ),
      ),
      unknownToString,
    );

  const plan = planReleases(bumps);

  if (Result.isErr(plan)) {
    return Result.err(
      `❌ changesets cannot make a release plan of the changesets: ${plan.value}`,
    );
  }

  // The packages `changeset version` releases.
  const releasing: ReadonlySet<string> = new Set(plan.value.keys());

  /**
   * What makes `name`'s release breaking: the changesets that give it, or one
   * of its release groups, a breaking bump; or else the release plan, when it
   * moves the package across a major with no such changeset — a lagging member
   * of a `fixed` or `linked` group taken to the group's version (#3309).
   */
  const pendingOf = (name: string): readonly Pending[] => {
    const causes = findBreaking(name, bumps, groups, versions);

    if (Arr.isNonEmpty(causes)) {
      return causes;
    }

    const planned = plan.value.get(name);

    return planned !== undefined && isBreakingRelease(planned.from, planned.to)
      ? [
          {
            file: CHANGESETS_CONFIG_FILE,
            name,
            bump: 'patch',
            via: undefined,
            planned,
          },
        ]
      : [];
  };

  const breakingDependents = new Set(
    packages
      .filter(({ name }) => Arr.isNonEmpty(pendingOf(name)))
      .map(({ name }) => name),
  );

  // One edge per dependent and dependency, however many fields name it.
  const edges: readonly Edge[] = packages
    .filter(({ released }) => released)
    .flatMap(({ name, version, dependencies }) =>
      Array.from(
        Map.groupBy(
          dependencies.filter((dependency) => versions.has(dependency.name)),
          (dependency) => dependency.name,
        ),
        ([dependency, declared]) => ({
          dependency,
          dependent: name,
          version,
          peerRange: declared.find(({ field }) => field === 'peerDependencies')
            ?.range,
        }),
      ),
    );

  // What any breaking release of `dependency` releases, one plan per dependency
  // an override of a peer edge names.
  const releasedWithBreak = new Map(
    Arr.uniq(
      overrides
        .filter(({ dependency, dependents }) =>
          edges.some(
            (edge) =>
              edge.dependency === dependency &&
              dependents.includes(edge.dependent) &&
              edge.peerRange !== undefined,
          ),
        )
        .map(({ dependency }) => dependency),
    ).map(
      (dependency) =>
        [
          dependency,
          planReleases([
            {
              file: '(override check)',
              name: dependency,
              bump: breakingBumpOf(versions.get(dependency) ?? ''),
            },
          ]),
        ] as const,
    ),
  );

  const staleOverrides = overrides.flatMap(
    ({ dependency, dependents, exposure }) =>
      dependents.flatMap((dependent) => {
        const key = `${dependency} → ${dependent} ("${exposure}")` as const;

        const edge = edges.find(
          (e) => e.dependency === dependency && e.dependent === dependent,
        );

        if (edge === undefined) {
          return [
            `${key}: ${dependent} is not a published package with ${dependency} among its dependencies, peerDependencies or optionalDependencies. Remove the entry.`,
          ];
        }

        const withBreak = releasedWithBreak.get(dependency);

        if (withBreak !== undefined && edge.peerRange !== undefined) {
          if (Result.isErr(withBreak)) {
            return [
              `${key}: changesets cannot plan a breaking release of ${dependency} alone, by which the override is judged: ${withBreak.value}`,
            ];
          }

          if (withBreak.value.has(dependent)) {
            return [
              `${key}: ${dependent} names ${dependency} in its peerDependencies and is released with any breaking release of it, which holds its release whatever src/ does. Remove the entry.`,
            ];
          }
        }

        const detected = reExports.get(dependent)?.has(dependency) === true;

        if (exposure === 're-export' && detected) {
          return [
            `${key}: the re-export is found in src/ without it. Remove the entry.`,
          ];
        }

        if (exposure === 'review' && !detected) {
          return [
            `${key}: no re-export is found in src/, so the edge is reviewed without it. Remove the entry.`,
          ];
        }

        return [];
      }),
  );

  const duplicates = Arr.uniq(
    overrides
      .flatMap(({ dependency, dependents }) =>
        dependents.map((dependent) => `${dependency} → ${dependent}`),
      )
      .filter((key, index, keys) => keys.indexOf(key) !== index),
  ).map((key) => `${key}: overridden more than once. Keep one entry.`);

  const exposureOf = ({ dependency, dependent, peerRange }: Edge): EdgeKind =>
    peerRange !== undefined && releasing.has(dependent)
      ? ({ kind: 'peer', range: peerRange } as const)
      : ({
          kind:
            overrides.find(
              (override) =>
                override.dependency === dependency &&
                override.dependents.includes(dependent),
            )?.exposure ??
            (reExports.get(dependent)?.has(dependency) === true
              ? 're-export'
              : 'review'),
        } as const);

  const classified = edges.map((edge) => ({
    ...edge,
    exposure: exposureOf(edge),
  }));

  // The edges whose dependency breaks and whose dependent says nothing of it.
  const unannounced: readonly UnannouncedEdge[] = Arr.generate(function* () {
    for (const edge of classified) {
      const pending = pendingOf(edge.dependency);

      if (Arr.isNonEmpty(pending) && !breakingDependents.has(edge.dependent)) {
        yield { ...edge, pending };
      }
    }
  });

  const violations = [
    ...staleOverrides,
    ...duplicates,
    ...Arr.generate(function* () {
      for (const edge of unannounced) {
        if (edge.exposure.kind === 'peer') {
          yield describeHeldEdge(
            edge,
            `${edge.dependent} has ${edge.dependency} in its peerDependencies as "${edge.exposure.range}"`,
            [
              'Releasing it at all moves that range to the new',
              `${edge.dependency}, which consumers install themselves, so updating the`,
              'dependent asks them to take the break with nothing in its changelog',
              'to say so.',
            ],
            [],
          );
        }
      }
    }),
    ...unannounced
      .filter(({ exposure }) => exposure.kind === 're-export')
      .map((edge) =>
        describeHeldEdge(
          edge,
          `${edge.dependent} re-exports ${edge.dependency}${describeFiles(reExports.get(edge.dependent)?.get(edge.dependency) ?? [])}`,
          ['changesets would release it as a dependency patch.'],
          [
            'If the re-export really passes on nothing of the break, override the',
            `edge as "review" in ${SELF_RELATIVE}.`,
          ],
        ),
      ),
  ] as const;

  const warnings = Array.from(
    Map.groupBy(
      unannounced.filter(({ exposure }) => exposure.kind === 'review'),
      ({ dependency }) => dependency,
    ),
    ([dependency, reviewed]) => {
      const patched = reviewed.filter(({ dependent }) =>
        releasing.has(dependent),
      );

      const unreleased = reviewed.filter(
        ({ dependent }) => !releasing.has(dependent),
      );

      return [
        `${dependency} has a breaking release pending:`,
        '',
        ...describePending(dependency, reviewed[0]?.pending ?? []),
        '',
        ...(Arr.isNonEmpty(patched)
          ? [
              'and these dependents of it are given no breaking bump, so changesets',
              'would release each with what a changeset gives it, or as a dependency',
              'patch:',
              '',
              ...patched.map(
                ({ dependent, version }) => `  - ${dependent}@${version}`,
              ),
              '',
              'Where the change reaches what one of them exposes — a type in its',
              'signatures, the behavior of a function or a CLI built on it — give that',
              'one a breaking changeset of its own; where it does not, the patch is right.',
            ]
          : []),
        ...(Arr.isNonEmpty(patched) && Arr.isNonEmpty(unreleased) ? [''] : []),
        ...(Arr.isNonEmpty(unreleased)
          ? [
              `${Arr.isNonEmpty(patched) ? 'And these' : 'and these dependents of it'}, which changesets does not release:`,
              '',
              ...unreleased.map(
                ({ dependent, version }) => `  - ${dependent}@${version}`,
              ),
              '',
              `Where a range of theirs admits the new ${dependency}, their consumers get`,
              'it with no release of theirs, and a release of theirs would not stop',
              'that: where the change reaches what one of them exposes, narrow that',
              'range and release it.',
            ]
          : []),
      ].join('\n');
    },
  );

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} problem(s) with the releases of dependents:`,
        '',
        ...violations.flatMap((violation) => [violation, '']),
        ...(Arr.isNonEmpty(warnings)
          ? [
              'And to review, without holding the release:',
              '',
              ...warnings.flatMap((warning) => [warning, '']),
            ]
          : []),
        `Why a dependent's release has to say so: ${SELF_RELATIVE}.`,
      ].join('\n'),
    );
  }

  return Result.ok({
    edges: edges.length,
    reExports: classified.filter(
      ({ exposure }) => exposure.kind === 're-export',
    ).length,
    peers: classified.filter(({ exposure }) => exposure.kind === 'peer').length,
    warnings,
  });
};

/**
 * The packages a module re-exports from, by bare specifier: what it exports as
 * the very binding it imports. That is an `export … from '<dep>'` statement; an
 * imported binding exported by a separate `export { … }` or `export default`;
 * and an exported alias of one — `export type T = Imported` (whose type
 * arguments, if any, are its own type parameters in order), or
 * `export const v = imported` (or a member of it). A type or a value built from
 * an import, such as `DeepReadonly<{ … }>` or `f()`, is not one. Relative and
 * absolute specifiers name no package.
 */
export const findReExportedPackages = (
  fileName: string,
  sourceText: string,
): readonly string[] => {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    false,
  );

  const imported = new Map(
    sourceFile.statements.flatMap((statement) =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier)
        ? toPackageName(statement.moduleSpecifier.text).flatMap((name) => {
            const clause = statement.importClause;

            const bindings =
              clause === undefined
                ? ([] as const)
                : ([
                    ...(clause.name === undefined
                      ? ([] as const)
                      : ([clause.name.text] as const)),
                    ...(clause.namedBindings === undefined
                      ? ([] as const)
                      : ts.isNamespaceImport(clause.namedBindings)
                        ? ([clause.namedBindings.name.text] as const)
                        : clause.namedBindings.elements.map(
                            (element) => element.name.text,
                          )),
                  ] as const);

            return bindings.map((binding) => [binding, name] as const);
          })
        : [],
    ),
  );

  const packageOf = (binding: string | undefined): readonly string[] => {
    const name = binding === undefined ? undefined : imported.get(binding);

    return name === undefined ? [] : [name];
  };

  return Arr.uniq(
    sourceFile.statements.flatMap((statement): readonly string[] => {
      if (ts.isExportDeclaration(statement)) {
        if (statement.moduleSpecifier !== undefined) {
          return ts.isStringLiteral(statement.moduleSpecifier)
            ? toPackageName(statement.moduleSpecifier.text)
            : [];
        }

        return statement.exportClause !== undefined &&
          ts.isNamedExports(statement.exportClause)
          ? statement.exportClause.elements.flatMap((element) =>
              packageOf((element.propertyName ?? element.name).text),
            )
          : [];
      }

      if (ts.isExportAssignment(statement)) {
        return packageOf(aliasedBinding(statement.expression));
      }

      if (!isExported(statement)) {
        return [];
      }

      if (ts.isVariableStatement(statement)) {
        return statement.declarationList.declarations.flatMap(
          ({ initializer }) =>
            initializer === undefined
              ? []
              : packageOf(aliasedBinding(initializer)),
        );
      }

      if (ts.isTypeAliasDeclaration(statement)) {
        return packageOf(
          aliasedTypeBinding(
            statement.type,
            (statement.typeParameters ?? []).map(({ name }) => name.text),
          ),
        );
      }

      return [];
    }),
  );
};

/**
 * What the runtime fields of a `package.json` name, one entry per field a name
 * is in. {@link checkDependentReleases} makes one edge of a name, with the range
 * in `peerDependencies` if it is there.
 */
export const listDependencies = (
  packageJson: ReadonlyRecord<string, unknown>,
): readonly Dependency[] =>
  RUNTIME_DEPENDENCY_FIELDS.flatMap((field) => {
    const deps = packageJson[field];

    return isRecord(deps)
      ? Object.entries(deps).map(([name, range]) => ({
          name,
          field,
          range: isString(range) ? range : '',
        }))
      : [];
  });

export type WorkspacePackage = Readonly<{
  name: string;
  version: string;
  /**
   * Whether a changeset naming it releases it to consumers: false for a private
   * package, and for the strict standard library bundles.
   */
  released: boolean;
  /**
   * What its `dependencies`, `optionalDependencies` and `peerDependencies` name
   * — what reaches its consumers — as {@link listDependencies} reads them.
   */
  dependencies: readonly Dependency[];
}>;

export type Dependency = Readonly<{
  name: string;
  field: (typeof RUNTIME_DEPENDENCY_FIELDS)[number];
  /** As written, `workspace:` protocol included. */
  range: string;
}>;

type ReleaseGroup = Readonly<{
  kind: 'fixed' | 'linked';
  /** Package names, the config's globs expanded by `@changesets/config`. */
  members: readonly string[];
}>;

/**
 * A correction of what detection says about the edges from `dependency` to each
 * of `dependents`.
 */
export type ExposureOverride = Readonly<{
  dependency: string;
  dependents: readonly string[];
  /**
   * `"re-export"` for a re-export detection misses — say, a local alias
   * standing between the import and the export; `"review"` for one it finds
   * that does not pass the dependency's API on — say, one outside the public
   * entry.
   */
  exposure: Exposure;
}>;

type Exposure = 're-export' | 'review';

/** What a dependency's breaking release asks of an edge's dependent. */
type EdgeKind = Readonly<{ kind: 'peer'; range: string } | { kind: Exposure }>;

type Edge = Readonly<{
  dependency: string;
  dependent: string;
  /** The dependent's. */
  version: string;
  /** As written in the dependent's `peerDependencies`, if it is there. */
  peerRange: string | undefined;
}>;

type UnannouncedEdge = Edge &
  Readonly<{ exposure: EdgeKind; pending: readonly Pending[] }>;

type Summary = Readonly<{
  edges: number;
  reExports: number;
  peers: number;
  /**
   * One paragraph per dependency with a breaking release pending, listing the
   * dependents to review.
   */
  warnings: readonly string[];
}>;

/** A workspace package with its directory, relative to the repository root. */
type LocatedPackage = WorkspacePackage & Readonly<{ directory: string }>;

type Pending = Readonly<{
  file: string;
  name: string;
  bump: Bump;
  /** The kind of release group that carries the bump, if not the package's own. */
  via: ReleaseGroup['kind'] | undefined;
  /**
   * Set when no changeset gives a breaking bump and the release plan moves the
   * package across a major all the same.
   */
  planned?: PlannedRelease;
}>;

/** The versions a release moves a package from and to. */
type PlannedRelease = Readonly<{ from: string; to: string }>;

/**
 * Corrections of re-export detection, each with the reason it is a claim and
 * not a silencer. None is needed today.
 */
const OVERRIDES: readonly ExposureOverride[] = [] as const;

const SELF_RELATIVE = 'tools/scripts/cmd/check-dependent-releases.mts';

/** The directory the strict standard library bundles sit under. */
const STRICT_LIB_DIR = 'strict-lib';

const findBreaking = (
  name: string,
  bumps: readonly ChangesetBump[],
  groups: readonly ReleaseGroup[],
  versions: ReadonlyMap<string, string>,
): readonly Pending[] => {
  const version = versions.get(name) ?? '';

  const own = bumps
    .filter((bump) => bump.name === name && isBreaking(bump.bump, version))
    .map((bump) => ({ ...bump, via: undefined }));

  const viaGroups = groups
    .filter(({ members }) => members.includes(name))
    .flatMap(({ kind, members }) =>
      bumps
        .filter(
          (bump) =>
            bump.name !== name &&
            members.includes(bump.name) &&
            isBreaking(bump.bump, version),
        )
        .map((bump) => ({ ...bump, via: kind })),
    );

  return [...own, ...viaGroups];
};

/** The changesets that give `dependency` its breaking release. */
const describePending = (
  dependency: string,
  pending: readonly Pending[],
): readonly string[] =>
  pending.map(({ file, name, bump, via, planned }) =>
    planned === undefined
      ? `  - ${file} gives ${name} "${bump}"${via === undefined ? '' : `, which the ${via} group carries to ${dependency}`}`
      : `  - the release plan takes ${name} from ${planned.from} to ${planned.to}: a release group in ${file} carries it to the group's version`,
  );

const breakingBumpOf = (version: string): Bump =>
  version.startsWith('0.') ? 'minor' : 'major';

/** The changesets as `@changesets/assemble-release-plan` reads them. */
const toNewChangesets = (
  bumps: readonly ChangesetBump[],
): readonly NewChangeset[] =>
  Array.from(
    Map.groupBy(bumps, ({ file }) => file),
    ([file, named]) => ({
      id: file,
      summary: '',
      releases: named.map(({ name, bump }) => ({ name, type: bump })),
    }),
  );

/**
 * Why an edge holds the release: `subject` names the edge, `why` says what the
 * dependent's release does without a breaking bump, and `advice` follows the
 * changeset asked for.
 */
const describeHeldEdge = (
  { dependency, dependent, version, pending }: UnannouncedEdge,
  subject: string,
  why: readonly string[],
  advice: readonly string[],
): string =>
  [
    `${subject}, whose breaking release is pending:`,
    '',
    ...describePending(dependency, pending),
    '',
    `and no changeset gives ${dependent}@${version} a breaking bump.`,
    ...why,
    '',
    `Add a changeset giving ${dependent} "${breakingBumpOf(version)}" that says what`,
    'changed for its consumers.',
    ...advice,
  ].join('\n');

/** ` (a.mts)`, or ` (a.mts and 2 other files)`. */
const describeFiles = (files: readonly string[]): string => {
  if (!Arr.isNonEmpty(files)) {
    return '';
  }

  const others = files.length - 1;

  return others === 0
    ? ` (${files[0]})`
    : ` (${files[0]} and ${plural(others, 'other file')})`;
};

const isExported = (statement: DeepReadonly<ts.Statement>): boolean =>
  ts.canHaveModifiers(statement) &&
  (ts.getModifiers(statement) ?? []).some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  );

/**
 * The binding an expression names, through parentheses, `as`, `satisfies`, `!`,
 * `<T>` and member access: `a` of `(a.b as T)!`. `undefined` for any other
 * expression, such as a call.
 */
const aliasedBinding = (
  expression: DeepReadonly<ts.Expression>,
): string | undefined => {
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isNonNullExpression(expression) ||
    ts.isTypeAssertionExpression(expression) ||
    ts.isPropertyAccessExpression(expression)
  ) {
    return aliasedBinding(expression.expression);
  }

  return ts.isIdentifier(expression) ? expression.text : undefined;
};

/**
 * The binding a type alias names, when the alias is that type itself: `A` of
 * `A`, `ns.A` or `A<T, U>` aliased as `X<T, U>`. `undefined` for any other
 * type, such as `A<string>` or `A<U, T>`.
 */
const aliasedTypeBinding = (
  type: DeepReadonly<ts.TypeNode>,
  typeParameters: readonly string[],
): string | undefined => {
  if (ts.isParenthesizedTypeNode(type)) {
    return aliasedTypeBinding(type.type, typeParameters);
  }

  if (!ts.isTypeReferenceNode(type)) {
    return undefined;
  }

  const typeArguments = type.typeArguments ?? [];

  const forwardsParameters =
    typeArguments.length === typeParameters.length &&
    typeArguments.every(
      (argument, index) =>
        ts.isTypeReferenceNode(argument) &&
        argument.typeArguments === undefined &&
        ts.isIdentifier(argument.typeName) &&
        argument.typeName.text === typeParameters[index],
    );

  if (!forwardsParameters) {
    return undefined;
  }

  // `a` of `a.b.c`.
  let mut_name = type.typeName;

  while (ts.isQualifiedName(mut_name)) {
    mut_name = mut_name.left;
  }

  return ts.isIdentifier(mut_name) ? mut_name.text : undefined;
};

/** `pkg` of `pkg/sub` and `@scope/pkg` of `@scope/pkg/sub`. */
const toPackageName = (specifier: string): readonly string[] => {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    return [];
  }

  const segments = specifier.split('/');

  const name = specifier.startsWith('@')
    ? Arr.take(segments, 2).join('/')
    : segments[0];

  return name === undefined || name === '' ? [] : [name];
};

const readPackages = async (): Promise<readonly LocatedPackage[]> => {
  const packages = await getWorkspacePackages(projectRootPath);

  return packages.flatMap(({ name, path: directory, packageJson }) => {
    if (
      name === '' ||
      !isRecord(packageJson) ||
      !hasKey(packageJson, 'version') ||
      !isString(packageJson.version)
    ) {
      return [];
    }

    const relative = path.relative(projectRootPath, directory);

    return [
      {
        name,
        version: packageJson.version,
        directory: relative,
        released:
          !(hasKey(packageJson, 'private') && packageJson.private === true) &&
          !relative.startsWith(`${STRICT_LIB_DIR}/`),
        dependencies: listDependencies(packageJson),
      },
    ];
  });
};

const readReExports = async (
  packages: readonly LocatedPackage[],
): Promise<ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>> => {
  const names = new Set(packages.map(({ name }) => name));

  const entries = await Promise.all(
    packages
      .filter(({ released }) => released)
      .map(async ({ name, directory }) => {
        const files = await glob(`${directory}/src/**/*.{ts,mts,cts,tsx}`, {
          cwd: projectRootPath,
          ignore: ['**/*.test.*', '**/node_modules/**'],
        });

        if (Result.isErr(files)) {
          throw new Error(
            `Failed to list ${directory}/src: ${unknownToString(files.value)}`,
          );
        }

        const found = await Promise.all(
          files.value.toSorted().map(async (file) => ({
            file,
            reExported: findReExportedPackages(
              file,
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              await fs.readFile(path.resolve(projectRootPath, file), 'utf8'),
            ).filter((dependency) => names.has(dependency)),
          })),
        );

        const byDependency = Map.groupBy(
          found.flatMap(({ file, reExported }) =>
            reExported.map((dependency) => ({ file, dependency })),
          ),
          ({ dependency }) => dependency,
        );

        return [
          name,
          new Map(
            Array.from(byDependency, ([dependency, items]) => [
              dependency,
              items.map(({ file }) => file),
            ]),
          ),
        ] as const;
      }),
  );

  return new Map(entries);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await Promise.all([
    readChangesets(),
    readChangesetsConfigFile(),
    readPackages(),
  ])
    .then(async ([changesets, config, packages]) =>
      checkDependentReleases({
        changesets,
        config,
        packages,
        reExports: await readReExports(packages),
        overrides: OVERRIDES,
      }),
    )
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  for (const warning of result.value.warnings) {
    console.warn(`${warning}\n`);
  }

  console.info(
    `${result.value.edges} runtime dependency edge(s) between workspace packages, ${result.value.reExports} of them re-exports and ${result.value.peers} peer edge(s) whose dependent the pending changesets release; no breaking release reaches a re-exporting or peer dependent as a patch.`,
  );
}
