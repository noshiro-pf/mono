// cspell:ignore esac

/**
 * `lint-pull-request.yml`'s `code-owners` job against `pr-report-core`'s
 * reading of the same `CODEOWNERS`.
 *
 * The job runs on `pull_request_target` without a checkout, so it matches the
 * file in its own shell rather than through `pr-report-core`, which is what the
 * merge queue and the Pull Requests Manager hold a pull request by. Two
 * matchers that disagree would hold one the check passes, or pass one the check
 * fails, and neither would say so: this runs the job's script, with `gh`
 * answered from fixtures, and compares.
 */

import { execFile } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as util from 'node:util';
import { codeOwnerReview, parseCodeOwners, pushersOf } from 'pr-report-core';
import { isRecord, isString } from 'ts-data-forge';
import { projectRootPath } from '../project-root-path.mjs';

describe('the code-owners job of lint-pull-request.yml', () => {
  const codeOwners = [
    '# enforced-by: Validate code owners',
    '/.github/workflows/ @owner',
    '/repo-settings/ @owner @other',
    '/repo-settings/local.json @Third',
    // The last line, with no newline after it, is a rule like any other.
    '/tools/configs/gate-ignore-lists.json @owner',
  ].join('\n');

  const cases: readonly Readonly<{
    files: readonly string[];
    author: string;
    approvers?: readonly string[];
    /** Who pushed to the branch, `[author]` unless given. */
    pushers?: readonly string[] | 'unknown';
  }>[] = [
    { files: ['libs/a/src/x.mts'], author: 'bot' },
    { files: ['.github/workflows/release.yml'], author: 'bot' },
    { files: ['.github/workflows/release.yml'], author: 'Owner' },
    {
      files: ['.github/workflows/release.yml'],
      author: 'bot',
      approvers: ['OWNER'],
    },
    { files: ['repo-settings/rulesets/main.json'], author: 'other' },
    { files: ['repo-settings/local.json'], author: 'owner' },
    { files: ['repo-settings/local.json'], author: 'third' },
    { files: ['tools/configs/gate-ignore-lists.json'], author: 'bot' },
    { files: ['tools/configs/gate-ignore-lists.json.bak'], author: 'bot' },
    { files: ['.github/workflowsX/a.yml'], author: 'bot' },
    // Another writer on the owner's branch: the owner no longer stands alone.
    {
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      pushers: ['owner', 'helper'],
    },
    {
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      pushers: ['Owner'],
    },
    {
      files: ['repo-settings/rulesets/main.json'],
      author: 'owner',
      pushers: ['owner', 'other'],
    },
    {
      files: ['repo-settings/rulesets/main.json'],
      author: 'owner',
      pushers: ['owner', 'helper'],
      approvers: ['other'],
    },
    { files: ['libs/a/src/x.mts'], author: 'owner', pushers: 'unknown' },
    // A creator whose account is gone (`''`, sent as `null`).
    {
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      pushers: ['', 'owner'],
    },
    {
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      pushers: 'unknown',
    },
  ] as const;

  test.each(cases)(
    'agrees with pr-report-core on $files by $author, pushed by $pushers',
    async ({ files, author, approvers = [], pushers = [author] }) => {
      const review = codeOwnerReview({
        required: true,
        rules: parseCodeOwners(codeOwners),
        files,
        filesComplete: true,
        approvers,
        author,
        authorApproves: true,
        // Who pushed as `pr-report-core` reads the same activity, so that the
        // two readings of the chain are compared too.
        pushers: pushersOf(
          activityOf(pushers === 'unknown' ? [author] : pushers).map(
            ({ activity_type: activityType, before, after, actor }) => ({
              activityType,
              before,
              after,
              actor: actor?.login,
            }),
          ),
          headOf(pushers),
        ),
      });

      const ran = await runJob({
        codeOwners,
        files,
        author,
        approvers,
        pushers,
      });

      // The output in the comparison, so that a disagreement shows why.
      assert.deepStrictEqual(
        { passed: ran.passed, output: ran.output },
        { passed: review.state !== 'required', output: ran.output },
      );
    },
  );

  // A line the job cannot read fails it for everyone, so the file it reads has
  // to stay within what the job reads.
  test("reads the repository's own CODEOWNERS", async () => {
    const ran = await runJob({
      codeOwners: await readText(
        path.join(projectRootPath, '.github/CODEOWNERS'),
      ),
      files: ['libs/a/src/x.mts'],
      author: 'someone',
      approvers: [],
    });

    assert.deepStrictEqual(
      { passed: ran.passed, output: ran.output },
      { passed: true, output: ran.output },
    );
  });

  // GraphQL's `files` has only the new name, so `unblock-prs` counts a pull
  // request with a rename as one whose files it has not all read, and holds the
  // red check rather than re-running it (`reviewStateOf` in
  // `unblock-prs/github.mts`, `codeOwnersClassification` in `triage.mts`).
  test('counts a rename from both ends', async () => {
    const ran = await runJob({
      codeOwners,
      files: [
        {
          filename: 'libs/a/release.yml',
          previous_filename: '.github/workflows/release.yml',
        },
      ],
      author: 'bot',
      approvers: [],
    });

    assert.isFalse(ran.passed);

    assert.include(ran.output, '.github/workflows/release.yml (@owner)');
  });

  // Counted by lines, a name holding a newline would make two files read as
  // three and cover for one past the endpoint's cap.
  test('counts a name holding a newline as one file', async () => {
    const ran = await runJob({
      codeOwners,
      files: ['libs/a\nb.mts', 'libs/c.mts'],
      changedFiles: 3,
      author: 'bot',
      approvers: [],
    });

    assert.isFalse(ran.passed);

    assert.include(ran.output, 'the API listed 2');
  });

  // A deleted account's review has no user; it approves nobody's path.
  test('reads a review whose reviewer is gone', async () => {
    const ran = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'bot',
      approvers: [],
      reviews: [
        { user: null, state: 'APPROVED' },
        { user: { login: 'owner' }, state: 'APPROVED' },
      ],
    });

    assert.deepStrictEqual(
      { passed: ran.passed, output: ran.output },
      { passed: true, output: ran.output },
    );

    const alone = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'bot',
      approvers: [],
      reviews: [{ user: null, state: 'APPROVED' }],
    });

    assert.isFalse(alone.passed);
  });

  // A fork's pushes are not this repository's activity, and a chain that does
  // not reach the head (a push not recorded yet, or a gap) says nothing about
  // who wrote it: the author stands for nothing either way.
  test('tells no writers for a fork, or a chain short of the head', async () => {
    const forked = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      approvers: [],
      headRepo: 'owner/fork',
    });

    assert.isFalse(forked.passed);

    assert.include(forked.output, 'cannot be told');

    const short = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      approvers: [],
      pushers: 'unknown',
    });

    assert.isFalse(short.passed);
  });

  // As `pushersOf` reads it: a creator with no account left is a writer who
  // cannot be told, not one who can be left out.
  test('tells no writers when the branch’s creator is gone', async () => {
    const ran = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      approvers: [],
      pushers: ['', 'owner'],
    });

    assert.isFalse(ran.passed);

    assert.include(ran.output, 'cannot be told');
  });

  // Who pushed matters only to a path the author owns that no owner approved;
  // anything else costs no read of the activity, and no wait for it.
  test('reads who pushed only where it decides', async () => {
    const bot = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'bot',
      approvers: [],
    });

    assert.isFalse(bot.passed);

    assert.notInclude(bot.output, 'stands for');

    const approved = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      approvers: ['owner'],
      pushers: ['owner', 'helper'],
    });

    assert.isTrue(approved.passed);

    for (const ran of [bot, approved]) {
      assert.isFalse(ran.calls.some((call) => call.endsWith('/activity')));
    }

    const owned = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml', '.github/workflows/ci.yml'],
      author: 'owner',
      approvers: [],
    });

    assert.isTrue(owned.passed);

    assert.strictEqual(
      owned.calls.filter((call) => call.endsWith('/activity')).length,
      1,
    );
  });

  test('names who wrote what it holds', async () => {
    const ran = await runJob({
      codeOwners,
      files: ['.github/workflows/release.yml'],
      author: 'owner',
      approvers: [],
      pushers: ['owner', 'Helper'],
    });

    assert.isFalse(ran.passed);

    assert.include(ran.output, 'written by helper owner');
  });

  test('fails on a line it cannot read', async () => {
    const ran = await runJob({
      codeOwners: '/docs/ @owner\n*.md @owner\n',
      files: ['libs/a/src/x.mts'],
      author: 'owner',
      approvers: [],
    });

    assert.isFalse(ran.passed);

    assert.include(ran.output, 'cannot read');
  });
});

