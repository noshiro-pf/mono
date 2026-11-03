import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { readPackages, readProseGate } from './check-changed/packages.mjs';
import {
  AREAS,
  buildPlan,
  classifyChanges,
  type Area,
  type PackageInfo,
} from './check-changed/plan.mjs';
import {
  applicableCiOnly,
  CI_ONLY,
  findUncovered,
  groupByScript,
  listDirectories,
  matchesCiOnly,
  stepCommands,
  type CiOnly,
  type Uncovered,
} from './check-changed/reach.mjs';
import {
  buildCoverageGraph,
  reachableFrom,
  readCheckWorkflows,
  readManifests,
  splitCommandId,
  toCommandId,
  type CommandId,
} from './check-ci-commands.mjs';

/**
 * Asks whether every command the check workflows run is one that some diff
 * makes `check-changed` run, or is declared CI's alone (`CI_ONLY` in
 * `check-changed/reach.mts`, each with its reason).
 *
 * The two are written apart: the workflows name `ws:*` and `z:ci:*` scripts
 * over the whole workspace, and `check-changed/plan.mts` picks per package what
 * a diff needs. A check, generator or fixer added to the first and not the
 * second passes every local run and fails in CI first, which is what
 * `check-changed` exists to prevent. This reads the workflows through the
 * covering graph of `check-ci-commands.mts`, builds the plan `check-changed`
 * makes for one sample path at a time (a source file, a document and a manifest
 * in each package, and a path for each repository-wide area), and compares the
 * two. Whether a given diff's plan runs everything that diff needs is a
 * different question; this asks only whether any plan can.
 */
export const checkChangedReach = (): Promise<Result<Summary, string>> =>
  Result.safeTry(async function* () {
    const [manifestsRead, workflowsRead, packages] = await Promise.all([
      readManifests(),
      readCheckWorkflows(),
      readPackages(),
    ]);

    const manifests = yield* Result.safeUnwrap(manifestsRead);

    const workflows = yield* Result.safeUnwrap(workflowsRead);

    const rootScripts = manifests.find(
      ({ directory }) => directory === '.',
    )?.scripts;

    if (rootScripts === undefined) {
      return Result.err('The root package.json has no scripts.');
    }

    const proseGate = yield* Result.safeUnwrap(
      readProseGate(new Map(Object.entries(rootScripts))),
    );

    const local = yield* Result.safeUnwrap(
      planReach({
        packages,
        proseGate,
        rootScripts: Object.keys(rootScripts),
      }),
    );

    const missingAreas = AREAS.filter((area) => !local.areas.has(area));

    if (Arr.isNonEmpty(missingAreas)) {
      return Result.err(
        `No sample path in check-changed-reach.mts touches the area(s) ${missingAreas.join(', ')}; add one to ROOT_SAMPLES.`,
      );
    }

    const graph = buildCoverageGraph(manifests);

    const ciEntries = workflows.flatMap(({ relativePath, commands }) =>
      commands.map((command) => ({
        origin: `${relativePath}: ${command}`,
        command: toCommandId('.', command),
      })),
    );

    const localReach = reachableFrom(graph, local.commands);

    const uncovered = findUncovered({
      graph,
      manifests,
      ciEntries,
      localReach,
    });

    const violations = findReachViolations({
      uncovered,
      ciOnly: CI_ONLY,
      localReach,
      defined: graph.commands,
    });

    return Arr.isNonEmpty(violations)
      ? Result.err(violations.join('\n\n'))
      : Result.ok({
          ciEntries: ciEntries.length,
          planned: local.commands.length,
          ciOnly: uncovered.length,
        });
  });

/**
 * The paths whose plans together are every plan `check-changed` can make: in
 * each package a source file, a document and its manifest, and one path for
 * each repository-wide area (`ROOT_SAMPLES`). One plan per path rather than one
 * for all of them, because some areas replace a step rather than add one (a
 * cspell config runs `check:cspell` in place of `check:cspell:changeset`).
 */
export const samplePaths = (
  packages: readonly PackageInfo[],
): readonly string[] =>
  [
    ...packages.flatMap(({ dir }) => [
      `${dir}/src/sample.mts`,
      `${dir}/README.md`,
      `${dir}/package.json`,
    ]),
    ...ROOT_SAMPLES,
  ] as const;

/** The commands the plans for {@link samplePaths} run, and the areas they touch. */
export const planReach = ({
  packages,
  proseGate,
  rootScripts,
}: Readonly<{
  packages: readonly PackageInfo[];
  proseGate: readonly string[];
  rootScripts: readonly string[];
}>): Result<
  Readonly<{ commands: readonly CommandId[]; areas: ReadonlySet<Area> }>,
  string
> => {
  const mut_commands = new Set<CommandId>();

  const mut_areas = new Set<Area>();

  for (const file of samplePaths(packages)) {
    const classification = classifyChanges({
      files: [file],
      packages,
      proseGate,
    });

    for (const area of classification.areas) {
      mut_areas.add(area);
    }

    const plan = buildPlan({
      classification,
      base: 'BASE',
      rootScripts,
      coverage: true,
      spellChecked: [file],
    });

    for (const step of plan) {
      const commands = stepCommands(step);

      if (Result.isErr(commands)) {
        return commands;
      }

      for (const command of commands.value) {
        mut_commands.add(command);
      }
    }
  }

  return Result.ok({
    commands: Array.from(mut_commands).toSorted(),
    areas: mut_areas,
  });
};

