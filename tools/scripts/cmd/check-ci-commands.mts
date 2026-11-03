import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Obj,
  Optional,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import { Regex } from 'ts-std-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { listWorkflowFiles } from '../lib/repo-files.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { CHECK_ALL_STEPS, LEFT_TO_CI } from './check-all.mjs';
import {
  ALL_AREAS,
  buildPlan,
  GENERATORS_LEFT_TO_CI,
  type PackageInfo,
} from './check-changed/plan.mjs';
import { parseWorkflowTriggers } from './check-workflow-event-name.mjs';

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
 *
 * The same graph answers a third question, {@link findCommandsMissingLocally}:
 * whether the local runners that restate the workflows by hand, `check-all` and
 * `check-changed`, still run every command the workflows do.
 */
export const checkCiCommands = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const manifests = yield* Result.safeUnwrap(await readManifests());

    const graph = buildCoverageGraph(manifests);

    const workflows = yield* Result.safeUnwrap(await readCheckWorkflows());

    const violations = [
      ...findRedundantCommands(workflows, graph),
      ...findUncoveredCommands(workflows, manifests, graph),
      ...findCommandsMissingLocally({
        workflows,
        graph,
        runner: {
          name: 'check-all.mts',
          remedy:
            'add a step to CHECK_ALL_STEPS there that reaches it, or name it in LEFT_TO_CI with the reason.',
          runs: CHECK_ALL_STEPS.map(({ script }) =>
            toCommandId(ROOT_DIRECTORY, script),
          ),
          leftOut: LEFT_TO_CI,
          asks: () => true,
        },
      }),
      ...findCommandsMissingLocally({
        workflows,
        graph,
        runner: {
          name: 'check-changed/plan.mts',
          remedy:
            'give buildPlan a step that runs it for the paths it reads (and say so in the README), or name it in GENERATORS_LEFT_TO_CI with the reason.',
          runs: commandsAnyPlanRuns(manifests),
          leftOut: GENERATORS_LEFT_TO_CI,
          asks: isWriterScript,
        },
      }),
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
 * `pnpm run`, an `npm-run-all` list, and a recursive `pnpm run --recursive`
 * that reaches the named script in every workspace package — and the rest come
 * from {@link DECLARED_COVERAGE}.
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

  const packageScriptNames = Arr.generate(function* () {
    for (const { directory, scripts } of manifests) {
      if (directory !== ROOT_DIRECTORY) {
        yield { directory, names: Object.keys(scripts) };
      }
    }
  });

  const derived = manifests.flatMap(({ directory, scripts }) => {
    const siblingNames = Object.keys(scripts);

    return Object.entries(scripts).flatMap(([scriptName, body]) => {
      const invocations = resolveScriptInvocations(body);

      const local = invocations.local.flatMap((pattern) =>
        matchScriptNames(pattern, siblingNames).map((name) =>
          toCommandId(directory, name),
        ),
      );

      const recursive = invocations.recursive.flatMap((pattern) =>
        packageScriptNames.flatMap(({ directory: packageDir, names }) =>
          matchScriptNames(pattern, names).map((name) =>
            toCommandId(packageDir, name),
          ),
        ),
      );

      return [...local, ...recursive].map((to) => ({
        from: toCommandId(directory, scriptName),
        to,
      }));
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

  const withArguments = manifests.flatMap(({ directory, scripts }) =>
    Arr.generate(function* () {
      for (const [scriptName, body] of Object.entries(scripts)) {
        if (runsScriptWithArguments(body)) {
          yield toCommandId(directory, scriptName);
        }
      }
    }),
  );

  return {
    commands,
    edges: toEdgeMap([...derived, ...declared]),
    bodyEdges: toEdgeMap(derived),
    withArguments: new Set<CommandId>(withArguments),
  };
};

/**
 * The scripts one script body runs, as patterns rather than names: a body may
 * name a script (`pnpm run check:md`), a regular expression pnpm expands over
 * the manifest (`pnpm run '/check:prose:.-/'`), or a glob `npm-run-all` expands
 * the same way (`run-p check:test:-`).
 *
 * `recursive` holds what a `pnpm run --recursive` reaches, which is the named
 * script of every workspace package rather than a sibling of the caller. That
 * is the whole of what the `ws:` commands are, so it is what connects the
 * workflows' command names to the scripts each package defines.
 */
export const resolveScriptInvocations = (body: string): ScriptInvocations => {
  const mut_local: string[] = [];

  const mut_recursive: string[] = [];

  for (const matched of body.matchAll(PNPM_RUN)) {
    const tokens = tokenize(matched.groups?.['args'] ?? '');

    // Everything before the script name is a flag of pnpm's own (`--recursive`,
    // `--if-present`); everything after it is an argument handed to the script,
    // and an argument can change what the script does.
    // `verify:npm-packages:published` is `pnpm run verify:npm-packages
    // --published`, and what `--published` selects — the versions pinned
    // under verify-npm-packages/published rather than tarballs packed from the
    // checkout — is a different question from the one the bare script asks.
    // Whether a variant still covers the script it wraps is a judgement, so it
    // belongs in {@link DECLARED_COVERAGE} rather than being read off the body.
    const targetIndex = tokens.findIndex((token) => !token.startsWith('-'));

    const target = targetIndex === -1 ? undefined : tokens[targetIndex];

    if (target === undefined || tokens.length > targetIndex + 1) {
      continue;
    }

    if (tokens.some((token) => RECURSIVE_FLAGS.has(token))) {
      mut_recursive.push(target);
    } else {
      mut_local.push(target);
    }
  }

  for (const matched of body.matchAll(RUN_ALL)) {
    const tokens = tokenize(matched.groups?.['args'] ?? '');

    mut_local.push(...tokens.filter((token) => !token.startsWith('-')));
  }

  return { local: mut_local, recursive: mut_recursive };
};

/**
 * The script names a pattern from a script body selects.
 *
 * pnpm reads a name wrapped in slashes as a regular expression and
 * `npm-run-all` reads `*` as a glob; everything else is a literal name.
 */
export const matchScriptNames = (
  pattern: string,
  scriptNames: readonly string[],
): readonly string[] => {
  if (pattern.startsWith('/') && pattern.endsWith('/') && pattern.length > 1) {
    const expression = Regex.create(pattern.slice(1, -1), 'u');

    return Result.isErr(expression)
      ? []
      : scriptNames.filter((name) => expression.value.test(name));
  }

  return pattern.includes('*')
    ? scriptNames.filter((name) => matchesGlob(pattern, name))
    : scriptNames.includes(pattern)
      ? [pattern]
      : [];
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
 */
export const findRedundantCommands = (
  workflows: readonly CheckWorkflow[],
  graph: CoverageGraph,
): readonly string[] => {
  const shared = workflows.filter(({ pinsNodeVersion }) => !pinsNodeVersion);

  const mut_origins = new Map<string, readonly string[]>();

  for (const { relativePath, commands: workflowCommands } of shared) {
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
  const entryPoints = workflows.flatMap(({ commands }) =>
    commands.map((command) => toCommandId(ROOT_DIRECTORY, command)),
  );

  const covered = reachableFrom(graph.edges, entryPoints);

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

/**
 * The commands CI runs that a local runner — `check-all.mts`, or the plan
 * `check-changed` builds — neither runs nor names as left to CI, and every name
 * on its left-to-CI list that no longer means anything.
 *
 * Both runners restate the workflows by hand, and a command added to a matrix
 * without them is found by CI first: for a generator, as a dirty tree that
 * names none (#3213). This asks the question through the same graph as the rest
 * of the file. A command counts as run when a runner's command reaches it, or
 * when every script its body runs is run in turn: `code-check.yml` runs
 * `ws:check:types:non-strict-lib`, which `check-all.mts` never names, and every
 * package's `check:types` it runs is reached through `ws:check:types`.
 *
 * What is reported is the command a fix has to name: an aggregate some of whose
 * entries are run is opened up to the entries that are not, and a command none
 * of whose entries is run is named whole, rather than as each package script
 * under it, since the lists name root scripts. A body that runs a program
 * besides its scripts (an `assert-deps-built` in front) is judged by its
 * scripts alone; one that runs a script with arguments is run only when run
 * itself.
 */
export const findCommandsMissingLocally = ({
  workflows,
  graph,
  runner,
}: Readonly<{
  workflows: readonly CheckWorkflow[];
  graph: CoverageGraph;
  runner: LocalRunner;
}>): readonly string[] => {
  const reached = reachableFrom(graph.edges, runner.runs);

  const leftOut: ReadonlySet<CommandId> = new Set(
    runner.leftOut.map((scriptName) => toCommandId(ROOT_DIRECTORY, scriptName)),
  );

  const isWhollyRun = whollyRunBy(graph, reached, leftOut);

  const isRunWithoutTheList = whollyRunBy(graph, reached, new Set<CommandId>());

  // The commands to name for one that is not wholly run. One the runner does
  // not answer for is looked through, to the scripts under it that it does.
  // One it does answer for is named whole when none of its scripts is run or
  // none of those missing is one it answers for (`fix:fmt`, whose
  // `z:format-uncommitted` is plumbing), and opened up to them otherwise.
  const missingUnder = (
    command: CommandId,
    visiting: ReadonlySet<CommandId>,
  ): readonly CommandId[] => {
    if (isWhollyRun(command) || visiting.has(command)) {
      return [];
    }

    const targets = Array.from(graph.bodyEdges.get(command) ?? []);

    const open = targets.filter((target) => !isWhollyRun(target));

    const below = open.flatMap((target) =>
      missingUnder(target, new Set<CommandId>([...visiting, command])),
    );

    // A list names root scripts, so a package script under a root command is
    // reported as that command, which the list can name.
    if (
      isRootCommand(command) &&
      below.some((missing) => !isRootCommand(missing))
    ) {
      return [command];
    }

    return !runner.asks(scriptNameOf(command))
      ? below
      : open.length === targets.length || !Arr.isNonEmpty(below)
        ? [command]
        : below;
  };

  const mut_origins = new Map<CommandId, readonly string[]>();

  for (const { relativePath, commands } of workflows) {
    for (const command of commands) {
      for (const missing of missingUnder(
        toCommandId(ROOT_DIRECTORY, command),
        new Set<CommandId>(),
      )) {
        const origins = mut_origins.get(missing) ?? [];

        mut_origins.set(
          missing,
          origins.includes(relativePath)
            ? origins
            : Arr.toPushed(origins, relativePath),
        );
      }
    }
  }

  // By body edges alone, as above: a name a workflow reaches only through a
  // declared edge is one CI no longer runs as such.
  const runByCi = reachableFrom(
    graph.bodyEdges,
    workflows.flatMap(({ commands }) =>
      commands.map((command) => toCommandId(ROOT_DIRECTORY, command)),
    ),
  );

  return [
    ...Array.from(
      mut_origins,
      ([command, origins]) =>
        `\`${scriptNameOf(command)}\` (${origins.join(', ')}) is run by CI and not by ${runner.name}: ${runner.remedy}`,
    ),
    ...runner.leftOut.flatMap((scriptName) => {
      const command = toCommandId(ROOT_DIRECTORY, scriptName);

      return !runByCi.has(command)
        ? [
            `${runner.name} leaves \`${scriptName}\` to CI, and no check workflow runs it; remove it from the list.`,
          ]
        : isRunWithoutTheList(command)
          ? [
              `${runner.name} leaves \`${scriptName}\` to CI, and runs it as well; remove it from the list.`,
            ]
          : [];
    }),
  ];
};

/**
 * The root scripts a workflow runs: every `run: pnpm run <name>` step, plus
 * every entry of a matrix key the workflow hands to `pnpm run`.
 */
export const collectWorkflowCommands = (
  workflowFile: string,
): readonly string[] => {
  const matrixKeys = new Set(
    Arr.generate(function* () {
      for (const matched of Array.from(workflowFile.matchAll(MATRIX_COMMAND))) {
        const key = matched.groups?.['key'];

        if (key !== undefined) {
          yield key;
        }
      }
    }),
  );

  const literals = Arr.generate(function* () {
    for (const matched of Array.from(workflowFile.matchAll(LITERAL_COMMAND))) {
      const scriptName = matched.groups?.['scriptName'];

      if (scriptName !== undefined) {
        yield scriptName;
      }
    }
  });

  const fromMatrix = Array.from(matrixKeys).flatMap((key) =>
    collectMatrixEntries(workflowFile, key),
  );

  return Arr.uniq([...literals, ...fromMatrix]).toSorted();
};

/**
 * Every command a `check-changed` plan can run: the plan for a diff that
 * touches every area and the code of every package. A step counts by the script
 * it runs, whatever arguments narrow it to the diff
 * (`z:ts-codemod --diff-from`), since narrowing to the diff is the plan's
 * purpose.
 */
export const commandsAnyPlanRuns = (
  manifests: readonly Manifest[],
): readonly CommandId[] => {
  const packages = manifests
    .filter(({ directory }) => directory !== ROOT_DIRECTORY)
    .map(({ directory, scripts }): PackageInfo => ({
      name: directory,
      dir: directory,
      scripts: new Set(Object.keys(scripts)),
      isPrivate: false,
      workspaceDependencies: new Set<string>(),
      buildDependencies: new Set<string>(),
      exportsBuild: false,
    }));

  const plan = buildPlan({
    classification: {
      packages: packages.map((pkg) => ({ pkg, code: true }) as const),
      dependents: [],
      areas: new Set(ALL_AREAS),
      ignored: [],
    },
    base: 'origin/main',
    rootScripts: manifests.flatMap(({ directory, scripts }) =>
      directory === ROOT_DIRECTORY ? Object.keys(scripts) : [],
    ),
    coverage: false,
    hasUntracked: true,
    spellChecked: [],
  });

  return Arr.generate(function* () {
    for (const { cwd, args } of plan) {
      const [verb, program, ...rest] = args;

      if (verb === 'run' && program !== undefined) {
        yield toCommandId(cwd, program);
      }

      // `exec run-p --continue-on-error check:root:…`, as the plan runs the
      // `check:root:*` guards.
      if (
        verb === 'exec' &&
        program !== undefined &&
        RUN_ALL_BIN.has(program)
      ) {
        for (const scriptName of rest) {
          if (!scriptName.startsWith('-')) {
            yield toCommandId(cwd, scriptName);
          }
        }
      }
    }
  });
};

/**
 * Whether a script writes the tree, by the verb namespaces in CLAUDE.md:
 * `gen:` writes committed generated sources and `fix:` rewrites. A leading
 * scope is skipped as in {@link isCheckScript}, so `ws:gen`, `ws:fix:lint` and
 * `strict-lib:fix:fmt` count, and so does a package's bare `gen`.
 */
export const isWriterScript = (scriptName: string): boolean =>
  scriptName
    .split(':')
    .some((segment) => segment === GEN_SEGMENT || segment === FIX_SEGMENT);

/** What {@link findCommandsMissingLocally} holds a local runner to. */
export type LocalRunner = Readonly<{
  /** The file a reader fixes, as the messages name it. */
  name: string;
  /** What a reported command asks of that file. */
  remedy: string;
  /** The commands the runner runs, as {@link CommandId}s. */
  runs: readonly CommandId[];
  /** Root script names the runner leaves to CI on purpose. */
  leftOut: readonly string[];
  /** Which of the scripts CI runs the runner answers for. */
  asks: (scriptName: string) => boolean;
}>;

export type Manifest = Readonly<{
  /** Relative to the repository root; `.` for the root manifest. */
  directory: string;
  scripts: ReadonlyRecord<string, string>;
}>;

export type CommandId = string;

type Edge = Readonly<{ from: CommandId; to: CommandId }>;

export type CoverageGraph = Readonly<{
  commands: ReadonlySet<CommandId>;
  edges: ReadonlyMap<CommandId, ReadonlySet<CommandId>>;
  /** The edges read out of script bodies, without {@link DECLARED_COVERAGE}. */
  bodyEdges: ReadonlyMap<CommandId, ReadonlySet<CommandId>>;
  /**
   * The commands whose body runs a script with arguments, which adds no edge
   * (see {@link resolveScriptInvocations}): their body edges are not all they
   * run.
   */
  withArguments: ReadonlySet<CommandId>;
}>;

export type ScriptInvocations = Readonly<{
  local: readonly string[];
  recursive: readonly string[];
}>;

export type CheckWorkflow = Readonly<{
  relativePath: string;
  commands: readonly string[];
  pinsNodeVersion: boolean;
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

const RECURSIVE_FLAGS: ReadonlySet<string> = new Set<string>([
  '--recursive',
  '-r',
]);

const PNPM_RUN = /pnpm run (?<args>[^&|;\n]*)/gu;

const RUN_ALL = /\brun-[sp] (?<args>[^&|;\n]*)/gu;

/**
 * `pnpm run ${{ matrix.<key> }}`, which is how both matrix workflows invoke the
 * entry they are running.
 */
const MATRIX_COMMAND = /pnpm run \$\{\{ matrix\.(?<key>[a-z_]+) \}\}/gu;

const LITERAL_COMMAND = /run: pnpm run (?<scriptName>[\w:-]+)/gu;

/** `node-version:` pins a version; `node-version-file:` reads `volta.node`. */
const PINNED_NODE_VERSION = /^ *node-version: /mu;

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
    // The aggregate of aggregates, and a human aid rather than a CI job: it
    // exists to be faster than GitHub Actions, not to agree with it. CI is the
    // gate; see #1965 and `LEFT_TO_CI` in check-all.mts, which
    // `findCommandsMissingLocally` holds to the workflows.
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
    // `check:types`. As with `ws:check:lint` below, neither covers the root
    // command on its own; that the halves partition the packages is in their
    // filters, `!./strict-lib/**` and `./strict-lib/**`.
  },
  {
    directory: ROOT_DIRECTORY,
    scriptName: 'ws:check:lint',
    // `code-check.yml` runs `ws:fix:lint` as two halves, `ws:fix:lint:apps` and
    // `ws:fix:lint:non-apps`, which between them reach every package's
    // `fix:lint` — and through it `check:lint`. Neither half covers the root
    // command on its own, so no `DECLARED_COVERAGE` edge says so; that the
    // halves partition the packages is in their filters.
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

const toCommandId = (directory: string, scriptName: string): CommandId =>
  `${directory}:${scriptName}` as const;

/** A directory has no `:`, so the script name is what follows the first. */
const scriptNameOf = (command: CommandId): string =>
  command.slice(command.indexOf(':') + 1);

const isRootCommand = (command: CommandId): boolean =>
  command.startsWith(`${ROOT_DIRECTORY}:`);

/**
 * Whether a command is run, either itself (reached from what the runner runs,
 * or on its list) or through every script its body runs. Only body edges count:
 * a declared edge says the CI command covers a narrower one (`fix:fmt:full`
 * covers `fix:fmt:diff`), so running the narrower one does not run the CI
 * command; and a body that also runs a script with arguments runs more than its
 * edges show. A command met again inside its own walk is taken as not run,
 * which only a body cycle — a script that would never terminate — could make
 * happen.
 */
const whollyRunBy = (
  graph: CoverageGraph,
  reached: ReadonlySet<CommandId>,
  leftOut: ReadonlySet<CommandId>,
): ((command: CommandId) => boolean) => {
  const mut_memo = new Map<CommandId, boolean>();

  const isWhollyRun = (command: CommandId): boolean => {
    const known = mut_memo.get(command);

    if (known !== undefined) {
      return known;
    }

    mut_memo.set(command, false);

    const targets = Array.from(graph.bodyEdges.get(command) ?? []);

    const result =
      reached.has(command) ||
      leftOut.has(command) ||
      (!graph.withArguments.has(command) &&
        Arr.isNonEmpty(targets) &&
        targets.every(isWhollyRun));

    mut_memo.set(command, result);

    return result;
  };

  return isWhollyRun;
};

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
 * `z:check-should-run` is the diff gate, whose lists check-gates.yml reads
 * (`workflow-steps.mts check-diff`) through `workflow_call` — a workflow that
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

const GEN_SEGMENT = 'gen';

const FIX_SEGMENT = 'fix';

const RUN_ALL_BIN: ReadonlySet<string> = new Set<string>(['run-p', 'run-s']);

const VERIFY_PREFIX = 'verify:';

const CHECK_SEGMENT = 'check';

const CHECK_DASH = 'check-';

const isUncoveredByDesign = (directory: string, scriptName: string): boolean =>
  UNCOVERED_BY_DESIGN.some(
    (entry) =>
      entry.scriptName === scriptName &&
      (entry.directory === undefined || entry.directory === directory),
  );

/**
 * Whitespace-separated, with a quoted run kept together and unquoted.
 *
 * Scanned by hand rather than matched: the alternation a quote-aware pattern
 * needs is the shape `security/detect-unsafe-regex` rejects, and a script body
 * is short enough that the scan is the simpler of the two anyway.
 */
const tokenize = (args: string): readonly string[] => {
  const mut_tokens: string[] = [];

  let mut_current: string[] = [];

  const mut_state = { quote: '' };

  const flush = (): void => {
    if (Arr.isEmpty(mut_current)) {
      return;
    }

    mut_tokens.push(mut_current.join(''));

    mut_current = [];
  };

  for (const character of args) {
    if (mut_state.quote !== '') {
      if (character === mut_state.quote) {
        mut_state.quote = '';
      } else {
        mut_current.push(character);
      }
    } else if (QUOTES.has(character)) {
      mut_state.quote = character;
    } else if (WHITESPACE.has(character)) {
      flush();
    } else {
      mut_current.push(character);
    }
  }

  flush();

  return mut_tokens;
};

/** Whether a body runs a script with arguments, `pnpm run x --flag`. */
const runsScriptWithArguments = (body: string): boolean =>
  body.matchAll(PNPM_RUN).some((matched) => {
    const tokens = tokenize(matched.groups?.['args'] ?? '');

    const targetIndex = tokens.findIndex((token) => !token.startsWith('-'));

    return targetIndex !== -1 && tokens.length > targetIndex + 1;
  });

const QUOTES: ReadonlySet<string> = new Set<string>(["'", '"']);

const WHITESPACE: ReadonlySet<string> = new Set<string>([' ', '\t']);

/**
 * A script name against an `npm-run-all` glob, where `*` stands for any run of
 * characters. Matched rather than compiled, so that nothing here builds a
 * regular expression out of a string read from a manifest.
 */
const matchesGlob = (pattern: string, name: string): boolean => {
  const segments = pattern.split('*');

  if (Arr.isFixedLengthArray(1, segments)) {
    return name === pattern;
  }

  const first = segments.at(0) ?? '';

  const last = segments.at(-1) ?? '';

  if (!name.startsWith(first) || !name.endsWith(last)) {
    return false;
  }

  if (first.length + last.length > name.length) {
    return false;
  }

  const mut_cursor = { at: first.length };

  for (const segment of segments.slice(1, -1)) {
    const found = name.indexOf(segment, mut_cursor.at);

    if (found === -1) {
      return false;
    }

    mut_cursor.at = found + segment.length;
  }

  return mut_cursor.at <= name.length - last.length;
};

const toEdgeMap = (
  edges: readonly Edge[],
): ReadonlyMap<CommandId, ReadonlySet<CommandId>> => {
  const mut_edges = new Map<CommandId, Set<CommandId>>();

  for (const { from, to } of edges) {
    if (from === to) {
      continue;
    }

    const mut_targets = mut_edges.get(from) ?? new Set<CommandId>();

    mut_targets.add(to);

    mut_edges.set(from, mut_targets);
  }

  return mut_edges;
};

const reachableFrom = (
  edges: ReadonlyMap<CommandId, ReadonlySet<CommandId>>,
  entryPoints: readonly CommandId[],
): ReadonlySet<CommandId> => {
  const mut_seen = new Set<CommandId>(entryPoints);

  const mut_queue: CommandId[] = Array.from(entryPoints);

  while (Arr.isNonEmpty(mut_queue)) {
    const current = mut_queue.shift();

    if (current === undefined) {
      break;
    }

    const unseen = Array.from(edges.get(current) ?? []).filter(
      (next) => !mut_seen.has(next),
    );

    for (const next of unseen) {
      mut_seen.add(next);
    }

    mut_queue.push(...unseen);
  }

  return mut_seen;
};

const reaches = (
  graph: CoverageGraph,
  from: CommandId,
  to: CommandId,
): boolean => from !== to && reachableFrom(graph.edges, [from]).has(to);

const readScripts = (manifest: unknown): ReadonlyRecord<string, string> => {
  if (!isRecord(manifest) || !hasKey(manifest, 'scripts')) {
    return {};
  }

  const scripts = manifest.scripts;

  if (!isRecord(scripts)) {
    return {};
  }

  return Obj.filterMap(scripts, (body) =>
    isString(body) ? Optional.some(body) : Optional.none,
  );
};

const readRootManifest = async (): Promise<Result<Manifest, string>> => {
  const manifestPath = path.join(projectRootPath, 'package.json');

  const contents = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(manifestPath, 'utf8'),
  );

  if (Result.isErr(contents)) {
    return Result.err(
      `Failed to read package.json: ${unknownToString(contents.value)}`,
    );
  }

  const parsed = Json.parse(contents.value);

  return Result.isErr(parsed)
    ? Result.err(
        `Failed to parse package.json: ${unknownToString(parsed.value)}`,
      )
    : Result.ok({
        directory: ROOT_DIRECTORY,
        scripts: readScripts(parsed.value),
      });
};

const readManifests = async (): Promise<
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
      directory: path.relative(projectRootPath, workspacePackage.path),
      scripts: readScripts(workspacePackage.packageJson),
    }))
    .toSorted((a, b) => a.directory.localeCompare(b.directory));

  return Result.ok(Arr.toUnshifted(rootManifest.value)(workspaceManifests));
};

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

  const { triggerEvents } = parseWorkflowTriggers(contents.value);

  if (!triggerEvents.includes(PULL_REQUEST_EVENT)) {
    return Result.ok(undefined);
  }

  return Result.ok({
    relativePath,
    commands: collectWorkflowCommands(contents.value),
    pinsNodeVersion: PINNED_NODE_VERSION.test(contents.value),
  });
};

const readCheckWorkflows = async (): Promise<
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

const indentOf = (line: string): number =>
  line.length - line.trimStart().length;

/**
 * The list items under `<key>:` inside a `matrix:` block, read by indentation
 * rather than by a pattern built from the key.
 */
const collectMatrixEntries = (
  workflowFile: string,
  key: string,
): readonly string[] => {
  const lines = workflowFile.split('\n');

  const startIndex = lines.findIndex(
    (line) => indentOf(line) > 0 && line.trim() === `${key}:`,
  );

  if (startIndex === -1) {
    return [];
  }

  const indent = indentOf(lines[startIndex] ?? '');

  const rest = lines.slice(startIndex + 1);

  const endIndex = rest.findIndex(
    (line) => line.trim() !== '' && indentOf(line) <= indent,
  );

  const block = endIndex === -1 ? rest : rest.slice(0, endIndex);

  return block.flatMap((line) => {
    const trimmed = line.trim();

    if (!trimmed.startsWith(LIST_ITEM)) {
      return [];
    }

    const entry = trimmed.slice(LIST_ITEM.length).trim();

    return entry === '' || entry.includes(' ') ? [] : [entry];
  });
};

const LIST_ITEM = '- ';

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
    'A command CI runs that check-all or check-changed does not is found by CI',
    'first; each message above says which list in which file to change.',
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