// The paths below are this test's own temp directory and the repository's
// files, never input.
const readText = async (file: string): Promise<string> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(file, 'utf8');

/** The `run:` block of the job's one step, as the runner gets it. */
const jobScript = async (): Promise<string> => {
  const workflow = await readText(
    path.join(projectRootPath, '.github/workflows/lint-pull-request.yml'),
  );

  const lines = workflow.split('\n');

  const job = lines.indexOf('  code-owners:');

  const run = lines.findIndex(
    (line, index) => index > job && line === '        run: |',
  );

  // lint-pull-request.yml has a code-owners job, and the job a run block.
  assert.isAbove(job, -1);

  assert.isAbove(run, job);

  const body = lines
    .slice(run + 1)
    .findIndex((line) => line !== '' && !line.startsWith(' '.repeat(10)));

  return lines
    .slice(run + 1, body === -1 ? undefined : run + 1 + body)
    .map((line) => line.slice(' '.repeat(10).length))
    .join('\n');
};

const writeText = async (
  dir: string,
  name: string,
  text: string,
  mode = 0o644,
): Promise<void> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.writeFile(path.join(dir, name), text, { mode });

const push = (
  activityType: string,
  before: string,
  after: string,
  login: string,
): Activity =>
  ({
    activity_type: activityType,
    before,
    after,
    ref: 'refs/heads/feature',
    // `''` stands for a deleted account, which GitHub sends as `null`.
    actor: login === '' ? null : ({ login } as const),
  }) as const;

