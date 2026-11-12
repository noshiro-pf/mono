// cspell:ignore pushd

import * as fs from 'node:fs';
import { isBuiltin, stripTypeScriptTypes } from 'node:module';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { parse } from 'yaml';
import { runFile } from '../lib/child-process.mjs';
import { readScripts } from '../lib/manifest-scripts.mjs';
import {
  isUnderExperimental,
  listTrackedFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';
import { readShellScript } from '../lib/shell-commands.mjs';
import {
  isExpressionWrapper,
  skipExpressionWrappers,
} from '../lib/ts-expression-wrappers.mjs';
import { readWorkflowJobs } from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { readManifests } from './check-ci-commands.mjs';

/**
 * Fails when a TypeScript file the repository runs with plain `node` would not
 * load under Node as written.
 *
 * Everything else runs through `tsx --tsconfig tools/configs/tsconfig.tsx.json`,
 * which maps a relative `.mjs` to the `.mts` beside it, resolves the workspace
 * libraries to their sources, and compiles any TypeScript. Plain `node` does
 * none of that: it only erases types, resolves a specifier as written, and —
 * where these scripts run, before `pnpm install` (the setup action,
 * `pnpm-update.yml`) or in a worktree that may have none (the Claude Code
 * hooks) — has no package to load. `tsc` checks these files under the same
 * settings as the rest of `tools/`, so it passes all three; the failure would
 * only appear in CI's first step or in a session's hook.
 *
 * Which files are judged is read off what runs them — every `node <file>.mts`
 * in a manifest's `scripts`, a workflow's or a composite action's `run:`,
 * `.claude/settings.json` and a tracked shell script — never listed, so a new
 * one is judged from the commit that adds it. Each must strip under Node's own
 * `stripTypeScriptTypes` (no `enum`, no namespace holding values), and what it
 * loads once stripped — which keeps an inline `import { type X }` as
 * `import {} from …`, and names each module with a string literal — must be a
 * builtin or a relative file that exists as written and passes the same, and it
 * may not use CommonJS's `require` or `createRequire`. A package is allowed
 * only to the scripts in {@link RUN_AFTER_INSTALL}.
 */
export const checkNodeRunScripts = async (): Promise<
  Result<number, string>
> => {
  const runs = await collectNodeRuns();

  if (Result.isErr(runs)) {
    return Result.err(`❌ ${runs.value}`);
  }

  const violations = [
    ...runs.value.problems,
    ...judgeNodeRuns({
      runs: runs.value.runs,
      read: readTextFile,
      runAfterInstall: RUN_AFTER_INSTALL,
    }),
  ] as const;

  if (Arr.isNonEmpty(violations)) {
    return Result.err(
      [
        `❌ ${violations.length} problem(s) with the TypeScript files run by plain \`node\`:`,
        '',
        ...violations.map((violation) => `  ${violation}`),
        '',
        'Node erases types and nothing else: it reads no tsconfig `paths`, does',
        'not map `./x.mjs` to `./x.mts`, and finds no package before',
        '`pnpm install`. Import what is used only as a type with a top-level',
        '`import type`, keep the code in the file or use a `node:` builtin, or',
        'run the file with `tsx --tsconfig tools/configs/tsconfig.tsx.json`.',
      ].join('\n'),
    );
  }

  return Result.ok(Arr.uniq(runs.value.runs.map(({ file }) => file)).length);
};

/**
 * The TypeScript files a shell script hands to `node`, relative to the
 * repository root: each command's script — every file after `--test` — and each
 * module it preloads (`--import`, `--require`), resolved against `directory`,
 * where the script runs. `node` is recognized by its path too
 * (`/opt/node/bin/node`), and one that preloads tsx (`--import tsx`) runs
 * nothing stripped after that preload, so only what it preloaded before counts.
 * `nodeOptions` says which of node's options take the next word as their value
 * ({@link readNodeOptions}). `variables` are expanded in the words node is
 * given, along with what the script's own assignments set (`f=…`), each as it
 * stands where `node` runs (`f=a.mts; node "$f"; f=b.mts` runs `a.mts`).
 *
 * What this cannot name is an error, never skipped: a variable it does not know
 * or a GitHub expression, a script read from standard input (`node -`), and a
 * file that `exists` does not find after a `cd` or `pushd`. Those it does not
 * follow, because the reading cannot tell a `cd` that moves the script from one
 * in a subshell or a substitution (`"$(cd "$(dirname "$0")" && pwd)"`); a file
 * found from where the script starts is taken from there.
 */
export const nodeRunFilesOf = (
  script: string,
  context: Readonly<{
    directory: string;
    variables: ReadonlyRecord<string, string>;
    exists: (file: string) => boolean;
    nodeOptions: ReadonlyMap<string, boolean>;
  }>,
): Result<readonly string[], string> => {
  const reading = readShellScript(script);

  if (Arr.isNonEmpty(reading.problems)) {
    return /\bnode\b/u.test(script)
      ? Result.err(`cannot read the script: ${reading.problems.join('; ')}`)
      : Result.ok([]);
  }

  const mut_variables = new Map<string, string>(
    Object.entries(context.variables),
  );

  // The assignments made so far, each applied before the first command after
  // it: a variable set again after `node` does not change what `node` ran.
  // Each is taken as made, a conditional one (`[ … ] && f=…`) or one in a
  // function body included, because the reading has no control flow: of the
  // values a name may hold where `node` runs, the last one written is judged.
  const mut_assigned = { count: 0 };

  const assignBefore = (index: number): void => {
    while (mut_assigned.count < reading.assignments.length) {
      const assignment = reading.assignments[mut_assigned.count];

      if (assignment === undefined || assignment.before > index) {
        break;
      }

      mut_assigned.count += 1;

      const expanded = expandVariables(assignment.value, mut_variables);

      // One this cannot expand matters only if `node` is given it, which
      // reports it then; what the name held before is gone.
      if (Result.isOk(expanded)) {
        mut_variables.set(assignment.name, expanded.value);
      } else {
        mut_variables.delete(assignment.name);
      }
    }
  };

  const mut_state: { changedBy: string | undefined } = {
    changedBy: undefined,
  };

  const mut_files: string[] = [];

  const mut_unresolved: string[] = [];

  // The reading has taken off what precedes the command proper: assignments,
  // reserved words, and wrappers such as `env` or `timeout`.
  for (const [index, [command, ...args]] of reading.commands.entries()) {
    assignBefore(index);

    if (command === 'cd' || command === 'pushd') {
      mut_state.changedBy = command;

      continue;
    }

    // `node` by name or by its path (`/opt/node/bin/node`, `"$dir"/bin/node`).
    if (command === undefined || path.posix.basename(command) !== 'node') {
      continue;
    }

    const words = nodeFiles(args, context.nodeOptions);

    if (Result.isErr(words)) {
      return words;
    }

    for (const word of words.value) {
      const expanded = expandVariables(word, mut_variables);

      if (Result.isErr(expanded)) {
        mut_unresolved.push(...expanded.value);

        continue;
      }

      // A word that only named a file once expanded may name JavaScript.
      if (!TYPESCRIPT_FILE.test(expanded.value)) {
        continue;
      }

      const file = path.posix.normalize(
        path.posix.join(context.directory, expanded.value),
      );

      if (mut_state.changedBy !== undefined && !context.exists(file)) {
        return Result.err(
          `\`node\` is given ${word} after a \`${mut_state.changedBy}\`, which this does not follow, and there is no ${file}; give \`node\` its file from the directory the script starts in`,
        );
      }

      mut_files.push(file);
    }
  }

  if (Arr.isNonEmpty(mut_unresolved)) {
    return Result.err(
      `cannot tell which file \`node\` is given: ${mut_unresolved.join(', ')} is not known here`,
    );
  }

  return Result.ok(mut_files);
};

/**
 * What stops `entry` from loading under plain `node`, one line each: syntax
 * Node cannot strip, a relative import that is no file as written, an import by
 * absolute path or URL, which this cannot judge, and — unless
 * `packagesInstalled` — any package. A CommonJS loader is reported either way.
 * A relative file it loads is judged the same way. `read` gives a file's text
 * by its path from the root, or `undefined` when there is none.
 */
export const nodeLoadViolations = (
  entry: string,
  context: Readonly<{
    read: (file: string) => string | undefined;
    packagesInstalled: boolean;
  }>,
): readonly string[] => {
  const mut_seen = new Set<string>([entry]);

  const mut_queue: string[] = [entry];

  const mut_violations: string[] = [];

  while (Arr.isNonEmpty(mut_queue)) {
    const file = mut_queue.shift() ?? entry;

    const source = context.read(file);

    if (source === undefined) {
      mut_violations.push(`${file}: no such file`);

      continue;
    }

    // Node prints an ExperimentalWarning the first time this runs in a process.
    // It is Node's own stripper on purpose: what it refuses is exactly what
    // `node` refuses.
    const stripped = TYPESCRIPT_FILE.test(file)
      ? Result.fromThrowable(() => stripTypeScriptTypes(source))
      : Result.ok(source);

    if (Result.isErr(stripped)) {
      mut_violations.push(
        `${file}: Node cannot strip its types (${firstLine(unknownToString(stripped.value))})`,
      );

      continue;
    }

    const parsed = parseStripped(stripped.value);

    for (const line of commonJsLinesOf(parsed)) {
      mut_violations.push(
        `${file}:${line}: uses \`require\` or \`createRequire\`, whose loads this does not read; load the module with \`import\`; a member of either name, or a key a pattern takes out, counts even as data, as the doc of \`${commonJsLoaderLines.name}\` in ${THIS_FILE} says`,
      );
    }

    for (const specifier of specifiersOf(parsed)) {
      if (specifier === undefined) {
        mut_violations.push(
          `${file}: imports a module whose name is computed at runtime, which this cannot judge; name it with a string literal`,
        );

        continue;
      }

      if (isBuiltin(specifier)) {
        continue;
      }

      if (RELATIVE_SPECIFIER.test(specifier)) {
        const target = path.posix.normalize(
          path.posix.join(path.posix.dirname(file), specifier),
        );

        if (context.read(target) === undefined) {
          mut_violations.push(
            `${file}: imports '${specifier}', which is no file: Node resolves a relative specifier as written`,
          );
        } else if (!mut_seen.has(target)) {
          mut_seen.add(target);

          mut_queue.push(target);
        }

        continue;
      }

      if (specifier.startsWith('/') || URL_SPECIFIER.test(specifier)) {
        mut_violations.push(
          `${file}: imports '${specifier}', a path or URL this cannot judge; import the file by a relative path`,
        );

        continue;
      }

      if (!context.packagesInstalled) {
        mut_violations.push(
          `${file}: loads '${specifier}' at runtime, which is not there before \`pnpm install\``,
        );
      }
    }
  }

  return mut_violations;
};

/**
 * What JavaScript — a file as Node runs it, its types stripped — imports, in
 * order: each static `import` and `export … from`, and `import(…)`, with
 * `undefined` for one whose specifier is not a string literal, since what it
 * loads cannot be read. CommonJS loaders are {@link commonJsLoaderLines}'.
 */
export const runtimeSpecifiers = (
  text: string,
): readonly (string | undefined)[] => specifiersOf(parseStripped(text));

/**
 * The lines on which JavaScript names a CommonJS loader, `require` or
 * `createRequire`: read as a value or called (`require(…)`, `const r =
 * require`), as a member (`module.require`, `m['createRequire']`), imported or
 * destructured (`import { createRequire }`, `const { require: r } = g`), or as
 * a key a pattern takes one out with (`({ require: r } = g)`). None of what it
 * loads is read, and none is needed: a script `node` runs loads with `import`.
 *
 * Names are read as written, to catch a loader used by mistake, not one hidden
 * on purpose: a name held in a variable or built from pieces (`g[k]`,
 * `'re' + 'quire'`) is not seen. A member of either name counts on any object,
 * data included (a package's `exports.require`), in every script: a loader
 * passed on as a member (`const r = module.require`) or taken out by a pattern
 * looks no different from data, whether it is called later or not, and no
 * script `node` runs reads a package's conditions. One that must is a reason to
 * teach this the difference, not to hide the name from it. A key of an object
 * literal names nothing that is loaded, and neither does `typeof`, nor a name a
 * value is written to (`const [require] = list`, `({ a: require } = g)`).
 */
export const commonJsLoaderLines = (text: string): readonly number[] =>
  commonJsLinesOf(parseStripped(text));

/**
 * Every violation of the files in `runs`, each judged once and named with what
 * runs it, and every entry of `runAfterInstall` that nothing runs any longer.
 */
export const judgeNodeRuns = ({
  runs,
  read,
  runAfterInstall,
}: Readonly<{
  runs: readonly NodeRun[];
  read: (file: string) => string | undefined;
  runAfterInstall: ReadonlySet<string>;
}>): readonly string[] => {
  const origins = Map.groupBy(runs, ({ file }) => file);

  const judged = Array.from(origins, ([file, runsOfFile]) =>
    nodeLoadViolations(file, {
      read,
      packagesInstalled: runAfterInstall.has(file),
    }).map(
      (violation) => `${violation} (run by ${describeOrigins(runsOfFile)})`,
    ),
  ).flat();

  const stale = Array.from(runAfterInstall)
    .filter((file) => !origins.has(file))
    .map(
      (file) =>
        `${file}: listed in RUN_AFTER_INSTALL, but nothing runs it with \`node\`; take it off the list`,
    );

  return [...judged, ...stale];
};

/** The `run:` steps of a composite action, each with its directory. */
export const readCompositeSteps = (
  file: string,
  text: string,
): Result<readonly Readonly<{ run: string; directory: string }>[], string> => {
  const parsed = Result.fromThrowable((): unknown => parse(text));

  if (Result.isErr(parsed)) {
    return Result.err(`${file}: ${firstLine(unknownToString(parsed.value))}`);
  }

  const action = parsed.value;

  const runs =
    isRecord(action) && hasKey(action, 'runs') && isRecord(action.runs)
      ? action.runs
      : undefined;

  const steps = runs?.['steps'];

  if (!Arr.isArray(steps)) {
    return Result.ok([]);
  }

  return Result.ok(
    steps.flatMap((step: unknown) => {
      if (!isRecord(step) || !isString(step['run'])) {
        return [];
      }

      const directory = step['working-directory'];

      return [
        { run: step['run'], directory: isString(directory) ? directory : '.' },
      ];
    }),
  );
};

/** Every `command` string anywhere in Claude Code's settings. */
export const hookCommands = (value: unknown): readonly string[] => {
  if (Arr.isArray(value)) {
    return value.flatMap(hookCommands);
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, entry]) =>
    key === 'command' && isString(entry) ? [entry] : hookCommands(entry),
  );
};

