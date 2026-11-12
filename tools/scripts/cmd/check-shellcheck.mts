// cspell:ignore norc
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  Arr,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { runFile } from '../lib/child-process.mjs';
import { readScripts } from '../lib/manifest-scripts.mjs';
import { plural } from '../lib/plural.mjs';
import {
  downloadWithFetch,
  installReleaseBinary,
  platformKey,
  readReleaseBinaryPins,
  releaseBinaryCacheDir,
} from '../lib/release-binaries.mjs';
import {
  isUnderExperimental,
  listTrackedFiles,
  readRepositoryFile,
} from '../lib/repo-files.mjs';

/**
 * Runs the pinned shellcheck over every tracked `*.sh` and `*.bash`, every
 * script of every tracked `package.json`, and the commands of
 * `.github/unblock-prs.json`, all outside `experimental/` and `docs/`.
 *
 * The binary is the one `tools/configs/release-binaries.json` pins, never
 * whatever `PATH` has, and it runs without `SHELLCHECK_OPTS` and without a
 * `.shellcheckrc`, so nothing is switched off from outside.
 */
export const checkRepository = async (): Promise<Result<string, string>> => {
  const installed = await installPinnedShellcheck();

  if (Result.isErr(installed)) {
    return installed;
  }

  const sources = await readSources();

  if (Result.isErr(sources)) {
    return sources;
  }

  const result = await findShellFindings({
    shellcheck: installed.value.binary,
    sources: sources.value,
    exceptions: SCRIPT_EXCEPTIONS,
  });

  if (Result.isErr(result)) {
    return result;
  }

  const { findings, commandCount } = result.value;

  return Arr.isNonEmpty(findings)
    ? Result.err(
        [
          `❌ shellcheck ${installed.value.version} reported these:`,
          '',
          ...findings,
          '',
          'A finding that is wrong for its line is disabled in a shell file by',
          '`# shellcheck disable=SC<number> # why` above the command, and for a',
          'script of a package.json by an entry with its reason in',
          'SCRIPT_EXCEPTIONS (tools/scripts/cmd/check-shellcheck.mts). A command',
          'of .github/unblock-prs.json is rewritten instead.',
        ].join('\n'),
      )
    : Result.ok(
        `Nothing to report in ${plural(sources.value.shellFiles.length, 'shell file')}, the scripts of ${plural(sources.value.manifests.length, 'manifest')} and ${UNBLOCK_PRS_CONFIG} (${plural(commandCount, 'distinct command')}; shellcheck ${installed.value.version}).`,
      );
};

/**
 * What shellcheck finds in `sources`, one line each, and an entry of
 * `exceptions` that matches none of it.
 *
 * A shell file is checked in the dialect its shebang names. A script of a
 * manifest and a command of the queue's configuration are checked as `sh`, each
 * distinct text once, and reported under every place that has it; their
 * findings carry no position, which would be that of a temporary file.
 */
export const findShellFindings = async ({
  shellcheck,
  sources,
  exceptions,
}: Readonly<{
  /** The path of the shellcheck binary. */
  shellcheck: string;
  sources: ShellSources;
  exceptions: readonly ScriptException[];
}>): Promise<
  Result<
    Readonly<{ findings: readonly string[]; commandCount: number }>,
    string
  >
