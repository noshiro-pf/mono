import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, hasKey, Json, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { readScripts } from '../lib/manifest-scripts.mjs';
import { readPnpmRun } from '../lib/pnpm-command.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when the root scripts that split one recursive command into shards do
 * not partition the workspace between them.
 *
 * CI runs `ws:check:test:cov`, `ws:check:e2e`, `ws:fix:lint` and
 * `ws:check:types` as shards: some name what they run with `--filter=<pkg>`,
 * and one runs the rest by excluding those names again with `--filter=!<pkg>`.
 * The two lists are written by hand. Moving a package out of one shard while
 * its exclusion stays in the rest runs its tests nowhere, and every check stays
 * green; naming it in a shard without excluding it runs it twice.
 * `check-ci-commands.mts` checks that each shard is run, and
 * `check-codecov-builds.mts` that Codecov waits for each upload, but neither
 * reads the filters.
 *
 * A family is the filtered `pnpm run` commands of the root manifest that run
 * the same package script from scripts whose names differ only in their last
 * segment (`ws:check:e2e:shard-1`, `ws:check:e2e:shard-2`).
 * In each, exactly one shard is the rest (all of its filters are `!`
 * exclusions), every other shard only includes, nothing is included twice, and
 * what the rest excludes is exactly what the others include. A filter that
 * names a package must name a workspace member; path and graph selectors are
 * compared as written.
 */
export const checkWorkspaceShards = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const [scripts, packages] = await Promise.all([
      readRootScripts(),
      getWorkspacePackages(projectRootPath),
    ]);

    const families = groupFamilies(
      readFilteredRuns(yield* Result.safeUnwrap(scripts)),
    );

    const violations = findShardViolations(
      families,
      new Set<string>(packages.map((pkg) => pkg.name)),
    );

    if (!Arr.isNonEmpty(families)) {
      return Result.err(
        '❌ No root script runs a package script across a filtered part of the workspace, so there is nothing to check. If the shards moved out of the root package.json, or are no longer written as `pnpm run --filter=…`, update check-workspace-shards.mts.',
      );
    }

    return Arr.isNonEmpty(violations)
      ? Result.err(formatViolations(violations))
      : Result.ok({
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

const readRootScripts = async (): Promise<
  Result<ReadonlyRecord<string, string>, string>
> => {
  const file = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(projectRootPath, 'package.json'), 'utf8'),
  );

  if (Result.isErr(file)) {
    return Result.err(
      `Failed to read package.json: ${unknownToString(file.value)}`,
    );
  }

  const manifest = Json.parse(file.value);

  return Result.isErr(manifest)
    ? Result.err(
        `Failed to parse package.json: ${unknownToString(manifest.value)}`,
      )
    : Result.ok(readScripts(manifest.value));
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
