import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  checkScheduledFailureReport,
  findScheduledFailureReportViolations,
  REPORT_WORKFLOW,
} from './check-scheduled-failure-report.mjs';

// The names in flow style, so that the fixture is one `dedent` block.
const report = (names: readonly string[]): WorkflowText =>
  ({
    relativePath: REPORT_WORKFLOW,
    text: dedent`
      name: Report scheduled failure

      on:
        workflow_run:
          workflows: [${names.map((name) => JSON.stringify(name)).join(', ')}]
          types:
            - completed

      jobs: {}
    `,
  }) as const;

const scheduled = (file: string, name: string): WorkflowText =>
  ({
    relativePath: `.github/workflows/${file}`,
    text: dedent`
      name: ${name}

      on:
        schedule:
          - cron: '0 0 * * 1'
        workflow_dispatch:

      jobs: {}
    `,
  }) as const;

const onPush = (file: string, name: string): WorkflowText =>
  ({
    relativePath: `.github/workflows/${file}`,
    text: dedent`
      name: ${name}

      on:
        push:
          branches:
            - main

      jobs: {}
    `,
  }) as const;

const messagesOf = (
  workflows: readonly WorkflowText[],
): readonly string[] | string => {
  const found = findScheduledFailureReportViolations(workflows);

  return Result.isOk(found) ? found.value.messages : found.value;
};

describe(findScheduledFailureReportViolations, () => {
  test('accepts a list naming every scheduled workflow and nothing else', () => {
    const found = findScheduledFailureReportViolations([
      scheduled('a.yml', 'Update A'),
      scheduled('b.yml', 'E2E (production)'),
      onPush('c.yml', 'Release'),
      report(['Update A', 'E2E (production)']),
    ]);

    assert.isTrue(Result.isOk(found));

    assert.deepStrictEqual(found.value, {
      reported: ['Update A', 'E2E (production)'],
      messages: [],
    });
  });

  test('names a scheduled workflow the list leaves out', () => {
    assert.deepStrictEqual(
      messagesOf([
        scheduled('a.yml', 'Update A'),
        scheduled('b.yml', 'Update B'),
        report(['Update A']),
      ]),
      [
        `.github/workflows/b.yml: "Update B" runs on a schedule and is not named under on.workflow_run.workflows in ${REPORT_WORKFLOW}, so a failed scheduled run of it would tell nobody.`,
      ],
    );
  });

  // A rename leaves the old name in the list, which then matches nothing.
  test('names a listed name no workflow has', () => {
    assert.deepStrictEqual(
      messagesOf([
        scheduled('a.yml', 'Update A'),
        report(['Update A', 'Gone']),
      ]),
      [
        `${REPORT_WORKFLOW}: on.workflow_run.workflows names "Gone", which is the name of no workflow.`,
      ],
    );
  });

  // Its job reports only a run whose event is `schedule`, so a workflow with no
  // schedule would be listed for nothing.
  test('names a listed workflow that has no schedule', () => {
    assert.deepStrictEqual(
      messagesOf([
        scheduled('a.yml', 'Update A'),
        onPush('c.yml', 'Release'),
        report(['Update A', 'Release']),
      ]),
      [
        `${REPORT_WORKFLOW}: on.workflow_run.workflows names "Release" (.github/workflows/c.yml), which does not run on a schedule.`,
      ],
    );
  });

  // `workflow_run` matches every workflow of a name, so the entry is needed
  // while any of them runs on a schedule.
  test('accepts a name a scheduled and an unscheduled workflow share', () => {
    assert.deepStrictEqual(
      messagesOf([
        scheduled('a.yml', 'Link Check'),
        onPush('b.yml', 'Link Check'),
        report(['Link Check']),
      ]),
      [],
    );
  });

  // `workflow_run` matches by `name:`, and one left out is named by its path,
  // which nobody would think to list.
  test('names a scheduled workflow with no name', () => {
    assert.deepStrictEqual(
      messagesOf([
        {
          relativePath: '.github/workflows/a.yml',
          text: dedent`
            on:
              schedule:
                - cron: '0 0 * * 1'

            jobs: {}
          `,
        },
        report([]),
      ]),
      [
        '.github/workflows/a.yml: runs on a schedule and has no `name:`, which is what on.workflow_run.workflows matches.',
      ],
    );
  });

  test('reads `on:` given as a list or as one event', () => {
    assert.deepStrictEqual(
      messagesOf([
        {
          relativePath: '.github/workflows/a.yml',
          text: dedent`
            name: A
            on: [schedule, push]
            jobs: {}
          `,
        },
        {
          relativePath: '.github/workflows/b.yml',
          text: dedent`
            name: B
            on: schedule
            jobs: {}
          `,
        },
        report([]),
      ]).length,
      2,
    );
  });

  test('reads a `workflows:` with nothing under it as an empty list', () => {
    assert.deepStrictEqual(
      messagesOf([
        {
          relativePath: REPORT_WORKFLOW,
          text: dedent`
            name: R
            on:
              workflow_run:
                workflows:
                types: [completed]
            jobs: {}
          `,
        },
        scheduled('a.yml', 'Update A'),
      ]),
      [
        `.github/workflows/a.yml: "Update A" runs on a schedule and is not named under on.workflow_run.workflows in ${REPORT_WORKFLOW}, so a failed scheduled run of it would tell nobody.`,
      ],
    );
  });

  test('fails when the report workflow is missing or not on workflow_run', () => {
    assert.isTrue(
      Result.isErr(
        findScheduledFailureReportViolations([scheduled('a.yml', 'A')]),
      ),
    );

    assert.isTrue(
      Result.isErr(
        findScheduledFailureReportViolations([
          scheduled('a.yml', 'A'),
          {
            relativePath: REPORT_WORKFLOW,
            text: dedent`
              name: R
              on:
                push:
              jobs: {}
            `,
          },
        ]),
      ),
    );
  });

  test('fails when on.workflow_run.workflows is not a list of names', () => {
    for (const workflows of ['pnpm update', '[1, {a: b}]']) {
      assert.isTrue(
        Result.isErr(
          findScheduledFailureReportViolations([
            {
              relativePath: REPORT_WORKFLOW,
              text: dedent`
                name: R
                on:
                  workflow_run:
                    workflows: ${workflows}
                jobs: {}
              `,
            },
          ]),
        ),
      );
    }
  });

  test('names the file a parse fails on', () => {
    const found = findScheduledFailureReportViolations([
      { relativePath: '.github/workflows/broken.yml', text: 'on: [\n' },
      report([]),
    ]);

    assert.isTrue(
      Result.isErr(found) &&
        found.value.startsWith('.github/workflows/broken.yml: not YAML'),
    );
  });
});

describe(checkScheduledFailureReport, () => {
  test("holds for the repository's own workflows", async () => {
    const result = await checkScheduledFailureReport();

    // `assert.isTrue` takes no message in this repository's typings; the
    // comparison shows the messages when it fails.
    assert.deepStrictEqual(Result.isErr(result) ? result.value : '', '');
  });
});

type WorkflowText = Readonly<{ relativePath: string; text: string }>;
