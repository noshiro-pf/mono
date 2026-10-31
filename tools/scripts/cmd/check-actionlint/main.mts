// cspell:ignore pyflakes
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, Num, Result, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  downloadWithFetch,
  installReleaseBinary,
  parseReleaseBinaryPins,
  platformKey,
  releaseBinaryCacheDir,
  releaseBinaryPinsPath,
  type ReleaseBinaryPin,
} from '../../lib/release-binaries.mjs';
import { projectRootPath } from '../../project-root-path.mjs';
import {
  extractRunScripts,
  withoutComment,
  type RunScript,
  type StepsBlock,
} from './run-scripts.mjs';

/**
 * Runs actionlint over `.github/workflows/`, and through it shellcheck over
 * every `run:` block; then the same over the `runs.steps` of the composite
 * actions under `.github/actions/`, which actionlint reads only for their
 * inputs.
 *
 * What it reports — an expression of the wrong type, a context the key does
 * not allow, a `needs` or a step id that does not exist, an input a local
 * action or reusable workflow does not take, an untrusted value spliced into
 * a `run:` — otherwise shows only when the workflow runs, which for one that
 * runs on a `push` to `main`, a schedule or `workflow_dispatch` is after the
 * merge; an injection shows only when someone uses it. The inputs and
 * outputs of a third-party action are not checked: actionlint knows them by
 * `owner/repo@vX` only, and every pin here is a SHA.
 *
 * **The verdict is CI's.** Both binaries are the ones
 * `tools/configs/release-binaries.json` pins, downloaded and verified by
 * `../../lib/release-binaries.mts`, never whatever `PATH` has: a missing
 * shellcheck is skipped by actionlint without a word, an older one lacks
 * checks, and a newer actionlint accepts syntax the pinned one rejects. For
 * the same reason pyflakes, which actionlint runs over `shell: python` steps
 * when it is on `PATH`, is turned off (there is no such step), and
 * `SHELLCHECK_OPTS`, which shellcheck reads, is cleared.
 *
 * **The composite actions are judged by actionlint itself.** Their
 * `runs.steps`, found by `./run-scripts.mts`, are copied line for line into a
 * one-job workflow and handed to the same actionlint over stdin; what it
 * reports is moved back to its line and column in `action.yml`. So the
 * arguments it passes shellcheck, the prelude it puts before a script, the
 * codes it excludes and which shells it checks are its own, and cannot drift
 * from how it judges a workflow when the pin moves. Every key of every step is
 * checked, `env:`, `with:` and `if:` as well as `run:`, and the action's
 * inputs are declared in that workflow ({@link wrapInWorkflow}), so a
 * misspelt `inputs.*`, a step id that does not exist and an untrusted
 * `github.event.*` are all reported. A composite action has no `secrets`, so
 * the wrapper declares one secret no action reads, and actionlint reports a
 * `secrets.<name>` it does not declare; what it still accepts is the secrets
 * every workflow has (`secrets.GITHUB_TOKEN`, `secrets.ACTIONS_STEP_DEBUG`,
 * `secrets.ACTIONS_RUNNER_DEBUG`) and the whole object (`toJSON(secrets)`).
 * A key only a workflow's step takes (`timeout-minutes:`) is not reported
 * either, nor the `with:` of a local action (`uses: ./…`), which actionlint
 * resolves only from a file.
 */
