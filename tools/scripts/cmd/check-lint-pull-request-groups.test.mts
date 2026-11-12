import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { collectGroupViolations } from './check-lint-pull-request-groups.mjs';

describe(collectGroupViolations, () => {
  test('passes the workflows as they are', async () => {
    const result = collectGroupViolations(
      await read(WORKFLOW),
      await read(CHECK_RESULT),
      await read(RULESET),
    );

    assert.deepStrictEqual(result, Result.ok([]));
  });

  test('fails a label event taken out of the idle group', async () => {
    const violations = await violationsWith(
      "!(github.event.action == 'opened' ||",
      "!(github.event.action == 'opened' || github.event.action == 'labeled' ||",
    );

    assert.deepStrictEqual(violations, [
      'Under `skip-ci`, these are idle edited, synchronize, unlabeled, where it should be edited, labeled, synchronize, unlabeled',
      'Under `skip-ci`, these neither judge nor are idle labeled, where it should be none',
    ]);
  });

  test('fails a judging event put in the idle group', async () => {
    const violations = await violationsWith(
      "!(github.event.action == 'opened' ||\n          (github.event.action",
      '!((github.event.action',
    );

    assert.deepStrictEqual(violations, [
      'Under `skip-ci`, these are idle edited, labeled, opened, synchronize, unlabeled, where it should be edited, labeled, synchronize, unlabeled',
      'These judge in the idle group opened, where it should be none',
    ]);
  });

  test('reads a job as judging whenever its `if` is truthy', async () => {
    const violations = await violationsWith(
      "\n      github.event.action == 'opened' ||",
      "\n      github.event.action == 'opened' || (github.event.action == 'labeled' && 'x') ||",
    );

    assert.deepStrictEqual(violations, [
      'Under `skip-ci`, these judge edited (title), labeled, opened, where it should be edited (title), opened',
      'These judge in the idle group labeled, where it should be none',
    ]);
  });

  test('fails an idle group the runs share', async () => {
    const violations = await violationsWith(
      "format('-idle-{0}', github.run_id)",
      "'-idle'",
    );

    assert.deepStrictEqual(violations, [
      'Under `skip-ci`, these are idle none, where it should be edited, labeled, synchronize, unlabeled',
      'Under `skip-ci`, these neither judge nor are idle edited, labeled, synchronize, unlabeled, where it should be none',
      'These run in a group of their own that is not idle edited, labeled, synchronize, unlabeled, where it should be none',
    ]);
  });

  test('fails a run that judges outside the pull request’s group', async () => {
    const violations = await violationsWith(
      "        '') }}",
      '        github.event.action) }}',
    );

    assert.deepStrictEqual(violations, [
      'These run in a group of their own that is not idle edited, edited (title), labeled, opened, synchronize, unlabeled, where it should be none',
    ]);
  });

  test('fails text between the group and its suffix', async () => {
    const violations = await violationsWith(
      'github.ref) }}${{',
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      'github.ref) }}-${{ github.event.action }}${{',
    );

    assert.lengthOf(violations, 1);

    assert.match(violations[0] ?? '', /^Its concurrency group is not /u);
  });

  test('fails a group that is not the pull request’s', async () => {
    const violations = await violationsWith(
      'github.event.pull_request.number, github.ref',
      'github.ref, github.ref',
    );

    assert.lengthOf(violations, 1);

    assert.match(violations[0] ?? '', /^Its concurrency group is not /u);
  });

  test('asks where a new trigger goes under the label', async () => {
    const violations = await violationsWith(
      '      - opened\n',
      '      - opened\n      - reopened\n',
    );

    assert.deepStrictEqual(violations, [
      'Under `skip-ci`, these are idle edited, labeled, reopened, synchronize, unlabeled, where it should be edited, labeled, synchronize, unlabeled',
    ]);
  });

  test('fails a trigger other than `pull_request_target`', async () => {
    const violations = await violationsWith(
      '\non:\n',
      '\non:\n  workflow_dispatch:\n',
    );

    assert.deepStrictEqual(violations, [
      'It triggers on pull_request_target, workflow_dispatch, where it should be pull_request_target',
    ]);
  });

  test('passes the triggers and the needs in another order', async () => {
    const workflow = await read(WORKFLOW);

    const text = workflow
      .replace('      - opened\n', () => '')
      .replace(
        '      - unlabeled\n',
        () => '      - unlabeled\n      - opened\n',
      )
      .replace(
        '      - semantic-pull-request\n      - commit-messages\n',
        () => '      - commit-messages\n      - semantic-pull-request\n',
      );

    assert.deepStrictEqual(
      collectGroupViolations(
        text,
        await read(CHECK_RESULT),
        await read(RULESET),
      ),
      Result.ok([]),
    );
  });

  test('fails a job that does not take the anchor', async () => {
    const violations = await violationsWith(
      '    if: *judges\n',
      "    if: github.event.action == 'opened'\n",
    );

    assert.deepStrictEqual(violations, [
      '`commit-messages` does not take the same `if` as `semantic-pull-request` (`*judges`)',
    ]);
  });

  test('fails a judging job that needs another', async () => {
    const violations = await violationsWith(
      '  commit-messages:\n',
      '  commit-messages:\n    needs: semantic-pull-request\n',
    );

    assert.deepStrictEqual(violations, [
      '`commit-messages` needs semantic-pull-request, where the jobs that judge should need nothing: a skipped need would skip it whatever its `if`',
    ]);
  });

  test('fails an aggregate that leaves a judging job out', async () => {
    const violations = await violationsWith(
      '      - commit-messages\n      - commit-count\n',
      '      - commit-messages\n',
    );

    assert.deepStrictEqual(violations, [
      '`lint-pull-request-result` needs commit-messages, semantic-pull-request, where it should be commit-count, commit-messages, semantic-pull-request',
    ]);
  });

  test('fails an aggregate that calls another workflow', async () => {
    const violations = await violationsWith(
      '    uses: ./.github/workflows/check-result.yml\n',
      '    uses: ./.github/workflows/other-result.yml\n',
    );

    assert.deepStrictEqual(violations, [
      '`lint-pull-request-result` calls ./.github/workflows/other-result.yml, where it should be ./.github/workflows/check-result.yml',
    ]);
  });

  test('fails an aggregate that passes other needs', async () => {
    const violations = await violationsWith(
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      '      needs: ${{ toJSON(needs) }}\n',
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      '      needs: ${{ toJSON(needs.commit-count) }}\n',
    );

    assert.deepStrictEqual(violations, [
      // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
      '`lint-pull-request-result` passes `needs` as ${{ toJSON(needs.commit-count) }}, where it should be ${{ toJSON(needs) }}',
    ]);
  });

  test('fails an aggregate run on every event', async () => {
    const violations = await violationsWith(
      "    if: always() && !contains(needs.*.result, 'skipped')\n",
      '    if: always()\n',
    );

    assert.deepStrictEqual(violations, [
      "`lint-pull-request-result`'s `if` is always(), where it should be always() && !contains(needs.*.result, 'skipped')",
    ]);
  });

  test('fails a `check-result.yml` that skips every event under the label', async () => {
    const checkResult = await read(CHECK_RESULT);

    const changed = checkResult.replace(
      "(github.event_name != 'pull_request' || !contains(github.event.pull_request.labels.*.name, 'skip-ci'))",
      () => "!contains(github.event.pull_request.labels.*.name, 'skip-ci')",
    );

    assert.notStrictEqual(changed, checkResult);

    const result = collectGroupViolations(
      await read(WORKFLOW),
      changed,
      await read(RULESET),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [RESULT_MESSAGE]);
  });

  test('fails a `check-result.yml` whose `result` is not run on a cancel', async () => {
    const checkResult = await read(CHECK_RESULT);

    const changed = checkResult.replace('      always() &&\n', () => '');

    assert.notStrictEqual(changed, checkResult);

    const result = collectGroupViolations(
      await read(WORKFLOW),
      changed,
      await read(RULESET),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [RESULT_MESSAGE]);
  });

  test('fails a `check-result.yml` that adds a skip under the label', async () => {
    const checkResult = await read(CHECK_RESULT);

    const changed = checkResult.replace(
      '      always() &&\n',
      () =>
        "      always() &&\n      !contains(github.event.pull_request.labels.*.name, 'skip-ci') &&\n",
    );

    assert.notStrictEqual(changed, checkResult);

    const result = collectGroupViolations(
      await read(WORKFLOW),
      changed,
      await read(RULESET),
    );

    assert.isTrue(Result.isOk(result));

    assert.lengthOf(result.value, 1);
  });

  test('fails a `check-result.yml` whose skip is no longer a conjunct', async () => {
    const checkResult = await read(CHECK_RESULT);

    const changed = checkResult.replace(
      "      (github.event_name != 'pull_request' ||",
      () => "      ((github.event_name != 'pull_request') || true ||",
    );

    assert.notStrictEqual(changed, checkResult);

    const result = collectGroupViolations(
      await read(WORKFLOW),
      changed,
      await read(RULESET),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [RESULT_MESSAGE]);
  });

  test('refuses a `check-result.yml` with no `result` job', async () => {
    const checkResult = await read(CHECK_RESULT);

    const changed = checkResult.replace('  result:\n', () => '  verdict:\n');

    assert.notStrictEqual(changed, checkResult);

    assert.deepStrictEqual(
      collectGroupViolations(
        await read(WORKFLOW),
        changed,
        await read(RULESET),
      ),
      Result.err(
        '.github/workflows/check-result.yml: no `result` job with an `if`',
      ),
    );
  });

  test('refuses an expression it does not read', async () => {
    const violations = await resultWith(
      "github.event.changes.title != '')),\n",
      'github.event.changes.title)),\n',
    );

    assert.isTrue(Result.isErr(violations));
  });

  test('fails an aggregate whose `name:` renames the required context', async () => {
    const violations = await violationsWith(
      '  lint-pull-request-result:\n',
      '  lint-pull-request-result:\n    name: Lint\n',
    );

    assert.deepStrictEqual(violations, [
      '`lint-pull-request-result` has a `name:`, which renames the required context `lint-pull-request-result / result`',
    ]);
  });

  test('fails a ruleset that does not require the aggregate', async () => {
    const ruleset = await read(RULESET);

    const changed = ruleset.replace(
      '"lint-pull-request-result / result"',
      () => '"lint-result / result"',
    );

    assert.notStrictEqual(changed, ruleset);

    assert.deepStrictEqual(
      collectGroupViolations(
        await read(WORKFLOW),
        await read(CHECK_RESULT),
        changed,
      ),
      Result.ok([
        'repo-settings/rulesets/main.json does not require `lint-pull-request-result / result`, so the aggregate blocks nothing',
      ]),
    );
  });

  test('fails a ruleset that still requires a job the aggregate judges', async () => {
    const ruleset = await read(RULESET);

    const changed = ruleset.replace(
      '"context": "verify-lockfile",',
      () => '"context": "Validate commit count",',
    );

    assert.notStrictEqual(changed, ruleset);

    assert.deepStrictEqual(
      collectGroupViolations(
        await read(WORKFLOW),
        await read(CHECK_RESULT),
        changed,
      ),
      Result.ok([
        'repo-settings/rulesets/main.json requires `Validate commit count`, which reports `skipped` under `skip-ci` and so satisfies the requirement without a verdict: require `lint-pull-request-result / result` alone',
      ]),
    );
  });

  test('fails a `check-result.yml` whose `result` job is renamed by a `name:`', async () => {
    const checkResult = await read(CHECK_RESULT);

    const changed = checkResult.replace(
      '  result:\n',
      () => '  result:\n    name: Result\n',
    );

    assert.notStrictEqual(changed, checkResult);

    assert.deepStrictEqual(
      collectGroupViolations(
        await read(WORKFLOW),
        changed,
        await read(RULESET),
      ),
      Result.ok([
        ".github/workflows/check-result.yml's `result` job has a `name:`, which renames the required context `lint-pull-request-result / result`",
      ]),
    );
  });

  test('refuses a `case` it does not read', async () => {
    const violations = await resultWith(
      "        '') }}",
      "        '', 'x') }}",
    );

    assert.isTrue(Result.isErr(violations));
  });

  test('refuses an expression that throws, rather than throwing', async () => {
    const violations = await resultWith(
      "github.event.action == 'opened' ||",
      "github.event.action ('opened') ||",
    );

    assert.isTrue(Result.isErr(violations));
  });
});

