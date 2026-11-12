import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, asUint32, hasKey, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { MutableRecord, ReadonlyRecord, StrictPick } from 'ts-type-forge';
import {
  CI_JOB,
  CI_JOB_BUILD,
  CI_JOB_COMMAND,
} from '../lib/ci-job-options.mjs';
import {
  matchesGlob,
  matchScriptNames,
  readScripts,
} from '../lib/manifest-scripts.mjs';
import { optionValues, readPnpmRun, readRunAll } from '../lib/pnpm-command.mjs';
import {
  listWorkflowFiles,
  readRootPackageScripts,
} from '../lib/repo-files.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
import {
  expandVariable,
  matrixKeyOf,
  matrixValues,
  readMatrix,
  readWorkflowJobs,
  triggersOn,
  type Matrix,
} from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Asks both directions of the same question about the check workflows: is any
 * command run twice over, and is any check command run at all.
 *
 * Neither is visible by reading one file. A pull request's checks are spread
 * across five workflows and about forty matrix entries, and what each entry
 * runs is a script name that resolves through the root manifest into other
 * scripts, and through the `ws:` commands into every package's. So a command
 * already covered by another one looks exactly like a command that is not, and
 * a check nothing runs looks exactly like a check that passes.
 *
 * Both had happened. `test-node-versions (current)` ran the whole Vitest suite
 * a second time on the Node every other workflow already uses, with a second
 * `ws:build` in front of it (#1968). In the other direction, six packages'
 * READMEs went unchecked because no `gen:readme` reached them, which is what
 * `check-readme-sample-coverage.mts` was written for — one instance of a
 * question nothing was asking in general.
 *
 * What makes the question answerable is that most of the covering relation is
 * written down already: `check:prose` *is* `pnpm run '/check:prose:.-/'`, and
 * `ws:check:types` *is* a recursive run of every package's `check:types`. This
 * reads those bodies rather than restating them, so that a script that stops
 * calling another stops covering it here too. Only the relations a body cannot
 * show — `check:test:cov` running the same suite as `check:test` with
 * `--coverage` — are declared, in {@link DECLARED_COVERAGE}, with the reason
 * next to each.
 */
export const checkCiCommands = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const manifests = yield* Result.safeUnwrap(await readManifests());

    const graph = buildCoverageGraph(manifests);

    const workflows = yield* Result.safeUnwrap(await readCheckWorkflows());

    const unread = [
      ...graph.problems,
      ...workflows.flatMap(({ relativePath, problems }) =>
        problems.map((problem) => `${relativePath}: ${problem}`),
      ),
      ...workflows.flatMap(({ relativePath, packageRuns }) =>
        resolvePackageRuns(packageRuns, manifests).problems.map(
          (problem) => `${relativePath}: ${problem}`,
        ),
      ),
    ].map(
      (problem) =>
        `${problem}. Write it in a form this reads, so that what it runs is judged.`,
    );

    const violations = [
      ...unread,
      ...findStaleExclusiveJobs(workflows, EXCLUSIVE_JOBS),
      ...findRedundantCommands(workflows, graph),
      ...findUncoveredCommands(workflows, manifests, graph),
    ] as const;

    if (!Arr.isNonEmpty(violations)) {
      const distinct = new Set(workflows.flatMap(({ commands }) => commands));

      return Result.ok({
        workflows: workflows.length,
        commands: distinct.size,
        scripts: graph.commands.size,
      });
    }

    return Result.err(formatViolations(violations));
  });

/**
 * The covering relation over every script in the repository, as one directed
 * graph: an edge `a -> b` means that running `a` also runs `b`.
 *
 * Three kinds of edge are read out of the script bodies themselves — a local
 * `pnpm run`, an `npm-run-all` list, and a `pnpm run --recursive` (or one with
 * a `--filter`) that reaches the named script in every workspace package its
 * filters select — and the rest come from {@link DECLARED_COVERAGE}.
 */
