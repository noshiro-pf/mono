import { Arr } from 'ts-data-forge';

/**
 * What a `pnpm run` and an `npm-run-all` list run, read from a command's words
 * (`readShellCommands` in `shell-commands.mts`): the guards that compare the
 * workflows, the manifests and `check-changed` read script runs through these
 * two, so that a flag's value is never taken for a script in one of them and
 * not the others.
 */

/**
 * The script a `pnpm run` runs, with the arguments after it, the `--filter`
 * selectors, `--recursive` and `--dir`, wherever pnpm takes them (before `run`
 * or after it); undefined for any other command.
 */
export const readPnpmRun = (words: readonly string[]): PnpmRun | undefined => {
  if (words[0] !== 'pnpm') {
    return undefined;
  }

  const mut_filters: string[] = [];

  const mut_state: {
    recursive: boolean;
    workspaceRoot: boolean;
    directory: string | undefined;
    sawRun: boolean;
  } = {
    recursive: false,
    workspaceRoot: false,
    directory: undefined,
    sawRun: false,
  };

  const mut_cursor = { at: 1 };

  while (mut_cursor.at < words.length) {
    const word = words[mut_cursor.at] ?? '';

    if (!word.startsWith('-')) {
      if (!mut_state.sawRun) {
        if (!RUN_COMMANDS.has(word)) {
          return undefined;
        }

        mut_state.sawRun = true;

        mut_cursor.at += 1;

        continue;
      }

      return {
        script: word,
        args: words.slice(mut_cursor.at + 1),
        filters: mut_filters,
        recursive: mut_state.recursive,
        workspaceRoot: mut_state.workspaceRoot,
        directory: mut_state.directory,
      };
    }

    const [flag, inline] = splitFlag(word);

    const value =
      inline ?? (VALUE_FLAGS.has(flag) ? words[mut_cursor.at + 1] : undefined);

    if (value !== undefined && FILTER_FLAGS.has(flag)) {
      mut_filters.push(value);
    } else if (value !== undefined && DIRECTORY_FLAGS.has(flag)) {
      mut_state.directory = value;
    } else if (RECURSIVE_FLAGS.has(flag)) {
      mut_state.recursive = true;
    } else if (WORKSPACE_ROOT_FLAGS.has(flag)) {
      mut_state.workspaceRoot = true;
    }

    mut_cursor.at += inline === undefined && VALUE_FLAGS.has(flag) ? 2 : 1;
  }

  return undefined;
};

/**
 * The scripts an `npm-run-all` list (`run-s`, `run-p`) runs, and apart from them
 * those it runs with arguments of their own (`"gen:x -- --all"`, one quoted
 * entry): a script run with arguments may not be the check the bare script is,
 * as with `pnpm run x --flag`. Undefined for any other command.
 */
export const readRunAll = (
  words: readonly string[],
): RunAllList | undefined => {
  if (!RUN_ALL_PROGRAMS.has(words[0] ?? '')) {
    return undefined;
  }

  const mut_scripts: string[] = [];

  const mut_withArguments: string[] = [];

  const mut_cursor = { at: 1 };

  while (mut_cursor.at < words.length) {
    const word = words[mut_cursor.at] ?? '';

    if (word.startsWith('-')) {
      const [flag, inline] = splitFlag(word);

      mut_cursor.at +=
        inline === undefined && RUN_ALL_VALUE_FLAGS.has(flag) ? 2 : 1;

      continue;
    }

    const [script = '', ...args] = word.trim().split(/\s+/u);

    if (Arr.isEmpty(args)) {
      mut_scripts.push(script);
    } else {
      mut_withArguments.push(script);
    }

    mut_cursor.at += 1;
  }

  return { scripts: mut_scripts, withArguments: mut_withArguments };
};

/**
 * The values of the options among `args` that `flags` names, given as
 * `--flag value` or `--flag=value`: what a script's own options say
 * (`z:ci-job --command <script>`).
 */
export const optionValues = (
  args: readonly string[],
  flags: ReadonlySet<string>,
): readonly string[] =>
  args.flatMap((arg, index) => {
    const [flag, inline] = splitFlag(arg);

    const value = inline ?? args[index + 1];

    return value !== undefined && flags.has(flag) ? [value] : [];
  });

export type PnpmRun = Readonly<{
  script: string;
  /** What follows the script, handed to it. */
  args: readonly string[];
  /** The `--filter` / `--filter-prod` / `-F` selectors, as written. */
  filters: readonly string[];
  recursive: boolean;
  /** `-w` / `--workspace-root`: the run is the workspace root's. */
  workspaceRoot: boolean;
  /** `--dir` / `-C`, as written. */
  directory: string | undefined;
}>;

export type RunAllList = Readonly<{
  scripts: readonly string[];
  withArguments: readonly string[];
}>;

/** A `--filter` / `--filter-prod` / `-F` word, with its value or without. */
export const isFilterFlag = (word: string): boolean =>
  FILTER_FLAGS.has(splitFlag(word)[0]);

/** `--flag=value` as its flag and value; a flag alone as itself. */
const splitFlag = (word: string): readonly [string, string | undefined] => {
  const equals = word.indexOf('=');

  return equals === -1
    ? [word, undefined]
    : [word.slice(0, equals), word.slice(equals + 1)];
};

const WORKSPACE_ROOT_FLAGS: ReadonlySet<string> = new Set<string>([
  '-w',
  '--workspace-root',
]);

const RUN_COMMANDS: ReadonlySet<string> = new Set<string>([
  'run',
  'run-script',
]);

const FILTER_FLAGS: ReadonlySet<string> = new Set<string>([
  '--filter',
  '--filter-prod',
  '-F',
]);

const DIRECTORY_FLAGS: ReadonlySet<string> = new Set<string>(['--dir', '-C']);

const RECURSIVE_FLAGS: ReadonlySet<string> = new Set<string>([
  '--recursive',
  '-r',
]);

/** The `pnpm` flags whose value is the next word when not given with `=`. */
const VALUE_FLAGS: ReadonlySet<string> = new Set<string>([
  ...FILTER_FLAGS,
  ...DIRECTORY_FLAGS,
  '--workspace-concurrency',
  '--reporter',
  '--loglevel',
  '--changed-files-ignore-pattern',
  '--test-pattern',
  '--resume-from',
]);

const RUN_ALL_PROGRAMS: ReadonlySet<string> = new Set<string>([
  'run-s',
  'run-p',
  'npm-run-all',
]);

/** The `npm-run-all` flags whose value is the next word. */
const RUN_ALL_VALUE_FLAGS: ReadonlySet<string> = new Set<string>([
  '--max-parallel',
  '--npm-path',
]);