/**
 * The branch's activity as the API lists it, oldest first: an unrelated push to
 * another life of the branch, its deletion, then its creation by the first of
 * `actors` and a push by each of the rest, chained `before` to `after`.
 */
const activityOf = (actors: readonly string[]): readonly Activity[] =>
  [
    push('push', 'old-1', 'old-2', 'stranger'),
    push('branch_deletion', 'old-2', '0'.repeat(40), 'stranger'),
    ...actors.map((actor, index) =>
      push(
        index === 0 ? 'branch_creation' : 'force_push',
        index === 0 ? '0'.repeat(40) : `sha-${index - 1}`,
        `sha-${index}`,
        actor,
      ),
    ),
  ] as const;

/** The head the chain of `actors` ends at; `'unknown'` is one it misses. */
const headOf = (actors: readonly string[] | 'unknown'): string =>
  actors === 'unknown'
    ? 'not-recorded-yet'
    : (`sha-${actors.length - 1}` as const);

/**
 * Runs the job's script with `gh` answered from these, in a temp directory.
 * `changedFiles` is the event's count, `files.length` unless given; `reviews`
 * replaces the approvals `approvers` makes.
 */
const runJob = async ({
  codeOwners,
  files,
  changedFiles = files.length,
  author,
  approvers,
  reviews = approvers.map((login) => ({ user: { login }, state: 'APPROVED' })),
  pushers = [author],
  headRepo = 'owner/repo',
}: Readonly<{
  codeOwners: string;
  files: readonly (
    string | Readonly<{ filename: string; previous_filename: string }>
  )[];
  changedFiles?: number;
  author: string;
  approvers: readonly string[];
  reviews?: readonly Readonly<{
    user: Readonly<{ login: string }> | null;
    state: string;
  }>[];
  /**
   * Who pushed, in order, the first creating the branch; `'unknown'` is a chain
   * that stops short of the head.
   */
  pushers?: readonly string[] | 'unknown';
  headRepo?: string;
}>): Promise<
  Readonly<{
    passed: boolean;
    output: string;
    /** The API paths `gh` was asked for, in order. */
    calls: readonly string[];
  }>
> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-owners-job-'));

  try {
    await writeText(dir, 'CODEOWNERS', codeOwners);

    await writeText(
      dir,
      'files.json',
      JSON.stringify(
        files.map((file) => (isString(file) ? { filename: file } : file)),
      ),
    );

    await writeText(dir, 'reviews.json', JSON.stringify(reviews));

    await writeText(
      dir,
      'activity.json',
      // Newest first, as the job asks for it.
      JSON.stringify(
        activityOf(pushers === 'unknown' ? [author] : pushers).toReversed(),
      ),
    );

    await writeText(dir, 'gh', FAKE_GH, 0o755);

    await writeText(dir, 'run.sh', await jobScript());

    const result = await util
      .promisify(execFile)('bash', ['-e', path.join(dir, 'run.sh')], {
        cwd: dir,
        env: {
          PATH: `${dir}:${process.env['PATH'] ?? ''}`,
          FIXTURES: dir,
          GH_TOKEN: 'token',
          PR_NUMBER: '1',
          AUTHOR: author,
          BASE_SHA: 'base',
          HEAD_SHA: headOf(pushers),
          HEAD_REF: 'feature',
          HEAD_REPO: headRepo,
          PUSHES_RETRY_SECONDS: '0',
          CHANGED_FILES: changedFiles.toString(),
          GITHUB_REPOSITORY: 'owner/repo',
          GITHUB_STEP_SUMMARY: path.join(dir, 'summary.md'),
        },
      })
      .then(({ stdout, stderr }) => ({
        passed: true,
        output: `${stdout}${stderr}`,
      }))
      // A failed command rejects with what it wrote on the error.
      .catch((error: unknown) => ({
        passed: false,
        output: isRecord(error)
          ? [error['stdout'], error['stderr']].filter(isString).join('')
          : 'the command could not be run',
      }));

    const calls = await readText(path.join(dir, 'calls.log')).catch(() => '');

    return {
      ...result,
      calls: calls.split('\n').filter((line) => line !== ''),
    };
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};

/** One entry of `GET /repos/{owner}/{repo}/activity`, as far as it is read. */
type Activity = Readonly<{
  activity_type: string;
  before: string;
  after: string;
  ref: string;
  /** `null` for a deleted account, as GitHub sends it. */
  actor: Readonly<{ login: string }> | null;
}>;

/** `gh api <path> --jq <filter>`, answered from the files in `$FIXTURES`. */
const FAKE_GH = [
  '#!/usr/bin/env bash',
  "url=''",
  "filter='.'",
  'while [ $# -gt 0 ]; do',
  '  case "$1" in',
  '    --jq) shift; filter="$1" ;;',
  '    repos/*) url="$1" ;;',
  '  esac',
  '  shift',
  'done',
  'echo "$url" >>"$FIXTURES/calls.log"',
  'case "$url" in',
  '  */contents/*) jq -n --arg c "$(base64 -w0 "$FIXTURES/CODEOWNERS")" \'{content: $c}\' | jq -r "$filter" ;;',
  '  */files*) jq -r "$filter" "$FIXTURES/files.json" ;;',
  '  */reviews*) jq -r "$filter" "$FIXTURES/reviews.json" ;;',
  '  */activity*) jq -r "$filter" "$FIXTURES/activity.json" ;;',
  '  *) exit 1 ;;',
  'esac',
  '',
].join('\n');