export const buildCoverageGraph = (
  manifests: readonly Manifest[],
): CoverageGraph => {
  const commands = new Set(
    manifests.flatMap(({ directory, scripts }) =>
      Object.keys(scripts).map((scriptName) =>
        toCommandId(directory, scriptName),
      ),
    ),
  );

  const members = membersOf(manifests);

  const mut_problems: string[] = [];

  const derived = manifests.flatMap(({ directory, scripts }) => {
    const siblingNames = Object.keys(scripts);

    return Object.entries(scripts).flatMap(([scriptName, body]) => {
      const from = toCommandId(directory, scriptName);

      const invocations = resolveScriptInvocations(body);

      mut_problems.push(
        ...invocations.problems.map((problem) => `${from}: ${problem}`),
      );

      const local = invocations.local.flatMap((pattern) =>
        matchScriptNames(pattern, siblingNames).map((name) =>
          toCommandId(directory, name),
        ),
      );

      const recursive = invocations.recursive.flatMap(
        ({ pattern, filters }) => {
          const selected = selectMembers(filters, members);

          if (Result.isErr(selected)) {
            mut_problems.push(`${from}: ${selected.value}`);

            return [];
          }

          return selected.value.flatMap(({ directory: packageDir, names }) =>
            matchScriptNames(pattern, names).map((name) =>
              toCommandId(packageDir, name),
            ),
          );
        },
      );

      // `pnpm --dir <path>`, relative to the manifest whose script runs it.
      const pointed = invocations.pointed.flatMap(
        ({ pattern, directory: target, fromRoot }) => {
          const resolved = path.posix.normalize(
            fromRoot === true ? target : path.posix.join(directory, target),
          );

          const member = members.find(
            (candidate) => candidate.directory === resolved,
          );

          if (member === undefined) {
            mut_problems.push(
              `${from}: \`--dir ${target}\` names ${resolved}, which is no workspace member`,
            );

            return [];
          }

          return matchScriptNames(pattern, member.names).map((name) =>
            toCommandId(resolved, name),
          );
        },
      );

      return [...local, ...recursive, ...pointed].map((to) => ({ from, to }));
    });
  });

  const declared = DECLARED_COVERAGE.flatMap(({ from, to }) =>
    Arr.generate(function* () {
      for (const { directory, scripts } of manifests) {
        if (hasKey(scripts, from) && hasKey(scripts, to)) {
          yield {
            from: toCommandId(directory, from),
            to: toCommandId(directory, to),
          };
        }
      }
    }),
  );

  const mut_edges = new Map<CommandId, Set<CommandId>>();

  const addEdge = ({ from, to }: Edge): void => {
    if (from === to) {
      return;
    }

    const mut_targets = mut_edges.get(from) ?? new Set<CommandId>();

    mut_targets.add(to);

    mut_edges.set(from, mut_targets);
  };

  for (const edge of derived) {
    addEdge(edge);
  }

  for (const edge of declared) {
    addEdge(edge);
  }

  return { commands, edges: mut_edges, problems: mut_problems };
};

/**
 * The scripts one script body runs, as patterns rather than names: a body may
 * name a script (`pnpm run check:md`), a regular expression pnpm expands over
 * the manifest (`pnpm run '/check:prose:.-/'`), or a glob `npm-run-all` expands
 * the same way (`run-p check:test:-`). The body is read as the shell reads it
 * (`shell-commands.mts`), and each command as pnpm or `npm-run-all` reads its
 * words (`pnpm-command.mts`), so a flag's value is no script.
 *
 * `recursive` holds what a `pnpm run --recursive`, or a `pnpm run` with a
 * `--filter`, reaches, which is the named script of every workspace package
 * rather than a sibling of the caller. That is the whole of what the `ws:`
 * commands are, so it is what connects the workflows' command names to the
 * scripts each package defines. Each carries its `--filter` selectors, which
 * `buildCoverageGraph` applies: the root splits a command by them
 * (`ws:check:types:strict-lib`, `ws:check:test:heavy`), and a part reaches its
 * own packages, not every package. `pointed` holds a `pnpm --dir <path> run`,
 * the path as written.
 *
 * A script run with arguments of its own is left out. Everything after the
 * script name is handed to it, and an argument can change what the script
 * does: `verify:npm-packages:published` is `pnpm run verify:npm-packages
 * --published`, and what `--published` selects — the versions pinned under
 * verify-npm-packages/published rather than tarballs packed from the checkout
 * — is a different question from the one the bare script asks. Whether a
 * variant still covers the script it wraps is a judgement, so it belongs in
 * {@link DECLARED_COVERAGE} rather than being read off the body; an
 * `npm-run-all` entry with arguments (`"gen:x -- --all"`) is the same.
 */
export const resolveScriptInvocations = (body: string): ScriptInvocations => {
  const reading = readShellCommands(body);

  const mut_local: string[] = [];

  const mut_recursive: RecursiveInvocation[] = [];

  const mut_pointed: PointedInvocation[] = [];

  for (const words of reading.commands) {
    const run = readPnpmRun(words);

    if (run !== undefined) {
      if (Arr.isNonEmpty(run.args)) {
        continue;
      }

      // A filter runs the script in the packages it selects, `--recursive` or
      // not.
      if (run.recursive || Arr.isNonEmpty(run.filters)) {
        mut_recursive.push({ pattern: run.script, filters: run.filters });
      } else if (run.workspaceRoot) {
        mut_pointed.push({
          pattern: run.script,
          directory: '.',
          fromRoot: true,
        });
      } else if (run.directory !== undefined && run.directory !== '.') {
        mut_pointed.push({ pattern: run.script, directory: run.directory });
      } else {
        mut_local.push(run.script);
      }

      continue;
    }

    mut_local.push(...(readRunAll(words)?.scripts ?? []));
  }

  return {
    local: mut_local,
    recursive: mut_recursive,
    pointed: mut_pointed,
    problems: reading.problems,
  };
};

/**
 * Two commands the same group of jobs runs where one already covers the other.
 *
 * Only jobs that run on the same Node are compared. A workflow that pins an
 * explicit `node-version` is running its commands *because* of the version,
 * which is the whole of `node-version-compatibility.yml`: its `ws:check:test`
 * is covered by `code-check`'s `ws:check:test:cov` on paper and is not the same
 * check, because the Node underneath differs. Which versions that matrix may
 * name is `check-node-support.mts`'s question, and it is the one that caught
 * `current` naming the same Node as `volta.node`.
 *
 * Nor is a job that never runs beside the rest of its workflow, named in
 * `exclusiveJobs` ({@link EXCLUSIVE_JOBS}) with the reason: what it runs is
 * never run twice over.
 */
