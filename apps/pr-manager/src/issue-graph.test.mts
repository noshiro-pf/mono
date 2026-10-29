import type { Label } from 'pr-report-core';
import { DEFAULT_ISSUE_FILTER } from './issue-filter.mjs';
import {
  buildIssueGraph,
  issueStartsOf,
  omitDone,
  omitFilteredIssues,
  omitPending,
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
      { from: 1, to: 2, kind: 'start-after' },
    ]);
  });

  test('draws what a declaration names as GitHub described it', () => {
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
        pending: false,
      },
      {
        number: 9,
        kind: 'issue',
        title: '',
        url: 'https://github.com/o/r/issues/9',
        state: 'unknown',
        priority: 'none',
        pending: false,
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
      { from: 1, to: 2, kind: 'start-after' },
      { from: 1, to: 7, kind: 'closes' },
      { from: 2, to: 8, kind: 'closes' },
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

  test('marks what is labelled pending, of a listed issue and of an open pull request', () => {
    const graph = build({
      issues: [
        issue(1, [], ['pending']),
        issue(2, [1], ['bug']),
        issue(3, [4]),
      ],
      referenced: [referencedItem(4, 'issue', 'waiting')],
      pulls: [pull(7, [2], ['pending'])],
    });

    assert.deepStrictEqual(
      graph.nodes.map(({ number, pending }) => [number, pending]),
      [
        [1, true],
        [2, false],
        [3, false],
        // What a declaration names past the list: its labels are not read.
        [4, false],
        [7, true],
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

describe(issueStartsOf, () => {
  test('each listed issue’s state, and what it names as the graph draws it', () => {
    const issues = [issue(1, []), issue(2, [1, 7]), issue(3, [])] as const;

    const graph = build({
      issues,
      referenced: [referencedItem(7, 'pull-request', 'done')],
      pulls: [pull(9, [3])],
    });

    const starts = issueStartsOf(graph, issues);

    assert.deepStrictEqual(
      Array.from(starts, ([number, { state, named }]) => ({
        number,
        state,
        named: named.map((node) => [node.number, node.state]),
      })),
      [
        { number: 1, state: 'free', named: [] },
        {
          number: 2,
          state: 'blocked',
          named: [
            [1, 'free'],
            [7, 'done'],
          ],
        },
        { number: 3, state: 'in-progress', named: [] },
      ],
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

describe(omitPending, () => {
  test('takes out what is pending, and every edge that runs from it or to it, leaving how the rest stands', () => {
    const graph = build({
      issues: [issue(1, [], ['pending']), issue(2, [1]), issue(3, [])],
      pulls: [pull(7, [3], ['pending'])],
    });

    const shown = omitPending(graph);

    assert.deepStrictEqual(
      shown.nodes.map(({ number, state }) => [number, state]),
      [
        // Still waiting on #1, which is drawn no more.
        [2, 'blocked'],
        [3, 'in-progress'],
      ],
    );

    assert.deepStrictEqual(shown.edges, []);
  });

  test('takes out what is left with no edge that is not a listed issue', () => {
    const graph = build({
      issues: [issue(5, [3], ['pending']), issue(6, [])],
      referenced: [referencedItem(3, 'issue', 'abandoned')],
    });

    assert.deepStrictEqual(
      omitPending(graph).nodes.map(({ number }) => number),
      [6],
    );
  });

  test('hands back the graph it was given when nothing in it is pending', () => {
    const graph = build({ issues: [issue(1, []), issue(2, [1])] });

    assert.strictEqual(omitPending(graph), graph);
  });
});

describe(omitFilteredIssues, () => {
  test('takes out the listed issues of a priority not shown, with what only they name or have closed', () => {
    const graph = build({
      issues: [
        issue(1, [9], ['priority:high']),
        issue(2, [1, 8], ['priority:low']),
        issue(3, [8]),
      ],
      referenced: [referencedItem(8, 'issue', 'waiting')],
      pulls: [pull(7, [2], ['priority:high']), pull(6, [3])],
    });

    const shown = omitFilteredIssues(graph, {
      ...DEFAULT_ISSUE_FILTER,
      hiddenPriorities: ['low'],
      onlyPriorities: [],
    });

    // #9, past the end of the list, waits on nothing and is waited on by #1;
    // #8 is still named by #3; #7 closed only #2.
    assert.deepStrictEqual(
      shown.nodes.map(({ number }) => number),
      [1, 3, 6, 8, 9],
    );

    assert.deepStrictEqual(
      shown.edges.map(({ from, to, kind }) => [from, to, kind]),
      [
        [9, 1, 'start-after'],
        [8, 3, 'start-after'],
        [3, 6, 'closes'],
      ],
    );
  });

  test('keeps one left out that an issue left in waits on, alone, since it is why that one waits', () => {
    const graph = build({
      issues: [
        issue(1, [2], ['priority:high']),
        issue(2, [3, 9], ['priority:low']),
        issue(3, [], ['priority:low']),
      ],
      pulls: [pull(7, [2])],
    });

    const shown = omitFilteredIssues(graph, {
      ...DEFAULT_ISSUE_FILTER,
      hiddenPriorities: [],
      onlyPriorities: ['high'],
    });

    assert.deepStrictEqual(
      shown.nodes.map(({ number, state }) => [number, state]),
      [
        [1, 'blocked'],
        [2, 'blocked'],
      ],
    );

    assert.deepStrictEqual(
      shown.edges.map(({ from, to, kind }) => [from, to, kind]),
      [[2, 1, 'start-after']],
    );
  });

  test('keeps every edge between issues drawn, a cycle through one kept included', () => {
    const graph = build({
      issues: [
        issue(1, [2], ['priority:high']),
        issue(2, [3], ['priority:low']),
        issue(3, [], ['priority:high']),
        issue(4, [5], ['priority:high']),
        issue(5, [4], ['priority:low']),
      ],
    });

    const shown = omitFilteredIssues(graph, {
      ...DEFAULT_ISSUE_FILTER,
      hiddenPriorities: [],
      onlyPriorities: ['high'],
    });

    assert.deepStrictEqual(
      shown.edges.map(({ from, to }) => [from, to]),
      [
        [2, 1],
        [3, 2],
        [5, 4],
        [4, 5],
      ],
    );
  });

  test('keeps the edges a kept issue has to what is drawn for another', () => {
    const graph = build({
      issues: [
        issue(1, [3], ['priority:low']),
        issue(2, [1, 3, 4], ['priority:high']),
      ],
      referenced: [referencedItem(3, 'issue', 'abandoned')],
      pulls: [pull(4, [1])],
    });

    const shown = omitFilteredIssues(graph, {
      ...DEFAULT_ISSUE_FILTER,
      hiddenPriorities: ['low'],
      onlyPriorities: [],
    });

    assert.deepStrictEqual(
      shown.nodes.map(({ number }) => number),
      [1, 2, 3, 4],
    );

    assert.deepStrictEqual(
      shown.edges.map(({ from, to, kind }) => [from, to, kind]),
      [
        [3, 1, 'start-after'],
        [1, 2, 'start-after'],
        [3, 2, 'start-after'],
        [4, 2, 'start-after'],
        [1, 4, 'closes'],
      ],
    );
  });

  test('with priorities picked, keeps only the listed issues of them', () => {
    const graph = build({
      issues: [
        issue(1, [], ['priority:high']),
        issue(2, [], ['priority:mid']),
        issue(3, []),
      ],
    });

    assert.deepStrictEqual(
      omitFilteredIssues(graph, {
        ...DEFAULT_ISSUE_FILTER,
        hiddenPriorities: [],
        onlyPriorities: ['high', 'none'],
      }).nodes.map(({ number }) => number),
      [1, 3],
    );
  });

  test('with pending picked, keeps only the listed issues labelled pending, and what one of them waits on', () => {
    const graph = build({
      issues: [
        issue(1, [], ['priority:high']),
        issue(2, [1], ['pending']),
        issue(3, []),
      ],
      pulls: [pull(7, [3])],
    });

    const shown = omitFilteredIssues(graph, {
      ...DEFAULT_ISSUE_FILTER,
      onlyPending: true,
    });

    // #1 is why #2 waits; #7 closed only #3.
    assert.deepStrictEqual(
      shown.nodes.map(({ number }) => number),
      [1, 2],
    );
  });

  test('hands back the graph it was given when every priority in it is shown', () => {
    const graph = build({
      issues: [issue(1, [], ['priority:high']), issue(2, [1])],
    });

    assert.strictEqual(
      omitFilteredIssues(graph, {
        ...DEFAULT_ISSUE_FILTER,
        hiddenPriorities: ['low'],
        onlyPriorities: [],
      }),
      graph,
    );
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
    misplacedMergeAfter: [],
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