export const checkActionlint = async ({
  pins,
  install,
  tryRunning,
  runActionlint,
  compositeActions,
  lintWorkflowText,
}: Readonly<{
  pins: ReadonlyRecord<string, ReleaseBinaryPin>;
  install: Install;
  /**
   * Why `binary args` could not run, or `undefined` when it did — so that a
   * binary this machine cannot execute fails here instead of actionlint
   * quietly skipping the shellcheck it was given.
   */
  tryRunning: (binary: string, args: readonly string[]) => string | undefined;
  runActionlint: RunActionlint;
  /** Each `action.yml` under `.github/actions/`, by repository path. */
  compositeActions: readonly Readonly<{ path: string; text: string }>[];
  lintWorkflowText: LintWorkflowText;
}>): Promise<Result<string, string>> => {
  const actionlintPin = pins['actionlint'];

  const shellcheckPin = pins['shellcheck'];

  if (actionlintPin === undefined || shellcheckPin === undefined) {
    return Result.err(
      `❌ tools/configs/release-binaries.json pins no ${[
        ...(actionlintPin === undefined ? ['actionlint'] : []),
        ...(shellcheckPin === undefined ? ['shellcheck'] : []),
      ].join(' and no ')}.`,
    );
  }

  const [actionlint, shellcheck] = await Promise.all([
    install('actionlint', actionlintPin),
    install('shellcheck', shellcheckPin),
  ]);

  if (Result.isErr(actionlint) || Result.isErr(shellcheck)) {
    return Result.err(
      [actionlint, shellcheck]
        .filter((installed) => Result.isErr(installed))
        .map(({ value }) => value)
        .join('\n'),
    );
  }

  const notRunning = Arr.generate(function* () {
    for (const { binary, args } of [
      { binary: actionlint.value, args: ['-version'] },
      { binary: shellcheck.value, args: ['--version'] },
    ]) {
      const why = tryRunning(binary, args);

      if (why !== undefined) {
        yield `❌ ${binary} does not run here: ${why}`;
      }
    }
  });

  if (Arr.isNonEmpty(notRunning)) {
    return Result.err(notRunning.join('\n'));
  }

  const versions =
    `actionlint ${actionlintPin.version}, shellcheck ${shellcheckPin.version}` as const;

  const workflows = judgeActionlint(
    runActionlint(actionlint.value, shellcheck.value),
    versions,
  );

  const actions = compositeActions.map((action) => {
    const { scripts, steps, inputs, problems } = extractRunScripts(action.text);

    const verdict =
      steps === undefined
        ? ({ findings: [], failure: undefined } as const)
        : judgeComposite(
            lintWorkflowText(
              actionlint.value,
              shellcheck.value,
              wrapInWorkflow(steps, { inputs }),
            ),
            action.path,
            scripts,
          );

    return {
      checked: steps !== undefined,
      unread: problems.map((problem) => `${action.path}:${problem}`),
      ...verdict,
    };
  });

  const unread = actions.flatMap((action) => action.unread);

  const findings = actions.flatMap((action) => action.findings);

  const failures = Arr.generate(function* () {
    for (const { failure } of actions) {
      if (failure !== undefined) {
        yield failure;
      }
    }
  });

  const checkedActions = actions.filter(({ checked }) => checked).length;

  if (
    workflows === undefined &&
    !Arr.isNonEmpty(unread) &&
    !Arr.isNonEmpty(findings) &&
    !Arr.isNonEmpty(failures)
  ) {
    return Result.ok(
      `Nothing to report in the workflows or in the steps of ${checkedActions} composite action${checkedActions === 1 ? '' : 's'} (${versions}).`,
    );
  }

  return Result.err(
    [
      ...(workflows === undefined ? [] : [workflows]),
      ...section(
        `❌ actionlint reported these in the composite actions (${versions}):`,
        findings,
        [
          'A shellcheck finding that is wrong for its line is disabled on the',
          'command it names (`# shellcheck disable=SC<number> # why`).',
        ],
      ),
      ...section(
        '❌ actionlint could not judge these composite actions:',
        failures,
        [],
      ),
      ...section(
        '❌ These composite-action steps were not read as `./run-scripts.mts` reads them, so they were checked only in part, or not at all:',
        unread,
        [
          'Write each as a block-style step under `runs.steps`, with its own',
          '`shell:` and a literal `run: |`; `./run-scripts.mts` says what it reads.',
        ],
      ),
    ].join('\n'),
  );
};

/**
 * `steps` as the steps of a one-job workflow, copied line for line, and how
 * far they moved: a line of `steps` is `lineOffset` lines further down in the
 * workflow than in `action.yml`, and `columnOffset` columns further right —
 * as many as put its items under the wrapper's `steps:`, whatever their
 * indentation in `action.yml`. The first `headerLines` lines are the
 * wrapper's own.
 *
 * The workflow gives the steps the composite action's own inputs: a
 * `workflow_call` declaring them as strings, which a composite action's are.
 * The matrix is an expression (of a context no configuration declares), so
 * that a `matrix.*` of the calling job may be any value, and the runner is one of its entries, so that actionlint does
 * not judge a `shell:` against one operating system when a composite action
 * can run on any.
 */