export const findRedundantCommands = (
  workflows: readonly CheckWorkflow[],
  graph: CoverageGraph,
  exclusiveJobs: ReadonlyRecord<string, string> = EXCLUSIVE_JOBS,
): readonly string[] => {
  const shared = workflows.filter(({ pinsNodeVersion }) => !pinsNodeVersion);

  const mut_origins = new Map<string, readonly string[]>();

  for (const { relativePath, jobCommands } of shared) {
    const workflowCommands = Arr.uniq(
      Object.entries(jobCommands).flatMap(([job, jobScripts]) =>
        hasKey(exclusiveJobs, exclusiveJobKey(relativePath, job))
          ? []
          : jobScripts,
      ),
    );

    for (const command of workflowCommands) {
      mut_origins.set(
        command,
        Arr.toPushed(mut_origins.get(command) ?? [], relativePath),
      );
    }
  }

  const commands = Array.from(mut_origins.keys()).toSorted();

  return commands.flatMap((covering) =>
    commands.flatMap((covered) => {
      if (covering === covered) {
        return [];
      }

      if (
        !reaches(
          graph,
          toCommandId(ROOT_DIRECTORY, covering),
          toCommandId(ROOT_DIRECTORY, covered),
        )
      ) {
        return [];
      }

      return [
        [
          `CI runs both \`${covering}\` (${(mut_origins.get(covering) ?? []).join(', ')})`,
          `and \`${covered}\` (${(mut_origins.get(covered) ?? []).join(', ')}),`,
          `and \`${covering}\` already runs \`${covered}\`.`,
        ].join(' '),
      ];
    }),
  );
};

/**
 * One message per `exclusiveJobs` entry that no longer names a job of a check
 * workflow running a root command, so that an entry left behind by a renamed or
 * deleted job cannot later hide one that does run beside the rest.
 */
export const findStaleExclusiveJobs = (
  workflows: readonly CheckWorkflow[],
  exclusiveJobs: ReadonlyRecord<string, string>,
): readonly string[] =>
  Arr.generate(function* () {
    for (const key of Object.keys(exclusiveJobs)) {
      if (
        workflows.every(({ relativePath, jobCommands }) =>
          Object.entries(jobCommands).every(
            ([job, jobScripts]) =>
              !(
                exclusiveJobKey(relativePath, job) === key &&
                Arr.isNonEmpty(jobScripts)
              ),
          ),
        )
      ) {
        yield `EXCLUSIVE_JOBS in check-ci-commands.mts names \`${key}\`, which is no job of a check workflow that runs a root command; remove the entry.`;
      }
    }
  });

/**
 * Every check script that no check workflow reaches.
 *
 * A script is a check when its name says so, because that is what the verb
 * namespaces in CLAUDE.md make a name mean: `check:` reads and reports, and a
 * `check:` script nothing runs is the failure this half exists to find. What is
 * deliberately not run is {@link UNCOVERED_BY_DESIGN}, with the reason beside
 * it.
 */
export const findUncoveredCommands = (
  workflows: readonly CheckWorkflow[],
  manifests: readonly Manifest[],
  graph: CoverageGraph,
): readonly string[] => {
  const entryPoints = workflows.flatMap(({ commands, packageRuns }) => [
    ...commands.map((command) => toCommandId(ROOT_DIRECTORY, command)),
    ...resolvePackageRuns(packageRuns, manifests).commands,
  ]);

  const covered = reachableFrom(graph, entryPoints);

  return manifests.flatMap(({ directory, scripts }) =>
    Object.keys(scripts)
      .toSorted()
      .flatMap((scriptName) => {
        if (!isCheckScript(scriptName)) {
          return [];
        }

        if (covered.has(toCommandId(directory, scriptName))) {
          return [];
        }

        if (isUncoveredByDesign(directory, scriptName)) {
          return [];
        }

        return [
          `\`${scriptName}\` in ${directory}/package.json is a check that no check workflow runs.`,
        ];
      }),
  );
};

export type Manifest = Readonly<{
  /** Relative to the repository root; `.` for the root manifest. */
  directory: string;
  /** The package's `name`, which a `--filter` selector may give. */
  name?: string;
  scripts: ReadonlyRecord<string, string>;
}>;

export type CommandId = string;

type Edge = Readonly<{ from: CommandId; to: CommandId }>;

export type CoverageGraph = Readonly<{
  commands: ReadonlySet<CommandId>;
  edges: ReadonlyMap<CommandId, ReadonlySet<CommandId>>;
  /** What a script body says that this could not read. */
  problems: readonly string[];
}>;

export type ScriptInvocations = Readonly<{
  local: readonly string[];
  recursive: readonly RecursiveInvocation[];
  pointed: readonly PointedInvocation[];
  /** What the body says that the shell reader could not read. */
  problems: readonly string[];
}>;

export type PointedInvocation = Readonly<{
  pattern: string;
  /** `--dir` / `-C`, as written. */
  directory: string;
  /** `-w`: the directory is the root's, not the manifest's. */
  fromRoot?: boolean;
}>;

export type RecursiveInvocation = Readonly<{
  pattern: string;
  /** The `--filter` selectors, as written. */
  filters: readonly string[];
}>;