/**
 * Every `node <file>` the repository writes, wherever it is written: a
 * manifest's `scripts`, a workflow's or a composite action's `run:`, a hook in
 * `.claude/settings.json`, and a tracked shell script. The test of
 * `tools/configs/scripts-run-before-install.mts` reads its list off this too.
 */
export const collectNodeRuns = (): Promise<Result<Collected, string>> =>
  Result.safeTry(async function* () {
    const [manifestsRead, trackedRead, nodeOptionsRead] = await Promise.all([
      readManifests(),
      listTrackedFiles(),
      readNodeOptions(),
    ]);

    const manifests = yield* Result.safeUnwrap(manifestsRead);

    const tracked = yield* Result.safeUnwrap(trackedRead);

    const nodeOptions = yield* Result.safeUnwrap(nodeOptionsRead);

    const memberDirectories = new Set(
      manifests.map(({ directory }) => directory),
    );

    const fromMembers = manifests.flatMap((manifest) =>
      Object.entries(manifest.scripts).map(([name, body]): ScriptSource => ({
        origin: `${path.posix.join(manifest.directory, 'package.json')} \`${name}\``,
        script: body,
        directory: manifest.directory,
        variables: {},
      })),
    );

    const commandFiles = selectCommandFiles(tracked, memberDirectories);

    // Every directory with a tracked manifest, a member's or not.
    const manifestDirectories = new Set<string>(
      tracked
        .filter((file) => path.posix.basename(file) === 'package.json')
        .map(path.posix.dirname),
    );

    const texts = await Promise.all(
      commandFiles.map(async (file) => {
        const text = await readRepositoryFile(file);

        return Result.map(text, (value) => [file, value] as const);
      }),
    );

    const mut_scripts: ScriptSource[] = Array.from(fromMembers);

    for (const text of texts) {
      const [file, value] = yield* Result.safeUnwrap(text);

      mut_scripts.push(
        ...(yield* Result.safeUnwrap(
          shellScriptsOf(file, value, manifestDirectories),
        )),
      );
    }

    return Result.ok(
      runsOf(mut_scripts, {
        exists: (file) => readTextFile(file) !== undefined,
        nodeOptions,
      }),
    );
  });

