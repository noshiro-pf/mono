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
import * as t from 'ts-fortress';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { parse } from 'yaml';
import { readShellCommands } from '../lib/shell-commands.mjs';
import {
  memberManifestGlobs,
  parseWorkspacePackages,
  PNPM_WORKSPACE_FILE_NAME,
  readPnpmWorkspaceFile,
} from '../lib/workspace-globs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a dependency installed under an `npm:` alias
 * (`"react-17": "npm:react@17.0.2"`) would be moved to the latest version of
 * the package it aliases by the root `update-packages` script, which
 * `pnpm-update.yml` runs on a schedule.
 *
 * `update.ignoreDeps` in `pnpm-workspace.yaml` matches a dependency's real
 * name, never the name an alias installs it under (pnpm 12.15), so an alias is
 * held back only when the script excludes it by name (`'!react-17'`) or
 * `ignoreDeps` names the package it aliases (`typescript` for
 * `typescript-native`), which holds that package back everywhere. Each alias in
 * a workspace member's or the root's `dependencies`, `devDependencies` or
 * `optionalDependencies` has to be one of the two.
 */
export const checkNpmAliasUpdates = async (): Promise<
  Result<number, string>
> => {
  const workspace = await readPnpmWorkspaceFile();

  if (Result.isErr(workspace)) {
    return Result.err(`❌ ${workspace.value}`);
  }

  const memberGlobs = parseWorkspacePackages(workspace.value);

  if (Result.isErr(memberGlobs)) {
    return Result.err(`❌ ${memberGlobs.value}`);
  }

  const files = await glob(
    Arr.toUnshifted('package.json')(memberManifestGlobs(memberGlobs.value)),
    {
      cwd: projectRootPath,
      ignore: ['**/node_modules/**'],
    },
  );

  if (Result.isErr(files)) {
    return Result.err(
      `❌ Failed to list the manifests: ${unknownToString(files.value)}`,
    );
  }

  const manifests = await Promise.all(
    files.value.toSorted().map(async (file) => {
      const text = await Result.fromPromise(
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a workspace manifest
        fs.readFile(path.join(projectRootPath, file), 'utf8'),
      );

      return Result.isErr(text)
        ? Result.err(`${file}: ${unknownToString(text.value)}`)
        : Result.ok({ file, manifest: parseJson(text.value) });
    }),
  );

  const unreadable = manifests.filter(Result.isErr).map(({ value }) => value);

  if (Arr.isNonEmpty(unreadable)) {
    return Result.err(`❌ ${unreadable.join('\n')}`);
  }

  const read = manifests.filter(Result.isOk).map(({ value }) => value);

  const root = read.find(({ file }) => file === 'package.json');

  const rootScripts = ROOT_MANIFEST.validate(root?.manifest);

  if (Result.isErr(rootScripts)) {
    return Result.err(
      '❌ package.json has no `update-packages` script to read the excluded dependencies from.',
    );
  }

  const excluded = excludedDependencies(
    rootScripts.value.scripts['update-packages'],
  );

  if (Result.isErr(excluded)) {
    return Result.err(`❌ The \`update-packages\` script: ${excluded.value}`);
  }

  const aliases = read.flatMap(({ file, manifest }) =>
    npmAliasesOf(file, manifest),
  );

  const problems = aliasProblems({
    aliases,
    excluded: excluded.value,
    ignoreDeps: ignoreDepsOf(workspace.value),
  });

  if (Arr.isNonEmpty(problems)) {
    return Result.err(
      [
        '❌ `pnpm run update-packages` would move these npm: aliases to the latest version of what they alias:',
        '',
        ...problems.map((problem) => `  ${problem}`),
        '',
        `Exclude each in the root \`update-packages\` script with \`'!<alias>'\`. \`update.ignoreDeps\` in ${PNPM_WORKSPACE_FILE_NAME} matches the aliased package's own name, so naming it there holds that package back everywhere.`,
      ].join('\n'),
    );
  }

  return Result.ok(aliases.length);
};

export type NpmAlias = Readonly<{
  /** The manifest, repository-relative. */
  file: string;
  /** The name it is installed under. */
  alias: string;
  /** The package it aliases. */
  target: string;
}>;

/**
 * One line for each alias that `update-packages` does not exclude by name and
 * whose package `ignoreDeps` does not hold back.
 */