export type CheckWorkflow = Readonly<{
  relativePath: string;
  /** The root scripts it runs. */
  commands: readonly string[];
  /**
   * The root scripts each job runs, by job id: `commands` is their union, kept
   * as well because most readers ask what the workflow runs, not which job.
   * `collectWorkflowCommands` makes both from one reading.
   */
  jobCommands: ReadonlyRecord<string, readonly string[]>;
  /** What it runs in packages, resolved by {@link resolvePackageRuns}. */
  packageRuns: readonly PackageRun[];
  /** What it says that this could not read. */
  problems: readonly string[];
  pinsNodeVersion: boolean;
}>;

export type WorkflowCommands = StrictPick<
  CheckWorkflow,
  'commands' | 'jobCommands' | 'packageRuns' | 'problems'
>;

/** A `pnpm run` pointed at packages by `--filter`, `-r` or `--dir`. */
export type PackageRun = Readonly<{
  scripts: readonly string[];
  filters: readonly string[];
  /** `--dir`, or the step's working directory, from the repository root. */
  directory: string | undefined;
}>;

type CheckSummary = Readonly<{
  workflows: number;
  commands: number;
  scripts: number;
}>;

const ROOT_DIRECTORY = '.';

/**
 * A workflow is one of the repository's checks when it triggers on
 * `pull_request`, which is exactly the six named in CLAUDE.md.
 * `lint-pull-request.yml` and `skip-ci-label.yml` use `pull_request_target` and
 * run no repository command; `check-gates.yml` is reached through
 * `workflow_call`. The rest — the release, the dependency updates, the Pages
 * deploy — run commands that nothing about a pull request depends on, so a
 * check only they reach is a check no pull request gets.
 */
const PULL_REQUEST_EVENT = 'pull_request';

/**
 * A selector this reads: a package name or a path, either with `*` globs, and
 * `!` before it to exclude. The dependency forms (`...`, `^`, `[ref]`, `{…}`)
 * select by what the graph does not know, so a filter that uses one is reported
 * rather than read as selecting every package, which would hide a gap in what
 * it reaches.
 */
