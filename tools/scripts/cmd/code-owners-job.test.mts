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
import { codeOwnerReview, parseCodeOwners } from 'pr-report-core';
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
  ] as const;

  test.each(cases)(
    'agrees with pr-report-core on $files by $author',
    async ({ files, author, approvers = [] }) => {
      const review = codeOwnerReview({
        required: true,
        rules: parseCodeOwners(codeOwners),
        files,
        filesComplete: true,
        approvers,
        author,
        authorApproves: true,
      });

      const ran = await runJob({ codeOwners, files, author, approvers });

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

/** Runs the job's script with `gh` answered from these, in a temp directory. */
const runJob = async ({
  codeOwners,
  files,
  author,
  approvers,
}: Readonly<{
  codeOwners: string;
  files: readonly string[];
  author: string;
  approvers: readonly string[];
}>): Promise<Readonly<{ passed: boolean; output: string }>> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'code-owners-job-'));

  try {
    await writeText(dir, 'CODEOWNERS', codeOwners);

    await writeText(
      dir,
      'files.json',
      JSON.stringify(files.map((filename) => ({ filename }))),
    );

    await writeText(
      dir,
      'reviews.json',
      JSON.stringify(
        approvers.map((login) => ({ user: { login }, state: 'APPROVED' })),
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
          CHANGED_FILES: files.length.toString(),
          GITHUB_REPOSITORY: 'owner/repo',
          GITHUB_STEP_SUMMARY: path.join(dir, 'summary.md'),
        },
      })
      .then(
        ({ stdout, stderr }) => ({
          passed: true,
          output: `${stdout}${stderr}`,
        }),
        // A failed command rejects with what it wrote on the error.
        (error: unknown) => ({
          passed: false,
          output: isRecord(error)
            ? [error['stdout'], error['stderr']].filter(isString).join('')
            : 'the command could not be run',
        }),
      );

    return result;
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
};

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
  'case "$url" in',
  '  */contents/*) jq -n --arg c "$(base64 -w0 "$FIXTURES/CODEOWNERS")" \'{content: $c}\' | jq -r "$filter" ;;',
  '  */files*) jq -r "$filter" "$FIXTURES/files.json" ;;',
  '  */reviews*) jq -r "$filter" "$FIXTURES/reviews.json" ;;',
  '  *) exit 1 ;;',
  'esac',
  '',
].join('\n');