export const wrapInWorkflow = (
  steps: StepsBlock,
  context: Readonly<{ inputs: readonly string[] }>,
): WrappedWorkflow => {
  const header = [
    'on:',
    '  workflow_call:',
    ...(Arr.isNonEmpty(context.inputs)
      ? Arr.toUnshifted('    inputs:')(
          context.inputs.flatMap((name) => [
            `      ${JSON.stringify(name)}:`,
            '        type: string',
          ]),
        )
      : (['    inputs: {}'] as const)),
    '    secrets:',
    `      ${JSON.stringify(noSecret)}:`,
    '        required: false',
    'jobs:',
    '  composite:',
    `    runs-on: ${dollar}{{ matrix.runner }}`,
    '    strategy:',
    `      matrix: ${dollar}{{ fromJSON(github.event_name) }}`,
    '    steps:',
  ] as const;

  // The items go no shallower than the wrapper's `    steps:`.
  const columnOffset = Math.max(0, 4 - steps.dashIndent);

  const body = steps.lines.map((line) =>
    line === '' ? '' : `${' '.repeat(columnOffset)}${line}`,
  );

  return {
    text: `${[...header, ...body].join('\n')}\n`,
    lineOffset: header.length + 1 - steps.line,
    columnOffset,
    headerLines: header.length,
  };
};

/** What {@link wrapInWorkflow} makes of a composite action's steps. */
export type WrappedWorkflow = Readonly<{
  text: string;
  lineOffset: number;
  columnOffset: number;
  headerLines: number;
}>;

/** `$`, for a `${{` that is not a template's. */
const dollar = '$';

/**
 * The one secret the wrapper declares, so that actionlint reports any other
 * `secrets.<name>`: with none declared it takes every name.
 */
const noSecret = 'check-actionlint-no-secrets';

/** The path of `name`'s pinned binary, installed if it is not yet. */
export type Install = (
  name: string,
  pin: ReleaseBinaryPin,
) => Promise<Result<string, string>>;

/** How the actionlint run over `.github/workflows/` ended. */
export type RunActionlint = (
  actionlint: string,
  shellcheck: string,
) => Readonly<{
  status: number | null;
  signal: string | null;
  /** Why it could not be started at all, if it could not. */
  error: string | undefined;
}>;

/** One actionlint run over a workflow given as text, in its JSON format. */
export type LintWorkflowText = (
  actionlint: string,
  shellcheck: string,
  workflow: WrappedWorkflow,
) => Readonly<{
  workflow: WrappedWorkflow;
  status: number | null;
  stdout: string;
  /** Where actionlint says why it stopped, when it did. */
  stderr: string;
  /** Why it could not be started at all, if it could not. */
  error: string | undefined;
}>;

/** The failure for the workflows, or `undefined` when actionlint passed. */
const judgeActionlint = (
  { status, signal, error }: ReturnType<RunActionlint>,
  versions: string,
): string | undefined => {
  if (error !== undefined) {
    return `❌ Could not run actionlint: ${error}`;
  }

  if (status === 0) {
    return undefined;
  }

  // actionlint exits 1 for findings; 2 (bad option) and 3 (fatal), like a
  // signal, mean it never got as far as a verdict.
  if (status === 1) {
    return [
      '',
      `❌ actionlint reported the problems above (${versions}).`,
      '',
      'A shellcheck finding that is wrong for its line is disabled on the',
      'command it names (`# shellcheck disable=SC<number> # why`), not for',
      'the whole directory. An error about syntax GitHub already accepts',
      '(a new expression function, key or runner label) means the pinned',
      'actionlint predates it: pnpm-update.yml moves it within its line once',
      'a release has matured, or pin a newer one by hand with',
      '`pnpm run update-release-binaries -- --to actionlint@<x.y.z>`, rather',
      'than rewriting the workflow.',
    ].join('\n');
  }

  return `❌ actionlint stopped without a verdict (${status === null ? `signal ${signal ?? 'unknown'}` : `exit status ${status}`}; ${versions}); its output above says why.`;
};

/**
 * actionlint's message, with what it means for a composite action where its
 * words are the wrapper's: an undeclared secret names the one the wrapper
 * declares, and an unknown anchor is one the steps, linted alone, cannot see.
 */
const explain = (message: string): string =>
  message.includes(noSecret)
    ? (`${message.replace(/ in object type \{.*\}$/u, '')}: a composite action has no \`secrets\`; pass the value in as an input` as const)
    : message.includes('unknown anchor')
      ? (`${message}: \`runs.steps\` is linted on its own, so write the value out or anchor it within the steps` as const)
      : message;

/**
 * What actionlint found in a composite action's steps, each moved to its line
 * and column in `file`: a shellcheck finding to the line of the script it
 * names, anything else by the constant shift {@link wrapInWorkflow} made.
 * Inside a scalar that spans lines actionlint gives only an offset into it,
 * so such a finding gets the scalar's first line and no column, or for a
 * `run: |` where the script starts.
 */
