import {
  claudeSessionUrlOfBody,
  describeOpened,
  emptyList,
  encodeOpenView,
  isSplitViewPage,
  issueUrlOf,
  liveOpenViews,
  openViewKeyOf,
  parseOpenViews,
  pullRequestOf,
  pullRequestTitleOf,
  splitMenuTitle,
  splitOpenQuery,
  splitOpenRequestOf,
  tabsToOpen,
  toolbarPlanOf,
  workerTag,
  type SplitViewList,
} from '../src/index.mjs';

const list: SplitViewList = {
  version: 1,
  entries: [
    { id: 'a', name: 'A', createdAt: 0, pinned: true },
    { id: 'b', name: 'B', createdAt: 0, pinned: false },
  ],
  activeId: 'b',
} as const;

describe('toolbar', () => {
  test('focuses the split view looked at last (#2876)', () => {
    expect(
      toolbarPlanOf(list, [
        { tabId: 1, workspaceId: 'a', viewedAt: 5 },
        { tabId: 2, workspaceId: 'b', viewedAt: 9 },
      ]),
    ).toStrictEqual({ kind: 'focus', tabId: 2 });
  });

  test('a record counts only while its tab holds the page (#2891)', () => {
    const records = [
      { tabId: 1, workspaceId: 'a', viewedAt: 5 },
      { tabId: 2, workspaceId: 'b', viewedAt: 9 },
    ] as const;

    expect(liveOpenViews(records, new Set<number>([1]))).toStrictEqual([
      records[0],
    ]);
  });

  test('opens every saved view when none is open, else a fresh page', () => {
    expect(toolbarPlanOf(list, [])).toStrictEqual({
      kind: 'open-all',
      frontId: 'b',
    });

    expect(toolbarPlanOf({ ...list, activeId: 'gone' }, [])).toStrictEqual({
      kind: 'open-all',
      frontId: 'a',
    });

    expect(toolbarPlanOf(emptyList, [])).toStrictEqual({ kind: 'open-page' });
  });

  test('tabsToOpen skips what is open and keeps pins', () => {
    expect(tabsToOpen(list.entries, new Set<string>(['b']), 'b')).toStrictEqual(
      [{ workspaceId: 'a', pinned: true, active: false }],
    );
  });

  test('describeOpened', () => {
    expect(describeOpened(0, 0)).toBe('There is no saved split view to open.');

    expect(describeOpened(0, 2)).toBe(
      'Every saved split view is already open in a tab.',
    );

    expect(describeOpened(1, 0)).toBe(
      'Opened one split view in a tab of its own.',
    );

    expect(describeOpened(3, 1)).toBe(
      'Opened 3 split views in tabs of their own. One was already open.',
    );
  });
});

describe('context menu', () => {
  test('titles follow the UI language', () => {
    expect(splitMenuTitle('right', 'ja-JP')).toBe('右に分割して開く');

    expect(splitMenuTitle('down', 'en-US')).toBe('Open in a split below');
  });

  test('a split from an ordinary tab', () => {
    expect(
      splitOpenQuery({
        direction: 'right',
        pageUrl: 'https://a.example/',
        linkUrl: 'https://b.example/',
        tabTitle: 'A',
      }),
    ).toBe(
      '?layout=rpp&url=https%3A%2F%2Fa.example%2F&url=https%3A%2F%2Fb.example%2F&name=A',
    );

    expect(
      splitOpenQuery({
        direction: 'down',
        pageUrl: 'https://a.example/',
        linkUrl: undefined,
        tabTitle: '',
      }),
    ).toBe('?layout=cpp&url=https%3A%2F%2Fa.example%2F');

    expect(
      splitOpenQuery({
        direction: 'down',
        pageUrl: 'https://a.example/',
        linkUrl: 'mailto:x@a.example',
        tabTitle: undefined,
      }),
    ).toBeUndefined();

    expect(
      splitOpenQuery({
        direction: 'down',
        pageUrl: 'chrome://newtab',
        linkUrl: undefined,
        tabTitle: undefined,
      }),
    ).toBeUndefined();
  });

  test('a split from inside a split view', () => {
    expect(
      splitOpenRequestOf({
        direction: 'down',
        tabId: 3,
        paneId: 1,
        linkUrl: 'https://b.example/',
      }),
    ).toStrictEqual({
      tag: workerTag,
      kind: 'split-open',
      tabId: 3,
      paneId: 1,
      axis: 'column',
      url: 'https://b.example/',
    });

    expect(
      splitOpenRequestOf({
        direction: 'down',
        tabId: 3,
        paneId: 1,
        linkUrl: 'data:text/html,x',
      }),
    ).toBeUndefined();

    expect(
      isSplitViewPage(
        'chrome-extension://id/split.html?ws=a',
        'chrome-extension://id/split.html',
      ),
    ).toBe(true);
  });
});

describe('GitHub', () => {
  test('pull request and issue addresses', () => {
    expect(
      pullRequestOf('https://github.com/o/r.js/pull/12/files?x=1#y'),
    ).toStrictEqual({ number: 12, url: 'https://github.com/o/r.js/pull/12' });

    expect(pullRequestOf('https://github.com/o/r/issues/12')).toBeUndefined();

    expect(pullRequestOf('http://github.com/o/r/pull/12')).toBeUndefined();

    expect(pullRequestOf('https://github.com/o/r/pull/x')).toBeUndefined();

    expect(issueUrlOf('https://github.com/o/r/issues/3#c')).toBe(
      'https://github.com/o/r/issues/3',
    );
  });

  test('the title in a pull request tab title', () => {
    expect(
      pullRequestTitleOf(
        'Fix · the thing by someone · Pull Request #12 · o/r · GitHub',
      ),
    ).toBe('Fix · the thing');

    expect(
      pullRequestTitleOf('#12 Fix it by someone · Pull Request #12 · o/r'),
    ).toBe('Fix it');

    expect(pullRequestTitleOf('o/r: Issues · GitHub')).toBeUndefined();
  });

  test('the session a description names', () => {
    expect(
      claudeSessionUrlOfBody(
        'Body\n\nClaude-Session: [Title](https://claude.ai/code/session_abc)\n',
      ),
    ).toBe('https://claude.ai/code/session_abc');

    expect(claudeSessionUrlOfBody('none')).toBeUndefined();
  });
});

describe('open view records', () => {
  test('round-trip through session storage', () => {
    const record = { tabId: 12, workspaceId: 'a', viewedAt: 3 } as const;

    expect(
      parseOpenViews({
        [openViewKeyOf(record.tabId)]: encodeOpenView(record),
        'openView:x': encodeOpenView(record),
        'openView:5': { workspaceId: 1, viewedAt: 0 },
        other: 1,
      }),
    ).toStrictEqual([record]);
  });
});