> => {
  const commands = commandsOf(sources);

  if (Result.isErr(commands)) {
    return commands;
  }

  const texts = Arr.uniq(commands.value.map(({ text }) => text));

  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'check-shellcheck-'));

  try {
    const filesDir = path.join(root, 'files');

    const commandsDir = path.join(root, 'commands');

    await Promise.all([
      ...sources.shellFiles.map((file) =>
        writeFile(path.join(filesDir, file.path), file.text),
      ),
      ...texts.map((text, index) =>
        writeFile(path.join(commandsDir, commandFileName(index)), `${text}\n`),
      ),
    ]);

    const [fileComments, commandComments] = await Promise.all([
      runShellcheck(shellcheck, {
        options: [],
        files: sources.shellFiles.map((file) => file.path),
        cwd: filesDir,
      }),
      runShellcheck(shellcheck, {
        options: ['--shell=sh'],
        files: texts.map((_, index) => commandFileName(index)),
        cwd: commandsDir,
      }),
    ]);

    if (Result.isErr(fileComments)) {
      return fileComments;
    }

    if (Result.isErr(commandComments)) {
      return commandComments;
    }

    const fileOfText = new Map(
      texts.map((text, index) => [text, commandFileName(index)]),
    );

    const commandsByFile = Map.groupBy(commands.value, ({ text }) =>
      fileOfText.get(text),
    );

    const commandFindings = commandComments.value.flatMap((comment) =>
      (commandsByFile.get(comment.file) ?? []).map((command) => ({
        command,
        comment,
      })),
    );

    const isExcepted =
      (exception: ScriptException) =>
      ({ command, comment }: CommandFinding): boolean =>
        command.manifest === exception.manifest &&
        command.script === exception.script &&
        comment.code === exception.code;

    return Result.ok({
      commandCount: texts.length,
      findings: [
        ...fileComments.value.map(
          ({ file, line, column, level, code, message }) =>
            `${file}:${line}:${column}: ${level}: ${message} [SC${code}]`,
        ),
        ...commandFindings
          .filter((finding) =>
            exceptions.every((exception) => !isExcepted(exception)(finding)),
          )
          .map(
            ({ command, comment }) =>
              `${command.label}: SC${comment.code} ${comment.message}`,
          ),
        ...exceptions
          .filter((exception) => !commandFindings.some(isExcepted(exception)))
          .map(
            ({ manifest, script, code }) =>
              `The exception for SC${code} in script "${script}" of ${manifest} matches no finding: delete it from SCRIPT_EXCEPTIONS in tools/scripts/cmd/check-shellcheck.mts.`,
          ),
      ],
    });
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
};

/**
 * The commands of the queue's configuration that `unblock-prs` hands a shell,
 * each with the path of its field.
 *
 * The fields are {@link COMMAND_FIELDS}. A `run`, `before` or `after` anywhere
 * else is an error rather than a command left unchecked: those are the names
 * the configuration gives a command.
 */
export const unblockPrsCommands = (
  config: unknown,
): Result<readonly Readonly<{ field: string; text: string }>[], string> => {
  const mut_commands: Readonly<{ field: string; text: string }>[] = [];

  const mut_unknown: string[] = [];

  const visit = (value: unknown, field: string, shape: string): void => {
    if (Arr.isArray(value)) {
      for (const [index, item] of value.entries()) {
        visit(item, `${field}[${index}]`, `${shape}[]`);
      }

      return;
    }

    if (!isRecord(value)) {
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      const childField = field === '' ? key : (`${field}.${key}` as const);

      const childShape = shape === '' ? key : (`${shape}.${key}` as const);

      if (!COMMAND_KEYS.has(key)) {
        visit(child, childField, childShape);
      } else if (!COMMAND_FIELDS.has(childShape)) {
        mut_unknown.push(childField);
      } else if (isString(child)) {
        mut_commands.push({ field: childField, text: child });
      } else if (Arr.isArray(child)) {
        for (const [index, item] of child.entries()) {
          if (isString(item)) {
            mut_commands.push({ field: `${childField}[${index}]`, text: item });
          }
        }
      }
    }
  };

  visit(config, '', '');

  return Arr.isNonEmpty(mut_unknown)
    ? Result.err(
        mut_unknown
          .map(
            (field) =>
              `${UNBLOCK_PRS_CONFIG}: ${field} is not a command field this guard knows. If unblock-prs runs it through a shell, add it to COMMAND_FIELDS in tools/scripts/cmd/check-shellcheck.mts.`,
          )
          .join('\n'),
      )
    : Result.ok(mut_commands);
};

/** The pinned shellcheck, installed, and its version. */
export const installPinnedShellcheck = async (): Promise<
  Result<Readonly<{ binary: string; version: string }>, string>