const judgeComposite = (
  { workflow, status, stdout, stderr, error }: ReturnType<LintWorkflowText>,
  file: string,
  scripts: readonly RunScript[],
): Readonly<{ findings: readonly string[]; failure: string | undefined }> => {
  if (error !== undefined) {
    return {
      findings: [],
      failure: `${file}: could not run actionlint: ${error}`,
    };
  }

  const parsed = Result.fromThrowable(() => JSON.parse(stdout) as unknown);

  const reports =
    Result.isOk(parsed) && Arr.isArray(parsed.value)
      ? parsed.value.filter(isRecord)
      : undefined;

  // 0 is clean and 1 is findings, which come as a JSON list; anything else
  // means no verdict.
  if (
    reports === undefined ||
    (status !== 0 && status !== 1) ||
    (status === 1 && !Arr.isNonEmpty(reports))
  ) {
    return {
      findings: [],
      failure: `${file}: actionlint stopped without a verdict (${status === null ? 'a signal' : `exit status ${status}`}): ${[
        stdout,
        stderr,
      ]
        .map((output) => output.trim())
        .filter((output) => output !== '')
        .join(' / ')}`,
    };
  }

  const workflowLines = workflow.text.split('\n');

  return {
    findings: reports.map((report) => {
      const reported =
        typeof report['message'] === 'string' ? report['message'] : '';

      // A position actionlint names in its message is the wrapper's too.
      const message = explain(reported).replaceAll(
        /\bline:(?<line>\d+),col:(?<column>\d+)/gu,
        (match: string, l?: string, c?: string) => {
          const position = Result.zip(
            Num.safeParseInt(l ?? ''),
            Num.safeParseInt(c ?? ''),
          );

          return Result.isOk(position)
            ? `line:${position.value[0] - workflow.lineOffset},col:${position.value[1] - workflow.columnOffset}`
            : match;
        },
      );

      const reportedLine =
        typeof report['line'] === 'number' ? report['line'] : Number.NaN;

      const line = reportedLine - workflow.lineOffset;

      const column =
        (typeof report['column'] === 'number' ? report['column'] : Number.NaN) -
        workflow.columnOffset;

      // A line of the wrapper's own header has no counterpart in `file`.
      if (!Number.isFinite(line) || reportedLine <= workflow.headerLines) {
        return `${file}: ${message}`;
      }

      if (!Number.isFinite(column)) {
        return `${file}:${line}: ${message}`;
      }

      const shellcheck =
        /SC(?<code>\d+):(?<level>\w+):(?<line>\d+):(?<column>\d+): (?<text>.*)$/u.exec(
          message,
        )?.groups;

      // actionlint puts a shellcheck finding on the step's `run:` key; the
      // script starts on that line, or on the next for a block scalar.
      const script = scripts.find((s) => s.runLine === line);

      // On the line of a block scalar's header (`script: |`), and wherever
      // else a scalar spans lines, actionlint's column is an offset into the
      // whole scalar, so the line alone is right.
      const lineText = workflowLines[reportedLine - 1] ?? '';

      const at =
        /: *[|>][-+\d]{0,2}$/u.test(withoutComment(lineText)) ||
        column > lineText.length - workflow.columnOffset
          ? (`${file}:${line}` as const)
          : (`${file}:${line}:${column}` as const);

      if (shellcheck === undefined) {
        // What actionlint finds in a block-scalar script is nearest the
        // script's start; a syntax error on its key line is about the step.
        return script !== undefined &&
          script.line !== line &&
          report['kind'] !== 'syntax-check'
          ? `${file}:${script.line}:${script.column + 1}: ${message}`
          : `${at}: ${message}`;
      }

      if (script === undefined) {
        return `${at}: ${message}`;
      }

      const scriptLine =
        script.line +
        Result.unwrapOkOr(Num.safeParseInt(shellcheck['line'] ?? ''), 1) -
        1;

      const scriptColumn =
        script.column +
        Result.unwrapOkOr(Num.safeParseInt(shellcheck['column'] ?? ''), 1);

      return `${file}:${scriptLine}:${scriptColumn}: ${shellcheck['level'] ?? ''}: ${shellcheck['text'] ?? ''} [SC${shellcheck['code'] ?? ''}]`;
    }),
    failure: undefined,
  };
};

