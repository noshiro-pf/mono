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
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import { projectRootPath } from '../project-root-path.mjs';
import { parseReleaseGroups } from './check-linked-releases.mjs';
import {
  isBreaking,
  parseChangesetBumps,
  readChangesets,
  type Bump,
  type ChangesetFile,
} from './check-next-major.mjs';

/**
 * Holds a breaking release of a workspace package until every published
 * package that re-exports it is given a breaking release too, and lists the
 * other dependents for review.
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
 * - **re-export** — its `src/` exports a binding it imports from the
 *   dependency, as such or as an alias ({@link findReExportedPackages}), read
 *   as TypeScript syntax. The dependency's break is, nearly always, the
 *   dependent's, so the check fails until a changeset gives the dependent a
 *   breaking bump whose text is what its consumers read.
 * - **review** — any other runtime dependency. Some of the break may still
 *   get through — a type in the dependent's signatures, the behavior of a
 *   function or a CLI built on the dependency — but whether it does depends on
 *   what broke, which no reading of the edge can tell. These are listed,
 *   grouped by dependency, without holding the release. The dependents' own
 *   tests run against the new dependency in the same pull request, which
 *   catches the behavior they cover; the list is for what they do not.
 *
 * Every edge that is not a re-export is reviewed, rather than only those
 * declared to expose something, so that an edge nobody thought to declare is
 * not silently passed.
 *
 * A dependency's breaking release is read from its own changesets and from the
 * `fixed` and `linked` groups in `.changeset/config.json`: a breaking bump of
 * any member counts for every member. For `linked` that is what
 * `check:prose:linked-releases` already requires the changesets to say.
 *
 * A breaking bump is `major`, or `minor` while the package is still `0.x`.
 * The dependents checked are the published workspace packages, other than the
 * strict standard library bundles: a changeset never names one (they release
 * through their `-source` harnesses, see CLAUDE.md), so no advice here could
 * be followed for them.
 *
 * Where detection is wrong, {@link OVERRIDES} corrects it. The check fails on
 * an override that has gone stale: an edge that is no longer a runtime
 * dependency of a checked package, or one that says what detection already
 * finds.
 *
 * It is a `check:prose` guard for the reason `check:prose:next-major` is: a
 * changeset is Markdown, and `code-check.yml` skips a diff of Markdown alone.
 * It reads `src/` as syntax only, so it needs no build.
 */