export const aliasProblems = ({
  aliases,
  excluded,
  ignoreDeps,
}: Readonly<{
  aliases: readonly NpmAlias[];
  excluded: ReadonlySet<string>;
  ignoreDeps: ReadonlySet<string>;
}>): readonly string[] =>
  aliases
    .filter(
      ({ alias, target }) =>
        Array.from(excluded).every((pattern) => !matchesName(pattern, alias)) &&
        !ignoreDeps.has(target),
    )
    .map(
      ({ file, alias, target }) =>
        `${file}: \`${alias}\` (npm:${target}) is neither excluded by \`'!${alias}'\` nor held back by \`ignoreDeps\`.`,
    );

/**
 * The dependency names or patterns `update-packages` excludes: each `!<name>`
 * argument of its `pnpm update`, a `--filter` value (which selects workspace
 * members) aside.
 */
export const excludedDependencies = (
  script: string,
): Result<ReadonlySet<string>, string> => {
  const reading = readShellCommands(script);

  if (Arr.isNonEmpty(reading.problems)) {
    return Result.err(reading.problems.join('; '));
  }

  const update = reading.commands.find(
    (words) => words[0] === 'pnpm' && words[1] === 'update',
  );

  if (update === undefined) {
    return Result.err('it runs no `pnpm update`.');
  }

  return Result.ok(
    new Set(
      update
        .filter(
          (word, i) =>
            word.startsWith('!') &&
            update[i - 1] !== '--filter' &&
            update[i - 1] !== '-F',
        )
        .map((word) => word.slice(1)),
    ),
  );
};

/**
 * The `npm:` aliases among a manifest's `dependencies`, `devDependencies` and
 * `optionalDependencies`, each with the package it names: `npm:react@17.0.2`
 * aliases `react`, `npm:@scope/name@1` aliases `@scope/name`.
 */
export const npmAliasesOf = (
  file: string,
  manifest: unknown,
): readonly NpmAlias[] =>
  isRecord(manifest)
    ? DEPENDENCY_FIELDS.flatMap((field) => {
        const deps = hasKey(manifest, field) ? manifest[field] : undefined;

        return isRecord(deps)
          ? Arr.generate(function* () {
              for (const [alias, specifier] of Object.entries(deps)) {
                const target = isString(specifier)
                  ? aliasTarget(specifier)
                  : undefined;

                if (target !== undefined) {
                  yield { file, alias, target } as const;
                }
              }
            })
          : [];
      })
    : ([] as const);

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
] as const;

/** The package an `npm:` specifier names, or `undefined` for any other. */
const aliasTarget = (specifier: string): string | undefined => {
  if (!specifier.startsWith('npm:')) {
    return undefined;
  }

  const rest = specifier.slice('npm:'.length);

  // A scoped name starts with `@`; the version is after the last `@` past it.
  const at = rest.indexOf('@', rest.startsWith('@') ? 1 : 0);

  return at === -1 ? rest : rest.slice(0, at);
};

/**
 * Whether the dependency name `name` matches `pattern`, as `pnpm update` reads
 * one of its package arguments: `*` stands for any run of characters
 * (`react-*`), anything else for itself.
 */
const matchesName = (pattern: string, name: string): boolean => {
  const [first = '', ...rest] = pattern.split('*');

  if (!name.startsWith(first)) {
    return false;
  }

  if (!Arr.isNonEmpty(rest)) {
    return name === first;
  }

  const last = rest.at(-1) ?? '';

  let mut_from = first.length;

  for (const part of rest.slice(0, -1)) {
    const at = name.indexOf(part, mut_from);

    if (at === -1) {
      return false;
    }

    mut_from = at + part.length;
  }

  return name.length - last.length >= mut_from && name.endsWith(last);
};

/** `update.ignoreDeps` of `pnpm-workspace.yaml`, or none. */
const ignoreDepsOf = (workspace: string): ReadonlySet<string> => {
  const parsed: unknown = parse(workspace);

  const read = WORKSPACE_UPDATE.validate(parsed);

  return new Set<string>(
    Result.isOk(read) ? (read.value.update?.ignoreDeps ?? []) : [],
  );
};

const parseJson = (text: string): unknown => JSON.parse(text);

const ROOT_MANIFEST = t.record({
  scripts: t.record({ 'update-packages': t.string() }),
});

const WORKSPACE_UPDATE = t.record({
  update: t.optional(t.record({ ignoreDeps: t.optional(t.array(t.string())) })),
});

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkNpmAliasUpdates();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.log(
    `${result.value} npm: alias(es) found; each is excluded from update-packages or held back by ignoreDeps.`,
  );
}