/**
 * Node's options, each with whether it takes the next word as its value: those
 * `node --help` lists, written `--name=…` there (not `--name[=…]`, whose value
 * is given with `=` alone), and {@link NODE_HIDDEN_VALUE_OPTIONS}. Read from
 * the Node running this. CI runs the check on the Node the repository pins, as
 * the scripts run; a Node of another major may list an option otherwise, and is
 * read as it would run them. An error when Node cannot say, as a check that
 * cannot read its input fails rather than passing.
 */
export const readNodeOptions = async (): Promise<
  Result<ReadonlyMap<string, boolean>, string>
> => {
  const help = await runFile(process.execPath, ['--help']);

  if (help.status !== 0) {
    const reason = unknownToString(
      help.error ??
        help.signal ??
        `exited with ${help.status ?? 'no status'}: ${help.stderr.trim()}`,
    );

    return Result.err(`\`node --help\` failed: ${reason}`);
  }

  const options = new Map(
    help.stdout.split('\n').flatMap((line) => {
      const names = line.startsWith('  -')
        ? Array.from(
            line.slice(2).matchAll(NODE_HELP_NAME),
            ([, name]) => name ?? '',
          )
        : ([] as const);

      const takesValue = /[^[]=/u.test(names.at(-1) ?? '');

      return names.map(
        (name) => [name.split(/[=[]/u, 1)[0] ?? name, takesValue] as const,
      );
    }),
  );

  // A layout this does not read would leave every option taking no value.
  if (options.get('--require') !== true || options.get('--check') !== false) {
    return Result.err(
      '`node --help` lists its options in a layout this does not read',
    );
  }

  return Result.ok(
    new Map<string, boolean>([
      ...options,
      ...Array.from(
        NODE_HIDDEN_VALUE_OPTIONS,
        (option) => [option, true] as const,
      ),
    ]),
  );
};

/**
 * The files `node` is given in `scripts`, and each script this cannot read. A
 * script whose directory is unknown is one of those if it gives `node` a
 * TypeScript file or a word this cannot read.
 * `exists` says whether a file is there, by its path from the root, and
 * `nodeOptions` is the map {@link readNodeOptions} gives when it reads Node's
 * help.
 */
export const runsOf = (
  scripts: readonly ScriptSource[],
  {
    exists,
    nodeOptions,
  }: Readonly<{
    exists: (file: string) => boolean;
    nodeOptions: ReadonlyMap<string, boolean>;
  }>,
): Collected => {
  const mut_runs: NodeRun[] = [];

  const mut_problems: string[] = [];

  for (const { origin, script, directory, variables } of scripts) {
    const files = nodeRunFilesOf(script, {
      directory: directory ?? '.',
      variables,
      exists,
      nodeOptions,
    });

    if (
      directory === undefined &&
      (Result.isErr(files) || Arr.isNonEmpty(files.value))
    ) {
      mut_problems.push(
        `${origin}: runs \`node\` from its caller's directory, which this cannot tell; move the script out of the directory that holds a \`package.json\`, or run its \`node\` from that package's scripts`,
      );
    } else if (Result.isErr(files)) {
      mut_problems.push(`${origin}: ${files.value}`);
    } else {
      mut_runs.push(...files.value.map((file) => ({ file, origin })));
    }
  }

  return { runs: mut_runs, problems: mut_problems };
};

/**
 * The tracked files {@link shellScriptsOf} is to read: every one of a kind it
 * reads outside `experimental/`, but the manifests of the workspace members,
 * which are read as members. Anything else in a member's directory, a shell
 * script included, is among them.
 */
export const selectCommandFiles = (
  tracked: readonly string[],
  memberDirectories: ReadonlySet<string>,
): readonly string[] =>
  tracked.filter(
    (file) =>
      !isUnderExperimental(file) &&
      isCommandFile(file) &&
      !(
        path.posix.basename(file) === 'package.json' &&
        memberDirectories.has(path.posix.dirname(file))
      ),
  );

/**
 * The shell scripts a tracked file holds, each with where it runs, by the
 * file's kind: a manifest outside the workspace (`verify-npm-packages/`, the
 * strict-lib bundles; a member's `scripts` come from its manifest as read), a
 * workflow, a composite action, `.claude/settings.json`, or a `*.sh` script
 * whole. Any other file holds none.
 */
export const shellScriptsOf = (
  file: string,
  text: string,
  manifestDirectories: ReadonlySet<string>,
): Result<readonly ScriptSource[], string> => {
  if (path.posix.basename(file) === 'package.json') {
    const parsed = Json.parse(text);

    return Result.isErr(parsed)
      ? Result.err(`${file}: ${unknownToString(parsed.value)}`)
      : Result.ok(
          Object.entries(readScripts(parsed.value)).map(([name, body]) => ({
            origin: `${file} \`${name}\``,
            script: body,
            directory: path.posix.dirname(file),
            variables: {},
          })),
        );
  }

  if (WORKFLOW.test(file)) {
    const jobs = readWorkflowJobs(text);

    return Result.isErr(jobs)
      ? Result.err(`${file}: ${jobs.value}`)
      : Result.ok(
          jobs.value.flatMap((job) =>
            Arr.generate(function* () {
              for (const step of job.steps) {
                if (step.run !== undefined) {
                  yield {
                    origin: `${file} (job \`${job.name}\`)`,
                    script: step.run,
                    directory: step.workingDirectory ?? '.',
                    variables: {},
                  };
                }
              }
            }),
          ),
        );
  }

  if (COMPOSITE_ACTION.test(file)) {
    return Result.map(readCompositeSteps(file, text), (steps) =>
      steps.map((step) => ({
        origin: file,
        script: step.run,
        directory: step.directory,
        variables: {},
      })),
    );
  }

  if (file === CLAUDE_SETTINGS) {
    const parsed = Json.parse(text);

    return Result.isErr(parsed)
      ? Result.err(`${file}: ${unknownToString(parsed.value)}`)
      : Result.ok(
          hookCommands(parsed.value).map((command) => ({
            origin: file,
            script: command,
            directory: '.',
            // Claude Code runs a hook with the project's root in this variable.
            variables: { CLAUDE_PROJECT_DIR: '.' },
          })),
        );
  }

  if (file.endsWith('.sh')) {
    // Read as run from the root. Where a shell script runs is its caller's
    // choice, which the file does not say; the one tracked script moves to the
    // root itself. One under a directory with a manifest of its own, a member's
    // or not, is as likely run from that package, so its directory is left
    // unknown and it may not run `node`. A guess that is wrong names a file
    // that is not there, which is reported, and a script this cannot read is an
    // error too, so neither passes unread.
    return Result.ok([
      {
        origin: file,
        script: text,
        directory: isUnderManifest(file, manifestDirectories) ? undefined : '.',
        variables: {},
      },
    ]);
  }

  return Result.ok([]);
};

/** A shell script and where it runs. */
export type ScriptSource = Readonly<{
  /** Where the script is written, for the report. */
  origin: string;
  script: string;
  /** Where it runs from the root; `undefined` when that is its caller's. */
  directory: string | undefined;
  variables: ReadonlyRecord<string, string>;
}>;

export type NodeRun = Readonly<{
  /** Relative to the repository root. */
  file: string;
  /** Where the command is written, for the report. */
  origin: string;
}>;

type Collected = Readonly<{
  runs: readonly NodeRun[];
  /** Commands that run `node` on something this cannot name. */
  problems: readonly string[];
}>;

/** This command's path from the root, which its messages point to. */
const THIS_FILE = path
  .relative(projectRootPath, import.meta.filename)
  .replaceAll(path.sep, '/');

/**
 * The scripts run with `node` that may load packages, because nothing runs them
 * before `pnpm install` and the build they need. Every other one runs where
 * there may be none: keep this list to what it must hold.
 */
export const RUN_AFTER_INSTALL: ReadonlySet<string> = new Set<string>([
  // `pnpm run benchmark` measures the built packages, imported from `dist/`.
  'libs/synstate-next/scripts/cmd/benchmark.mts',
]);

const TYPESCRIPT_FILE = /\.(?:[cm]?ts)$/u;

/** A word whose last part is an expansion, which may name a TypeScript file. */
const ENDS_IN_EXPANSION = /\$(?:\{[^}]*\}+|\w+|[@*#?])$/u;

const RELATIVE_SPECIFIER = /^\.\.?(?:\/|$)/u;

/** A specifier with a scheme other than `node:` (`file:`, `data:`, `https:`). */
const URL_SPECIFIER = /^[A-Za-z][\w+.-]*:/u;

const VARIABLE = /\$\{(\w+)\}|\$(\w+)/gu;

/**
 * Options of Node's own that take the next word as their value and that
 * `node --help` leaves out. V8's, which it leaves out too, take one after `=`
 * alone. No check can list what the help leaves out: one found later joins this
 * list.
 */
const NODE_HIDDEN_VALUE_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--security-revert',
]);

/** Options of `node` whose value is a module it loads. */
const NODE_PRELOAD_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--experimental-loader',
  '--import',
  '--loader',
  '--require',
  '-r',
]);