export const checkDependentReleases = ({
  changesets,
  groups,
  packages,
  reExports,
  overrides,
}: Readonly<{
  changesets: readonly ChangesetFile[];
  groups: readonly ReleaseGroup[];
  packages: readonly WorkspacePackage[];
  /**
   * Per dependent, the packages its `src/` re-exports from, each with the
   * files that do.
   */
  reExports: ReadonlyMap<string, ReadonlyMap<string, readonly string[]>>;
  overrides: readonly ExposureOverride[];
}>): Result<Summary, string> => {
  const versions = new Map(
    packages.map(({ name, version }) => [name, version]),
  );

  const bumps = changesets.flatMap(({ file, content }) =>
    Array.from(parseChangesetBumps(content), ([name, bump]) => ({
      file,
      name,
      bump,
    })),
  );

  const ownBreaking = (name: string): boolean =>
    bumps.some(
      (bump) =>
        bump.name === name && isBreaking(bump.bump, versions.get(name) ?? ''),
    );

  const edges = packages
    .filter(({ released }) => released)
    .flatMap(({ name, version, dependencies }) =>
      dependencies
        .filter((dependency) => versions.has(dependency))
        .map((dependency) => ({ dependency, dependent: name, version })),
    );

  const staleOverrides = overrides.flatMap(
    ({ dependency, dependents, exposure }) =>
      dependents.flatMap((dependent) => {
        const key = `${dependency} → ${dependent} ("${exposure}")` as const;

        if (
          edges.every(
            (edge) =>
              edge.dependency !== dependency || edge.dependent !== dependent,
          )
        ) {
          return [
            `${key}: ${dependent} is not a published package with ${dependency} among its dependencies, peerDependencies or optionalDependencies. Remove the entry.`,
          ];
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

  const exposureOf = (dependency: string, dependent: string): Exposure =>
    overrides.find(
      (override) =>
        override.dependency === dependency &&
        override.dependents.includes(dependent),
    )?.exposure ??
    (reExports.get(dependent)?.has(dependency) === true
      ? 're-export'
      : 'review');

  // The edges whose dependency breaks and whose dependent says nothing of it.
  const unannounced = edges.flatMap((edge) => {
    const pending = findBreaking(edge.dependency, bumps, groups, versions);

    return !Arr.isNonEmpty(pending) || ownBreaking(edge.dependent)
      ? []
      : [
          {
            ...edge,
            exposure: exposureOf(edge.dependency, edge.dependent),
            pending,
          },
        ];
  });

  const violations = [
    ...staleOverrides,
    ...duplicates,
    ...unannounced
      .filter(({ exposure }) => exposure === 're-export')
      .map(({ dependency, dependent, version, pending }) =>
        [
          `${dependent} re-exports ${dependency}${describeFiles(reExports.get(dependent)?.get(dependency) ?? [])}, whose breaking release is pending:`,
          '',
          ...describePending(dependency, pending),
          '',
          `and no changeset gives ${dependent}@${version} a breaking bump, so`,
          'changesets would release it as a dependency patch.',
          '',
          `Add a changeset giving ${dependent} "${breakingBumpOf(version)}" that says what`,
          'changed for its consumers. If the re-export really passes on nothing',
          `of the break, override the edge as "review" in ${SELF_RELATIVE}.`,
        ].join('\n'),
      ),
  ] as const;

  const warnings = Array.from(
    Map.groupBy(
      unannounced.filter(({ exposure }) => exposure === 'review'),
      ({ dependency }) => dependency,
    ),
    ([dependency, reviewed]) =>
      [
        `${dependency} has a breaking release pending:`,
        '',
        ...describePending(dependency, reviewed[0]?.pending ?? []),
        '',
        'and these dependents of it are given no breaking bump, so changesets',
        'would release each as a dependency patch:',
        '',
        ...reviewed.map(
          ({ dependent, version }) => `  - ${dependent}@${version}`,
        ),
        '',
        'Where the change reaches what one of them exposes — a type in its',
        'signatures, the behavior of a function or a CLI built on it — give that',
        'one a breaking changeset of its own; where it does not, the patch is right.',
      ].join('\n'),
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
    reExports: edges.filter(
      ({ dependency, dependent }) =>
        exposureOf(dependency, dependent) === 're-export',
    ).length,
    warnings,
  });
};

/**
 * The packages a module re-exports from, by bare specifier: what it exports
 * as the very binding it imports. That is an `export … from '<dep>'`
 * statement; an imported binding exported by a separate `export { … }` or
 * `export default`; and an exported alias of one — `export type T = Imported`
 * (whose type arguments, if any, are its own type parameters in order), or
 * `export const v = imported` (or a member of it). A type or a value built
 * from an import, such as `DeepReadonly<{ … }>` or `f()`, is not one. Relative
 * and absolute specifiers name no package.
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

/** Whether `name` is matched by a `fixed` or `linked` group member pattern. */
export const matchesGroupMember = (pattern: string, name: string): boolean =>
  path.posix.matchesGlob(name, pattern);

export type WorkspacePackage = Readonly<{
  name: string;
  version: string;
  /**
   * Whether a changeset naming it releases it to consumers: false for a
   * private package, and for the strict standard library bundles.
   */
  released: boolean;
  /**
   * The names in its `dependencies`, `optionalDependencies` and
   * `peerDependencies` — what reaches its consumers.
   */
  dependencies: readonly string[];
}>;

export type ReleaseGroup = Readonly<{
  kind: 'fixed' | 'linked';
  /** As written in the config; a member may be a glob. */
  members: readonly string[];
}>;

/**
 * A correction of what detection says about the edges from `dependency` to
 * each of `dependents`.
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

type Summary = Readonly<{
  edges: number;
  reExports: number;
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
}>;

/**
 * Corrections of re-export detection, each with the reason it is a claim and
 * not a silencer. None is needed today.
 */
const OVERRIDES: readonly ExposureOverride[] = [] as const;

const SELF_RELATIVE = 'tools/scripts/cmd/check-dependent-releases.mts';

const CONFIG_FILE = '.changeset/config.json';

/** The directory the strict standard library bundles sit under. */
const STRICT_LIB_DIR = 'strict-lib';

const RUNTIME_DEPENDENCY_FIELDS = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

const findBreaking = (
  name: string,
  bumps: readonly Readonly<{ file: string; name: string; bump: Bump }>[],
  groups: readonly ReleaseGroup[],
  versions: ReadonlyMap<string, string>,
): readonly Pending[] => {
  const version = versions.get(name) ?? '';

  const own = bumps
    .filter((bump) => bump.name === name && isBreaking(bump.bump, version))
    .map((bump) => ({ ...bump, via: undefined }));

  const viaGroups = groups
    .filter(({ members }) =>
      members.some((pattern) => matchesGroupMember(pattern, name)),
    )
    .flatMap(({ kind, members }) =>
      bumps
        .filter(
          (bump) =>
            bump.name !== name &&
            members.some((pattern) => matchesGroupMember(pattern, bump.name)) &&
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
  pending.map(
    ({ file, name, bump, via }) =>
      `  - ${file} gives ${name} "${bump}"${via === undefined ? '' : `, which the ${via} group carries to ${dependency}`}`,
  );

const breakingBumpOf = (version: string): Bump =>
  version.startsWith('0.') ? 'minor' : 'major';

/** ` (a.mts)`, or ` (a.mts and 2 other files)`. */
const describeFiles = (files: readonly string[]): string => {
  if (!Arr.isNonEmpty(files)) {
    return '';
  }

  const others = files.length - 1;

  return others === 0
    ? ` (${files[0]})`
    : ` (${files[0]} and ${others} other file${others === 1 ? '' : 's'})`;
};

const isExported = (statement: DeepReadonly<ts.Statement>): boolean =>
  ts.canHaveModifiers(statement) &&
  (ts.getModifiers(statement) ?? []).some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  );

/**
 * The binding an expression names, through parentheses, `as`, `satisfies`,
 * `!`, `<T>` and member access: `a` of `(a.b as T)!`. `undefined` for any
 * other expression, such as a call.
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
        dependencies: RUNTIME_DEPENDENCY_FIELDS.flatMap((field) => {
          const deps = packageJson[field];

          return isRecord(deps) ? Object.keys(deps) : [];
        }),
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

const readGroups = async (): Promise<readonly ReleaseGroup[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const config = await fs.readFile(
    path.resolve(projectRootPath, CONFIG_FILE),
    'utf8',
  );

  return (['fixed', 'linked'] as const).flatMap((kind) => {
    const groups = parseReleaseGroups(config, kind);

    if (Result.isErr(groups)) {
      throw new Error(groups.value);
    }

    return groups.value.map((members) => ({ kind, members }));
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await Promise.all([
    readChangesets(),
    readGroups(),
    readPackages(),
  ])
    .then(async ([changesets, groups, packages]) =>
      checkDependentReleases({
        changesets,
        groups,
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
    `${result.value.edges} runtime dependency edge(s) between workspace packages, ${result.value.reExports} of them re-exports; no breaking release reaches a re-exporting dependent as a patch.`,
  );
}
