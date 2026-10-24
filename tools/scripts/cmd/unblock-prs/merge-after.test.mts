import {
  issueOrderOf,
  unlinkedClosingIssues,
  waitingOnNote,
  type ClosingIssueAnswer,
} from './merge-after.mjs';
import type { PullRequest } from './types.mjs';

const repo = { owner: 'noshiro-pf', name: 'mono' } as const;

describe(waitingOnNote, () => {
  test('names what the order is waiting on', () => {
    assert.deepStrictEqual(waitingOnNote(pullRequest(), [5], false), {
      kind: 'note',
      note: '#10: Merge-After #5, still open',
    });
  });

  test('says which of them an issue it closes asked for', () => {
    assert.deepStrictEqual(waitingOnNote(pullRequest(), [5, 7], true, [7]), {
      kind: 'note',
      note: '#10: Merge-After #5, #7, still open (#7 from the Start-After of an issue it closes) — and on a Merge-After cycle, so nothing here will move it',
    });
  });
});

describe(issueOrderOf, () => {
  test('reads what GitHub links and what the body closes by keyword', () => {
    const order = issueOrderOf(
      repo,
      [
        {
          number: 10,
          bodyHtml: '',
          // What GitHub records as blocking it counts as the line does.
          linked: [issue(1, 'Start-After: #20', 'OPEN', [21])],
        },
        // Stacked: GitHub links nothing, and marks the keyword.
        { number: 11, bodyHtml: closes(2), linked: [] },
      ],
      new Map([[2, issue(2, 'Start-After: #3, #4')]]),
    );

    assert.deepStrictEqual(
      order.closes,
      new Map([
        [10, [1]],
        [11, [2]],
      ]),
    );

    assert.deepStrictEqual(
      order.startAfter,
      new Map([
        [2, [3, 4]],
        [1, [20, 21]],
      ]),
    );
  });

  test('a closed issue, or one GitHub would not describe, closes nothing', () => {
    const order = issueOrderOf(
      repo,
      [
        {
          number: 10,
          bodyHtml: closes(3),
          linked: [issue(1, 'Start-After: #20', 'CLOSED')],
        },
      ],
      new Map(),
    );

    assert.deepStrictEqual(order.closes, new Map([[10, []]]));
  });
});

describe(unlinkedClosingIssues, () => {
  test('lists the keyword-closed issues GitHub did not link, once each', () => {
    assert.deepStrictEqual(
      unlinkedClosingIssues(repo, [
        { bodyHtml: `${closes(5)}${closes(1)}`, linked: [issue(1, '')] },
        { bodyHtml: closes(5), linked: [] },
      ]),
      [5],
    );
  });
});

const pullRequest = (): PullRequest =>
  ({
    number: 10,
    id: 'PR_10',
    title: '#10',
    body: '',
    state: 'OPEN',
    headRefName: 'fix/a-thing',
    headRefOid: 'c'.repeat(40),
    baseRefName: 'main',
    isCrossRepository: false,
    isDraft: false,
    mergeStateStatus: 'BEHIND',
    autoMergeRequest: null,
    labels: [{ name: 'merge-queued' }],
  }) as const;

const issue = (
  number: number,
  body: string,
  state: string = 'OPEN',
  blockedBy: readonly number[] = [],
): ClosingIssueAnswer => ({ number, state, body, blockedBy }) as const;

/** A closing keyword as GitHub renders one it recognized. */
const closes = (number: number): string =>
  [
    '<p dir="auto"><span class="issue-keyword">Closes</span> ',
    `<a class="issue-link js-issue-link" data-url="https://github.com/${repo.owner}/${repo.name}/issues/${number}"`,
    ` data-hovercard-type="issue" href="https://github.com/${repo.owner}/${repo.name}/issues/${number}">#${number}</a></p>`,
  ].join('');
