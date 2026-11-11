import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, Json, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { readScripts } from '../lib/manifest-scripts.mjs';
import { isFilterFlag, readPnpmRun } from '../lib/pnpm-command.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when the root scripts that split one recursive command into shards do
 * not partition the workspace between them.
 *
 * The root splits `ws:check:test` and `ws:check:test:cov` by how many suites
 * may run at once (`:heavy` one at a time, `:light` four at a time), and
 * `ws:check:types` between `code-check.yml` and `strict-lib-gen.yml`
 * (`:non-strict-lib`, `:strict-lib`): some shards name what they run with
 * `--filter=<pkg>`, and one runs the rest by excluding those names again with
 * `--filter=!<pkg>`. The two lists are written by hand. Moving a package out of
 * one shard while its exclusion stays in the rest runs its tests nowhere, and
 * every check stays green; naming it in a shard without excluding it runs it
 * twice. `check-ci-commands.mts` checks that each shard is run, but does not
 * read the filters.
 *
 * A family is the filtered `pnpm run` commands of the root manifest that run
 * the same package script from scripts whose names differ only in their last
 * segment (`ws:check:test:heavy`, `ws:check:test:light`).
 * In each, exactly one shard is the rest (all of its filters are `!`
 * exclusions), every other shard only includes, nothing is included twice, and
 * what the rest excludes is exactly what the others include. A filter that
 * names a package must name a workspace member; path and graph selectors are
 * compared as written.
 */
export const checkWorkspaceShards = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const [file, packages] = await Promise.all([
      readRootManifest(),
      getWorkspacePackages(projectRootPath),
    ]);

    const scripts = yield* Result.safeUnwrap(
      readRootScripts(yield* Result.safeUnwrap(file)),
    );

    const families = groupFamilies(readFilteredRuns(scripts));

    const violations = [
      ...findUnreadRuns(
        scripts,
        new Set<string>([
          ...Object.keys(scripts),
          ...packages.flatMap((pkg) =>
            Object.keys(readScripts(pkg.packageJson)),
          ),
        ]),
      ),
      ...findStaleNotShards(scripts, NOT_SHARDS),
      ...findShardViolations(
        families,
        new Set<string>(packages.map((pkg) => pkg.name)),
      ),
    ] as const;

    // The unread runs name the cause when no family is found because of them.
    if (Arr.isNonEmpty(violations)) {
      return Result.err(formatViolations(violations));
    }

    if (!Arr.isNonEmpty(families)) {
      return Result.err(
        '❌ No root script runs a package script across a filtered part of the workspace, so there is nothing to check. If the shards moved out of the root package.json, or are no longer written as `pnpm run --filter=…`, update check-workspace-shards.mts.',
      );
    }

    return Result.ok({
      families: families.length,
      shards: families.reduce((sum, { runs }) => sum + runs.length, 0),
    });
  });

/**
 * Each `pnpm run` with at least one filter, among the commands of a script body
 * as `readShellCommands` reads them: the script it runs in every package, and
 * its filters, read by `readPnpmRun` as the other guards read them, so that a
 * flag's value is never taken for the script here and not there. What follows
 * the script name is the script's arguments, never a filter.
 */
export const readFilteredRuns = (
  scripts: ReadonlyRecord<string, string>,
): readonly FilteredRun[] =>
  Object.entries(scripts)
    .filter(([scriptName]) => !hasKey(NOT_SHARDS, scriptName))
    .flatMap(([scriptName, body]) =>
      Arr.generate(function* () {
        for (const words of readShellCommands(body).commands) {
          const run = readPnpmRun(words);

          if (run !== undefined && Arr.isNonEmpty(run.filters)) {
            yield { scriptName, target: run.script, filters: run.filters };
          }
        }
      }),
    );

/**
 * One message per filtered `pnpm` command of a root script that is not read as
 * a run, so that a shard written another way is not skipped in silence: one
 * `readPnpmRun` does not read (an implicit run, `pnpm recursive run`,
 * `pnpm test`, a value flag it does not know before `run`) and that names no
 * other pnpm command; and one it reads whose script neither the root nor a
 * workspace package defines, which is what a value flag it does not know after
 * `run` leaves.
 * {@link NOT_SHARDS} entries are skipped, as {@link readFilteredRuns} skips them.
 */
