import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// Erased by Node, as a top-level `import type` is; see the header.
import type { UnknownRecord } from 'ts-type-forge';

/**
 * The `UserPromptSubmit` and `SessionStart` hook `.claude/settings.json` runs:
 * on each prompt, it tells the model what `CLAUDE.md`, and the files it names,
 * have become on `origin/main` since the session last saw them.
 *
 * Claude Code reads `CLAUDE.md` from the working tree when a session starts and
 * not again until it compacts. A session lives for days on a branch cut from an
 * older `main`, so a rule merged meanwhile never reaches it, and nothing fails
 * to say so. This keeps, per session, the `origin/main` commit whose
 * `CLAUDE.md` the model has — `git merge-base HEAD origin/main` on the first
 * prompt — fetches `main` at most once a minute per clone, and when the two
 * differ adds to the prompt:
 *
 * - the diff of every `CLAUDE.md` between them, to be followed over the copy
 *   the session loaded;
 * - which files the root `CLAUDE.md` names (in backticks, a link or an `@`
 *   import, at either commit) changed in between, by name only: the model reads
 *   those on demand, so it is told to read them again rather than shown them.
 *
 * The session's commit then moves to `origin/main`, so each change is reported
 * once. `SessionStart` — startup, resume, `/clear`, compaction — drops it,
 * since each reloads `CLAUDE.md` from the working tree and may lose what was
 * reported; the next prompt reports from the merge base again.
 *
 * **Silent when it cannot run**: outside a git repository or without
 * `origin/main`. A fetch that fails or times out is ignored and the last
 * fetched `origin/main` is used; any other git command that fails leaves the
 * session's commit where it was, so the next prompt tries again. State lives in
 * `claude-md-sync/` under the git common directory, so worktrees share the
 * fetch throttle and nothing of it is tracked.
 *
 * **Run with `node`, not `tsx`**, for the reasons `claude-code-post-edit.mts`
 * gives: only `node:*` modules at runtime, erasable syntax, no `Temporal`;
 * `check:root:node-run-scripts` holds the first two, the test the last. The repository is the one holding the hook's `cwd`, not
 * `$CLAUDE_PROJECT_DIR`, for the same reason.
 */
export const run = async (
  stdin: string,
  now: number = Date.now(),
): Promise<string | undefined> => {
  const input = parseJson(stdin);

  if (!isObject(input)) {
    return undefined;
  }

  const sessionId = input['session_id'];

  // Every later git command runs at the top level, where a pathspec such as
  // `CLAUDE.md` means the root one whatever directory the session is in.
  const located = await git(
    typeof input['cwd'] === 'string' ? input['cwd'] : process.cwd(),
    [
      'rev-parse',
      '--path-format=absolute',
      '--show-toplevel',
      '--git-common-dir',
    ],
  );

  const [root, commonDir] = located?.split('\n') ?? [];

  if (
    root === undefined ||
    commonDir === undefined ||
    typeof sessionId !== 'string' ||
    !SESSION_ID.test(sessionId)
  ) {
    return undefined;
  }

  const stateDir = path.join(commonDir, STATE_DIR);

  const stateFile = path.join(stateDir, sessionId);

  switch (input['hook_event_name']) {
    case 'SessionStart':
      fs.rmSync(stateFile, { force: true });

      pruneStale(stateDir, now);

      return undefined;

    case 'UserPromptSubmit':
      return onPrompt(root, stateDir, stateFile, now);

    default:
      return undefined;
  }
};

/**
 * Every path `markdown` names: a backtick span, a link target, or an `@`
 * import, with `<root>/`, `./` and a `#fragment` dropped. Most are not paths at
 * all; matching them against the changed files is what sorts that out.
 */
export const extractReferences = (markdown: string): ReadonlySet<string> =>
  new Set(
    Array.from(markdown.matchAll(REFERENCE), (match) =>
      (
        match.groups?.['code'] ??
        match.groups?.['link'] ??
        match.groups?.['import'] ??
        ''
      )
        .replace(LEADING_ROOT, '')
        .replace(FRAGMENT, ''),
    ).filter((reference) => reference !== ''),
  );

/** `git diff --name-status --no-renames` output, one change per line. */
export const parseNameStatus = (output: string): readonly Change[] =>
  Array.from(output.matchAll(NAME_STATUS_LINE), (match) => ({
    status: match.groups?.['status'] ?? '',
    path: match.groups?.['path'] ?? '',
  }));

/**
 * What the model is told: the `CLAUDE.md` diff, if any, then the files it names
 * that changed, if any.
 */