/**
 * Both directions: a command CI runs that no plan reaches and no `CI_ONLY`
 * entry names, and an entry that names nothing CI still leaves to itself (CI
 * stopped running it, or `check-changed` now does). One message per script,
 * listing the directories it is in. And for an entry with a `writtenBy`, the
 * directories CI leaves the script to itself in where a generator it lists and
 * the package defines is reached by no plan, or the package defines none.
 * Where several entries name a command the most specific applies
 * (`applicableCiOnly`), so a directory-scoped entry with no `writtenBy` exempts
 * a package whose output is not committed; one that exempts a package defining
 * a generator a less specific entry lists is a violation too.
 */
export const findReachViolations = ({
  uncovered,
  ciOnly,
  localReach,
  defined,
}: Readonly<{
  uncovered: readonly Uncovered[];
  ciOnly: readonly CiOnly[];
  /** What the plans reach, through the covering graph. */
  localReach: ReadonlySet<CommandId>;
  /** Every script a manifest defines. */
  defined: ReadonlySet<CommandId>;
}>): readonly string[] => {
  const applied = uncovered.map((entry) => ({
    ...entry,
    applies: applicableCiOnly(ciOnly, entry.command),
  }));

  const unplanned = applied.filter(({ applies }) => applies === undefined);

  const missing = groupByScript(unplanned).map(
    ({ scriptName, directories, origin }) =>
      [
        `CI runs \`${scriptName}\` in ${listDirectories(directories)} (reached from ${origin}),`,
        'and no change makes check-changed run it. Plan it in',
        'check-changed/plan.mts for the paths it reads, or add it to CI_ONLY in',
        'check-changed/reach.mts with the reason it is left to CI.',
      ].join(' '),
  );

  const stale = ciOnly
    .filter((entry) => applied.every(({ applies }) => applies !== entry))
    .map((entry) =>
      [
        `CI_ONLY in check-changed/reach.mts names \`${entry.scriptName}\`${entry.directory === undefined ? '' : ` in ${entry.directory}`},`,
        'which CI no longer runs, check-changed now runs, or a more specific entry',
        'covers wherever it matches; remove the entry.',
      ].join(' '),
    );

  // Each generator the directory defines, since a directory may have both (a
  // README and JSDoc embedded from samples), and dropping either leaves its
  // output stale. A directory that defines none of them is a violation too, so
  // that renaming a generator does not quietly switch the check off.
  const withoutGenerator = ciOnly.flatMap((entry) => {
    const { writtenBy } = entry;

    if (writtenBy === undefined) {
      return [];
    }

    const unwritten = applied.filter(({ command, applies }) => {
      const generators = definedGenerators(command, writtenBy, defined);

      return (
        applies === entry &&
        (Arr.isEmpty(generators) ||
          generators.some((generator) => !localReach.has(generator)))
      );
    });

    return groupByScript(unwritten).map(({ scriptName, directories }) =>
      [
        `CI_ONLY leaves \`${scriptName}\` in ${listDirectories(directories)} to CI because`,
        `check-changed runs what writes its committed output (${writtenBy.map((generator) => `\`${generator}\``).join(', ')}),`,
        'and there the package defines none of them, or no plan runs every one it',
        'defines. Plan them, or correct the entry.',
      ].join(' '),
    );
  });

  // An exemption is only for a package with no generator to run: one that
  // defines one a less specific entry lists would have its output go stale with
  // nothing planned to say so.
  const wrongExemption = applied.flatMap(({ command, applies }) => {
    if (applies === undefined || applies.writtenBy !== undefined) {
      return [];
    }

    const shadowed = ciOnly
      .filter((entry) => entry !== applies && matchesCiOnly(entry, command))
      .flatMap((entry) =>
        definedGenerators(command, entry.writtenBy ?? [], defined),
      );

    return Arr.isNonEmpty(shadowed)
      ? [
          [
            `CI_ONLY in check-changed/reach.mts names \`${applies.scriptName}\` in ${applies.directory ?? 'every package'} as writing nothing committed,`,
            `but the package defines ${Arr.uniq(shadowed.map((generator) => `\`${splitCommandId(generator).scriptName}\``)).join(', ')}.`,
            'Remove the entry, or give it that `writtenBy`.',
          ].join(' '),
        ]
      : [];
  });

  return [...missing, ...stale, ...withoutGenerator, ...wrongExemption];
};

/** The generators of `writtenBy` the command's directory defines. */
const definedGenerators = (
  command: CommandId,
  writtenBy: readonly string[],
  defined: ReadonlySet<CommandId>,
): readonly CommandId[] => {
  const { directory } = splitCommandId(command);

  return writtenBy
    .map((generator) => toCommandId(directory, generator))
    .filter((generator) => defined.has(generator));
};

type Summary = Readonly<{
  ciEntries: number;
  planned: number;
  ciOnly: number;
}>;

/**
 * A path for each area `classifyChanges` knows beyond a package's own files;
 * `checkChangedReach` fails when one of `AREAS` is touched by none of them.
 */
const ROOT_SAMPLES = [
  'tools/scripts/cmd/sample.mts',
  'tools/configs/sample.mts',
  '.github/workflows/sample.yml',
  'package.json',
  'pnpm-lock.yaml',
  'LICENSE',
  'docs/sample.md',
  'docs/package-dependencies.md',
  '.markdownlint-cli2.mjs',
  '.cspell.config.yaml',
  '.prettierrc',
  '.changeset/sample.md',
  'repo-settings/sample.json',
  'strict-lib/sample.mts',
] as const;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkChangedReach().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ Every command the ${result.value.ciEntries} CI entry points reach is one check-changed can run, or one of the ${result.value.ciOnly} it leaves to CI by design (${result.value.planned} commands planned).`,
  );
}