export const findUnreadRuns = (
  scripts: ReadonlyRecord<string, string>,
  packageScripts: ReadonlySet<string>,
): readonly string[] =>
  Object.entries(scripts)
    .filter(([scriptName]) => !hasKey(NOT_SHARDS, scriptName))
    .flatMap(([scriptName, body]) =>
      Arr.generate(function* () {
        for (const words of readShellCommands(body).commands) {
          if (words[0] !== 'pnpm' || !words.some(isFilterFlag)) {
            continue;
          }

          const run = readPnpmRun(words);

          if (run === undefined) {
            if (words.every((word) => !PNPM_COMMANDS.has(word))) {
              yield `\`${scriptName}\` runs \`${words.join(' ')}\`, a filtered pnpm command this guard does not read as a run; write it as \`pnpm run [flags] <script>\`.`;
            }
          } else if (!packageScripts.has(run.script)) {
            yield `\`${scriptName}\` runs \`${run.script}\` in the packages it filters, which no workspace package defines as a script; a pnpm flag this guard does not know may have taken its value as the script.`;
          }
        }
      }),
    );

/**
 * One message per {@link NOT_SHARDS} entry that no longer applies: its script
 * is gone, or runs no filtered `pnpm run`. Either way it would go on exempting
 * whatever that script runs later.
 */
export const findStaleNotShards = (
  scripts: ReadonlyRecord<string, string>,
  notShards: ReadonlyRecord<string, string>,
): readonly string[] =>
  Object.keys(notShards).flatMap((scriptName) => {
    const body = scripts[scriptName];

    if (body === undefined) {
      return [
        `NOT_SHARDS names \`${scriptName}\`, which the root package.json no longer has; remove it from the list.`,
      ];
    }

    const filtered = readShellCommands(body).commands.some((words) =>
      Arr.isNonEmpty(readPnpmRun(words)?.filters ?? []),
    );

    return filtered
      ? []
      : [
          `NOT_SHARDS names \`${scriptName}\`, which no longer runs a filtered \`pnpm run\`; remove it from the list.`,
        ];
  });

/**
 * The root manifest's scripts, from its text; an error that says so when there
 * are none, rather than the "no family found" that would follow.
 */
export const readRootScripts = (
  manifestText: string,
): Result<ReadonlyRecord<string, string>, string> => {
  const manifest = Json.parse(manifestText);

  if (Result.isErr(manifest)) {
    return Result.err(
      `Failed to parse package.json: ${unknownToString(manifest.value)}`,
    );
  }

  const scripts = readScripts(manifest.value);

  return Arr.isNonEmpty(Object.keys(scripts))
    ? Result.ok(scripts)
    : Result.err(
        '❌ The root package.json has no `scripts` (or none that is a string), so there are no shards to read.',
      );
};

/**
 * The runs grouped into families: the same target, from scripts that share
 * every segment of their name but the last.
 */
export const groupFamilies = (
  runs: readonly FilteredRun[],
): readonly Family[] => {
  const mut_families = new Map<string, Family>();

  for (const run of runs) {
    const prefix = Arr.butLast(run.scriptName.split(':')).join(':');

    const key = `${prefix}\0${run.target}` as const;

    const family = mut_families.get(key) ?? {
      label: `\`${prefix === '' ? '' : `${prefix}:`}*\` (\`${run.target}\`)`,
      runs: [],
    };

    mut_families.set(key, { ...family, runs: Arr.toPushed(family.runs, run) });
  }

  return Array.from(mut_families.values());
};

/** What is wrong with each family, one message per problem. */
export const findShardViolations = (
  families: readonly Family[],
  packageNames: ReadonlySet<string>,
): readonly string[] =>
  families.flatMap(({ label, runs }) =>
    Array.from(familyViolations(`${label}:`, runs, packageNames)),
  );

type FilteredRun = Readonly<{
  scriptName: string;
  /** The package script the run reaches in every selected package. */
  target: string;
  filters: readonly string[];
}>;

type Family = Readonly<{
  /** How a message names the family. */
  label: string;
  runs: readonly FilteredRun[];
}>;

type CheckSummary = Readonly<{
  families: number;
  shards: number;
}>;

/**
 * Root scripts whose filtered run selects part of the workspace for a reason of
 * its own rather than as one shard of a split, each mapped to that reason.
 */
const NOT_SHARDS: ReadonlyRecord<string, string> = {
  'changeset:version-packages':
    "Runs pr-merge-queue's own gen:plugin-version after `changeset version`; one package by design, not a split.",
} as const;

const isExclusion = (filter: string): boolean => filter.startsWith('!');

/**
 * pnpm's own commands, which a filtered command that is not a `pnpm run` may be
 * (`pnpm update --filter …`): one that names none of them is read as a script
 * run this guard does not read.
 */
