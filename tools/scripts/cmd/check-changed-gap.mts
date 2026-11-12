import * as util from 'node:util';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { plural } from '../lib/plural.mjs';
import { git, splitZ } from '../lib/step-runner.mjs';
import { readPackages, readProseGate } from './check-changed/packages.mjs';
import {
  buildPlan,
  classifyChanges,
  type Classification,
  type Step,
} from './check-changed/plan.mjs';
import {
  CI_ONLY,
  findUncovered,
  groupByScript,
  listDirectories,
  matchesCiOnly,
  stepCommands,
  type Uncovered,
} from './check-changed/reach.mjs';
import {
  buildCoverageGraph,
  reachableFrom,
  readManifests,
  splitCommandId,
  toCommandId,
  type CoverageGraph,
  type Manifest,
} from './check-ci-commands.mjs';

/**
 * Says, for a CI job that failed, which of its commands `check-changed` would
 * have run for the same diff: the step `code-check.yml` and `style-check.yml`
 * run after a failed matrix entry, into the job summary.
 *
 * A failure is either one `check-changed` would have shown, so the difference
 * lies in how the two ran it (the environment, a stale `dist/`, a run that was
 * skipped), or one it would not have: it ran the command over the changed files
 * alone, the command is CI's by design (`CI_ONLY`), it is in a package whose
 * code the diff does not touch, or `plan.mts` plans it for other diffs and not
 * this one. The last is the gap that `check:root:check-changed-reach` cannot
 * see, which asks only whether some diff's plan runs a command; read beside the
 * failing command's log, the summary says which it was.
 *
 * ```sh
 * pnpm run z:check-changed-gap --job <matrix command> --base <commit>
 * ```
 */
export const describeGap = ({
  job,
  graph,
  manifests,
  plan,
  touched,
}: Readonly<{
  /** The root script the job ran. */
  job: string;
  graph: CoverageGraph;
  manifests: readonly Manifest[];
  plan: readonly Step[];
  /** The directories of the packages whose code the diff touches. */
  touched: ReadonlySet<string>;
}>): Result<string, string> => {
  const entry = toCommandId('.', job);

  if (!graph.commands.has(entry)) {
    return Result.err(`\`${job}\` is not a root script.`);
  }

  const mut_planned: string[] = [];

  for (const step of plan) {
    const commands = stepCommands(step, graph.commands);

    if (Result.isErr(commands)) {
      return commands;
    }

    mut_planned.push(...commands.value);
  }

  const localReach = reachableFrom(graph, mut_planned);

  // What a narrowing step stands for, and what that covers in turn
  // (`fix:fmt:full` covers `fix:fmt:diff`).
  const narrowed = reachableFrom(
    graph,
    Arr.generate(function* () {
      for (const { cwd, narrows } of plan) {
        if (narrows !== undefined) {
          yield toCommandId(cwd, narrows);
        }
      }
    }),
  );

  // Everything the job runs that does work of its own, whether or not the plan
  // reaches it.
  const jobCommands = findUncovered({
    graph,
    manifests,
    ciEntries: [{ origin: job, command: entry }],
    localReach: new Set<string>(),
  });

  const groups = Map.groupBy(
    jobCommands.map((command) =>
      classify({ command, localReach, narrowed, touched }),
    ),
    ({ group }) => group,
  );

  const listed = GROUPS.map(({ name, meaning }) => ({
    name,
    meaning,
    commands: withoutCovered(graph, groups.get(name) ?? []),
  }));

  const count = listed.reduce((sum, { commands }) => sum + commands.length, 0);

  return Result.ok(
    [
      `### Would \`check-changed\` have run \`${job}\`?`,
      '',
      `For this diff, \`check-changed\` plans ${plural(plan.length, 'step')}. Of the ${plural(count, 'command')} \`${job}\` runs (less those another of the same group runs):`,
      '',
      ...listed.flatMap(({ name, meaning, commands }) =>
        render(name, meaning, commands),
      ),
    ].join('\n'),
  );
};

/**
 * The directories of the packages whose code a diff touches: one it touches by
 * documents alone gets its generators and none of its code checks, by design,
 * so its code checks are not the plan's gap.
 */
export const codeTouched = (
  classification: Classification,
): ReadonlySet<string> =>
  new Set(
    classification.packages
      .filter(({ code }) => code)
      .map(({ pkg }) => pkg.dir),
  );

type GroupName =
  | 'Planned'
  | 'Planned over the diff only'
  | 'Left to CI by design'
  | 'In packages whose code this diff does not touch'
  | 'Not planned for this diff';

type Classified = Uncovered &
  Readonly<{ group: GroupName; reason?: string | undefined }>;

/** The groups, in the order the summary lists them, and what each one means. */
const GROUPS: readonly Readonly<{ name: GroupName; meaning: string }>[] = [
  {
    name: 'Planned',
    meaning:
      'If the failing command is one of these, `check-changed` would have shown it: look for what differs in how the two ran it (the environment, a stale `dist/`, a run that was skipped).',
  },
  {
    name: 'Planned over the diff only',
    meaning:
      '`check-changed` runs these over the changed files alone. A failure in a file the diff does not touch is one it cannot see.',
  },
  {
    name: 'Left to CI by design',
    meaning:
      'Listed in `CI_ONLY` (`tools/scripts/cmd/check-changed/reach.mts`) with the reason. Run one by hand when the change is about it.',
  },
  {
    name: 'In packages whose code this diff does not touch',
    meaning:
      '`check-changed` runs the code checks of the packages whose code a diff touches, the generators of those it touches by documents and of those that declare a changed one, and the `fix:lint` of those whose ESLint config imports a package that a change reaches. A failure here is in a package the change reached another way, a dependent most often: build (`pnpm run ws:build:deps`) and run the `ws:*` command for it.',
  },
  {
    name: 'Not planned for this diff',
    meaning:
      '`check-changed` plans these for other diffs. If the failing command is one of these, the rule in `tools/scripts/cmd/check-changed/plan.mts` that plans it is too narrow for this diff.',
  },
] as const;

