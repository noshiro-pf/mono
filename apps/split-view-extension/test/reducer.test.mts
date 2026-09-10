import {
  createPane,
  findPane,
  initialWorkspaceState,
  paneIdsOf,
  paneNode,
  parseWorkspaceState,
  reconcileWorkspace,
  splitNode,
  workspaceReducer,
  type WorkspaceState,
} from '../src/index.mjs';

const withUrl = (
  state: WorkspaceState,
  paneId: number,
  url: string,
): WorkspaceState =>
  workspaceReducer(state, { type: 'navigate', paneId, input: url });

describe('initialWorkspaceState', () => {
  test('is a 2x2 grid of four empty panes', () => {
    const state = initialWorkspaceState();

    assert.deepStrictEqual(paneIdsOf(state.root), [0, 1, 2, 3]);

    assert.deepStrictEqual(state.panes.length, 4);

    assert.deepStrictEqual(state.nextPaneId, 4);

    assert.deepStrictEqual(
      state.panes.map((pane) => pane.url),
      ['', '', '', ''],
    );
  });
});

describe('navigate', () => {
  test('normalizes what was typed', () => {
    const state = withUrl(initialWorkspaceState(), 1, 'example.com');

    assert.deepStrictEqual(findPane(state, 1)?.url, 'https://example.com');

    assert.deepStrictEqual(state.activePaneId, 1);
  });

  test('re-submitting the same address reloads instead of doing nothing', () => {
    const first = withUrl(initialWorkspaceState(), 1, 'https://example.com');

    const second = withUrl(first, 1, 'https://example.com');

    assert.deepStrictEqual(findPane(first, 1)?.reloadToken, 0);

    assert.deepStrictEqual(findPane(second, 1)?.reloadToken, 1);
  });

  test('ignores an empty address and an unknown pane', () => {
    const state = initialWorkspaceState();

    assert.deepStrictEqual(withUrl(state, 1, ' '.repeat(3)), state);

    assert.deepStrictEqual(withUrl(state, 99, 'example.com'), state);
  });
});

describe('split and close', () => {
  test('splitting adds a pane next to the one split', () => {
    const state = workspaceReducer(initialWorkspaceState(), {
      type: 'split',
      paneId: 0,
      axis: 'row',
    });

    assert.deepStrictEqual(paneIdsOf(state.root), [0, 4, 1, 2, 3]);

    assert.deepStrictEqual(state.panes.length, 5);

    assert.deepStrictEqual(state.nextPaneId, 5);

    assert.deepStrictEqual(state.activePaneId, 4);
  });

  test('closing removes the pane and its state', () => {
    const state = workspaceReducer(initialWorkspaceState(), {
      type: 'close',
      paneId: 0,
    });

    assert.deepStrictEqual(paneIdsOf(state.root), [1, 2, 3]);

    assert.deepStrictEqual(
      state.panes.map((pane) => pane.id),
      [1, 2, 3],
    );

    assert.deepStrictEqual(state.activePaneId, 1);
  });

  test('the last pane cannot be closed', () => {
    const single = workspaceReducer(initialWorkspaceState(), {
      type: 'apply-preset',
      presetId: 'single',
    });

    assert.deepStrictEqual(
      workspaceReducer(single, { type: 'close', paneId: 0 }),
      single,
    );
  });
});

describe('apply-preset', () => {
  test('keeps the addresses of the panes it reuses', () => {
    const state = withUrl(
      withUrl(initialWorkspaceState(), 0, 'a.example.com'),
      1,
      'b.example.com',
    );

    const columns = workspaceReducer(state, {
      type: 'apply-preset',
      presetId: 'columns-3',
    });

    assert.deepStrictEqual(paneIdsOf(columns.root), [0, 1, 2]);

    assert.deepStrictEqual(
      columns.panes.map((pane) => pane.url),
      ['https://a.example.com', 'https://b.example.com', ''],
    );
  });

  test('creates the panes a larger layout needs', () => {
    const grid = workspaceReducer(initialWorkspaceState(), {
      type: 'apply-preset',
      presetId: 'grid-2x3',
    });

    assert.deepStrictEqual(paneIdsOf(grid.root), [0, 1, 2, 3, 4, 5]);

    assert.deepStrictEqual(grid.nextPaneId, 6);
  });

  test('drops the panes a smaller layout has no room for', () => {
    const single = workspaceReducer(initialWorkspaceState(), {
      type: 'apply-preset',
      presetId: 'single',
    });

    assert.deepStrictEqual(paneIdsOf(single.root), [0]);

    assert.deepStrictEqual(single.panes.length, 1);
  });
});