const UNREAD_SELECTOR = /\.\.\.|\^|\[|\{/u;

const SCRIPT_NAME = /^[\w:-]+$/u;

/** The `z:ci-job` options that name a root script it runs. */
const CI_JOB_SCRIPT_OPTIONS: ReadonlySet<string> = new Set<string>([
  CI_JOB_COMMAND,
  CI_JOB_BUILD,
]);

const WORKSPACE_EXPRESSION = /^\$\{\{\s*github\.workspace\s*\}\}\/?$/u;

/** `node-version:` pins a version; `node-version-file:` reads `volta.node`. */
const PINNED_NODE_VERSION = /^ *node-version: /mu;

/**
 * Jobs that never run beside the rest of their workflow, keyed by
 * `<workflow path>#<job id>`, each with the reason. Their commands still count
 * as run, for {@link findUncoveredCommands}, but not as run twice, for
 * {@link findRedundantCommands}. A claim, not a silencer: an entry whose job is
 * gone fails ({@link findStaleExclusiveJobs}).
 */
const EXCLUSIVE_JOBS: ReadonlyRecord<string, string> = {
  '.github/workflows/code-check.yml#coverage-main':
    'Runs `ws:check:test:cov` on a push to main only when the matrix reused a verdict and no run of the tree kept its reports, so never beside the coverage entry that runs it.',
} as const;

/**
 * What a script body cannot say about itself.
 *
 * Every entry is applied to a manifest that defines both names, so one line
 * covers the root and all sixty packages where the pair means the same thing.
 */
const DECLARED_COVERAGE: readonly CoverageDeclaration[] = [
  {
    from: 'check:test:cov',
    to: 'check:test',
    // `pnpm run z:vitest:node run --coverage` against `pnpm run
    // z:vitest:node run`: the same suite, with the instrumentation added.
  },
  {
    from: 'ws:check:test:cov',
    to: 'ws:check:test',
    // The root pair of the same two, one `run-s` removed from each other.
  },
  {
    from: 'fix:lint',
    to: 'check:lint',
    // `eslint . --fix` against `eslint .`: the same rules over the same files,
    // and a rule that has no fixer still reports.
  },
  {
    from: 'ws:fix:lint',
    to: 'ws:check:lint',
  },
  {
    from: 'fix:fmt:full',
    to: 'fix:fmt:diff',
    // Prettier over everything against Prettier over what differs from
    // `origin/main`.
  },
  {
    from: 'fix:fmt:diff',
    to: 'fix:fmt',
    // What differs from `origin/main` against what is uncommitted.
  },
  {
    from: 'fix:codemod:full',
    to: 'fix:codemod:diff',
  },
  {
    from: 'fix:codemod:affected',
    to: 'fix:codemod:diff',
    // The codemod over the diff from the base, or over everything when what
    // decides its output changed (`codemod-affected.mts`).
  },
  {
    from: 'fix:codemod:diff',
    to: 'fix:codemod',
  },
  {
    from: 'doc',
    to: 'gen:jsdoc',
    // Nine packages reach their embedding steps through a `gen-docs.mts` rather
    // by naming them, so the body shows nothing. That the wiring exists at all
    // is `check-example-coverage.mts`'s question, and this defers to it.
  },
  {
    from: 'doc',
    to: 'gen:readme',
    // As above, with `check-readme-sample-coverage.mts` as the guard.
  },
] as const;

/**
 * Checks no check workflow runs, on purpose.
 *
 * An entry is a claim that something else already covers the script, or that it
 * is not a check a pull request needs; either way the reason is the point.
 */
const UNCOVERED_BY_DESIGN: readonly UncoveredDeclaration[] = [
  {
    directory: ROOT_DIRECTORY,
    scriptName: 'check-all',
    // A human aid rather than a CI job: it runs the matrix entries of
    // code-check.yml and style-check.yml, read from them, so each is reached
    // here through its own workflow; its header says what it leaves out.
  },
  {
    directory: ROOT_DIRECTORY,
    scriptName: 'check-changed',
    // A human and session aid like `check-all`: it picks the commands a diff
    // needs and runs those, every one of which CI runs through its own entry.
  },
  {
    directory: ROOT_DIRECTORY,
    scriptName: 'verify:npm-packages:published:update',
    // Not a check — it rewrites the pins under `verify-npm-packages/published`
    // so that a release arrives as a diff. `pnpm-update.yml` runs it, and
    // `verify-published-packages.yml` is what checks the result.
  },
  {
    directory: ROOT_DIRECTORY,
    scriptName: 'ws:check:types',
    // CI runs it as two halves, `ws:check:types:non-strict-lib` (in
    // `code-check.yml`) and `ws:check:types:strict-lib` (in
    // `strict-lib-gen.yml`), which between them reach every package's
    // `check:types`. Neither covers the root command on its own; that the
    // halves partition the packages is in their filters, `!./strict-lib/**` and
    // `./strict-lib/**` (`check:root:workspace-shards`).
  },
  {
    // Every package that defines one.
    scriptName: 'check-all',
    // The per-package aggregate. Everything in it is covered by the root `ws:`
    // command for the same check, which is what CI runs.
  },
  {
    directory: 'apps/event-schedule-app',
    scriptName: 'check:e2e:production',
    // The end-to-end tests against the deployed site, which
    // `e2e-production.yml` runs daily (through the binary, after installing
    // this app alone). What they judge is the site, not the tree, so a pull
    // request check would fail for nothing the branch did.
  },
  {
    scriptName: 'check:cspell',
    // The package-scoped spell check. The root `check:cspell` reads the whole
    // repository, so the per-package script exists to be run by hand in a
    // package directory, where it picks that package's own config up as cwd.
  },
] as const;

type CoverageDeclaration = Readonly<{ from: string; to: string }>;

type UncoveredDeclaration = Readonly<{
  /** Every manifest when absent. */
  directory?: string;
  scriptName: string;
}>;

/**
 * What a workflow runs: every `pnpm run` of a step's `run:` script, read as the
 * shell reads it, a variable the step's or job's `env:` gives a matrix value
 * read through it; a matrix value as each value the job's matrix gives the key,
 * and a `z:ci-job`'s `--command` and `--build` the same way. A run in the root
 * names a root script; one pointed at packages (`--filter`, `-r`, `--dir`, a
 * `working-directory`) is kept for {@link resolvePackageRuns}. A script it
 * cannot name — one an expression or a variable gives, or a matrix key the
 * matrix does not hold — is a problem, not a run left out.
 */
export const collectWorkflowCommands = (
  workflowFile: string,
): WorkflowCommands => {
  const jobs = readWorkflowJobs(workflowFile);

  if (Result.isErr(jobs)) {
    return {
      commands: [],
      jobCommands: {},
      packageRuns: [],
      problems: [jobs.value],
    };
  }

  const mut_jobCommands: MutableRecord<string, readonly string[]> = {};

  const mut_packageRuns: PackageRun[] = [];

  const mut_problems: string[] = [];

  for (const job of jobs.value) {
    const matrix = readMatrix(job.matrix);

    const mut_commands: string[] = [];

    for (const [index, step] of job.steps.entries()) {
      if (step.run === undefined) {
        continue;
      }

      const where = `job \`${job.name}\`, step ${index + 1}` as const;

      const reading = readShellCommands(step.run);

      mut_problems.push(
        ...reading.problems.map((problem) => `${where}: ${problem}`),
      );

      const env = { ...job.env, ...step.env } as const;

      for (const words of reading.commands) {
        const run = readPnpmRun(words.map((word) => expandVariable(word, env)));

        if (run === undefined) {
          continue;
        }

        const named = Arr.toUnshifted(run.script)(
          run.script === CI_JOB
            ? optionValues(run.args, CI_JOB_SCRIPT_OPTIONS)
            : [],
        ).map((word) => scriptsNamedBy(word, matrix));

        for (const result of named) {
          if (Result.isErr(result)) {
            mut_problems.push(`${where}: ${result.value}`);
          }
        }

        const scripts = named.flatMap((result) =>
          Result.isOk(result) ? result.value : [],
        );

        // `-w` runs from the workspace root wherever the step is.
        const base =
          run.workspaceRoot || isRootDirectory(step.workingDirectory)
            ? undefined
            : step.workingDirectory;

        // pnpm resolves a path selector, and picks `-r`'s packages, from the
        // working directory; this resolves them from the root.
        if (
          base !== undefined &&
          (run.recursive || Arr.isNonEmpty(run.filters))
        ) {
          mut_problems.push(
            `${where}: a run pointed at packages from the working directory \`${base}\`, which this does not read`,
          );

          continue;
        }

        // `-w` overrides `--dir` too.
        const directory =
          run.workspaceRoot || run.directory === undefined
            ? base
            : base === undefined
              ? run.directory
              : path.posix.join(base, run.directory);

        if (
          run.recursive ||
          Arr.isNonEmpty(run.filters) ||
          !isRootDirectory(directory)
        ) {
          mut_packageRuns.push({ scripts, filters: run.filters, directory });
        } else {
          mut_commands.push(...scripts);
        }
      }
    }

    if (Arr.isNonEmpty(mut_commands)) {
      mut_jobCommands[job.name] = Arr.uniq(mut_commands).toSorted();
    }
  }

  return {
    commands: Arr.uniq(Object.values(mut_jobCommands).flat()).toSorted(),
    jobCommands: mut_jobCommands,
    packageRuns: mut_packageRuns,
    problems: mut_problems,
  };
};

/**
 * The commands a workflow's package runs reach, `<directory>:<script>`: those
 * of each package a run's `--filter` selectors pick (every one, for `-r` with
 * none), or of the package its `--dir` names. A run that reaches no package
 * that defines the script, or names a directory or selector this cannot read,
 * is a problem.
 */
export const resolvePackageRuns = (
  runs: readonly PackageRun[],
  manifests: readonly Manifest[],
): Readonly<{
  commands: readonly CommandId[];
  problems: readonly string[];
}> => {
  const members = membersOf(manifests);

  const mut_commands: CommandId[] = [];

  const mut_problems: string[] = [];

  for (const { scripts, filters, directory } of runs) {
    const selected =
      directory === undefined
        ? selectMembers(filters, members)
        : Arr.isNonEmpty(filters)
          ? Result.err(
              `\`--dir ${directory}\` beside \`--filter\`, which this does not read`,
            )
          : directory.includes('$')
            ? Result.err(
                `a directory an expression or a variable gives (\`${directory}\`)`,
              )
            : Result.ok(
                members.filter(
                  (member) =>
                    member.directory === path.posix.normalize(directory),
                ),
              );

    if (Result.isErr(selected)) {
      mut_problems.push(selected.value);

      continue;
    }

    for (const script of scripts) {
      const reached = selected.value.flatMap(({ directory: dir, names }) =>
        matchScriptNames(script, names).map((name) => toCommandId(dir, name)),
      );

      if (Arr.isEmpty(reached)) {
        mut_problems.push(
          `\`pnpm run ${script}\` pointed at packages (${
            directory === undefined && Arr.isEmpty(filters)
              ? '-r'
              : [
                  ...filters.map((filter) => `--filter ${filter}`),
                  ...(directory === undefined ? [] : [`--dir ${directory}`]),
                ].join(' ')
          }) reaches no package that defines it`,
        );
      }

      mut_commands.push(...reached);
    }
  }

  return { commands: Arr.uniq(mut_commands), problems: mut_problems };
};

export const toCommandId = (directory: string, scriptName: string): CommandId =>
  `${directory}:${scriptName}` as const;

/** The inverse of {@link toCommandId}; a directory holds no `:`. */
export const splitCommandId = (
  command: CommandId,
): Readonly<{ directory: string; scriptName: string }> => {
  const separator = command.indexOf(':');

  return {
    directory: command.slice(0, separator),
    scriptName: command.slice(separator + 1),
  };
};

export const reachableFrom = (
  graph: CoverageGraph,
  entryPoints: readonly CommandId[],
): ReadonlySet<CommandId> => {
  const mut_seen = new Set<CommandId>(entryPoints);

  const mut_queue: CommandId[] = Array.from(entryPoints);

  while (Arr.isNonEmpty(mut_queue)) {
    const current = mut_queue.shift();

    if (current === undefined) {
      break;
    }

    const unseen = Array.from(graph.edges.get(current) ?? []).filter(
      (next) => !mut_seen.has(next),
    );

    for (const next of unseen) {
      mut_seen.add(next);
    }

    mut_queue.push(...unseen);
  }

  return mut_seen;
};

export const readManifests = async (): Promise<
  Result<readonly Manifest[], string>
> => {
  const rootManifest = await readRootManifest();

  if (Result.isErr(rootManifest)) {
    return rootManifest;
  }

  const packages = await Result.fromPromise(
    getWorkspacePackages(projectRootPath),
  );

  if (Result.isErr(packages)) {
    return Result.err(
      `Failed to list the workspace packages: ${unknownToString(packages.value)}`,
    );
  }

  const workspaceManifests = packages.value
    .map((workspacePackage): Manifest => ({
      name: workspacePackage.name,
      // `/`-separated, as check-changed names directories.
      directory: path
        .relative(projectRootPath, workspacePackage.path)
        .split(path.sep)
        .join('/'),
      scripts: readScripts(workspacePackage.packageJson),
    }))
    .toSorted((a, b) => a.directory.localeCompare(b.directory));

  return Result.ok(Arr.toUnshifted(rootManifest.value)(workspaceManifests));
};

export const readCheckWorkflows = async (): Promise<
  Result<readonly CheckWorkflow[], string>
> => {
  const paths = await listWorkflowFiles();

  if (Result.isErr(paths)) {
    return paths;
  }

  const results = await Promise.all(paths.value.map(readWorkflow));

  const failed = results.find(Result.isErr);

  return failed !== undefined
    ? Result.err(failed.value)
    : Result.ok(
        Arr.generate(function* () {
          for (const result of results) {
            if (!Result.isErr(result) && result.value !== undefined) {
              yield result.value;
            }
          }
        }),
      );
};

/**
 * The entries under the `include:` of every job's matrix, each with its
 * properties as strings (`command`, `build`, `browser: 'true'`);
 * `check-all.mts` runs them. A workflow YAML cannot parse, or a matrix whose
 * entries are not in the file, is an error.
 */
export const readMatrixInclude = (
  workflowFile: string,
): Result<readonly ReadonlyRecord<string, string>[], string> => {
  const jobs = readWorkflowJobs(workflowFile);

  if (Result.isErr(jobs)) {
    return jobs;
  }

  const matrices = jobs.value
    .filter(({ matrix }) => matrix !== undefined)
    .map(({ name, matrix }) => ({ name, matrix: readMatrix(matrix) }));

  const unread = matrices.find(({ matrix }) => Result.isErr(matrix));

  if (unread !== undefined && Result.isErr(unread.matrix)) {
    return Result.err(`job \`${unread.name}\`: ${unread.matrix.value}`);
  }

  return Result.ok(
    matrices.flatMap(({ matrix }) =>
      Result.isOk(matrix) ? matrix.value.include : [],
    ),
  );
};

export const readRootManifest = async (): Promise<Result<Manifest, string>> =>
  Result.map(await readRootPackageScripts(), (scripts) => ({
    directory: ROOT_DIRECTORY,
    scripts,
  }));

/**
 * A path selector against a directory, one `/`-separated segment at a time:
 * `**` takes any number of segments, and within one `*` any run of characters
 * ({@link matchesGlob}, which builds no regular expression from a manifest).
 */
const matchesPathGlob = (
  globSegments: readonly string[],
  pathSegments: readonly string[],
): boolean => {
  const [head, ...rest] = globSegments;

  if (head === undefined) {
    return Arr.isEmpty(pathSegments);
  }

  if (head === '**') {
    return Arr.seq(asUint32(pathSegments.length + 1)).some((skipped) =>
      matchesPathGlob(rest, pathSegments.slice(skipped)),
    );
  }

  const [first, ...remaining] = pathSegments;

  return (
    first !== undefined &&
    matchesGlob(head, first) &&
    matchesPathGlob(rest, remaining)
  );
};

/**
 * The workspace members pnpm's `--filter` selectors pick: those one of the
 * positive selectors picks (every package when none is given; the root only
 * when one names it, `.`), less those a `!` one picks. A selector of a form
 * this does not read ({@link UNREAD_SELECTOR}) is an error.
 */
const selectMembers = <
  M extends Readonly<{ directory: string; name: string | undefined }>,
>(
  filters: readonly string[],
  members: readonly M[],
): Result<readonly M[], string> => {
  const unread = filters.filter((selector) => UNREAD_SELECTOR.test(selector));

  if (Arr.isNonEmpty(unread)) {
    return Result.err(
      `a \`--filter\` selector of a form this does not read: ${unread.map((selector) => `\`${selector}\``).join(', ')}`,
    );
  }

  const packages = members.filter(
    ({ directory }) => directory !== ROOT_DIRECTORY,
  );

  const picked = (selector: string): ReadonlySet<M> => {
    if (selector === '.' || selector === './') {
      return new Set<M>(
        members.filter(({ directory }) => directory === ROOT_DIRECTORY),
      );
    }

    if (selector.startsWith('.')) {
      return new Set<M>(
        packages.filter(({ directory }) =>
          matchesPathGlob(
            selector.replace(/^\.\//u, '').split('/'),
            directory.split('/'),
          ),
        ),
      );
    }

    const byName = packages.filter(
      ({ name }) => name !== undefined && matchesGlob(selector, name),
    );

    // pnpm lets an unscoped name select a scoped package of that name, when no
    // package has the name itself and exactly one scope does; a selector that
    // is scoped itself falls back to nothing.
    if (
      Arr.isNonEmpty(byName) ||
      selector.includes('/') ||
      selector.startsWith('@')
    ) {
      return new Set<M>(byName);
    }

    const scoped = packages.filter(
      ({ name }) =>
        name?.startsWith('@') === true &&
        matchesGlob(selector, name.slice(name.indexOf('/') + 1)),
    );

    return new Set<M>(Arr.isFixedLengthArray(1, scoped) ? scoped : []);
  };

  // Each selector matched once, not once per member.
  const included = filters
    .filter((selector) => !selector.startsWith('!'))
    .map(picked);

  const excluded = filters
    .filter((selector) => selector.startsWith('!'))
    .map((selector) => picked(selector.slice(1)));

  const kept = Arr.isEmpty(included)
    ? packages
    : members.filter((member) => included.some((set) => set.has(member)));

  return Result.ok(
    kept.filter((member) => excluded.every((set) => !set.has(member))),
  );
};

/** Each manifest as a member a selector may pick, with its script names. */
const membersOf = (
  manifests: readonly Manifest[],
): readonly Readonly<{
  directory: string;
  name: string | undefined;
  names: readonly string[];
}>[] =>
  manifests.map(({ directory, name, scripts }) => ({
    directory,
    name,
    names: Object.keys(scripts),
  }));

/**
 * The root scripts a word of a workflow's `pnpm run` names: the word itself, or
 * each value the job's matrix gives the key `${{ matrix.<key> }}` names. Any
 * other expansion is an error, since what it runs is not in the file.
 */
const scriptsNamedBy = (
  word: string,
  matrix: Result<Matrix, string>,
): Result<readonly string[], string> => {
  const key = matrixKeyOf(word);

  if (key !== undefined) {
    if (Result.isErr(matrix)) {
      return Result.err(`\`${word}\` names ${matrix.value}`);
    }

    const values = matrixValues(matrix.value, key);

    return Arr.isNonEmpty(values)
      ? Result.ok(values)
      : Result.err(`\`${word}\` names a key its job's matrix does not give`);
  }

  return SCRIPT_NAME.test(word) || word.startsWith('/')
    ? Result.ok([word])
    : Result.err(`a script named by \`${word}\`, which this cannot read`);
};

