import type { Label } from 'pr-report-core';
import {
  buildIssueGraph,
  omitDone,
  type OpenPullRequestFacts,
} from './issue-graph.mjs';
import type { IssueItem, ReferencedItem } from './load-report.mjs';

describe(buildIssueGraph, () => {
  test('draws every listed issue, free when it declares nothing', () => {
    const graph = build({ issues: [issue(2, []), issue(1, [])] });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, kind, state }) => ({ number, kind, state })),
      [
        { number: 1, kind: 'issue', state: 'free' },
        { number: 2, kind: 'issue', state: 'free' },
      ],
    );

    assert.deepStrictEqual(graph.edges, []);
  });

  test('runs an edge from what is waited for to the issue waiting', () => {
    const graph = build({ issues: [issue(1, []), issue(2, [1])] });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, state }) => [number, state]),
      [
        [1, 'free'],
        [2, 'blocked'],
      ],
    );

    assert.deepStrictEqual(graph.edges, [
      { from: 1, to: 2, kind: 'start-after', settled: false },
    ]);
  });

  test('draws what a declaration names as GitHub described it, and its edge settled once done', () => {
    const graph = build({
      issues: [issue(5, [3, 4])],
      referenced: [
        referencedItem(3, 'pull-request', 'done'),
        referencedItem(4, 'issue', 'done'),
      ],
    });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, kind, state, url }) => ({
        number,
        kind,
        state,
        url,
      })),
      [
        {
          number: 3,
          kind: 'pull-request',
          state: 'done',
          url: 'https://github.com/o/r/pull/3',
        },
        {
          number: 4,
          kind: 'issue',
          state: 'done',
          url: 'https://github.com/o/r/issues/4',
        },
        {
          number: 5,
          kind: 'issue',
          state: 'ready',
          url: 'https://github.com/o/r/issues/5',
        },
      ],
    );

    assert.isTrue(graph.edges.every(({ settled }) => settled));
  });

  test('draws an open pull request a declaration names as open, and what waits on it as blocked', () => {
    const graph = build({
      issues: [issue(5, [3])],
      pulls: [pull(3, [])],
    });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, kind, state }) => ({ number, kind, state })),
      [
        { number: 3, kind: 'pull-request', state: 'open' },
        { number: 5, kind: 'issue', state: 'blocked' },
      ],
    );
  });

  test('draws a number nobody described by its number, as unknown, and the issue naming it for attention', () => {
    const graph = build({ issues: [issue(5, [9])] });

    assert.deepStrictEqual(graph.nodes, [
      {
        number: 5,
        kind: 'issue',
        title: 'Issue 5',
        url: 'https://github.com/o/r/issues/5',
        state: 'attention',
        priority: 'none',
      },
      {
        number: 9,
        kind: 'issue',
        title: '',
        url: 'https://github.com/o/r/issues/9',
        state: 'unknown',
        priority: 'none',
      },
    ]);
  });

  test('draws an open issue past the end of the list as open', () => {
    const graph = build({
      issues: [issue(5, [2])],
      referenced: [referencedItem(2, 'issue', 'waiting')],
    });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, state }) => [number, state]),
      [
        [2, 'open'],
        [5, 'blocked'],
      ],
    );
  });

  test('draws the open pull request closing an issue, and the issue as in progress when it could be started', () => {
    const graph = build({
      issues: [issue(1, []), issue(2, [1])],
      pulls: [pull(7, [1]), pull(8, [2]), pull(9, [42])],
    });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, kind, state }) => ({ number, kind, state })),
      [
        { number: 1, kind: 'issue', state: 'in-progress' },
        // Worked on while still waiting: what it waits for is what matters.
        { number: 2, kind: 'issue', state: 'blocked' },
        { number: 7, kind: 'pull-request', state: 'open' },
        { number: 8, kind: 'pull-request', state: 'open' },
      ],
    );

    assert.deepStrictEqual(graph.edges, [
      { from: 1, to: 2, kind: 'start-after', settled: false },
      { from: 1, to: 7, kind: 'closes', settled: false },
      { from: 2, to: 8, kind: 'closes', settled: false },
    ]);
  });

  test('draws a pull request both named and closing an issue once', () => {
    const graph = build({
      issues: [issue(1, []), issue(2, [7])],
      pulls: [pull(7, [1])],
    });

    assert.deepStrictEqual(
      graph.nodes.map(({ number }) => number),
      [1, 2, 7],
    );

    assert.deepStrictEqual(
      graph.edges.map(({ from, to, kind }) => [from, to, kind]),
      [
        [7, 2, 'start-after'],
        [1, 7, 'closes'],
      ],
    );
  });

  test('carries the priority label of a listed issue and of an open pull request', () => {
    const graph = build({
      issues: [
        issue(1, [], ['priority:high']),
        issue(2, [1], ['bug', 'priority:low']),
        issue(3, [4]),
      ],
      referenced: [referencedItem(4, 'issue', 'waiting')],
      pulls: [pull(7, [1], ['priority:mid'])],
    });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, priority }) => [number, priority]),
      [
        [1, 'high'],
        [2, 'low'],
        [3, 'none'],
        // What a declaration names past the list: its labels are not read.
        [4, 'none'],
        [7, 'mid'],
      ],
    );
  });

  test('marks the issues on a cycle', () => {
    const graph = build({ issues: [issue(1, [2]), issue(2, [1])] });

    assert.deepStrictEqual(
      graph.nodes.map(({ state }) => state),
      ['cycle', 'cycle'],
    );
  });
});

