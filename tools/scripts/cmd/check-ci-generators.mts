import * as fs from 'node:fs/promises';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import {
  AREAS,
  buildPlan,
  type Area,
  type Step,
} from './check-changed/plan.mjs';
import {
  buildCoverageGraph,
  collectWorkflowCommands,
  matchScriptNames,
  readRootManifest,
  rootScriptsReachedFrom,
} from './check-ci-commands.mjs';

/**
 * Asks whether every root generator a workflow job runs before it asserts a
 * clean tree is one `check-changed` schedules for some diff.
 *
 * `check-changed` runs the root generators that `check-changed/plan.mts` wires
 * to an area by hand. One that a workflow runs and no area schedules lets a
 * change only it rewrites pass `check-changed` and fail CI with a dirty tree
 * that names no generator, as `gen:verify-npm-packages` and `gen:license-files`
 * did before each was wired.
 *
 * A generator is a root `gen:*` script, reached from a job's commands through
 * the root manifest, or one of {@link GENERATES_AS}. `ws:gen` and the other
 * recursive runs reach each package's `gen`, which `check-changed` runs for
 * every package a diff touches; the `strict-lib:gen:*` scripts are
 * `strict-lib-gen.yml`'s alone, as `plan.mts` says.
 */
export const checkCiGenerators = (): Promise<
  Result<Readonly<{ jobs: number; generators: number }>, string>
> =>
  Result.safeTry(async function* () {
    const { scripts } = yield* Result.safeUnwrap(await readRootManifest());

    const workflows = yield* Result.safeUnwrap(await readWorkflows());

    const jobs = workflows.flatMap(collectCleanTreeJobCommands);

    const generators = ciGenerators(jobs.flat(), scripts);

    // A reader that stops understanding the workflows would otherwise pass on
    // an empty list.
    if (!Arr.isNonEmpty(jobs) || !Arr.isNonEmpty(generators)) {
      return Result.err(
        `❌ Found ${jobs.length} job(s) that assert a clean tree and ${generators.length} root generator(s) in them; the workflows are no longer read the way this guard expects.`,
      );
    }

    const planned = plannedRootGenerators();

    const unplanned = generators.filter((name) => !planned.has(name));

    return Arr.isNonEmpty(unplanned)
      ? Result.err(
          [
            '❌ A workflow job runs these generators before asserting a clean tree, and check-changed never does:',
            ...unplanned.map((name) => `  - ${name}`),
            'Wire each to the area of the files it reads in tools/scripts/cmd/check-changed/plan.mts.',
          ].join('\n'),
        )
      : Result.ok({ jobs: jobs.length, generators: generators.length });
  });

/**
 * The root scripts each job of a workflow that asserts a clean tree names, one
 * list per such job: its `run: pnpm run <name>` steps, the entries of a matrix
 * it hands to `pnpm run`, and every `pnpm run <name>` in a `run: |` block, with
 * or without arguments after the name.
 *
 * A job is read by indentation, from its key under `jobs:` to the next, and its
 * comment lines are left out, so that a comment naming the assertion or a
 * script changes nothing.
 *
 * Whether a command runs before the assertion is not asked: a job that
 * regenerates after asserting has no reason to.
 */
export const collectCleanTreeJobCommands = (
  workflowFile: string,
): readonly (readonly string[])[] =>
  splitJobs(workflowFile)
    .filter((job) => job.includes(CLEAN_TREE_ASSERTION))
    .map((job) =>
      Arr.uniq([
        ...collectWorkflowCommands(job),
        ...pnpmRunTargets(job),
      ]).toSorted((a, b) => a.localeCompare(b)),
    );

/**
 * The root generators the given commands reach through the root manifest's
 * scripts, sorted.
 */
export const ciGenerators = (
  commands: readonly string[],
  scripts: ReadonlyRecord<string, string>,
): readonly string[] => {
  const names = Object.keys(scripts);

  const reached = rootScriptsReachedFrom(
    buildCoverageGraph([{ directory: '.', scripts }]),
    Arr.uniq(commands.flatMap((command) => matchScriptNames(command, names))),
  );

  return Arr.uniq([
    ...reached.filter((name) => name.startsWith(GENERATOR_PREFIX)),
    ...Arr.generate(function* () {
      for (const name of reached) {
        const generator = GENERATES_AS[name];

        if (generator !== undefined) {
          yield generator;
        }
      }
    }),
  ]).toSorted((a, b) => a.localeCompare(b));
};

/**
 * The root generators `check-changed` schedules for some diff: those of a diff
 * touching every area, and of one touching each area alone, since a step may be
 * wired to an area's absence as well as its presence.
 */