/**
 * Whether a step's working directory is the repository root: none, `.`, `./`,
 * or `${{ github.workspace }}`, which is where the checkout is.
 */
const isRootDirectory = (directory: string | undefined): boolean =>
  directory === undefined ||
  path.posix.normalize(directory).replace(/\/$/u, '') === '.' ||
  WORKSPACE_EXPRESSION.test(directory);

/**
 * Whether a script's name says it is a check a pull request should get.
 *
 * The verb namespaces in CLAUDE.md are what make a name mean this: `check:`
 * reads and reports, so a `check:` script nothing runs is a question nobody is
 * asking. A leading scope is skipped, so `ws:check:types` and
 * `strict-lib:check:lint` count too, and `verify:` joins them — what
 * verify-npm-packages/ reads is the published artifact rather than the source,
 * which is a check by every meaning except the prefix.
 *
 * The `z:` namespace is this repository's plumbing: a script another script or
 * a workflow's own glue invokes, never a check in its own right.
 * `z:check-should-run` is the diff gate by hand; check-gates.yml reads its lists
 * (`tools/configs/gate-ignore-lists.json`, through `workflow-steps.mts
 * check-diff`) through `workflow_call` — a workflow that
 * triggers on nothing and so is not one of the six below.
 */
const isCheckScript = (scriptName: string): boolean => {
  if (scriptName.startsWith(PLUMBING_PREFIX)) {
    return false;
  }

  if (scriptName.startsWith(VERIFY_PREFIX)) {
    return true;
  }

  // A leading scope is skipped by asking about the segments rather than about
  // the whole name, so `ws:check:types` and `strict-lib:check:lint` count and
  // `precheck:x` does not.
  return scriptName
    .split(':')
    .some(
      (segment) => segment === CHECK_SEGMENT || segment.startsWith(CHECK_DASH),
    );
};