describe('report', () => {
  test('records where the frame says it is', () => {
    const state = workspaceReducer(initialWorkspaceState(), {
      type: 'report',
      paneId: 2,
      url: 'https://example.com/inner',
      title: 'Inner',
      historyLength: 3,
    });

    assert.deepStrictEqual(
      findPane(state, 2)?.currentUrl,
      'https://example.com/inner',
    );

    assert.deepStrictEqual(findPane(state, 2)?.title, 'Inner');

    assert.deepStrictEqual(findPane(state, 2)?.historyLength, 3);
  });

  test('is the same state when nothing changed, so that polling is free', () => {
    const first = workspaceReducer(initialWorkspaceState(), {
      type: 'report',
      paneId: 2,
      url: 'https://example.com/',
      title: '',
      historyLength: 1,
    });

    const second = workspaceReducer(first, {
      type: 'report',
      paneId: 2,
      url: 'https://example.com/',
      title: '',
      historyLength: 1,
    });

    assert.isTrue(first === second);
  });
});

describe('reload', () => {
  test('reloads where the pane is now, not where it was pointed', () => {
    const navigated = workspaceReducer(
      workspaceReducer(initialWorkspaceState(), {
        type: 'navigate',
        paneId: 0,
        input: 'https://example.com',
      }),
      {
        type: 'report',
        paneId: 0,
        url: 'https://example.com/inner',
        title: 'Inner',
        historyLength: 2,
      },
    );

    const reloaded = workspaceReducer(navigated, { type: 'reload', paneId: 0 });

    assert.deepStrictEqual(
      findPane(reloaded, 0)?.url,
      'https://example.com/inner',
    );

    assert.deepStrictEqual(findPane(reloaded, 0)?.reloadToken, 1);
  });
});

describe('set-sandboxed', () => {
  test('forces the frame to be recreated, since the attribute is read on load', () => {
    const state = workspaceReducer(initialWorkspaceState(), {
      type: 'set-sandboxed',
      paneId: 0,
      sandboxed: false,
    });

    assert.deepStrictEqual(findPane(state, 0)?.sandboxed, false);

    assert.deepStrictEqual(findPane(state, 0)?.reloadToken, 1);
  });
});

describe('reconcileWorkspace', () => {
  test('creates the panes the tree refers to and drops the ones it does not', () => {
    const repaired = reconcileWorkspace({
      version: 1,
      root: splitNode('row', paneNode(3), paneNode(9)),
      panes: [createPane(3), createPane(7)],
      nextPaneId: 0,
      activePaneId: 7,
    });

    assert.deepStrictEqual(
      repaired.panes.map((pane) => pane.id),
      [3, 9],
    );

    assert.deepStrictEqual(repaired.nextPaneId, 10);

    assert.deepStrictEqual(repaired.activePaneId, 3);
  });
});

describe('parseWorkspaceState', () => {
  test('reads back what was stored', () => {
    const stored = {
      version: 1,
      root: {
        kind: 'split',
        axis: 'row',
        ratio: 0.3,
        first: { kind: 'pane', paneId: 0 },
        second: { kind: 'pane', paneId: 1 },
      },
      panes: [
        { id: 0, url: 'https://example.com', sandboxed: false },
        { id: 1, url: '', sandboxed: true },
      ],
      nextPaneId: 2,
      activePaneId: 1,
    } as const;

    assert.deepStrictEqual(parseWorkspaceState(stored), {
      version: 1,
      root: splitNode('row', paneNode(0), paneNode(1), 0.3),
      panes: [
        { ...createPane(0), url: 'https://example.com', sandboxed: false },
        createPane(1),
      ],
      nextPaneId: 2,
      activePaneId: 1,
    });
  });

  test('refuses a value with no usable tree', () => {
    assert.deepStrictEqual(parseWorkspaceState(undefined), undefined);

    assert.deepStrictEqual(
      parseWorkspaceState({ root: { kind: 'nonsense' } }),
      undefined,
    );

    assert.deepStrictEqual(
      parseWorkspaceState({ root: { kind: 'split', axis: 'row' } }),
      undefined,
    );
  });
});