/** Options after which `node` runs no script file. */
const NODE_NO_SCRIPT_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--check',
  '-c',
  '--eval',
  '-e',
  '--print',
  '-p',
  '--run',
]);

/**
 * A preloaded module that registers tsx's loader for ES modules: `tsx` or
 * `tsx/esm`, or the file either resolves to by its path in `node_modules`. Its
 * other entry points (`tsx/cjs`, `tsx/esm/api`) leave an `.mts` script to Node.
 */
const TSX_PRELOAD =
  /^tsx(?:\/esm)?$|(?:^|\/)node_modules\/tsx\/dist\/(?:esm\/index|loader)\.mjs$/u;

/**
 * One of the option names that head a line of `node --help`
 * (`-r, --require=...`), read from the line's third column on.
 */
const NODE_HELP_NAME = /(?:^|, )(-[^\s,]*)/guy;

/** The CommonJS loaders' names. */
const COMMONJS_LOADERS: ReadonlySet<string> = new Set<string>([
  'createRequire',
  'require',
]);

const COMPOSITE_ACTION = /^\.github\/actions\/.+\/action\.ya?ml$/u;

const WORKFLOW = /^\.github\/workflows\/[^/]+\.ya?ml$/u;

const CLAUDE_SETTINGS = '.claude/settings.json';

