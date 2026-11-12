import { Result } from 'ts-data-forge';
import type { IssueClaim } from '../conventions/index.mjs';
import type { IssueFacts } from '../snapshot/index.mjs';
import type { IssueStartState } from './issues.mjs';
import type { IssueDecision } from './queue.mjs';
import { heldThemes, surveyIssues, type IssueSurvey } from './startable.mjs';

const UPDATED = '2026-10-15T00:00:00Z';

const decided = (
  number: number,
  {
    start = 'free',
    claim,
    ...fields
  }: Partial<IssueFacts> &
    Readonly<{
      start?: IssueStartState;
      claim?: IssueDecision['claim'];
    }> = {},
): IssueDecision =>
  ({
    facts: {
      number,
      state: 'open',
      stateReason: undefined,
      title: 'feat: a thing',
      body: '',
      author: 'owner',
      url: `https://github.com/o/r/issues/${number}`,
      labels: [],
      createdAt: UPDATED,
      updatedAt: UPDATED,
      commentCount: 0,
      blockedBy: Result.ok([]),
      comments: Result.ok([]),
      ...fields,
    },
    waitsFor: [],
    start,
    named: [],
    claim,
    unread: undefined,
  }) as const;

const labelled = (...names: readonly string[]): IssueFacts['labels'] =>
  names.map((name) => ({ name, color: '', description: '' }));

const survey = (
  issues: readonly IssueDecision[],
  attempted: ReadonlyMap<number, string | undefined> = new Map<
    number,
    string | undefined
  >(),
): IssueSurvey => surveyIssues(issues, { authors: ['owner'], attempted });

const started = (
  number: number,
  title: string,
  fields: Parameters<typeof decided>[1] = {},
): IssueDecision => decided(number, { start: 'in-progress', title, ...fields });

const claimedBy = (by: string): IssueClaim =>
  ({ state: 'started', by, at: UPDATED }) as const;

describe(surveyIssues, () => {
  test('takes the startable issues, lowest number first', () => {
    const { fresh } = survey([
      decided(30),
      decided(10, { start: 'ready' }),
      decided(20),
    ]);

    assert.deepStrictEqual(
      fresh.map(({ number }) => number),
      [10, 20, 30],
    );

    assert.deepStrictEqual(fresh[0], {
      number: 10,
      title: 'feat: a thing',
      url: 'https://github.com/o/r/issues/10',
      updatedAt: UPDATED,
      issueTier: 'none',
      rank: 4,
      tier: 'other',
      themes: [],
      primary: [],
    });
  });

  test('passes over what is waiting, in a cycle, started or planned', () => {
    const states = [
      'blocked',
      'attention',
      'cycle',
      'in-progress',
      'planned',
    ] as const;

    const result = survey(states.map((start, i) => decided(i + 1, { start })));

    assert.deepStrictEqual(result, {
      fresh: [],
      left: [],
      foreign: [],
      held: [],
    });
  });

  test('takes the issues by tier, what has none before D', () => {
    const { fresh } = survey([
      decided(1, { labels: labelled('priority:D') }),
      decided(2),
      decided(3, { labels: labelled('priority:B') }),
      decided(4, { labels: labelled('priority:S') }),
    ]);

    assert.deepStrictEqual(
      fresh.map(({ number, tier }) => [number, tier]),
      [
        [4, 'S'],
        [3, 'other'],
        [2, 'other'],
        [1, 'D'],
      ],
    );
  });

  test('holds what is placed under hold or close, a question, a pending one and one that will not be done', () => {
    const result = survey([
      decided(1, { labels: labelled('priority:hold') }),
      decided(2, { labels: labelled('priority:close') }),
      decided(3, { labels: labelled('Question') }),
      decided(4, { labels: labelled('pending') }),
      decided(5, { labels: labelled('wontfix') }),
      decided(6),
    ]);

    assert.deepStrictEqual(result.held, [1, 2, 3, 4, 5]);

    assert.deepStrictEqual(
      result.fresh.map(({ number }) => number),
      [6],
    );
  });

  test('leaves what someone outside the authors wrote, whatever the case of a login', () => {
    const result = surveyIssues(
      [decided(1, { author: 'Owner' }), decided(2, { author: 'stranger' })],
      { authors: ['OWNER'], attempted: new Map<number, string | undefined>() },
    );

    assert.deepStrictEqual(
      result.fresh.map(({ number }) => number),
      [1],
    );

    assert.deepStrictEqual(result.foreign, [2]);
  });

  test('hands an issue on again only once it has changed', () => {
    const result = survey(
      [
        decided(1),
        decided(2, { updatedAt: '2026-10-16T00:00:00Z' }),
        decided(3),
      ],
      new Map<number, string | undefined>([
        [1, UPDATED],
        [2, UPDATED],
        [3, undefined],
      ]),
    );

    assert.deepStrictEqual(result.left, [1, 3]);

    assert.deepStrictEqual(
      result.fresh.map(({ number }) => number),
      [2],
    );
  });

  test('reads each one’s themes from its title and body', () => {
    const { fresh } = survey([
      decided(1, {
        title: 'unblock-prs: a thing',
        body: 'In `libs/pr-merge-queue/src/unblock-prs/main.mts` and `libs/ts-data-forge`.',
      }),
    ]);

    assert.deepStrictEqual(fresh[0]?.themes, [
      'pr-merge-queue',
      'ts-data-forge',
      'unblock-prs',
    ]);

    assert.deepStrictEqual(fresh[0]?.primary, [
      'pr-merge-queue',
      'unblock-prs',
    ]);
  });
});

describe(heldThemes, () => {
  test('every started issue holds its primary themes with no asker', () => {
    assert.deepStrictEqual(
      heldThemes(
        [
          started(1, 'ci: a', { claim: claimedBy('me') }),
          decided(2, { title: 'tooling: b' }),
        ],
        undefined,
      ),
      { held: new Map<string, readonly number[]>([['ci', [1]]]), unread: [] },
    );
  });

  test('leaves out the asker’s own, and keeps one with no claim', () => {
    assert.deepStrictEqual(
      heldThemes(
        [
          started(1, 'ci: a', { claim: claimedBy('me') }),
          started(2, 'feat(synstate): b', { claim: claimedBy('them') }),
          started(3, 'chore(tools): c'),
        ],
        'me',
      ).held,
      new Map<string, readonly number[]>([
        ['synstate', [2]],
        ['tooling', [3]],
      ]),
    );
  });

  test('counts one whose comments are unread as another’s, and names it', () => {
    assert.deepStrictEqual(
      heldThemes(
        [
          started(1, 'ci: a', {
            comments: Result.err({
              kind: 'unavailable',
              what: 'comments',
              message: '502',
            }),
          }),
        ],
        'me',
      ),
      { held: new Map<string, readonly number[]>([['ci', [1]]]), unread: [1] },
    );
  });
});