// Run from the repository root and without `SHELLCHECK_OPTS`, which
// shellcheck reads whoever starts it. (An `undefined` value leaves the
// variable out of the child's environment.)
const toolEnv = { ...process.env, SHELLCHECK_OPTS: undefined } as const;

const section = (
  title: string,
  entries: readonly string[],
  advice: readonly string[],
): readonly string[] =>
  Arr.isNonEmpty(entries)
    ? ([
        '',
        title,
        '',
        ...entries.map((entry) => `  ${entry}`),
        ...(Arr.isNonEmpty(advice)
          ? (['', ...advice] as const)
          : ([] as const)),
      ] as const)
    : ([] as const);

const installPinned: Install = (name, pin) =>
  installReleaseBinary({
    name,
    pin,
    platform: platformKey(process.platform, process.arch),
    cacheDir: releaseBinaryCacheDir,
    download: downloadWithFetch,
  });

const tryRunningBinary = (
  binary: string,
  args: readonly string[],
): string | undefined => {
  const { status, error, stderr } = spawnSync(binary, args, {
    env: toolEnv,
    encoding: 'utf8',
    timeout: 30_000,
  });

  return error !== undefined
    ? error.message
    : status === 0
      ? undefined
      : `exit status ${status ?? 'none'}: ${stderr.trim()}`;
};

const runActionlintBinary: RunActionlint = (actionlint, shellcheck) => {
  const { status, signal, error } = spawnSync(
    actionlint,
    [`-shellcheck=${shellcheck}`, '-pyflakes='],
    { cwd: projectRootPath, stdio: 'inherit', env: toolEnv },
  );

  return { status, signal, error: error?.message };
};

const lintWorkflowTextBinary: LintWorkflowText = (
  actionlint,
  shellcheck,
  workflow,
) => {
  const { status, stdout, stderr, error } = spawnSync(
    actionlint,
    [
      `-shellcheck=${shellcheck}`,
      '-pyflakes=',
      '-format',
      '{{json .}}',
      '-stdin-filename',
      'composite-action.yml',
      '-',
    ],
    {
      cwd: projectRootPath,
      env: toolEnv,
      input: workflow.text,
      encoding: 'utf8',
    },
  );

  return { workflow, status, stdout, stderr, error: error?.message };
};

const readCompositeActions = async (): Promise<
  Result<readonly Readonly<{ path: string; text: string }>[], string>
> => {
  // Where the composite actions are kept (see "Setup" in
  // .github/workflows/README.md); none at all is an empty list.
  const files = await glob('.github/actions/**/action.{yml,yaml}', {
    cwd: projectRootPath,
    absolute: true,
  });

  if (Result.isErr(files)) {
    return Result.err(
      `❌ Could not list the composite actions: ${unknownToString(files.value)}`,
    );
  }

  const texts = await Result.fromPromise(
    Promise.all(
      files.value.toSorted().map(async (file) => ({
        path: path.relative(projectRootPath, file),
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file the glob listed.
        text: await fs.readFile(file, 'utf8'),
      })),
    ),
  );

  return Result.isErr(texts)
    ? Result.err(
        `❌ Could not read a composite action: ${unknownToString(texts.value)}`,
      )
    : Result.ok(texts.value);
};

const readPins = async (): Promise<
  Result<ReadonlyRecord<string, ReleaseBinaryPin>, string>
> => {
  const text = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixed path inside the repository.
    fs.readFile(releaseBinaryPinsPath, 'utf8'),
  );

  if (Result.isErr(text)) {
    return Result.err(
      `❌ Could not read ${releaseBinaryPinsPath}: ${unknownToString(text.value)}`,
    );
  }

  const json = Result.fromThrowable(() => JSON.parse(text.value) as unknown);

  return Result.isErr(json)
    ? Result.err(
        `❌ ${releaseBinaryPinsPath} is not JSON: ${unknownToString(json.value)}`,
      )
    : parseReleaseBinaryPins(json.value);
};

if (isDirectlyExecuted(import.meta.url)) {
  const [pins, compositeActions] = await Promise.all([
    readPins(),
    readCompositeActions(),
  ]);

  const result = Result.isErr(pins)
    ? pins
    : Result.isErr(compositeActions)
      ? compositeActions
      : await checkActionlint({
          pins: pins.value,
          install: installPinned,
          tryRunning: tryRunningBinary,
          runActionlint: runActionlintBinary,
          compositeActions: compositeActions.value,
          lintWorkflowText: lintWorkflowTextBinary,
        });

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