const classify = ({
  command,
  localReach,
  narrowed,
  touched,
}: Readonly<{
  command: Uncovered;
  localReach: ReadonlySet<string>;
  narrowed: ReadonlySet<string>;
  touched: ReadonlySet<string>;
}>): Classified => {
  if (localReach.has(command.command)) {
    return { ...command, group: 'Planned' };
  }

  if (narrowed.has(command.command)) {
    return { ...command, group: 'Planned over the diff only' };
  }

  const ciOnly = CI_ONLY.find((entry) => matchesCiOnly(entry, command.command));

  if (ciOnly !== undefined) {
    return { ...command, group: 'Left to CI by design', reason: ciOnly.reason };
  }

  const { directory } = splitCommandId(command.command);

  return directory !== '.' && !touched.has(directory)
    ? { ...command, group: 'In packages whose code this diff does not touch' }
    : { ...command, group: 'Not planned for this diff' };
};

/**
 * The group less what another command of the same group already runs
 * (`fix:lint` runs `check:lint`'s rules), so that a covered command is left out
 * only beside the one that covers it.
 */
const withoutCovered = (
  graph: CoverageGraph,
  group: readonly Classified[],
): readonly Classified[] => {
  const reaches = new Map(
    group.map(({ command }) => [command, reachableFrom(graph, [command])]),
  );

  return group.filter(({ command }) =>
    group.every(
      (other) =>
        other.command === command ||
        !(reaches.get(other.command)?.has(command) ?? false),
    ),
  );
};

const render = (
  name: GroupName,
  meaning: string,
  group: readonly Classified[],
): readonly string[] => {
  if (Arr.isEmpty(group)) {
    return [];
  }

  if (name !== 'Left to CI by design') {
    return [
      `**${name}** (${group.length}): ${groupByScript(group)
        .map(
          ({ scriptName, directories }) =>
            `\`${scriptName}\` in ${listDirectories(directories)}`,
        )
        .join('; ')}.`,
      '',
      meaning,
      '',
    ];
  }

  // One line per reason, since two entries may share a script name.
  const byReason = Map.groupBy(group, ({ reason }) => reason ?? '');

  return [
    `**${name}** (${group.length}):`,
    '',
    ...Array.from(byReason).flatMap(([reason, commands]) =>
      groupByScript(commands).map(
        ({ scriptName, directories }) =>
          `- \`${scriptName}\` in ${listDirectories(directories)}: ${reason}`,
      ),
    ),
    '',
    meaning,
    '',
  ];
};

const main = async (): Promise<Result<string, string>> => {
  const { values } = util.parseArgs({
    options: {
      job: { type: 'string' },
      base: { type: 'string' },
    },
    strict: true,
  });

  const { job, base } = values;

  if (job === undefined || base === undefined || base.startsWith('-')) {
    return Result.err(
      'Usage: pnpm run z:check-changed-gap --job <root script> --base <commit>',
    );
  }

  // The diff from the merge base, as check-changed takes it. CI's checkout is
  // one commit deep, where there is none; the gate runs a check only on a
  // branch up to date with its base, so the base is the fork point there.
  const mergeBase = await Result.fromPromise(git(['merge-base', 'HEAD', base]));

  const from = Result.isOk(mergeBase) ? mergeBase.value.trim() : base;

  // The committed diff, as the pushed branch has it: the job's own steps may
  // have left files behind, which are not the change.
  const listDiff = async (
    filter: readonly string[],
  ): Promise<Result<readonly string[], string>> => {
    const diff = await Result.fromPromise(
      git([
        'diff',
        '--name-only',
        '--no-renames',
        '-z',
        ...filter,
        from,
        'HEAD',
        '--',
      ]),
    );

    return Result.isOk(diff)
      ? Result.ok(splitZ(diff.value))
      : Result.err(
          `${unknownToString(diff.value).trim()}\n(fetch the base first)`,
        );
  };

  const changed = await listDiff([]);

  if (Result.isErr(changed)) {
    return changed;
  }

  const files = changed.value;

  // What still exists in HEAD, for the cspell step, as check-changed passes it.
  const remaining = await listDiff(['--diff-filter=d']);

  if (Result.isErr(remaining)) {
    return remaining;
  }

  const [manifestsRead, packages] = await Promise.all([
    readManifests(),
    readPackages(),
  ]);

  if (Result.isErr(manifestsRead)) {
    return manifestsRead;
  }

  const manifests = manifestsRead.value;

  const rootScripts = Object.keys(
    manifests.find(({ directory }) => directory === '.')?.scripts ?? {},
  );

  const proseGate = readProseGate();

  if (Result.isErr(proseGate)) {
    return proseGate;
  }

  const classification = classifyChanges({
    files,
    packages,
    proseGate: proseGate.value,
  });

  const plan = buildPlan({
    classification,
    base: from,
    rootScripts,
    // As a local run plans it by default.
    coverage: true,
    // As check-changed passes them: the files that still exist, less those
    // outside every check.
    spellChecked: remaining.value.filter(
      (file) => !classification.ignored.includes(file),
    ),
  });

  return describeGap({
    job,
    graph: buildCoverageGraph(manifests),
    manifests,
    plan,
    touched: codeTouched(classification),
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await main().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
