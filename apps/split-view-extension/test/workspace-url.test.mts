import {
  createPane,
  findPane,
  formatLayoutSpec,
  initialWorkspaceState,
  paneIdsOf,
  paneNode,
  parseWorkspaceUrl,
  splitNode,
  workspaceReducer,
  workspaceUrlSearch,
  type WorkspaceState,
} from '../src/index.mjs';

/** Two columns at 7:3 — the layout a pull request review wants. */
const review: WorkspaceState = {
  version: 1,
  root: splitNode('row', paneNode(0), paneNode(1), 0.7),
  panes: [
    {
      ...createPane(0),
      url: 'https://github.com/noshiro-pf/mono/pull/2052/files',
    },
    {
      ...createPane(1),
      url: 'https://github.com/noshiro-pf/mono/pull/2052',
    },
  ],
  nextPaneId: 2,
  activePaneId: 0,
} as const;

const urlsOf = (state: WorkspaceState): readonly string[] =>
  paneIdsOf(state.root).map((paneId) => findPane(state, paneId)?.url ?? '?');

describe('workspaceUrlSearch', () => {
  test('names the workspace, the layout and the addresses, in tree order', () => {
    assert.deepStrictEqual(
      workspaceUrlSearch('pr', review),
      '?ws=pr&layout=r70pp&url=https://github.com/noshiro-pf/mono/pull/2052/files&url=https://github.com/noshiro-pf/mono/pull/2052',
    );
  });

  test('leaves the zoom and the sandbox out while they are the defaults', () => {
    const zoomed = workspaceReducer(review, {
      type: 'zoom',
      paneId: 1,
      step: 'out',
    });

    const sandboxOff = workspaceReducer(review, {
      type: 'set-sandboxed',
      paneId: 0,
      sandboxed: false,
    });

    assert.isTrue(
      workspaceUrlSearch('pr', zoomed).endsWith('&zoom=1&zoom=0.9'),
    );

    assert.isTrue(
      workspaceUrlSearch('pr', sandboxOff).endsWith('&sandbox=0&sandbox=1'),
    );
  });

  test('writes where the pane has navigated to, not where it was pointed', () => {
    const navigated = workspaceReducer(review, {
      type: 'report',
      paneId: 0,
      url: 'https://github.com/noshiro-pf/mono/pull/2052/commits',
      title: 'Commits',
      historyLength: 2,
    });

    assert.isTrue(
      workspaceUrlSearch('pr', navigated).includes(
        '&url=https://github.com/noshiro-pf/mono/pull/2052/commits&',
      ),
    );
  });

  test('keeps an address readable, and only what would break the query is escaped', () => {
    const state = workspaceReducer(review, {
      type: 'navigate',
      paneId: 1,
      input: 'https://example.com/a b?x=1&y=2#top',
    });

    assert.deepStrictEqual(
      workspaceUrlSearch('pr', state),
      '?ws=pr&layout=r70pp&url=https://github.com/noshiro-pf/mono/pull/2052/files&url=https://example.com/a+b%3Fx%3D1%26y%3D2%23top',
    );
  });

  test('drops the empty panes at the end', () => {
    const state = workspaceReducer(initialWorkspaceState(), {
      type: 'navigate',
      paneId: 0,
      input: 'https://example.com',
    });

    assert.deepStrictEqual(
      workspaceUrlSearch('one', state),
      '?ws=one&layout=rcppcpp&url=https://example.com',
    );

    assert.deepStrictEqual(
      workspaceUrlSearch('one', initialWorkspaceState()),
      '?ws=one&layout=rcppcpp',
    );
  });
});

