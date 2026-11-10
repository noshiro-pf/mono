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
import type { MutableRecord, ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import { parse } from 'yaml';
import {
  listTrackedFiles,
  listWorkflowFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';
import { readShellCommands } from '../lib/shell-commands.mjs';
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
 * in a manifest's `scripts`, a workflow's or a composite action's `run:` and
 * `.claude/settings.json` — never listed, so a new one is judged from the
 * commit that adds it. Each must strip under Node's own `stripTypeScriptTypes`
 * (no `enum`, no namespace holding values), and what it loads once stripped —
 * which keeps an inline `import { type X }` as `import {} from …` — must be a
 * builtin or a relative file that exists as written and passes the same. A
 * package is allowed only to the scripts in {@link RUN_AFTER_INSTALL}.
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
 * where the script runs. `variables` are expanded in the words node is given,
 * along with what the script's own assignments set (`f=…`), taken in order with
 * no regard to where `node` runs.
 *
 * What this cannot name is an error, never skipped: a variable it does not know
 * or a GitHub expression, a word that may be an option's value or the script
 * (`--test-reporter spec`), and a file that `exists` does not find after a `cd`
 * or `pushd`. Those it does not follow, because the reading cannot tell a `cd`
 * that moves the script from one in a subshell or a substitution
 * (`"$(cd "$(dirname "$0")" && pwd)"`); a file found from where the script
 * starts is taken from there.
 */
export const nodeRunFilesOf = (
  script: string,
  context: Readonly<{
    directory: string;
    variables: ReadonlyRecord<string, string>;
    exists: (file: string) => boolean;
  }>,
): Result<readonly string[], string> => {
  const reading = readShellCommands(script);

  if (Arr.isNonEmpty(reading.problems)) {
    return /\bnode\b/u.test(script)
      ? Result.err(`cannot read the script: ${reading.problems.join('; ')}`)
      : Result.ok([]);
  }

  const mut_variables: MutableRecord<string, string> = {
    ...context.variables,
  };

  for (const [name, value] of reading.assignments) {
    const expanded = expandVariables(value, mut_variables);

    // One this cannot expand matters only if `node` is given it, which reports
    // it then.
    if (Result.isOk(expanded)) {
      mut_variables[name] = expanded.value;
    }
  }

  const mut_state: { changedBy: string | undefined } = {
    changedBy: undefined,
  };

  const mut_files: string[] = [];

  const mut_unresolved: string[] = [];

  // The reading has taken off what precedes the command proper: assignments,
  // reserved words, and wrappers such as `env` or `timeout`.
  for (const [command, ...args] of reading.commands) {
    if (command === 'cd' || command === 'pushd') {
      mut_state.changedBy = command;

      continue;
    }

    if (command !== 'node') {
      continue;
    }

    const words = nodeFiles(args);

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
 * `packagesInstalled` — any package. A relative file it loads is judged the
 * same way. `read` gives a file's text by its path from the root, or
 * `undefined` when there is none.
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

    const specifiers = ts
      .preProcessFile(stripped.value, true, true)
      .importedFiles.map(({ fileName }) => fileName);

    for (const specifier of specifiers) {
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

/**
 * The scripts run with `node` that may load packages, because nothing runs them
 * before `pnpm install` and the build they need. Every other one runs where
 * there may be none: keep this list to what it must hold.
 */
const RUN_AFTER_INSTALL: ReadonlySet<string> = new Set<string>([
  // `pnpm run benchmark` measures the built packages, imported from `dist/`.
  'libs/synstate-next/scripts/cmd/benchmark.mts',
]);

const TYPESCRIPT_FILE = /\.(?:[cm]?ts)$/u;

/** A word whose last part is an expansion, which may name a TypeScript file. */
const ENDS_IN_EXPANSION = /\$(?:\{[^}]*\}+|\w+|[@*#?])$/u;

const RELATIVE_SPECIFIER = /^\.\.?(?:\/|$)/u;

/** A path, as a script is written: with a directory or an extension. */
const LOOKS_LIKE_PATH = /\/|\.\w+$/u;

/** A specifier with a scheme other than `node:` (`file:`, `data:`, `https:`). */
const URL_SPECIFIER = /^[A-Za-z][\w+.-]*:/u;

const VARIABLE = /\$\{(\w+)\}|\$(\w+)/gu;

/** Options of `node` that take the next word as their value. */
const NODE_VALUE_OPTIONS: ReadonlySet<string> = new Set<string>([
  '--conditions',
  '-C',
  '--env-file',
  '--experimental-loader',
  '--import',
  '--input-type',
  '--loader',
  '--require',
  '-r',
  '--stack-size',
  '--title',
]);

/** Of those, the ones whose value is a module node loads. */
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

const COMPOSITE_ACTION = /^\.github\/actions\/.+\/action\.ya?ml$/u;

const CLAUDE_SETTINGS = '.claude/settings.json';

/** A TypeScript file, or a word whose expansion may name one. */
const isTypeScriptWord = (word: string): boolean =>
  TYPESCRIPT_FILE.test(word) || ENDS_IN_EXPANSION.test(word);

/**
 * The first word after `at` that is a path or may expand to a TypeScript file,
 * skipping options and the bare words between them.
 */
const nextPathAfter = (
  args: readonly string[],
  at: number,
): string | undefined =>
  args
    .slice(at + 1)
    .find(
      (word) =>
        !word.startsWith('-') &&
        (isTypeScriptWord(word) || LOOKS_LIKE_PATH.test(word)),
    );

/**
 * The words among node's arguments that may name a TypeScript file it loads:
 * the script, every file after `--test`, and a preloaded module. A word that is
 * no path where the script should be — no directory, no extension — is an error
 * when the next path after it is a TypeScript file: it may be the value of an
 * option this does not know (`--test-reporter spec`), with that file the
 * script.
 */
const nodeFiles = (
  args: readonly string[],
): Result<readonly string[], string> => {
  const mut_files: string[] = [];

  const mut_state = { at: 0, test: false };

  while (mut_state.at < args.length) {
    const word = args[mut_state.at] ?? '';

    const [option = '', inlineValue] = word.split('=', 2);

    if (NODE_NO_SCRIPT_OPTIONS.has(option)) {
      break;
    }

    if (word !== '--' && word.startsWith('-')) {
      mut_state.test ||= option === '--test';

      const takesNext =
        inlineValue === undefined && NODE_VALUE_OPTIONS.has(option);

      const value = takesNext ? args[mut_state.at + 1] : inlineValue;

      if (
        value !== undefined &&
        NODE_PRELOAD_OPTIONS.has(option) &&
        isTypeScriptWord(value)
      ) {
        mut_files.push(value);
      }

      mut_state.at += takesNext ? 2 : 1;

      continue;
    }

    if (word === '--') {
      mut_state.at += 1;

      continue;
    }

    if (isTypeScriptWord(word)) {
      mut_files.push(word);
    } else if (
      !LOOKS_LIKE_PATH.test(word) &&
      isTypeScriptWord(nextPathAfter(args, mut_state.at) ?? '')
    ) {
      return Result.err(
        `cannot tell whether \`${word}\` is node's script or an option's value; write the option as \`--name=value\``,
      );
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
  variables: ReadonlyRecord<string, string>,
): Result<string, readonly string[]> => {
  const missing = Array.from(
    word.matchAll(VARIABLE),
    ([match, braced, bare]) => [match, braced ?? bare ?? ''] as const,
  )
    .filter(([, name]) => !hasKey(variables, name))
    .map(([match]) => match);

  if (Arr.isNonEmpty(missing)) {
    return Result.err(missing);
  }

  const expanded = word.replaceAll(
    VARIABLE,
    (_match, braced: string | undefined, bare: string | undefined) =>
      variables[braced ?? bare ?? ''] ?? '',
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

/** Every `node <file>` the repository writes, wherever it is written. */
const collectNodeRuns = (): Promise<Result<Collected, string>> =>
  Result.safeTry(async function* () {
    const manifests = yield* Result.safeUnwrap(await readManifests());

    const workflows = yield* Result.safeUnwrap(await listWorkflowFiles());

    const tracked = yield* Result.safeUnwrap(await listTrackedFiles());

    const mut_scripts: (readonly [
      origin: string,
      script: string,
      directory: string,
      variables: ReadonlyRecord<string, string>,
    ])[] = [];

    for (const manifest of manifests) {
      for (const [name, body] of Object.entries(manifest.scripts)) {
        mut_scripts.push([
          `${path.posix.join(manifest.directory, 'package.json')} \`${name}\``,
          body,
          manifest.directory,
          {},
        ]);
      }
    }

    for (const absolute of workflows) {
      const file = path
        .relative(projectRootPath, absolute)
        .split(path.sep)
        .join('/');

      const text = yield* Result.safeUnwrap(await readRepositoryFile(file));

      const jobs = readWorkflowJobs(text);

      if (Result.isErr(jobs)) {
        return Result.err(`${file}: ${jobs.value}`);
      }

      for (const job of jobs.value) {
        for (const step of job.steps) {
          if (step.run !== undefined) {
            mut_scripts.push([
              `${file} (job \`${job.name}\`)`,
              step.run,
              step.workingDirectory ?? '.',
              {},
            ]);
          }
        }
      }
    }

    for (const file of tracked) {
      if (!COMPOSITE_ACTION.test(file)) {
        continue;
      }

      const text = yield* Result.safeUnwrap(await readRepositoryFile(file));

      const steps = yield* Result.safeUnwrap(readCompositeSteps(file, text));

      for (const step of steps) {
        mut_scripts.push([file, step.run, step.directory, {}]);
      }
    }

    if (tracked.includes(CLAUDE_SETTINGS)) {
      const text = yield* Result.safeUnwrap(
        await readRepositoryFile(CLAUDE_SETTINGS),
      );

      const parsed = Json.parse(text);

      if (Result.isErr(parsed)) {
        return Result.err(
          `${CLAUDE_SETTINGS}: ${unknownToString(parsed.value)}`,
        );
      }

      for (const command of hookCommands(parsed.value)) {
        mut_scripts.push([
          CLAUDE_SETTINGS,
          command,
          '.',
          // Claude Code runs a hook with the project's root in this variable.
          { CLAUDE_PROJECT_DIR: '.' },
        ]);
      }
    }

    const mut_runs: NodeRun[] = [];

    const mut_problems: string[] = [];

    for (const [origin, script, directory, variables] of mut_scripts) {
      const files = nodeRunFilesOf(script, {
        directory,
        variables,
        exists: (file) => readTextFile(file) !== undefined,
      });

      if (Result.isErr(files)) {
        mut_problems.push(`${origin}: ${files.value}`);
      } else {
        mut_runs.push(...files.value.map((file) => ({ file, origin })));
      }
    }

    return Result.ok({ runs: mut_runs, problems: mut_problems });
  });

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
