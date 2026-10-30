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
import { extractRunScripts, type RunScript } from './run-scripts.mjs';

/**
 * Runs actionlint over `.github/workflows/`, and through it shellcheck over
 * every `run:` block; then the same over the `run:` blocks of the composite
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
 * **The composite actions are judged by actionlint itself.** Their scripts,
 * read by `./run-scripts.mts`, are put back into a one-job workflow, each as
 * a step with its own `shell:`, and handed to the same actionlint over stdin;
 * what it reports is moved back to its line in `action.yml`. So the arguments
 * it passes shellcheck, the prelude it puts before a script, the codes it
 * excludes and which shells it checks are its own, and cannot drift from how
 * it judges a workflow when the pin moves. The action's own contexts are
 * declared in that workflow ({@link wrapInWorkflow}), so the expressions in
 * a script are checked too, a misspelt `inputs.*` and an untrusted
 * `github.event.*` included. Only `run:` and `shell:` are carried over: an
 * expression in a step's `env:`, `with:` or `if:` is not checked, and a
 * `secrets.*`, which a composite action cannot read, is accepted because the
 * wrapper is a reusable workflow.
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
    const { scripts, inputs, stepIds, problems } = extractRunScripts(
      action.text,
    );

    const verdict = Arr.isNonEmpty(scripts)
      ? judgeComposite(
          lintWorkflowText(
            actionlint.value,
            shellcheck.value,
            wrapInWorkflow(scripts, { inputs, stepIds }),
          ),
          action.path,
          scripts,
        )
      : ({ findings: [], failure: undefined } as const);

    return {
      checked: scripts.length,
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

  const checkedScripts = actions.reduce(
    (total, { checked }) => total + checked,
    0,
  );

  if (
    workflows === undefined &&
    !Arr.isNonEmpty(unread) &&
    !Arr.isNonEmpty(findings) &&
    !Arr.isNonEmpty(failures)
  ) {
    return Result.ok(
      `Nothing to report in the workflows or in ${checkedScripts} composite-action run script${checkedScripts === 1 ? '' : 's'} (${versions}).`,
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
        '❌ These composite-action `run:` steps were not read, so nothing checked them:',
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
 * `scripts` as the steps of a one-job workflow, and the line of each step's
 * `run: |2` in it, which is where actionlint reports what it finds there.
 *
 * The workflow gives the scripts the composite action's own contexts: a
 * `workflow_call` declaring its inputs as strings, which a composite
 * action's are, and a step with each `id` the action's steps have, ahead of
 * the scripts. The runner is an expression, so that actionlint does not
 * judge a `shell:` against one operating system when a composite action can
 * run on any.
 */
export const wrapInWorkflow = (
  scripts: readonly RunScript[],
  context: Readonly<{ inputs: readonly string[]; stepIds: readonly string[] }>,
): Readonly<{ text: string; runLines: readonly number[] }> => {
  const header = [
    'on:',
    '  workflow_call:',
    '    inputs:',
    ...Arr.toPushed(context.inputs, runnerInput).flatMap((name) => [
      `      ${JSON.stringify(name)}:`,
      '        type: string',
    ]),
    'jobs:',
    '  composite:',
    `    runs-on: \${{ inputs.${runnerInput} }}`,
    '    steps:',
    ...context.stepIds.flatMap((id) => [
      `      - id: ${JSON.stringify(id)}`,
      '        shell: bash',
      "        run: 'true'",
    ]),
  ] as const;

  const steps = scripts.map(({ shell, script }) => [
    `      - shell: ${JSON.stringify(shell)}`,
    // `|2`: the content sits two columns past the key, so a script whose
    // first line is indented keeps that indentation.
    '        run: |2',
    ...script
      .replace(/\n$/u, '')
      .split('\n')
      .map((line) => (line === '' ? '' : `          ${line}`)),
  ]);

  // 1-based: the header and every step before, then `shell:`, then `run:`.
  const runLines = Arr.scan(
    steps,
    (linesBefore, step) => linesBefore + step.length,
    header.length,
  )
    .slice(0, -1)
    .map((linesBefore) => linesBefore + 2);

  return {
    text: `${[...header, ...steps.flat()].join('\n')}\n`,
    runLines,
  };
};

/** The wrapper's runner, an input no composite action is expected to have. */
const runnerInput = 'check-actionlint-runner';

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
  workflow: Readonly<{ text: string; runLines: readonly number[] }>,
) => Readonly<{
  workflow: Readonly<{ text: string; runLines: readonly number[] }>;
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
      'a release has matured, or bump the version and every digest in',
      'tools/configs/release-binaries.json, rather than rewriting the',
      'workflow.',
    ].join('\n');
  }

  return `❌ actionlint stopped without a verdict (${status === null ? `signal ${signal ?? 'unknown'}` : `exit status ${status}`}; ${versions}); its output above says why.`;
};

/**
 * What actionlint found in a composite action's scripts, each moved to its
 * line and column in `file`: a shellcheck finding to the line of the script
 * it names, anything else to the start of that step's script.
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

  return {
    findings: reports.map((report) => {
      const message =
        typeof report['message'] === 'string' ? report['message'] : '';

      const reportedLine =
        typeof report['line'] === 'number' ? report['line'] : Number.NaN;

      // On a step's `run:` line, or on its `shell:` line just above.
      const step = workflow.runLines.findIndex(
        (runLine) => reportedLine === runLine || reportedLine === runLine - 1,
      );

      const script = scripts[step];

      if (script === undefined) {
        return `${file}: ${message}`;
      }

      const shellcheck =
        /SC(?<code>\d+):(?<level>\w+):(?<line>\d+):(?<column>\d+): (?<text>.*)$/u.exec(
          message,
        )?.groups;

      if (shellcheck === undefined) {
        return `${file}:${script.line}:${script.column + 1}: ${message}`;
      }

      const line =
        script.line +
        Result.unwrapOkOr(Num.safeParseInt(shellcheck['line'] ?? ''), 1) -
        1;

      const column =
        script.column +
        Result.unwrapOkOr(Num.safeParseInt(shellcheck['column'] ?? ''), 1);

      return `${file}:${line}:${column}: ${shellcheck['level'] ?? ''}: ${shellcheck['text'] ?? ''} [SC${shellcheck['code'] ?? ''}]`;
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
