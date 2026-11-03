import type { IssueStartState, ReportIssue } from 'pr-report-core';
import { passedOverNotes, surveyIssues } from './survey.mjs';

const UPDATED = '2026-10-15T00:00:00Z';

const issue = (
  number: number,
  {
    start = 'free',
    author = 'owner',
    labels = [],
    updatedAt = UPDATED,
  }: Readonly<{
    start?: IssueStartState;
    author?: string;
    labels?: readonly string[];
    updatedAt?: string;
  }> = {},
): ReportIssue =>
  ({
    number,
    title: 'feat: a thing',
    author,
    url: `https://github.com/o/r/issues/${number}`,
    labels: labels.map((name) => ({ name, color: '', description: '' })),
    createdAt: UPDATED,
    updatedAt,
    comments: 0,
    startAfter: [],
    misplacedMergeAfter: [],
    start,
    named: [],
  }) as const;

const OWNER = new Set<string>(['owner']);

const NONE = new Map<number, string | undefined>();

describe(surveyIssues, () => {
  test('takes the startable issues, oldest first', () => {
    const survey = surveyIssues(
      [issue(30), issue(10, { start: 'ready' }), issue(20)],
      OWNER,
      NONE,
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [10, 20, 30],
    );

    assert.deepStrictEqual(survey.fresh[0], {
      number: 10,
      url: 'https://github.com/o/r/issues/10',
      updatedAt: UPDATED,
    });
  });

  test('passes over what is waiting, in a cycle, started or planned', () => {
    const survey = surveyIssues(
      (
        [
          'blocked',
          'cycle',
          'attention',
          'in-progress',
          'planned',
        ] as const satisfies readonly IssueStartState[]
      ).map((start, i) => issue(i + 1, { start })),
      OWNER,
      NONE,
    );

    assert.deepStrictEqual(survey, {
      fresh: [],
      left: [],
      foreign: [],
      held: [],
    });
  });

  test('takes the issues by tier, what has none before D', () => {
    const survey = surveyIssues(
      [
        issue(1, { labels: ['priority:D'] }),
        issue(2),
        issue(3, { labels: ['priority:B'] }),
        issue(4, { labels: ['priority:S'] }),
        issue(5, { labels: ['priority:high'] }),
      ],
      OWNER,
      NONE,
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [4, 3, 2, 5, 1],
    );
  });

  test('holds what is placed under hold or close', () => {
    const survey = surveyIssues(
      [
        issue(1, { labels: ['priority:hold'] }),
        issue(2, { labels: ['priority:close'] }),
        issue(3),
      ],
      OWNER,
      NONE,
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [3],
    );

    assert.deepStrictEqual(survey.held, [1, 2]);
  });

  test('leaves what someone outside the authors wrote, whatever the case of a login', () => {
    const survey = surveyIssues(
      [issue(1, { author: 'stranger' }), issue(2, { author: 'Owner' })],
      OWNER,
      NONE,
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [2],
    );

    assert.deepStrictEqual(survey.foreign, [1]);
  });

  test('leaves a question, a pending one and one that will not be done', () => {
    const survey = surveyIssues(
      [
        issue(1, { labels: ['question'] }),
        issue(2, { labels: ['Pending'] }),
        issue(3, { labels: ['wontfix'] }),
        issue(4, { labels: ['enhancement'] }),
      ],
      OWNER,
      NONE,
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [4],
    );

    assert.deepStrictEqual(survey.held, [1, 2, 3]);
  });

  test('hands an issue on again only once it has changed', () => {
    const attempted = new Map<number, string | undefined>([
      [1, UPDATED],
      [2, '2026-10-01T00:00:00Z'],
      [3, undefined],
    ]);

    const survey = surveyIssues(
      [issue(1), issue(2), issue(3, { updatedAt: '2026-10-20T00:00:00Z' })],
      OWNER,
      attempted,
    );

    assert.deepStrictEqual(
      survey.fresh.map(({ number }) => number),
      [2],
    );

    // One whose state after its session could not be read is held for good.
    assert.deepStrictEqual(survey.left, [1, 3]);
  });
});

describe(passedOverNotes, () => {
  test('says nothing when nothing was passed over', () => {
    assert.deepStrictEqual(
      passedOverNotes({ left: [], foreign: [], held: [] }, ['owner']),
      [],
    );
  });

  test('says apart what a cap stopped from what a session left', () => {
    assert.deepStrictEqual(
      passedOverNotes(
        { left: [3, 4], foreign: [5], held: [6] },
        ['owner'],
        [4],
      ),
      [
        '#3: an earlier run-issue-resolver session left them as they stand; waiting for someone to change them.',
        '#4: a session stopped at its cap; a later run, capping one higher, tries again.',
        '#5: startable, but not written by owner; left to a person.',
        '#6: startable, but labelled duplicate, invalid, question, wontfix, pending, priority:hold, priority:close or the like; left as they are.',
      ],
    );
  });
});