export const plannedRootGenerators = (): ReadonlySet<string> => {
  const plan = (touched: readonly Area[]): readonly Step[] =>
    buildPlan({
      classification: {
        packages: [],
        dependents: [],
        areas: new Set<Area>(touched),
        ignored: [],
      },
      base: 'HEAD',
      // Read only for the `check:root:*` steps, which are not generators.
      rootScripts: [],
      coverage: false,
      hasUntracked: false,
      spellChecked: [],
    });

  // A root step is `pnpm run <script>`; one given arguments after the name
  // reads as a name no generator has, and is reported rather than matched.
  return new Set<string>(
    Arr.toUnshifted<readonly Area[]>(AREAS)(AREAS.map((area) => [area]))
      .flatMap(plan)
      .filter(
        ({ kind, cwd, args }) =>
          kind === 'generate' &&
          cwd === '.' &&
          args.at(0) === 'run' &&
          Arr.isFixedLengthArray(2, args),
      )
      .map(({ args }) => args.at(1) ?? ''),
  );
};

/** The step a job asserts a clean tree with. */
const CLEAN_TREE_ASSERTION = 'z:assert-repo-is-clean';

const GENERATOR_PREFIX = 'gen:';

/**
 * Root scripts that rewrite committed files without being named `gen:*`, mapped
 * to the generator `check-changed` runs in their place.
 *
 * `verify:npm-packages` writes the committed `verify-npm-packages/local/` space
 * before it verifies it; `gen:verify-npm-packages` is that writing alone.
 */
const GENERATES_AS: ReadonlyRecord<string, string> = {
  'verify:npm-packages': 'gen:verify-npm-packages',
} as const;

/** A line with a trailing `# comment` and the spaces before it taken off. */
const withoutComment = (line: string): string => {
  const at = line.indexOf(' #');

  return (at === -1 ? line : line.slice(0, at)).trimEnd();
};

const indentOf = (line: string): number =>
  line.length - line.trimStart().length;

/**
 * The text of each job under `jobs:`, from its key to the next one, without its
 * comment lines. A job key is a line at the indentation of the first one.
 */
const splitJobs = (workflowFile: string): readonly string[] => {
  const lines = workflowFile.split('\n');

  const start = lines.findIndex((line) => withoutComment(line) === JOBS_KEY);

  if (start === -1) {
    return [];
  }

  const rest = lines.slice(start + 1);

  const end = rest.findIndex((line) => line !== '' && !line.startsWith(' '));

  const body = (end === -1 ? rest : rest.slice(0, end)).filter(
    (line) => !line.trimStart().startsWith('#'),
  );

  const first = body.find((line) => line.trim() !== '');

  if (first === undefined) {
    return [];
  }

  const keyIndent = indentOf(first);

  const starts = Arr.generate(function* () {
    for (const [index, line] of body.entries()) {
      if (
        indentOf(line) === keyIndent &&
        JOB_KEY.test(withoutComment(line).trim())
      ) {
        yield index;
      }
    }
  });

  return starts.map((startIndex, position) =>
    body.slice(startIndex, starts.at(position + 1) ?? body.length).join('\n'),
  );
};

/**
 * The root script each `pnpm run` in a text names: the first word after it that
 * is not a flag, unquoted, whatever follows it. A run given a flag that points
 * it at packages (`--recursive`, `--filter`, `--dir`) names a package script,
 * not a root one, and is left out. `pnpm run ${{ matrix.<key> }}` names none;
 * `collectWorkflowCommands` reads the matrix instead.
 */
const pnpmRunTargets = (text: string): readonly string[] =>
  Arr.generate(function* () {
    for (const matched of text.matchAll(PNPM_RUN)) {
      const words = (matched.groups?.['args'] ?? '')
        .split(/\s+/u)
        .filter((word) => word !== '');

      const targetIndex = words.findIndex((word) => !word.startsWith('-'));

      if (targetIndex === -1) {
        continue;
      }

      const target = (words.at(targetIndex) ?? '').replaceAll(
        /^['"]|['"]$/gu,
        '',
      );

      const flags = words.slice(0, targetIndex);

      if (
        !target.startsWith('$') &&
        flags.every((flag) => !PACKAGE_FLAGS.has(flag.split('=', 1)[0] ?? flag))
      ) {
        yield target;
      }
    }
  });

const JOBS_KEY = 'jobs:';

const JOB_KEY = /^['"]?[\w-]+['"]?:$/u;

const PNPM_RUN = /pnpm run (?<args>[^&|;\n]*)/gu;

/** The flags of `pnpm run` that run a package's script rather than the root's. */
const PACKAGE_FLAGS: ReadonlySet<string> = new Set<string>([
  '--recursive',
  '-r',
  '--filter',
  '-F',
  '--dir',
  '-C',
]);

const readWorkflows = async (): Promise<Result<readonly string[], string>> => {
  const files = await listWorkflowFiles();

  if (Result.isErr(files)) {
    return files;
  }

  const contents = await Result.fromPromise(
    Promise.all(
      files.value.map((file) =>
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- the repository's own workflow files.
        fs.readFile(file, 'utf8'),
      ),
    ),
  );

  return Result.isErr(contents)
    ? Result.err(
        `Failed to read the workflows: ${unknownToString(contents.value)}`,
      )
    : contents;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkCiGenerators().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ The ${result.value.generators} root generator(s) the ${result.value.jobs} clean-tree job(s) run are all ones check-changed schedules.`,
  );
}