export const formatReport = ({
  seen,
  tip,
  diff,
  referenced,
}: Readonly<{
  seen: string;
  tip: string;
  diff: string | undefined;
  referenced: readonly Change[];
}>): string => {
  const range = `${seen.slice(0, 12)}..${tip.slice(0, 12)}` as const;

  const report = [
    `origin/main has moved since this session last saw CLAUDE.md (${range}).`,
    ...(diff === undefined
      ? []
      : [
          [
            'CLAUDE.md changed as follows. Follow this over the copy loaded',
            'at the start of the session; where it names something this',
            'checkout lacks, the branch is behind origin/main.',
          ].join(' '),
          '',
          diff.length <= MAX_DIFF_LENGTH
            ? diff
            : `${diff.slice(0, MAX_DIFF_LENGTH)}\n[truncated; read the rest with \`git diff ${range} -- CLAUDE.md\`]`,
        ]),
    ...(referenced.length === 0
      ? []
      : [
          '',
          [
            'Files CLAUDE.md names that changed in the same range; read them',
            'again before relying on an earlier reading',
            `(\`git diff ${range} -- <path>\`):`,
          ].join(' '),
          ...referenced
            .slice(0, MAX_LISTED_FILES)
            .map(({ status, path: file }) => `  ${status} ${file}`),
          ...(referenced.length > MAX_LISTED_FILES
            ? [`  … and ${referenced.length - MAX_LISTED_FILES} more`]
            : []),
        ]),
  ].join('\n');

  return report.length <= MAX_REPORT_LENGTH
    ? report
    : `${report.slice(0, MAX_REPORT_LENGTH)}\n[truncated; list the rest with \`git diff --name-status ${range}\`]`;
};

/** One line of `git diff --name-status`. */
export type Change = Readonly<{
  status: string;
  path: string;
}>;

const REMOTE = 'origin';

const BRANCH = 'main';

const REMOTE_MAIN = `${REMOTE}/${BRANCH}` as const;

const STATE_DIR = 'claude-md-sync';

/** Starts with a dot, which `SESSION_ID` never does. */
const FETCH_STAMP = '.fetched';

const FETCH_INTERVAL_MS = 60_000;

const GIT_TIMEOUT_MS = 10_000;

/** A session whose state is older than this is not coming back. */
const STALE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Claude Code saves a hook's added context longer than 10,000 characters to a
 * file and shows a preview, so the whole report is cut below that. The diff is
 * capped well under the cut, so that a long diff still leaves room for the list
 * of files after it, and the cut, when it comes, falls on that list.
 */
const MAX_REPORT_LENGTH = 9500;

const MAX_DIFF_LENGTH = 7000;

const MAX_LISTED_FILES = 30;

/** Also the file name of the session's state, so nothing that escapes. */
const SESSION_ID = /^[\w-]+$/u;

const COMMIT = /^[\da-f]{40,64}$/u;

