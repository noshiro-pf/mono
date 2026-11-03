import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as util from 'node:util';
import { Arr, hasKey, isRecord, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { collectWorkflowCommands } from './check-ci-commands.mjs';

/**
 * Fails unless the shards of every `<name>:shard-N` family of root scripts run
 * their member script in each workspace member that defines it exactly once.
 *
 * The check workflows run the slow workspace commands as shards
 * (`code-check.yml` `ws:fix:lint`, `ws:check:types`, `ws:check:test:cov` and
 * `ws:check:e2e`, `node-version-compatibility.yml` `ws:check:test`): the first
 * names the slowest packages with `--filter=<name>`, and the rest exclude those
 * names with `--filter=!<name>`, so that a new package lands somewhere. The
 * lists are kept by hand, in one-line scripts of a file that takes no comment,
 * and a mistake in them has no symptom: a name taken out of one list and left
 * in another stops a package being checked by any shard, CI stays green, and a
 * renamed package silently stops matching its name. So the selection is asked
 * of pnpm itself, with the very filters each shard passes, and compared. A
 * split is only as good as the jobs that run it, so a workflow that runs one
 * shard of a family has to run all of them, and every shard has to be run.
 */
export const checkWorkspaceShards = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const manifest = yield* Result.safeUnwrap(
      await readJson(path.join(projectRootPath, 'package.json')),
    );

    const scripts = toStringRecord(
      isRecord(manifest) && hasKey(manifest, 'scripts')
        ? manifest.scripts
        : undefined,
    );

    const families = collectShardFamilies(scripts);

    // The workspace scan, the workflows and every shard's `pnpm ls` at once:
    // none depends on another, and each `pnpm ls` is a pnpm start-up of most of
    // a second.
    const [members, workflows, selections] = await Promise.all([
      listMembers(),
      readWorkflowCommands(),
      Promise.all(
        families.map((family) =>
          Promise.all(
            family.shards.map(({ command }) =>
              command === undefined
                ? Promise.resolve(Result.ok([]))
                : listSelectedDirectories(command.filters),
            ),
          ),
        ),
      ),
    ]);

    if (Result.isErr(members)) {
      return members;
    }

    if (Result.isErr(workflows)) {
      return workflows;
    }

    const mut_violations: string[] = [];

    for (const [index, family] of families.entries()) {
      const mut_selected: (readonly string[])[] = [];

      for (const directories of selections[index] ?? []) {
        if (Result.isErr(directories)) {
          return directories;
        }

        mut_selected.push(directories.value);
      }

      mut_violations.push(
        ...findShardViolations({
          family,
          members: members.value,
          selected: mut_selected,
        }),
      );
    }

    mut_violations.push(...findShardsNotRun(families, workflows.value));

    return Arr.isNonEmpty(mut_violations)
      ? Result.err(formatViolations(mut_violations))
      : Result.ok({
          families: families.length,
          shards: families.reduce(
            (total, { shards }) => total + shards.length,
            0,
          ),
        });
  });

/**
 * The member script and the `--filter` selectors of the first recursive
 * `pnpm run` in a root script, or `undefined` when it has none or uses a
 * selector flag this does not read (`--filter-prod`, the workspace-root flags),
 * so that the shard is reported rather than read wrongly. A flag that takes a
 * value must be written `--flag=value`: a spaced value would be read as the
 * member script, which then no member defines, and that is reported.
 */
export const parseShardCommand = (
  command: string,
): ShardCommand | undefined => {
  for (const segment of command.split('&&')) {
    const tokens = segment.trim().split(/\s+/u);

    const runIndex = tokens.indexOf('run');

    if (
      runIndex === -1 ||
      tokens[0] !== 'pnpm' ||
      (!tokens.includes('--recursive') && !tokens.includes('-r'))
    ) {
      continue;
    }

    const args = tokens.filter((_, index) => index !== 0 && index !== runIndex);

    const mut_filters: string[] = [];

    for (let mut_index = 0; mut_index < args.length; mut_index += 1) {
      const token = args[mut_index] ?? '';

      if (token.startsWith('--filter=')) {
        mut_filters.push(unquote(token.slice('--filter='.length)));
      } else if (token === '--filter' || token === '-F') {
        mut_index += 1;

        mut_filters.push(unquote(args[mut_index] ?? ''));
      } else if (
        token === '-w' ||
        token === '--workspace-root' ||
        token === '--include-workspace-root' ||
        token.startsWith('--filter-prod')
      ) {
        return undefined;
      } else if (!token.startsWith('-')) {
        return { memberScript: token, filters: mut_filters };
      }
    }

    return undefined;
  }

  return undefined;
};