describe('parseWorkspaceUrl', () => {
  test('reads back what workspaceUrlSearch wrote', () => {
    const zoomed = workspaceReducer(review, {
      type: 'zoom',
      paneId: 1,
      step: 'out',
    });

    const request = parseWorkspaceUrl(workspaceUrlSearch('pr', zoomed));

    assert.deepStrictEqual(request.workspaceId, 'pr');

    assert.deepStrictEqual(request.name, undefined);

    assert.deepStrictEqual(request.state, zoomed);
  });

  test('is only a workspace id when the URL says nothing else', () => {
    assert.deepStrictEqual(parseWorkspaceUrl('?ws=abc'), {
      workspaceId: 'abc',
      name: undefined,
      state: undefined,
    });

    assert.deepStrictEqual(parseWorkspaceUrl(''), {
      workspaceId: undefined,
      name: undefined,
      state: undefined,
    });

    assert.deepStrictEqual(parseWorkspaceUrl('?ws=').workspaceId, undefined);
  });

  test('builds a view from the layout, the addresses and the zoom alone', () => {
    const request = parseWorkspaceUrl(
      '?layout=r70pp&url=github.com/noshiro-pf/mono/pull/2052/files&url=github.com/noshiro-pf/mono/pull/2052&zoom=1&zoom=0.75&name=PR%202052',
    );

    assert.deepStrictEqual(request.workspaceId, undefined);

    assert.deepStrictEqual(request.name, 'PR 2052');

    assert.isTrue(request.state !== undefined);

    assert.deepStrictEqual(formatLayoutSpec(request.state.root), 'r70pp');

    // Addresses are read as the address bar reads them, so a bare host works.
    assert.deepStrictEqual(urlsOf(request.state), [
      'https://github.com/noshiro-pf/mono/pull/2052/files',
      'https://github.com/noshiro-pf/mono/pull/2052',
    ]);

    assert.deepStrictEqual(
      request.state.panes.map((pane) => pane.zoom),
      [1, 0.75],
    );

    assert.deepStrictEqual(request.state.nextPaneId, 2);

    assert.deepStrictEqual(request.state.activePaneId, 0);
  });

  test('reads an address that has a query and a fragment of its own', () => {
    const address =
      'https://github.com/noshiro-pf/mono/pulls?q=is%3Apr+is%3Aopen&page=2#start';

    const params = new URLSearchParams([
      ['layout', 'rpp'],
      ['url', address],
      ['url', 'https://example.com/?a=1&b=2'],
    ]);

    const request = parseWorkspaceUrl(`?${params.toString()}`);

    assert.deepStrictEqual(
      request.state === undefined ? undefined : urlsOf(request.state),
      [address, 'https://example.com/?a=1&b=2'],
    );

    // And what the page writes back reads the same.
    assert.deepStrictEqual(
      request.state === undefined
        ? undefined
        : parseWorkspaceUrl(
            workspaceUrlSearch('x', request.state),
          ).state?.panes.map((pane) => pane.url),
      [address, 'https://example.com/?a=1&b=2'],
    );
  });

  test('takes a preset name as the layout', () => {
    const request = parseWorkspaceUrl('?layout=grid-2x2&url=https://a.test');

    assert.deepStrictEqual(
      request.state === undefined
        ? undefined
        : formatLayoutSpec(request.state.root),
      'rcppcpp',
    );

    assert.deepStrictEqual(
      request.state === undefined ? undefined : urlsOf(request.state),
      ['https://a.test', '', '', ''],
    );
  });

  test('puts addresses with no layout side by side', () => {
    const request = parseWorkspaceUrl(
      '?url=https://a.test&url=https://b.test&url=https://c.test',
    );

    assert.deepStrictEqual(
      request.state === undefined
        ? undefined
        : formatLayoutSpec(request.state.root),
      'r33.3prpp',
    );
  });

  test('does the same for a layout it cannot read, rather than dropping the addresses', () => {
    const request = parseWorkspaceUrl('?layout=nonsense&url=https://a.test');

    assert.deepStrictEqual(
      request.state === undefined
        ? undefined
        : formatLayoutSpec(request.state.root),
      'p',
    );
  });

  test('is no view at all when there is neither a layout nor an address', () => {
    assert.deepStrictEqual(
      parseWorkspaceUrl('?ws=abc&zoom=2&name=x').state,
      undefined,
    );

    assert.deepStrictEqual(parseWorkspaceUrl('?layout=').state, undefined);

    assert.deepStrictEqual(parseWorkspaceUrl('?layout=zzz').state, undefined);
  });

  test('ignores the addresses beyond the panes, and fills the panes beyond the addresses', () => {
    const request = parseWorkspaceUrl(
      '?layout=rpp&url=https://a.test&url=https://b.test&url=https://c.test',
    );

    assert.deepStrictEqual(
      request.state === undefined ? undefined : urlsOf(request.state),
      ['https://a.test', 'https://b.test'],
    );

    const short = parseWorkspaceUrl('?layout=rpcpp&url=https://a.test');

    assert.deepStrictEqual(
      short.state === undefined ? undefined : urlsOf(short.state),
      ['https://a.test', '', ''],
    );
  });

  test('clamps a zoom, and reads an unreadable one as 100%', () => {
    const request = parseWorkspaceUrl('?layout=rpp&zoom=9&zoom=big');

    assert.deepStrictEqual(
      request.state?.panes.map((pane) => pane.zoom),
      [2, 1],
    );
  });

  test('turns the sandbox off for a pane only on an explicit 0', () => {
    const request = parseWorkspaceUrl('?layout=rpcpp&sandbox=0&sandbox=1');

    assert.deepStrictEqual(
      request.state?.panes.map((pane) => pane.sandboxed),
      [false, true, true],
    );
  });

  test('sends a scheme a pane will not load to a search, as the address bar does', () => {
    const request = parseWorkspaceUrl('?layout=p&url=javascript:alert(1)');

    assert.isTrue(
      (request.state?.panes[0]?.url ?? '').startsWith(
        'https://www.google.com/search?',
      ),
    );
  });

  test('carries six long addresses well inside any limit the browser has', () => {
    // The longest URLs in ordinary use are a few hundred characters; this is
    // an order of magnitude more, in every pane of the largest preset.
    const long =
      `https://example.com/${'segment/'.repeat(250)}?q=${'x'.repeat(500)}` as const;

    const state: WorkspaceState = {
      ...initialWorkspaceState(),
      root: parseWorkspaceUrl('?layout=grid-2x3').state?.root ?? paneNode(0),
      panes: Array.from({ length: 6 }, (_, index) => ({
        ...createPane(index),
        url: long,
      })),
      nextPaneId: 6,
      activePaneId: 0,
    } as const;

    const search = workspaceUrlSearch('one', state);

    // Chrome's own ceiling on a URL is 2 MB; this is under 1% of it.
    assert.isTrue(search.length < 20_000);

    assert.deepStrictEqual(
      parseWorkspaceUrl(search).state?.panes.map((pane) => pane.url),
      Array.from({ length: 6 }, () => long),
    );
  });
});