const PLUMBING_PREFIX = 'z:';

const VERIFY_PREFIX = 'verify:';

const CHECK_SEGMENT = 'check';

const CHECK_DASH = 'check-';

const isUncoveredByDesign = (directory: string, scriptName: string): boolean =>
  UNCOVERED_BY_DESIGN.some(
    (entry) =>
      entry.scriptName === scriptName &&
      (entry.directory === undefined || entry.directory === directory),
  );

const exclusiveJobKey = (relativePath: string, job: string): string =>
  `${relativePath}#${job}` as const;

const reaches = (
  graph: CoverageGraph,
  from: CommandId,
  to: CommandId,
): boolean => from !== to && reachableFrom(graph, [from]).has(to);

const readWorkflow = async (
  workflowPath: string,
): Promise<Result<CheckWorkflow | undefined, string>> => {
  const relativePath = path.relative(projectRootPath, workflowPath);

  const contents = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(workflowPath, 'utf8'),
  );

  if (Result.isErr(contents)) {
    return Result.err(
      `Failed to read ${relativePath}: ${unknownToString(contents.value)}`,
    );
  }

  if (!triggersOn(contents.value, PULL_REQUEST_EVENT)) {
    return Result.ok(undefined);
  }

  return Result.ok({
    relativePath,
    ...collectWorkflowCommands(contents.value),
    pinsNodeVersion: PINNED_NODE_VERSION.test(contents.value),
  });
};

const formatViolations = (violations: readonly string[]): string =>
  [
    '❌ The check workflows and the check scripts disagree:',
    '',
    ...violations.map((message) => `  ${message}`),
    '',
    'A command already covered by another one spends runner time to re-answer',
    'a question, and a check no workflow runs is a check that cannot fail.',
    'Remove the redundant entry, wire the uncovered check into a workflow, or',
    'record the exception with its reason in check-ci-commands.mts.',
  ].join('\n');

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkCiCommands().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    [
      `The ${result.value.workflows} check workflows run`,
      `${result.value.commands} commands, none covered by another, and every`,
      `check among the ${result.value.scripts} scripts is reached.`,
    ].join(' '),
  );
}