/** The `<name>:shard-N` scripts, grouped by `<name>` and sorted. */
export const collectShardFamilies = (
  scripts: ReadonlyRecord<string, string>,
): readonly ShardFamily[] => {
  const mut_families = new Map<string, ShardFamily['shards'][number][]>();

  for (const [scriptName, command] of Object.entries(scripts)) {
    const family = SHARD_SCRIPT.exec(scriptName)?.groups?.['family'];

    if (family === undefined) {
      continue;
    }

    const mut_shards = mut_families.get(family) ?? [];

    mut_shards.push({ scriptName, command: parseShardCommand(command) });

    mut_families.set(family, mut_shards);
  }

  return Array.from(mut_families)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(([family, shards]) => ({
      family,
      shards: shards.toSorted((a, b) =>
        a.scriptName.localeCompare(b.scriptName, 'en', { numeric: true }),
      ),
    }));
};

/**
 * What is wrong with one family, given the member directories each shard
 * selects (`selected[i]` for `family.shards[i]`), one message per problem.
 */
export const findShardViolations = ({
  family,
  members,
  selected,
}: Readonly<{
  family: ShardFamily;
  members: readonly WorkspaceMember[];
  selected: readonly (readonly string[])[];
}>): readonly string[] => {
  const parsed = Arr.generate(function* () {
    for (const { command } of family.shards) {
      if (command !== undefined) {
        yield command;
      }
    }
  });

  const unparsed = family.shards
    .filter(({ command }) => command === undefined)
    .map(
      ({ scriptName }) =>
        `${scriptName}: no \`pnpm run --recursive <script>\` to read`,
    );

  if (Arr.isNonEmpty(unparsed)) {
    return unparsed;
  }

  const memberScripts = Arr.uniq(
    parsed.map(({ memberScript: script }) => script),
  );

  const memberScript = memberScripts[0];

  if (memberScript === undefined || memberScripts.length > 1) {
    return [
      `${family.family}: the shards run different member scripts (${memberScripts.join(', ')})`,
    ];
  }

  if (members.every(({ scripts }) => !scripts.includes(memberScript))) {
    return [
      `${family.family}: no workspace member defines \`${memberScript}\`, the script its shards run`,
    ];
  }

  const names = new Set(members.map(({ name }) => name));

  const staleNames = family.shards.flatMap(({ scriptName, command }) =>
    (command?.filters ?? [])
      .filter((filter) => {
        const selector = filter.startsWith('!') ? filter.slice(1) : filter;

        return isPackageName(selector) && !names.has(selector);
      })
      .map(
        (filter) =>
          `${scriptName}: --filter=${filter} names no workspace member`,
      ),
  );

  const coverage = members
    .filter(({ scripts }) => scripts.includes(memberScript))
    .flatMap(({ directory }) => {
      const runningShards = family.shards
        .filter((_, index) => selected[index]?.includes(directory) === true)
        .map(({ scriptName }) => scriptName);

      if (Arr.isEmpty(runningShards)) {
        return [
          `${family.family}: no shard runs \`${memberScript}\` in ${directory}`,
        ];
      }

      if (runningShards.length > 1) {
        return [
          `${family.family}: \`${memberScript}\` in ${directory} runs in ${runningShards.join(' and ')}`,
        ];
      }

      return [];
    });

  return [...staleNames, ...coverage];
};

/**
 * The shards no check workflow runs, and the workflows that run only some of a
 * family's shards: either way part of the split is never checked.
 */
export const findShardsNotRun = (
  families: readonly ShardFamily[],
  workflows: readonly Readonly<{ file: string; commands: readonly string[] }>[],
): readonly string[] =>
  families.flatMap(({ family, shards }) => {
    const shardNames = shards.map(({ scriptName }) => scriptName);

    const neverRun = shardNames
      .filter((name) =>
        workflows.every(({ commands }) => !commands.includes(name)),
      )
      .map((name) => `${name}: no check workflow runs it`);

    const partial = Arr.generate(function* () {
      for (const { file, commands } of workflows) {
        const missing = shardNames.filter((name) => !commands.includes(name));

        if (Arr.isNonEmpty(missing) && missing.length < shardNames.length) {
          yield `${file}: runs ${family} without ${missing.join(', ')}`;
        }
      }
    });

    return [...neverRun, ...partial];
  });

type CheckSummary = Readonly<{ families: number; shards: number }>;

type ShardCommand = Readonly<{
  memberScript: string;
  filters: readonly string[];
}>;

type ShardFamily = Readonly<{
  family: string;
  shards: readonly Readonly<{
    scriptName: string;
    command: ShardCommand | undefined;
  }>[];
}>;

type WorkspaceMember = Readonly<{
  name: string;
  /** Relative to the repository root. */
  directory: string;
  scripts: readonly string[];
}>;

const SHARD_SCRIPT = /^(?<family>.+):shard-\d+$/u;

