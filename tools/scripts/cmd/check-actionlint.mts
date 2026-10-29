// cspell:ignore pyflakes
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Runs actionlint over `.github/workflows/`, and through it shellcheck over
 * every `run:` block.
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
 * **The verdict must be CI's.** CI installs the versions pinned in
 * `code-check.yml`, in the `check:root` entry's "Install actionlint and
 * shellcheck" step, whose comment says how they are bumped; this reads the
 * pins from there and refuses to run with anything else. A missing shellcheck
 * is skipped by actionlint without a word, an older one lacks checks the
 * pinned one has, and a newer actionlint accepts syntax the pinned one
 * rejects: each would pass what CI fails. For the same reason pyflakes, which
 * actionlint runs over `shell: python` steps when it is on `PATH`, is turned
 * off (there is no such step), and `SHELLCHECK_OPTS`, which actionlint hands
 * to shellcheck, is cleared.
 *
 * The composite actions under `.github/actions/` are read for the inputs a
 * workflow passes them; their own `run:` blocks are not linted, because
 * actionlint lints workflow files only.
 */
export const checkActionlint = ({
  probe,
  run,
  codeCheckWorkflow,
}: Readonly<{
  probe: Probe;
  run: Run;
  /** The text of `.github/workflows/code-check.yml`, which holds the pins. */
  codeCheckWorkflow: string;
}>): Result<string, string> => {
  const tools = requiredTools.map((tool) => ({
    ...tool,
    pinned: tool.pinPattern.exec(codeCheckWorkflow)?.groups?.['version'],
  }));

  const unpinned = tools.filter(({ pinned }) => pinned === undefined);

  if (Arr.isNonEmpty(unpinned)) {
    return Result.err(
      [
        `❌ .github/workflows/code-check.yml no longer pins ${unpinned.map(({ command }) => command).join(' or ')} the way this guard reads it:`,
        ...unpinned.map(({ pinPattern }) => `  ${pinPattern.source}`),
        'Keep the step and tools/scripts/cmd/check-actionlint.mts in step.',
      ].join('\n'),
    );
  }

  const pinnedTools = tools.filter(
    (tool): tool is typeof tool & Readonly<{ pinned: string }> =>
      tool.pinned !== undefined,
  );

  const found = pinnedTools.map((tool) => {
    const output = probe(tool.command, tool.versionArgs);

    return {
      ...tool,
      found:
        output === undefined
          ? undefined
          : (tool.versionPattern.exec(output)?.groups?.['version'] ??
            'an unknown version'),
    };
  });

  const unusable = found.filter(
    ({ found: version, pinned }) => version !== pinned,
  );

  if (Arr.isNonEmpty(unusable)) {
    return Result.err(
      [
        '❌ check:root:actionlint runs the actionlint and shellcheck versions CI pins',
        '   in .github/workflows/code-check.yml, and PATH has something else:',
        '',
        ...unusable.map(
          ({ command, found: version, pinned, releases }) =>
            `  ${command.padEnd(10)}  ${(version === undefined ? 'not found' : `found ${version}`).padEnd(28)}  needs ${pinned.padEnd(8)}  ${releases}/tag/v${pinned}`,
        ),
        '',
        'Another version can pass what CI fails, so install those on PATH.',
      ].join('\n'),
    );
  }

  const versions = found
    .map(({ command, pinned }) => `${command} ${pinned}`)
    .join(', ');

  const { status, signal, error } = run();

  if (error !== undefined) {
    return Result.err(`❌ Could not run actionlint: ${error.message}`);
  }

  if (status === 0) {
    return Result.ok(`Nothing to report (${versions}).`);
  }

  // actionlint exits 1 for findings; 2 (bad option) and 3 (fatal), like a
  // signal, mean it never got as far as a verdict.
  if (status === 1) {
    return Result.err(
      [
        '',
        `❌ actionlint reported the problems above (${versions}).`,
        '',
        'A shellcheck finding that is wrong for its line is disabled on the',
        'command it names (`# shellcheck disable=SC<number> # why`), not for',
        'the whole directory. An error about syntax GitHub already accepts',
        '(a new expression function, key or runner label) means the pinned',
        'actionlint predates it: bump it in code-check.yml rather than',
        'rewriting the workflow.',
      ].join('\n'),
    );
  }

  return Result.err(
    `❌ actionlint stopped without a verdict (${status === null ? `signal ${signal ?? 'unknown'}` : `exit status ${status}`}; ${versions}); its output above says why.`,
  );
};

/**
 * What `command args` printed to stdout, or `undefined` when it could not be
 * run, exited non-zero or did not answer in time — a version manager's shim
 * with no version selected does one of the last two, and is no more a
 * shellcheck than a missing binary.
 */
export type Probe = (
  command: string,
  args: readonly string[],
) => string | undefined;

/** How the actionlint run ended, as `spawnSync` reports it. */
export type Run = () => Readonly<{
  status: number | null;
  signal: string | null;
  error: Error | undefined;
}>;

const requiredTools = [
  {
    command: 'actionlint',
    versionArgs: ['-version'],
    // `1.7.12` on a line of its own; `v1.7.12` from `go install …@v1.7.12`.
    versionPattern: /^v?(?<version>\d+\.\d+\.\d+\S*)$/mu,
    // The value, quoted or not; whatever follows it, a comment say, is not read.
    pinPattern: /^ +ACTIONLINT_VERSION: ['"]?(?<version>[^\s'"#]+)/mu,
    releases: 'https://github.com/rhysd/actionlint/releases',
  },
  {
    command: 'shellcheck',
    versionArgs: ['--version'],
    versionPattern: /^version: v?(?<version>\S+)$/mu,
    pinPattern: /^ +SHELLCHECK_VERSION: ['"]?(?<version>[^\s'"#]+)/mu,
    releases: 'https://github.com/koalaman/shellcheck/releases',
  },
] as const;

const codeCheckWorkflowPath = path.resolve(
  projectRootPath,
  '.github/workflows/code-check.yml',
);

// Both run from the repository root, so that a version manager selecting by
// directory picks the same binary for the probe and the run, and without
// `SHELLCHECK_OPTS`, which actionlint hands to shellcheck. (An `undefined`
// value leaves the variable out of the child's environment.)
const toolEnv = { ...process.env, SHELLCHECK_OPTS: undefined } as const;

// A fixed path inside the repository, which the rule cannot see through.
const readCodeCheckWorkflow = (): Promise<string> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(codeCheckWorkflowPath, 'utf8');

const probeOnPath: Probe = (command, args) => {
  const { error, status, stdout } = spawnSync(command, args, {
    cwd: projectRootPath,
    env: toolEnv,
    encoding: 'utf8',
    timeout: 30_000,
  });

  return error === undefined && status === 0 ? stdout : undefined;
};

const runActionlint: Run = () => {
  const { status, signal, error } = spawnSync('actionlint', ['-pyflakes='], {
    cwd: projectRootPath,
    stdio: 'inherit',
    env: toolEnv,
  });

  return { status, signal, error };
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await Result.fromPromise(readCodeCheckWorkflow()).then(
    (codeCheckWorkflow) =>
      Result.isErr(codeCheckWorkflow)
        ? Result.err(
            `❌ Could not read ${path.relative(projectRootPath, codeCheckWorkflowPath)}, which holds the pins: ${unknownToString(codeCheckWorkflow.value)}`,
          )
        : checkActionlint({
            probe: probeOnPath,
            run: runActionlint,
            codeCheckWorkflow: codeCheckWorkflow.value,
          }),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(result.value);
}