/** An `@` import ends at a word character, so prose punctuation after it does not stick. */
const REFERENCE =
  /`(?<code>[^`\s]+)`|\]\((?<link>[^)\s]+)\)|(?<=^|\s)@(?<import>[\w./~-]*\w)/gmu;

const LEADING_ROOT = /^(?:<root>\/|\.\/)/u;

const FRAGMENT = /#.*$/u;

/** What `buildReport` returns when git could not answer. */
const FAILED = Symbol('failed');

const NAME_STATUS_LINE = /^(?<status>[A-Z]+)\t(?<path>.+)$/gmu;

/** Every `CLAUDE.md` Claude Code may load, which `experimental/`'s are not. */
const isMemoryFile = (file: string): boolean =>
  path.posix.basename(file) === 'CLAUDE.md' &&
  !file.startsWith('experimental/');

/**
 * Trimmed stdout, or `undefined` when git fails or times out. `execFile` with a
 * callback rather than `tools/scripts/lib/child-process.mts`, which this file
 * cannot import (see the header).
 */
const git = (
  cwd: string,
  args: readonly string[],
): Promise<string | undefined> =>
  new Promise((resolve) => {
    const child = execFile(
      'git',
      // Unquoted, so that a non-ASCII path compares equal to the one CLAUDE.md
      // names.
      ['-c', 'core.quotePath=false', ...args],
      {
        cwd,
        encoding: 'utf8',
        timeout: GIT_TIMEOUT_MS,
        // A credential prompt would hang until the timeout.
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      },
      (error, stdout) => {
        resolve(error === null ? stdout.trim() : undefined);
      },
    );

    // Nothing is written to git; an open stdin would only be something to wait on.
    child.stdin?.end();
  });

/**
 * The report for `seen..tip`: `undefined` when nothing the session loaded
 * changed, `FAILED` when git could not say.
 */
const buildReport = async (
  cwd: string,
  seen: string,
  tip: string,
): Promise<string | undefined | typeof FAILED> => {
  const nameStatus = await git(cwd, [
    'diff',
    '--no-renames',
    '--name-status',
    seen,
    tip,
  ]);

  if (nameStatus === undefined) {
    return FAILED;
  }

  const changes = parseNameStatus(nameStatus);

  // Both commits' references, so a file named only before or only after counts.
  const memoryFileTexts = await Promise.all(
    [seen, tip].map(
      async (commit) => (await git(cwd, ['show', `${commit}:CLAUDE.md`])) ?? '',
    ),
  );

  const references = extractReferences(memoryFileTexts.join('\n'));

  const memoryFiles = changes.filter(({ path: file }) => isMemoryFile(file));

  const referenced = changes.filter(
    ({ path: file }) => !isMemoryFile(file) && references.has(file),
  );

  if (memoryFiles.length === 0 && referenced.length === 0) {
    return undefined;
  }

  const diff =
    memoryFiles.length === 0
      ? undefined
      : await git(cwd, [
          'diff',
          '--no-color',
          '--no-ext-diff',
          seen,
          tip,
          '--',
          ...memoryFiles.map(({ path: file }) => file),
        ]);

  return diff === undefined && memoryFiles.length > 0
    ? FAILED
    : formatReport({ seen, tip, diff, referenced });
};

/** Milliseconds since the epoch, or 0 for a file that is not there. */
const modifiedAt = (file: string): number => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the git common directory.
    return fs.statSync(file).mtimeMs;
  } catch {
    return 0;
  }
};

const writeText = (file: string, text: string): void => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the git common directory.
    fs.mkdirSync(path.dirname(file), { recursive: true });

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the git common directory.
    fs.writeFileSync(file, text);
  } catch {
    // A state that cannot be kept only means the next prompt reports again.
  }
};

/**
 * `git fetch origin main`, unless any session of this clone did so within the
 * last minute. The stamp is touched first, so prompts in several sessions at
 * once fetch once.
 */
const fetchMain = async (
  cwd: string,
  stateDir: string,
  now: number,
): Promise<void> => {
  const stamp = path.join(stateDir, FETCH_STAMP);

  if (now - modifiedAt(stamp) < FETCH_INTERVAL_MS) {
    return;
  }

  writeText(stamp, '');

  await git(cwd, ['fetch', '--quiet', '--no-tags', REMOTE, BRANCH]);
};

const readText = (file: string): string | undefined => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the git common directory.
    return fs.readFileSync(file, 'utf8');
  } catch {
    return undefined;
  }
};

const readSeen = (stateFile: string): string | undefined => {
  const text = readText(stateFile)?.trim();

  return text !== undefined && COMMIT.test(text) ? text : undefined;
};

const onPrompt = async (
  cwd: string,
  stateDir: string,
  stateFile: string,
  now: number,
): Promise<string | undefined> => {
  await fetchMain(cwd, stateDir, now);

  const tip = await git(cwd, [
    'rev-parse',
    '--verify',
    '--quiet',
    `${REMOTE_MAIN}^0`,
  ]);

  if (tip === undefined) {
    return undefined;
  }

  const seen =
    readSeen(stateFile) ?? (await git(cwd, ['merge-base', 'HEAD', tip])) ?? tip;

  const report = seen === tip ? undefined : await buildReport(cwd, seen, tip);

  // Kept at `seen` when git failed, so the next prompt tries the range again.
  // Otherwise written even when nothing changed, so that the first prompt's
  // merge base stays the baseline when `HEAD` moves later in the session: the
  // session still holds the `CLAUDE.md` it started with.
  writeText(stateFile, `${report === FAILED ? seen : tip}\n`);

  return report === FAILED ? undefined : report;
};

/** Removes the state of sessions not seen for `STALE_MS`. */
const pruneStale = (stateDir: string, now: number): void => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the git common directory.
    for (const name of fs.readdirSync(stateDir)) {
      const file = path.join(stateDir, name);

      if (now - modifiedAt(file) > STALE_MS) {
        fs.rmSync(file, { force: true });
      }
    }
  } catch {
    // Nothing to prune.
  }
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const isObject = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null;

/**
 * `isDirectlyExecuted` from `ts-repo-utils`, inlined: this runs with `node`
 * alone (see the header).
 */
const isDirectlyExecuted = (fileUrl: string): boolean =>
  process.argv[1] !== undefined &&
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.realpathSync(fileURLToPath(fileUrl)) === fs.realpathSync(process.argv[1]);

if (isDirectlyExecuted(import.meta.url)) {
  const report = await run(fs.readFileSync(0, 'utf8'));

  if (report !== undefined) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: report,
        },
      }),
    );
  }
}