const WORKFLOW = '.github/workflows/lint-pull-request.yml';

const CHECK_RESULT = '.github/workflows/check-result.yml';

const RULESET = 'repo-settings/rulesets/main.json';

const RESULT_MESSAGE =
  ".github/workflows/check-result.yml's `result` job's `if` is no longer the one this check was written against. The lint's caller passes no `gates` and judges under `skip-ci`: check that a cancelled run still reports red, and a run that judges still reports its verdict rather than `skipped`, which satisfies the required context. Then update RESULT_CONDITION in this check.";

const mut_files = new Map<string, Promise<string>>();

/** A file of the repository, read once for every case. */
const read = (relativePath: string): Promise<string> => {
  const cached =
    mut_files.get(relativePath) ??
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(projectRootPath, relativePath), 'utf8');

  mut_files.set(relativePath, cached);

  return cached;
};

/** The result for the workflow with `from` replaced by `to`, once. */
const resultWith = async (
  from: string,
  to: string,
): Promise<Result<readonly string[], string>> => {
  const text = await read(WORKFLOW);

  assert.include(text, from);

  return collectGroupViolations(
    text.replace(from, () => to),
    await read(CHECK_RESULT),
    await read(RULESET),
  );
};

/** The violations of the workflow with `from` replaced by `to`, once. */
const violationsWith = async (
  from: string,
  to: string,
): Promise<readonly string[]> => {
  const result = await resultWith(from, to);

  assert.isTrue(Result.isOk(result));

  return result.value;
};