> => {
  const pins = await readReleaseBinaryPins();

  if (Result.isErr(pins)) {
    return pins;
  }

  const pin = pins.value['shellcheck'];

  if (pin === undefined) {
    return Result.err(
      '❌ tools/configs/release-binaries.json pins no shellcheck.',
    );
  }

  return Result.map(
    await installReleaseBinary({
      name: 'shellcheck',
      pin,
      platform: platformKey(process.platform, process.arch),
      cacheDir: releaseBinaryCacheDir,
      download: downloadWithFetch,
    }),
    (binary) => ({ binary, version: pin.version }),
  );
};

export type TextFile = Readonly<{
  /** From the repository root. */
  path: string;
  text: string;
}>;

export type ShellSources = Readonly<{
  shellFiles: readonly TextFile[];
  /** Every `package.json`. */
  manifests: readonly TextFile[];
  /** `.github/unblock-prs.json`, when the repository has one. */
  unblockPrsConfig: TextFile | undefined;
}>;

export type ScriptException = Readonly<{
  /** The manifest's path from the repository root. */
  manifest: string;
  script: string;
  /** The number of the `SC` code. */
  code: number;
  reason: string;
}>;

type Command = Readonly<{
  /** Where the command is, as a finding names it. */
  label: string;
  text: string;
  /** Set for a manifest's script, which alone an exception can name. */
  manifest?: string;
  script?: string;
}>;

type CommandFinding = Readonly<{
  command: Command;
  comment: ShellcheckComment;
}>;

type ShellcheckComment = Readonly<{
  file: string;
  line: number;
  column: number;
  level: string;
  code: number;
  message: string;
}>;

/**
 * A finding of a `package.json` script that is wrong for it. JSON takes no
 * `# shellcheck disable=` comment, so the reason is kept here; an entry that no
 * longer matches a finding fails the guard. A command of
 * `.github/unblock-prs.json` cannot be named here: the queue's few commands are
 * the repository's own, and one with a wrong finding is rewritten.
 */
const SCRIPT_EXCEPTIONS: readonly ScriptException[] = [] as const;

const UNBLOCK_PRS_CONFIG = '.github/unblock-prs.json';

/** The fields of the queue's configuration that hold commands, an array index written `[]`. */
const COMMAND_FIELDS: ReadonlySet<string> = new Set<string>([
  'autoFix.before',
  'autoFix.prepare[].run',
  'autoFix.fixers[].run',
  'autoFix.after',
  'regenerate.before',
  'regenerate.generators[].run',
]);

/**
 * The keys of the commands `unblock-prs` runs through a shell. A command under
 * another key is not found: `generatedBranches[].rebuild`, which a person or
 * the skill runs, is not one of them.
 */
const COMMAND_KEYS: ReadonlySet<string> = new Set<string>([
  'run',
  'before',
  'after',
]);

const commandFileName = (index: number): string => `${index}.sh` as const;

const parseJson = (file: TextFile): Result<unknown, string> =>
  Result.mapErr(Json.parse(file.text), (error) => `${file.path}: ${error}`);

const commandsOf = ({
  manifests,
  unblockPrsConfig,
}: ShellSources): Result<readonly Command[], string> => {
  const mut_commands: Command[] = [];

  for (const manifest of manifests) {
    const parsed = parseJson(manifest);

    if (Result.isErr(parsed)) {
      return parsed;
    }

    for (const [script, text] of Object.entries(readScripts(parsed.value))) {
      mut_commands.push({
        label: `${manifest.path}: script "${script}"`,
        text,
        manifest: manifest.path,
        script,
      });
    }
  }

  if (unblockPrsConfig !== undefined) {
    const parsed = parseJson(unblockPrsConfig);

    if (Result.isErr(parsed)) {
      return parsed;
    }

    const commands = unblockPrsCommands(parsed.value);

    if (Result.isErr(commands)) {
      return commands;
    }

    for (const { field, text } of commands.value) {
      mut_commands.push({
        label: `${unblockPrsConfig.path}: ${field}`,
        // In these fields the worker puts a shell-quoted word where `$1` to
        // `$9` are. Its own `withCaptures` is not used: `pr-merge-queue` does
        // not export it. A `$1` written inside double quotes is not caught:
        // shellcheck finds nothing wrong in `"'x'"`.
        text: /^(?:autoFix\.fixers|regenerate\.generators)\[\d+\]\.run$/u.test(
          field,
        )
          ? text.replaceAll(/\$[1-9]/gu, "'x'")
          : text,
      });
    }
  }

  return Result.ok(mut_commands);
};