/**
 * A selector that is a plain package name, as opposed to a path (`./apps/**`),
 * a glob or a dependency selector (`foo...`), which can rightly match nothing.
 */
const isPackageName = (selector: string): boolean =>
  selector !== '' && !/^\.|[*{}[\]^]|\.\.\./u.test(selector);

const execFileAsync = util.promisify(execFile);

const unquote = (token: string): string =>
  /^'.*'$/u.test(token) || /^".*"$/u.test(token) ? token.slice(1, -1) : token;

const toStringRecord = (value: unknown): ReadonlyRecord<string, string> =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is FixedLengthTuple<2, string> =>
            typeof entry[1] === 'string',
        ),
      )
    : ({} as const);

const readJson = async (filePath: string): Promise<Result<unknown, string>> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const result = await Result.fromPromise(fs.readFile(filePath, 'utf8'));

  if (Result.isErr(result)) {
    return Result.err(
      `Failed to read ${path.relative(projectRootPath, filePath)}: ${unknownToString(result.value)}`,
    );
  }

  return Result.mapErr(
    Result.fromThrowable(() => JSON.parse(result.value) as unknown),
    (error) =>
      `Failed to parse ${path.relative(projectRootPath, filePath)}: ${unknownToString(error)}`,
  );
};

/**
 * The members `pnpm ls --recursive` lists for these filters — pnpm's own
 * reading of them — as directories relative to the root. The root itself is
 * left out, as `pnpm run --recursive` leaves it out.
 */
const listSelectedDirectories = async (
  filters: readonly string[],
): Promise<Result<readonly string[], string>> => {
  const result = await Result.fromPromise(
    execFileAsync(
      'pnpm',
      [
        'ls',
        '--recursive',
        '--depth',
        '-1',
        '--json',
        ...filters.map((filter) => `--filter=${filter}`),
      ],
      { cwd: projectRootPath, maxBuffer: 64 * 1024 * 1024 },
    ),
  );

  if (Result.isErr(result)) {
    return Result.err(
      `pnpm ls ${filters.join(' ')} failed: ${unknownToString(result.value)}`,
    );
  }

  const parsed = Result.fromThrowable(
    () => JSON.parse(result.value.stdout) as unknown,
  );

  if (Result.isErr(parsed) || !Arr.isArray(parsed.value)) {
    return Result.err(`pnpm ls ${filters.join(' ')} printed no JSON array.`);
  }

  return Result.ok(
    parsed.value.flatMap((entry: unknown) => {
      if (
        !isRecord(entry) ||
        !hasKey(entry, 'path') ||
        typeof entry.path !== 'string'
      ) {
        return [];
      }

      const directory = path.relative(projectRootPath, entry.path);

      return directory === '' ? [] : [directory];
    }),
  );
};

const listMembers = async (): Promise<
  Result<readonly WorkspaceMember[], string>
> => {
  const packages = await Result.fromPromise(
    getWorkspacePackages(projectRootPath),
  );

  return Result.isErr(packages)
    ? Result.err(
        `Failed to list the workspace packages: ${unknownToString(packages.value)}`,
      )
    : Result.ok(
        packages.value.map(({ name, path: packagePath, packageJson }) => ({
          name,
          directory: path.relative(projectRootPath, packagePath),
          scripts:
            isRecord(packageJson) && hasKey(packageJson, 'scripts')
              ? Object.keys(toStringRecord(packageJson.scripts))
              : [],
        })),
      );
};

const readWorkflowCommands = async (): Promise<
  Result<
    readonly Readonly<{ file: string; commands: readonly string[] }>[],
    string
  >
> =>
  Result.safeTry(async function* () {
    const workflowPaths = yield* Result.safeUnwrap(await listWorkflowFiles());

    const mut_workflows: Readonly<{
      file: string;
      commands: readonly string[];
    }>[] = [];

    for (const workflowPath of workflowPaths) {
      const file = path.relative(projectRootPath, workflowPath);

      const content = await Result.fromPromise(
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        fs.readFile(workflowPath, 'utf8'),
      );

      if (Result.isErr(content)) {
        return Result.err(
          `Failed to read ${file}: ${unknownToString(content.value)}`,
        );
      }

      mut_workflows.push({
        file,
        commands: collectWorkflowCommands(content.value),
      });
    }

    return Result.ok(mut_workflows);
  });

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ The `:shard-N` scripts in the root package.json do not split their',
    '   packages exactly once between them, or are not all run:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'A name the first shard selects is excluded, by the same name, from every',
    'other shard of its family that would otherwise select it, and a workflow',
    'that runs one shard of a family runs all of them.',
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
    `Every shard family splits its packages exactly once (${result.value.shards} shards in ${result.value.families} families).`,
  );
}