/** The text of a string literal or a template with no substitution. */
const literalText = (node: ts.Node): string | undefined =>
  ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)
    ? node.text
    : undefined;

/** {@link runtimeSpecifiers} of a parsed file. */
const specifiersOf = (root: ts.Node): readonly (string | undefined)[] => {
  const mut_specifiers: (string | undefined)[] = [];

  const visit = (node: ts.Node): void => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier !== undefined
    ) {
      mut_specifiers.push(literalText(node.moduleSpecifier));
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      const [first] = node.arguments;

      mut_specifiers.push(first === undefined ? undefined : literalText(first));
    }

    ts.forEachChild(node, visit);
  };

  visit(root);

  return mut_specifiers;
};

/**
 * An expression past the wrappers TypeScript adds and an indirect `(0, f)`. In
 * JavaScript, whose types Node has stripped, only parentheses are left of them.
 */
const calleeOf = (node: ts.Node): ts.Node => {
  const inner = skipExpressionWrappers(node);

  return ts.isBinaryExpression(inner) &&
    inner.operatorToken.kind === ts.SyntaxKind.CommaToken
    ? calleeOf(inner.right)
    : inner;
};

/**
 * The outermost of the wrappers {@link calleeOf} sees through around `node`.
 * Unlike `outermost` in `tools/configs/github-graphql-source-queries.mts`, it
 * climbs an indirect `(0, f)` too, as a callee is read through one.
 */