const writeFile = async (file: string, text: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- inside the temporary directory just made.
  await fs.mkdir(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- inside the temporary directory just made.
  await fs.writeFile(file, text);
};

/** What shellcheck says of `files`, which are relative to `cwd`; nothing is run for none. */
const runShellcheck = async (
  shellcheck: string,
  {
    options,
    files,
    cwd,
  }: Readonly<{
    options: readonly string[];
    files: readonly string[];
    cwd: string;
  }>,
): Promise<Result<readonly ShellcheckComment[], string>> => {
  if (!Arr.isNonEmpty(files)) {
    return Result.ok([]);
  }

  const { status, stdout, stderr, error } = await runFile(
    shellcheck,
    // `--`, so that a file whose name starts with `-` is not read as an option.
    ['--norc', '--format=json1', ...options, '--', ...files],
    {
      cwd,
      // An `undefined` value leaves the variable out of the child's
      // environment.
      env: { ...process.env, SHELLCHECK_OPTS: undefined },
      maxBuffer: 64 * 1024 * 1024,
    },
  );

  // Not `Json.parse`: its `JsonValue` does not narrow through
  // `comments.filter(isRecord)` below.
  const parsed = Result.fromThrowable((): unknown => JSON.parse(stdout));

  const comments =
    Result.isOk(parsed) && isRecord(parsed.value)
      ? parsed.value['comments']
      : undefined;

  // 0 is clean and 1 is findings; anything else means no verdict.
  if (
    error !== undefined ||
    (status !== 0 && status !== 1) ||
    !Arr.isArray(comments)
  ) {
    return Result.err(
      `❌ shellcheck stopped without a verdict (${error?.message ?? `exit status ${status ?? 'none'}`}): ${stderr.trim()}`,
    );
  }

  return Result.ok(
    comments.filter(isRecord).map((comment) => ({
      file: unknownToString(comment['file']),
      line: Number(comment['line']),
      column: Number(comment['column']),
      level: unknownToString(comment['level']),
      code: Number(comment['code']),
      message: unknownToString(comment['message']),
    })),
  );
};

const readSources = async (): Promise<Result<ShellSources, string>> => {
  const tracked = await listTrackedFiles();

  if (Result.isErr(tracked)) {
    return tracked;
  }

  // A diff under `docs/` alone skips `code-check.yml`, as one under
  // `experimental/` does, so a finding there would fail the next pull request
  // instead of the one that brought it.
  const files = tracked.value.filter(
    (file) => !isUnderExperimental(file) && !file.startsWith('docs/'),
  );

  const read = async (
    paths: readonly string[],
  ): Promise<Result<readonly TextFile[], string>> => {
    const texts = await Promise.all(
      paths.map(async (file) =>
        Result.map(await readRepositoryFile(file), (text) => ({
          path: file,
          text,
        })),
      ),
    );

    const failed = texts.find(Result.isErr);

    return failed ?? Result.ok(texts.filter(Result.isOk).map((r) => r.value));
  };

  const [shellFiles, manifests, configs] = await Promise.all([
    read(files.filter((file) => /\.(?:sh|bash)$/u.test(file))),
    read(files.filter((file) => path.posix.basename(file) === 'package.json')),
    read(files.filter((file) => file === UNBLOCK_PRS_CONFIG)),
  ]);

  if (Result.isErr(shellFiles)) {
    return shellFiles;
  }

  if (Result.isErr(manifests)) {
    return manifests;
  }

  if (Result.isErr(configs)) {
    return configs;
  }

  return Result.ok({
    shellFiles: shellFiles.value,
    manifests: manifests.value,
    unblockPrsConfig: configs.value[0],
  });
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkRepository().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