/** Pane 0 dropped onto pane 3, in a default grid with two addresses in it. */
const moved = (
  zone: 'bottom' | 'center' | 'left' | 'right' | 'top',
): WorkspaceState =>
  workspaceReducer(
    withUrl(
      withUrl(initialWorkspaceState(), 0, 'a.example.com'),
      3,
      'd.example.com',
    ),
    { type: 'move-pane', paneId: 0, targetPaneId: 3, zone },
  );

describe('move-pane', () => {
  test('the middle exchanges the two panes places, addresses and all', () => {
    const state = moved('center');

    // The default grid is a row of two columns, so 0 and 3 are opposite
    // corners; swapping them reverses the order the tree is read in.
    assert.deepStrictEqual(paneIdsOf(state.root), [3, 1, 2, 0]);

    // The pages travel with the panes: nothing is reloaded, so nothing has to
    // be re-fetched under a new id.
    assert.deepStrictEqual(findPane(state, 0)?.url, 'https://a.example.com');

    assert.deepStrictEqual(findPane(state, 3)?.url, 'https://d.example.com');

    assert.deepStrictEqual(findPane(state, 0)?.reloadToken, 0);
  });

  test('an edge takes that side of the target', () => {
    assert.deepStrictEqual(paneIdsOf(moved('right').root), [1, 2, 3, 0]);

    assert.deepStrictEqual(moved('right').panes.length, 4);
  });

  test('the moved pane becomes the active one', () => {
    assert.deepStrictEqual(moved('top').activePaneId, 0);
  });

  test('is the same state when there is nothing to do', () => {
    const state = initialWorkspaceState();

    assert.isTrue(
      workspaceReducer(state, {
        type: 'move-pane',
        paneId: 0,
        targetPaneId: 0,
        zone: 'center',
      }) === state,
    );

    assert.isTrue(
      workspaceReducer(state, {
        type: 'move-pane',
        paneId: 0,
        targetPaneId: 99,
        zone: 'left',
      }) === state,
    );
  });
});

/** Pane 1 of a default grid, zoomed by the steps given, in order. */
const zoomed = (steps: readonly ('in' | 'out' | 'reset')[]): WorkspaceState =>
  steps.reduce(
    (state, step) => workspaceReducer(state, { type: 'zoom', paneId: 1, step }),
    initialWorkspaceState(),
  );

describe('zoom', () => {
  test('a pane starts unzoomed', () => {
    assert.deepStrictEqual(findPane(initialWorkspaceState(), 1)?.zoom, 1);
  });

  test('steps that pane and no other', () => {
    const state = zoomed(['in', 'in']);

    assert.deepStrictEqual(findPane(state, 1)?.zoom, 1.25);

    assert.deepStrictEqual(findPane(state, 0)?.zoom, 1);
  });

  test('reset takes it back', () => {
    assert.deepStrictEqual(
      findPane(zoomed(['out', 'out', 'reset']), 1)?.zoom,
      1,
    );
  });

  // Zoom is a property of the pane, not of what is loaded in it: the frame is
  // scaled from outside, so there is nothing to reload.
  test('does not reload the frame', () => {
    assert.deepStrictEqual(findPane(zoomed(['in']), 1)?.reloadToken, 0);
  });

  test('is the same state at the end of the ladder', () => {
    const state = zoomed(['in', 'in', 'in', 'in', 'in', 'in']);

    assert.isTrue(
      workspaceReducer(state, { type: 'zoom', paneId: 1, step: 'in' }) ===
        state,
    );
  });
});