const outermostWrapper = (node: ts.Node): ts.Node => {
  const { parent } = node;

  return isExpressionWrapper(parent) ||
    (ts.isBinaryExpression(parent) &&
      parent.operatorToken.kind === ts.SyntaxKind.CommaToken &&
      parent.right === node)
    ? outermostWrapper(parent)
    : node;
};

/**
 * An identifier, or an object or array literal, that is, or is nested in, the
 * target of `=` or of a `for … of` / `for … in`, through any wrapper
 * (`(require) = x`): written to, not read.
 */
const isAssignmentTarget = (node: ts.Node): boolean => {
  const { parent } = node;

  if (
    isExpressionWrapper(parent) ||
    ts.isObjectLiteralExpression(parent) ||
    ts.isArrayLiteralExpression(parent) ||
    ts.isSpreadElement(parent) ||
    ts.isSpreadAssignment(parent) ||
    (ts.isPropertyAssignment(parent) && parent.initializer === node)
  ) {
    return isAssignmentTarget(parent);
  }

  return (
    (ts.isBinaryExpression(parent) &&
      parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      parent.left === node) ||
    ((ts.isForOfStatement(parent) || ts.isForInStatement(parent)) &&
      parent.initializer === node)
  );
};

/** An identifier other than the name a node declares or a member's name. */
const isReadAsValue = (identifier: ts.Node): boolean => {
  const { parent } = identifier;

  // `{ require }` and `export { require }` hand the value on; in
  // `export { f as require }`, `require` is only the name it goes by. A
  // re-export (`export { createRequire } from 'node:module'`) is judged by its
  // specifier, as an import's is.
  if (ts.isShorthandPropertyAssignment(parent)) {
    return true;
  }

  // `require = x`, `[require] = xs` and `({ a: require } = g)` write to the
  // name, as a declaration of it does.
  if (isAssignmentTarget(identifier)) {
    return false;
  }

  if (ts.isExportSpecifier(parent)) {
    return (
      parent.parent.parent.moduleSpecifier === undefined &&
      (parent.propertyName ?? parent.name) === identifier
    );
  }

  // `typeof require`, however wrapped, reads whether there is one and hands
  // nothing on.
  if (
    ts.isImportSpecifier(parent) ||
    ts.isLabeledStatement(parent) ||
    ts.isBreakOrContinueStatement(parent) ||
    ts.isTypeOfExpression(outermostWrapper(identifier).parent)
  ) {
    return false;
  }

  if (ts.isBindingElement(parent)) {
    return parent.name !== identifier && parent.propertyName !== identifier;
  }

  // Listed by hand: `ts.getNameOfDeclaration` also names the `require` of
  // `export default require`, which hands the value on.
  return !(
    (ts.isPropertyAccessExpression(parent) ||
      ts.isPropertyAssignment(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isGetAccessorDeclaration(parent) ||
      ts.isSetAccessorDeclaration(parent) ||
      ts.isPropertyDeclaration(parent) ||
      ts.isVariableDeclaration(parent) ||
      ts.isParameter(parent) ||
      ts.isFunctionDeclaration(parent) ||
      ts.isFunctionExpression(parent) ||
      ts.isClassDeclaration(parent) ||
      ts.isClassExpression(parent) ||
      ts.isNamespaceExport(parent) ||
      ts.isImportClause(parent) ||
      ts.isNamespaceImport(parent)) &&
    parent.name === identifier
  );
};

/** The text of an identifier, or of a name written as a string. */
const nameText = (node: ts.Node): string | undefined =>
  ts.isIdentifier(node) ? node.text : literalText(node);

/**
 * A key of a pattern: a destructuring declaration's, or one in an object
 * literal that is the target of an assignment.
 */
const isPatternKey = (node: ts.Node): boolean => {
  const { parent } = node;

  return (
    (ts.isBindingElement(parent) && parent.propertyName === node) ||
    (ts.isPropertyAssignment(parent) &&
      parent.name === node &&
      isAssignmentTarget(parent.parent))
  );
};

/**
 * A key with which a pattern takes a loader out of an object: a loader's name
 * in a destructuring assignment (`({ require: r } = g)`), or a computed key
 * naming one by a string in any pattern (`{ ['require']: r }`). A declaration's
 * plain key is its {@link ts.BindingElement}'s.
 */
const isLoaderKey = (node: ts.Node): boolean => {
  const { parent } = node;

  if (ts.isComputedPropertyName(node)) {
    const key = literalText(calleeOf(node.expression));

    return key !== undefined && COMMONJS_LOADERS.has(key) && isPatternKey(node);
  }

  const name = nameText(node);

  return (
    name !== undefined &&
    COMMONJS_LOADERS.has(name) &&
    ts.isPropertyAssignment(parent) &&
    parent.name === node &&
    isAssignmentTarget(parent.parent)
  );
};

/**
 * The name an import, an object pattern or a re-export takes from another
 * object or module (`{ require: { cache } }` takes `require`), or `undefined`
 * for any other node. An array pattern's element and a rest element take no
 * name; theirs is the local one the value is written to.
 */
const importedName = (node: ts.Node): string | undefined =>
  ts.isImportSpecifier(node) ||
  (ts.isBindingElement(node) &&
    ts.isObjectBindingPattern(node.parent) &&
    node.dotDotDotToken === undefined) ||
  (ts.isExportSpecifier(node) &&
    node.parent.parent.moduleSpecifier !== undefined)
    ? nameText(node.propertyName ?? node.name)
    : undefined;

/** Whether `node` names `require` or `createRequire`, as {@link commonJsLoaderLines} lists. */
const namesCommonJsLoader = (node: ts.Node): boolean => {
  if (isLoaderKey(node)) {
    return true;
  }

  if (ts.isIdentifier(node)) {
    return COMMONJS_LOADERS.has(node.text) && isReadAsValue(node);
  }

  if (
    ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node)
  ) {
    const member = ts.isPropertyAccessExpression(node)
      ? node.name.text
      : literalText(calleeOf(node.argumentExpression));

    return (
      member !== undefined &&
      COMMONJS_LOADERS.has(member) &&
      !ts.isTypeOfExpression(outermostWrapper(node).parent)
    );
  }

  const imported = importedName(node);

  return imported !== undefined && COMMONJS_LOADERS.has(imported);
};