const PNPM_COMMANDS: ReadonlySet<string> = new Set<string>([
  'add',
  'approve-builds',
  'audit',
  'bin',
  'config',
  'create',
  'dedupe',
  'deploy',
  'dlx',
  'doctor',
  'env',
  'exec',
  'fetch',
  'i',
  'import',
  'init',
  'install',
  'install-test',
  'licenses',
  'link',
  'list',
  'll',
  'ls',
  'outdated',
  'pack',
  'patch',
  'patch-commit',
  'prune',
  'publish',
  'rebuild',
  'remove',
  'rm',
  'root',
  'setup',
  'store',
  'un',
  'uninstall',
  'unlink',
  'up',
  'update',
  'upgrade',
  'why',
]);

/**
 * Whether a selector is a bare package name rather than a path (`./apps/**`), a
 * glob, or a graph selector (`pkg...`, `[origin/main]`).
 */
const isPackageName = (selector: string): boolean =>
  !selector.startsWith('.') &&
  !selector.includes('...') &&
  !/[*?[\]{}^]/u.test(selector) &&
  selector.split('/').length <= (selector.startsWith('@') ? 2 : 1);

function* familyViolations(
  at: string,
  family: readonly FilteredRun[],
  packageNames: ReadonlySet<string>,
): Generator<string> {
  for (const { scriptName, filters } of family) {
    const mut_seen = new Set<string>();

    for (const filter of filters) {
      const selector = filter.replace(/^!/u, '');

      if (selector === '') {
        yield `${at} \`${scriptName}\` has a filter with no selector.`;
      } else if (mut_seen.has(filter)) {
        yield `${at} \`${scriptName}\` names ${filter} twice.`;
      } else if (isPackageName(selector) && !packageNames.has(selector)) {
        yield `${at} \`${scriptName}\` names ${selector}, which is not a workspace package.`;
      }

      mut_seen.add(filter);
    }
  }

  // An empty selector is reported above and compared with nothing below.
  const cleaned = family.map((run) => ({
    ...run,
    filters: run.filters.filter((filter) => filter.replace(/^!/u, '') !== ''),
  }));

  const mixed = cleaned.filter(
    ({ filters }) => filters.some(isExclusion) && !filters.every(isExclusion),
  );

  if (Arr.isNonEmpty(mixed)) {
    for (const { scriptName } of mixed) {
      yield `${at} \`${scriptName}\` mixes inclusions and \`!\` exclusions; a shard is either a list of what it runs or the rest.`;
    }

    return;
  }

  const rests = cleaned.filter(({ filters }) => filters.every(isExclusion));

  const [rest] = rests;

  if (rest === undefined) {
    yield `${at} no shard runs the rest of the workspace (one whose filters are all \`!\` exclusions), so a package none names runs nowhere. Restore the shard that runs the rest; only a run that was never part of a split belongs in NOT_SHARDS in check-workspace-shards.mts, with the reason.`;

    return;
  }

  if (rests.length > 1) {
    yield `${at} ${rests.map(({ scriptName }) => `\`${scriptName}\``).join(', ')} each run the rest of the workspace, so whatever neither excludes runs twice.`;

    return;
  }

  const excluded = new Set<string>(
    rest.filters.map((filter) => filter.slice(1)),
  );

  const mut_included = new Map<string, readonly string[]>();

  for (const { scriptName, filters } of cleaned) {
    if (scriptName === rest.scriptName) {
      continue;
    }

    for (const filter of new Set<string>(filters)) {
      mut_included.set(
        filter,
        Arr.toPushed(mut_included.get(filter) ?? [], scriptName),
      );
    }
  }

  for (const [selector, shards] of mut_included) {
    if (shards.length > 1) {
      yield `${at} ${selector} is run by more than one shard (${shards.map((name) => `\`${name}\``).join(', ')}).`;
    } else if (!excluded.has(selector)) {
      yield `${at} \`${shards.join('')}\` runs ${selector}, which \`${rest.scriptName}\` does not exclude, so it runs twice.`;
    }
  }

  for (const selector of excluded) {
    if (!mut_included.has(selector)) {
      yield `${at} \`${rest.scriptName}\` excludes ${selector}, which no other shard runs.`;
    }
  }
}

const readRootManifest = async (): Promise<Result<string, string>> => {
  const file = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(projectRootPath, 'package.json'), 'utf8'),
  );

  return Result.isErr(file)
    ? Result.err(`Failed to read package.json: ${unknownToString(file.value)}`)
    : file;
};

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ The root scripts that shard a recursive command do not partition the',
    '   workspace:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'Name each package in at most one including shard, and exclude exactly',
    'those names, with `--filter=!<name>`, in the shard that runs the rest.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkWorkspaceShards().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value.shards} shards in ${result.value.families} families partition the workspace.`,
  );
}
