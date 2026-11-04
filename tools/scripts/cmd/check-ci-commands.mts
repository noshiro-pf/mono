import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  asUint32,
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
 */
export const checkCiCommands = (): Promise<Result<CheckSummary, string>> =>
  Result.safeTry(async function* () {
    const manifests = yield* Result.safeUnwrap(await readManifests());

    const graph = buildCoverageGraph(manifests);

    const workflows = yield* Result.safeUnwrap(await readCheckWorkflows());

    const violations = [
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

  const packageScriptNames = Arr.generate(function* () {
    for (const { directory, name, scripts } of manifests) {
      if (directory !== ROOT_DIRECTORY) {
        yield { directory, name, names: Object.keys(scripts) };
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

      const recursive = invocations.recursive.flatMap(({ pattern, filters }) =>
        selectMembers(filters, packageScriptNames).flatMap(
          ({ directory: packageDir, names }) =>
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

  return { commands, edges: mut_edges };
};

/**
 * The scripts one script body runs, as patterns rather than names: a body may
 * name a script (`pnpm run check:md`), a regular expression pnpm expands over
 * the manifest (`pnpm run '/check:prose:.-/'`), or a glob `npm-run-all` expands
 * the same way (`run-p check:test:-`).
 *
 * `recursive` holds what a `pnpm run --recursive`, or a `pnpm run` with a
 * `--filter`, reaches, which is the named script of every workspace package
 * rather than a sibling of the caller. That is the whole of what the `ws:`
 * commands are, so it is what connects the workflows' command names to the
 * scripts each package defines. Each carries its `--filter` selectors, which
 * `buildCoverageGraph` applies: CI shards by them (`ws:fix:lint:apps`,
 * `ws:check:test:shard-1`), and a shard reaches its own packages, not every
 * package.
 */
export const resolveScriptInvocations = (body: string): ScriptInvocations => {
  const mut_local: string[] = [];

  const mut_recursive: RecursiveInvocation[] = [];

  for (const matched of body.matchAll(PNPM_RUN)) {
    const tokens = tokenize(matched.groups?.['args'] ?? '');

    // `--filter <selector>` takes the next token, which is not the script.
    const filterValues = new Set(
      tokens.flatMap((token, index) =>
        FILTER_FLAGS.has(token) ? [index + 1] : [],
      ),
    );

    // Everything before the script name is a flag of pnpm's own (`--recursive`,
    // `--if-present`); everything after it is an argument handed to the script,
    // and an argument can change what the script does.
    // `verify:npm-packages:published` is `pnpm run verify:npm-packages
    // --published`, and what `--published` selects — the versions pinned
    // under verify-npm-packages/published rather than tarballs packed from the
    // checkout — is a different question from the one the bare script asks.
    // Whether a variant still covers the script it wraps is a judgement, so it
    // belongs in {@link DECLARED_COVERAGE} rather than being read off the body.
    const targetIndex = tokens.findIndex(
      (token, index) => !token.startsWith('-') && !filterValues.has(index),
    );

    const target = targetIndex === -1 ? undefined : tokens[targetIndex];

    if (target === undefined || tokens.length > targetIndex + 1) {
      continue;
    }

    const filters = tokens.flatMap((token, index) => {
      if (filterValues.has(index)) {
        return [token];
      }

      const prefix = Array.from(FILTER_FLAGS).find((flag) =>
        token.startsWith(`${flag}=`),
      );

      return prefix === undefined ? [] : [token.slice(prefix.length + 1)];
    });

    // A filter runs the script in the packages it selects, `--recursive` or
    // not.
    if (
      tokens.some((token) => RECURSIVE_FLAGS.has(token)) ||
      Arr.isNonEmpty(filters)
    ) {
      mut_recursive.push({ pattern: target, filters });
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
}>;

export type ScriptInvocations = Readonly<{
  local: readonly string[];
  recursive: readonly RecursiveInvocation[];
}>;

export type RecursiveInvocation = Readonly<{
  pattern: string;
  /** The `--filter` selectors, as written. */
  filters: readonly string[];
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

const FILTER_FLAGS: ReadonlySet<string> = new Set<string>([
  '--filter',
  '--filter-prod',
  '-F',
]);

/**
 * A selector this reads: a package name or a path, either with `*` globs, and
 * `!` before it to exclude. The dependency forms (`...`, `^`, `[ref]`, `{…}`)
 * select by what the graph does not know, so a filter that uses one selects
 * every package, which over-reaches rather than drops a check.
 */
const UNREAD_SELECTOR = /\.\.\.|\^|\[|\{/u;

const PNPM_RUN = /pnpm run (?<args>[^&|;\n]*)/gu;

const RUN_ALL = /\brun-[sp] (?<args>[^&|;\n]*)/gu;

/**
 * `pnpm run ${{ matrix.<key> }}`, which is how both matrix workflows invoke the
 * entry they are running.
 */
const MATRIX_COMMAND = /pnpm run \$\{\{ matrix\.(?<key>[a-z_]+) \}\}/gu;

/** A `pnpm` in a workflow line, and what follows it up to a separator. */
const WORKFLOW_PNPM = /(?:^|[\s;&|(])pnpm (?<rest>[^&|;\n#)]*)/gu;

const PROSE_QUOTES: ReadonlySet<string> = new Set<string>(["'", '"', '`']);

/** The `pnpm` flags whose value is the next word when not given with `=`. */
const VALUE_FLAGS: ReadonlySet<string> = new Set<string>([
  '--filter',
  '--filter-prod',
  '-F',
  '--dir',
  '-C',
  '--workspace-concurrency',
  '--reporter',
  '--loglevel',
]);

const QUOTED_RUN_VALUE =
  /^(?<key>\s*(?:- )?run: )(?<quote>['"])(?<command>.*)\k<quote>\s*$/u;

/** A step's `name:`, which may mention a command it does not run. */
const STEP_NAME = /^(?:- )?name: /u;

const SCRIPT_NAME = /^[\w:-]+$/u;

/** The flags that point a `pnpm` run at packages rather than the root. */
const PACKAGE_FLAGS: ReadonlySet<string> = new Set<string>([
  '--recursive',
  '-r',
  '--filter',
  '--filter-prod',
  '-F',
  '--dir',
  '-C',
]);

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
    // The aggregate of aggregates, and a human aid rather than a CI job: it
    // exists to be faster than GitHub Actions, not to agree with it. CI is the
    // gate; see #1965 and the note at the end of check-all.mts.
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
    scriptName: 'ws:check:e2e',
    // `code-check.yml` runs it as two shards, `ws:check:e2e:shard-1` and
    // `ws:check:e2e:shard-2`, which between them reach every app's `check:e2e`;
    // that they partition the apps is in their filters.
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

/**
 * The root scripts a workflow runs: every `pnpm run <name>` on a line that is
 * not a comment or a step's `name:`, in a `run: |` block too, and every entry
 * of a matrix key the workflow hands to `pnpm run`. A `pnpm` inside a quoted
 * string is prose (unless `$(` runs it), and a run pointed at packages
 * (`--filter`, `-r`, `--dir`) names a package script, which this leaves out.
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

  // Every `pnpm run <name>` outside a comment line, a `run: |` block's
  // included: its first word that is not a flag, whatever follows it. A run
  // pointed at packages names a package script, not a root one, and a matrix
  // reference is read through the matrix below.
  const literals = workflowFile
    .split('\n')
    .filter(
      (line) =>
        !line.trimStart().startsWith('#') && !STEP_NAME.test(line.trimStart()),
    )
    // A `run:` value YAML quotes as a whole is the command, not a string in it.
    .map((line) => line.replace(QUOTED_RUN_VALUE, '$<key>$<command>'))
    .flatMap((line) =>
      Array.from(line.matchAll(WORKFLOW_PNPM)).flatMap((matched) => {
        // A `pnpm` inside a quoted string is prose an `echo` prints, unless a
        // `$(` runs it.
        const before = line.slice(
          0,
          matched.index + matched[0].indexOf('pnpm'),
        );

        if (isInsideQuotes(before) && !before.trimEnd().endsWith('$(')) {
          return [];
        }

        const tokens = tokenize(matched.groups?.['rest'] ?? '');

        // `pnpm run`, not `pnpm exec vitest run`: `run` is pnpm's own first
        // word, its flags and their values aside.
        const runIndex = firstWord(tokens, 0);

        if (tokens[runIndex] !== 'run') {
          return [];
        }

        const nameIndex = firstWord(tokens, runIndex + 1);

        // A flag before the name points the run at packages; one after it is
        // the script's own argument.
        if (
          tokens
            .slice(0, nameIndex === -1 ? tokens.length : nameIndex)
            .some((token) => PACKAGE_FLAGS.has(token.split('=', 1)[0] ?? ''))
        ) {
          return [];
        }

        const name = tokens[nameIndex];

        // A script name, not prose with punctuation (`run pnpm run fmt, and
        // commit`) or a `${{ matrix.<key> }}`.
        return name !== undefined && SCRIPT_NAME.test(name) ? [name] : [];
      }),
    );

  const fromMatrix = Array.from(matrixKeys).flatMap((key) =>
    collectMatrixEntries(workflowFile, key),
  );

  return Arr.uniq([...literals, ...fromMatrix]).toSorted();
};

/** A manifest's `scripts`, the string-valued entries only. */
export const readScripts = (
  manifest: unknown,
): ReadonlyRecord<string, string> => {
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
 * positive selectors picks (every member when none is given), less those a `!`
 * one picks.
 */
const selectMembers = <
  M extends Readonly<{ directory: string; name: string | undefined }>,
>(
  filters: readonly string[],
  members: readonly M[],
): readonly M[] => {
  if (filters.some((selector) => UNREAD_SELECTOR.test(selector))) {
    return members;
  }

  const included = filters.filter((selector) => !selector.startsWith('!'));

  const excluded = filters
    .filter((selector) => selector.startsWith('!'))
    .map((selector) => selector.slice(1));

  const picked = (selector: string): readonly M[] => {
    if (selector.startsWith('.')) {
      return members.filter(({ directory }) =>
        matchesPathGlob(
          selector.replace(/^\.\//u, '').split('/'),
          directory.split('/'),
        ),
      );
    }

    const byName = members.filter(
      ({ name }) => name !== undefined && matchesGlob(selector, name),
    );

    if (Arr.isNonEmpty(byName) || selector.includes('/')) {
      return byName;
    }

    // pnpm lets an unscoped name select a scoped package of that name, when no
    // package has the name itself and exactly one scope does.
    const scoped = members.filter(
      ({ name }) =>
        name?.startsWith('@') === true &&
        matchesGlob(selector, name.slice(name.indexOf('/') + 1)),
    );

    return Arr.isFixedLengthArray(1, scoped) ? scoped : [];
  };

  const kept = Arr.isEmpty(included)
    ? members
    : members.filter((member) =>
        included.some((selector) => picked(selector).includes(member)),
      );

  return kept.filter((member) =>
    excluded.every((selector) => !picked(selector).includes(member)),
  );
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
 * The index of the first token from `from` on that is neither a flag nor the
 * value of one ({@link VALUE_FLAGS}); -1 when there is none.
 */
const firstWord = (tokens: readonly string[], from: number): number =>
  tokens.findIndex(
    (token, index) =>
      index >= from &&
      !token.startsWith('-') &&
      !(index > from && VALUE_FLAGS.has(tokens[index - 1] ?? '')),
  );

/**
 * Whether the end of a line's text is inside a quoted string, the way a shell
 * or a template literal reads one: a quote opens a string only outside another,
 * and a backslash escapes the next character.
 */
const isInsideQuotes = (text: string): boolean => {
  const mut_state = { open: '', escaped: false };

  for (const character of text) {
    if (mut_state.escaped) {
      mut_state.escaped = false;

      continue;
    }

    if (character === '\\' && mut_state.open !== "'") {
      mut_state.escaped = true;

      continue;
    }

    if (mut_state.open === '') {
      mut_state.open = PROSE_QUOTES.has(character) ? character : '';

      continue;
    }

    if (character === mut_state.open) {
      mut_state.open = '';
    }
  }

  return mut_state.open !== '';
};

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

const QUOTES: ReadonlySet<string> = new Set<string>(["'", '"']);

const WHITESPACE: ReadonlySet<string> = new Set<string>([' ', '\t']);

const reaches = (
  graph: CoverageGraph,
  from: CommandId,
  to: CommandId,
): boolean => from !== to && reachableFrom(graph, [from]).has(to);

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

const indentOf = (line: string): number =>
  line.length - line.trimStart().length;

/** The lines indented under each indented line that reads `heading`. */
const blockUnder = (
  lines: readonly string[],
  heading: string,
): readonly string[] =>
  lines.flatMap((line, startIndex) => {
    if (indentOf(line) === 0 || line.trim() !== heading) {
      return [];
    }

    const indent = indentOf(line);

    const rest = lines.slice(startIndex + 1);

    const endIndex = rest.findIndex(
      (next) => next.trim() !== '' && indentOf(next) <= indent,
    );

    return endIndex === -1 ? rest : rest.slice(0, endIndex);
  });

const singleValue = (text: string): readonly string[] => {
  const entry = text.trim();

  return entry === '' || entry.includes(' ') ? [] : [entry];
};

/**
 * The values of `<key>` in a matrix, read by indentation rather than by a
 * pattern built from the key: the list items under `<key>:`, and the `<key>:`
 * of each object under `include:`, where an entry carries its other properties
 * beside it.
 */
const collectMatrixEntries = (
  workflowFile: string,
  key: string,
): readonly string[] => {
  const lines = workflowFile.split('\n');

  const listed = blockUnder(lines, `${key}:`).flatMap((line) => {
    const trimmed = line.trim();

    return !trimmed.startsWith(LIST_ITEM)
      ? []
      : singleValue(trimmed.slice(LIST_ITEM.length));
  });

  const prefix = `${key}: ` as const;

  const included = blockUnder(lines, 'include:').flatMap((line) => {
    const trimmed = line.trim();

    const property = trimmed.startsWith(LIST_ITEM)
      ? trimmed.slice(LIST_ITEM.length).trimStart()
      : trimmed;

    return property.startsWith(prefix)
      ? singleValue(property.slice(prefix.length))
      : [];
  });

  return [...listed, ...included];
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