/** {@link commonJsLoaderLines} of a parsed file. */
const commonJsLinesOf = (root: ts.Node): readonly number[] => {
  const mut_lines = new Set<number>();

  const visit = (node: ts.Node): void => {
    if (namesCommonJsLoader(node)) {
      mut_lines.add(
        node.getSourceFile().getLineAndCharacterOfPosition(node.getStart())
          .line + 1,
      );
    }

    ts.forEachChild(node, visit);
  };

  visit(root);

  return Array.from(mut_lines);
};

/**
 * A file inside a directory, other than the root, that holds a `package.json`
 * among `manifestDirectories`, at any depth.
 */
const isUnderManifest = (
  file: string,
  manifestDirectories: ReadonlySet<string>,
): boolean =>
  Array.from(manifestDirectories).some(
    (directory) => directory !== '.' && file.startsWith(`${directory}/`),
  );

/** A tracked file whose kind {@link shellScriptsOf} reads. */
const isCommandFile = (file: string): boolean =>
  path.posix.basename(file) === 'package.json' ||
  WORKFLOW.test(file) ||
  COMPOSITE_ACTION.test(file) ||
  file === CLAUDE_SETTINGS ||
  file.endsWith('.sh');

/** JavaScript as Node runs it, parsed. */
const parseStripped = (text: string): ts.SourceFile =>
  ts.createSourceFile(
    'stripped.mjs',
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );

/** A TypeScript file, or a word whose expansion may name one. */
const isTypeScriptWord = (word: string): boolean =>
  TYPESCRIPT_FILE.test(word) || ENDS_IN_EXPANSION.test(word);

/**
 * The words among node's arguments that may name a TypeScript file it loads:
 * the script, every file after `--test`, and a preloaded module. An option
 * takes the next word as its value when `node --help` lists it so, as do the
 * few of Node's own it leaves out; V8's (`--stack-size`) take a value after `=`
 * alone. Every word after `--` is the script or one of its own.
 */
const nodeFiles = (
  args: readonly string[],
  nodeOptions: ReadonlyMap<string, boolean>,
): Result<readonly string[], string> => {
  const mut_files: string[] = [];

  const mut_state = { at: 0, test: false, positional: false };

  while (mut_state.at < args.length) {
    const word = args[mut_state.at] ?? '';

    // A value may hold `=` itself (`--import=./a=b.mts`).
    const equals = word.indexOf('=');

    const [option, inlineValue] =
      equals === -1
        ? ([word, undefined] as const)
        : ([word.slice(0, equals), word.slice(equals + 1)] as const);

    // Where the script goes, before `--` or after it; under `--test` it is a
    // test file's name.
    if (word === '-' && !mut_state.test) {
      return Result.err(
        '`node -` reads its script from standard input, which this cannot name; give `node` the file',
      );
    }

    if (!mut_state.positional) {
      if (NODE_NO_SCRIPT_OPTIONS.has(option)) {
        break;
      }

      // Every word after it is the script or the script's own.
      if (word === '--') {
        mut_state.positional = true;

        mut_state.at += 1;

        continue;
      }

      if (word !== '-' && word.startsWith('-')) {
        mut_state.test ||= option === '--test';

        const takesNext =
          inlineValue === undefined && nodeOptions.get(option) === true;

        const value = takesNext ? args[mut_state.at + 1] : inlineValue;

        if (value !== undefined && NODE_PRELOAD_OPTIONS.has(option)) {
          // From a tsx preload on (`--import tsx`), `node` is tsx: what it
          // loads after is compiled, not stripped. A module preloaded before it
          // is not. Read as written: tsx named through a variable or
          // `NODE_OPTIONS` leaves the run judged as plain `node`, which errs
          // loudly, reporting what tsx would have compiled, never silently.
          if (TSX_PRELOAD.test(value)) {
            return Result.ok(mut_files);
          }

          if (isTypeScriptWord(value)) {
            mut_files.push(value);
          }
        }

        mut_state.at += takesNext ? 2 : 1;

        continue;
      }
    }

    if (isTypeScriptWord(word)) {
      mut_files.push(word);
    }

    // The words after the script are its own arguments; `--test` runs them all.
    if (!mut_state.test) {
      break;
    }

    mut_state.at += 1;
  }

  return Result.ok(mut_files);
};

/**
 * The first place that runs a file, and how many more: `assert-deps-built.mts`
 * alone runs from some three hundred scripts.
 */
const describeOrigins = (runs: readonly NodeRun[]): string => {
  const [first, ...rest] = runs;

  const firstOrigin = first?.origin ?? '';

  return Arr.isNonEmpty(rest)
    ? `${firstOrigin} and ${rest.length} more`
    : firstOrigin;
};

/**
 * A word with `$NAME` and `${NAME}` replaced, or what in it cannot be: a name
 * not in `variables`, or any other `$` left (`$@`, `${{ … }}`).
 */
const expandVariables = (
  word: string,
  variables: ReadonlyMap<string, string>,
): Result<string, readonly string[]> => {
  const missing = Array.from(
    word.matchAll(VARIABLE),
    ([match, braced, bare]) => [match, braced ?? bare ?? ''] as const,
  )
    .filter(([, name]) => !variables.has(name))
    .map(([match]) => match);

  if (Arr.isNonEmpty(missing)) {
    return Result.err(missing);
  }

  const expanded = word.replaceAll(
    VARIABLE,
    (_match, braced: string | undefined, bare: string | undefined) =>
      variables.get(braced ?? bare ?? '') ?? '',
  );

  return expanded.includes('$') ? Result.err([word]) : Result.ok(expanded);
};

const firstLine = (text: string): string => text.split('\n', 1)[0] ?? '';

const readTextFile = (file: string): string | undefined => {
  const result = Result.fromThrowable(() =>
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFileSync(path.resolve(projectRootPath, file), 'utf8'),
  );

  return Result.isOk(result) ? result.value : undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkNodeRunScripts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ ${result.value} TypeScript file(s) run by plain \`node\` load under Node as written.`,
  );
}
