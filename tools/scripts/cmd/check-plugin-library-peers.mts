import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Obj,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a published ESLint plugin named after a published library of the
 * workspace — `eslint-plugin-<library>` or `eslint-plugin-<library>-<suffix>`,
 * the longest such library — does not name that library in `peerDependencies`
 * as `workspace:` and the range of the major the library is at
 * (`workspace:^9.0.0` for 9.2.0, `workspace:^0.13.0` for 0.13.1), marked
 * optional in `peerDependenciesMeta`.
 *
 * The range says which major of the library the rules are written for, so that
 * a project on another major is told at install (pnpm warns; npm can refuse) that
 * it wants another version of the plugin. It is optional because `eslint-config-typed` depends on every
 * plugin, and a project that uses the config without the library must not be
 * asked to install it.
 *
 * `workspace:` links the library in the workspace, where a bare range would
 * have pnpm resolve it from the registry, and `pnpm publish` writes the range
 * alone (`^9.0.0`) into what consumers install. `changeset version` keeps the
 * range current: a release of the library that leaves it rewrites it to the new
 * major (`workspace:^10.0.0`) and releases the plugin with it. What nothing
 * else catches is a plugin that never declared it — a new one, say.
 */
export const checkPluginLibraryPeers = (
  manifests: readonly WorkspaceManifest[],
): Result<number, string> => {
  const published = manifests.filter((manifest) => manifest.private !== true);

  const libraries = published.filter(
    (manifest) => !manifest.name.startsWith(PLUGIN_PREFIX),
  );

  const pairs = Arr.generate(function* () {
    for (const plugin of published) {
      const library = libraryOf(plugin.name, libraries);

      if (library !== undefined) {
        yield { plugin, library } as const;
      }
    }
  });

  const violations = pairs.flatMap(({ plugin, library }) =>
    violationsOf(plugin, library),
  );

  return Arr.isNonEmpty(violations)
    ? Result.err(
        [
          `❌ ${violations.length} problem(s): an ESLint plugin names the library it is for as an optional peer of the major the library is at.`,
          '',
          ...violations.map((violation) => `  - ${violation}`),
          '',
          `Why: ${path.relative(projectRootPath, SELF)}.`,
        ].join('\n'),
      )
    : Result.ok(pairs.length);
};

/** The fields of a workspace member's `package.json` this check reads. */
export type WorkspaceManifest = Readonly<{
  name: string;
  version?: string;
  private?: boolean;
  peerDependencies?: ReadonlyRecord<string, string>;
  peerDependenciesMeta?: ReadonlyRecord<
    string,
    Readonly<{ optional?: boolean }>
  >;
}>;

const PLUGIN_PREFIX = 'eslint-plugin-';

const SELF = path.resolve(
  projectRootPath,
  'tools/scripts/cmd/check-plugin-library-peers.mts',
);

/** The longest library `pluginName` is named after, if any. */
const libraryOf = (
  pluginName: string,
  libraries: readonly WorkspaceManifest[],
): WorkspaceManifest | undefined => {
  if (!pluginName.startsWith(PLUGIN_PREFIX)) {
    return undefined;
  }

  const rest = pluginName.slice(PLUGIN_PREFIX.length);

  return libraries
    .filter(({ name }) => rest === name || rest.startsWith(`${name}-`))
    .toSorted((a, b) => b.name.length - a.name.length)
    .at(0);
};

/**
 * The specifier of the major `version` is at: `workspace:^<major>.0.0`, or
 * `workspace:^0.<minor>.0` while it is `0.x`, as a caret range reads them.
 */
const majorSpecifierOf = (version: string): string => {
  const [major = '0', minor = '0'] = version.split('.', 2);

  return major === '0' ? `workspace:^0.${minor}.0` : `workspace:^${major}.0.0`;
};

const violationsOf = (
  plugin: WorkspaceManifest,
  library: WorkspaceManifest,
): readonly string[] => {
  const expected =
    `"${library.name}": "${majorSpecifierOf(library.version ?? '0.0.0')}"` as const;

  const actual = plugin.peerDependencies?.[library.name];

  const range =
    actual === undefined
      ? ([
          `${plugin.name}: peerDependencies has no "${library.name}"; write ${expected}`,
        ] as const)
      : `"${library.name}": "${actual}"` === expected
        ? ([] as const)
        : ([
            `${plugin.name}: peerDependencies has "${library.name}": "${actual}"; write ${expected}`,
          ] as const);

  const optional =
    plugin.peerDependenciesMeta?.[library.name]?.optional === true
      ? ([] as const)
      : ([
          `${plugin.name}: peerDependenciesMeta does not mark "${library.name}" optional; write "${library.name}": { "optional": true }`,
        ] as const);

  return [...range, ...optional];
};

/** A record of strings, or nothing when `value` is not one. */
const stringRecordOf = (
  value: unknown,
): ReadonlyRecord<string, string> | undefined =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is FixedLengthTuple<2, string> => isString(entry[1]),
        ),
      )
    : undefined;

const optionalFlagsOf = (
  value: unknown,
): ReadonlyRecord<string, Readonly<{ optional?: boolean }>> | undefined =>
  isRecord(value)
    ? Obj.map(value, (meta) =>
        isRecord(meta) && hasKey(meta, 'optional') && meta.optional === true
          ? { optional: true }
          : {},
      )
    : undefined;

const readManifests = async (): Promise<readonly WorkspaceManifest[]> => {
  const packages = await getWorkspacePackages(projectRootPath);

  return packages.map(({ name, packageJson }): WorkspaceManifest => {
    const json: unknown = packageJson;

    if (!isRecord(json)) {
      return { name };
    }

    return {
      name,
      ...(hasKey(json, 'version') && isString(json.version)
        ? { version: json.version }
        : {}),
      ...(hasKey(json, 'private') && json.private === true
        ? { private: true }
        : {}),
      ...(hasKey(json, 'peerDependencies')
        ? { peerDependencies: stringRecordOf(json.peerDependencies) ?? {} }
        : {}),
      ...(hasKey(json, 'peerDependenciesMeta')
        ? {
            peerDependenciesMeta:
              optionalFlagsOf(json.peerDependenciesMeta) ?? {},
          }
        : {}),
    };
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await readManifests()
    .then(checkPluginLibraryPeers)
    .catch((error: unknown) => Result.err(unknownToString(error)));

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} ESLint plugin(s) named after a library of the workspace; each names it as an optional peer of its major.`,
  );
}