describe(omitDone, () => {
  test('takes out what is done, and every edge that runs from it or to it', () => {
    const graph = build({
      issues: [issue(5, [3, 4]), issue(6, [5])],
      referenced: [
        referencedItem(3, 'pull-request', 'done'),
        referencedItem(4, 'issue', 'done'),
      ],
      pulls: [pull(8, [6])],
    });

    const shown = omitDone(graph);

    assert.deepStrictEqual(
      shown.nodes.map(({ number, state }) => [number, state]),
      [
        [5, 'ready'],
        [6, 'blocked'],
        [8, 'open'],
      ],
    );

    assert.deepStrictEqual(
      shown.edges.map(({ from, to, kind }) => [from, to, kind]),
      [
        [5, 6, 'start-after'],
        [6, 8, 'closes'],
      ],
    );
  });

  test('keeps what closed without being done, since what waits on it needs a look', () => {
    const graph = build({
      issues: [issue(5, [4])],
      referenced: [referencedItem(4, 'issue', 'abandoned')],
    });

    assert.deepStrictEqual(omitDone(graph), graph);
  });

  test('hands back the graph it was given when nothing in it is done', () => {
    const graph = build({ issues: [issue(1, []), issue(2, [1])] });

    assert.strictEqual(omitDone(graph), graph);
  });
});

const REPO_URL = 'https://github.com/o/r';

const build = ({
  issues,
  referenced = [],
  pulls = [],
}: Readonly<{
  issues: readonly IssueItem[];
  referenced?: readonly ReferencedItem[];
  pulls?: readonly OpenPullRequestFacts[];
}>): ReturnType<typeof buildIssueGraph> =>
  buildIssueGraph({ repoUrl: REPO_URL, issues, referenced, pulls });

const issue = (
  number: number,
  startAfter: readonly number[],
  labelNames: readonly string[] = [],
): IssueItem =>
  ({
    number,
    title: `Issue ${number}`,
    author: 'someone',
    url: `${REPO_URL}/issues/${number}`,
    labels: labelNames.map(label),
    createdAt: '2026-09-20T00:00:00Z',
    updatedAt: '2026-09-23T00:00:00Z',
    comments: 0,
    startAfter,
  }) as const;

const referencedItem = (
  number: number,
  kind: ReferencedItem['kind'],
  itemStatus: ReferencedItem['status'],
): ReferencedItem =>
  ({
    number,
    kind,
    title: `Item ${number}`,
    url: `${REPO_URL}/${kind === 'issue' ? 'issues' : 'pull'}/${number}`,
    status: itemStatus,
  }) as const;

const pull = (
  number: number,
  closes: readonly number[],
  labelNames: readonly string[] = [],
): OpenPullRequestFacts =>
  ({
    number,
    title: `Pull request ${number}`,
    url: `${REPO_URL}/pull/${number}`,
    labels: labelNames.map(label),
    linkedIssues: closes.map((issueNumber) => ({
      number: issueNumber,
      title: '',
      url: `${REPO_URL}/issues/${issueNumber}`,
      state: 'open',
    })),
  }) as const;

const label = (labelName: string): Label =>
  ({ name: labelName, color: 'ededed', description: '' }) as const;
