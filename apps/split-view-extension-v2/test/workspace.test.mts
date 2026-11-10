import {
  createPane,
  findPane,
  initialWorkspace,
  maxPaneCount,
  paneIdsOf,
  paneLeaf,
  panesInTreeOrder,
  split,
  workspaceFromStored,
  workspaceReducer,
  workspaceToStored,
  type Workspace,
} from '../src/index.mjs';

const two: Workspace = {
  root: split('row', paneLeaf(0), paneLeaf(1)),
  panes: [createPane(0, 'https://a.example/'), createPane(1)],
  nextPaneId: 2,
  activePaneId: 0,
  title: undefined,
} as const;

describe('workspaceReducer', () => {
  test('a new split view is a 2×2 grid of empty panes', () => {
    const workspace = initialWorkspace();

    expect(paneIdsOf(workspace.root)).toStrictEqual([0, 1, 2, 3]);

    expect(workspace.panes.map(({ url }) => url)).toStrictEqual([
      '',
      '',
      '',
      '',
    ]);

    expect(workspace.nextPaneId).toBe(4);
  });

  test('an action that changes nothing returns the same object', () => {
    expect(workspaceReducer(two, { type: 'activate', paneId: 0 })).toBe(two);

    expect(workspaceReducer(two, { type: 'close', paneId: 9 })).toBe(two);

    expect(
      workspaceReducer(two, { type: 'zoom', paneId: 0, step: 'reset' }),
    ).toBe(two);

    expect(
      workspaceReducer(two, {
        type: 'resize',
        path: [],
        firstPx: 500,
        availablePx: 1000,
      }),
    ).toBe(two);
  });

  test('a repeated report changes nothing', () => {
    const report = {
      type: 'report',
      paneId: 0,
      url: 'https://a.example/next',
      title: 'Next',
      historyLength: 2,
    } as const;

    const once = workspaceReducer(two, report);

    expect(findPane(once, 0)?.live).toMatchObject({
      currentUrl: 'https://a.example/next',
      title: 'Next',
    });

    expect(workspaceReducer(once, report)).toBe(once);
  });

  test('a reported address no pane navigates to is not taken', () => {
    const forged = workspaceReducer(two, {
      type: 'report',
      paneId: 0,
      url: 'chrome-extension://abc/split.html',
      title: 'Forged',
      historyLength: 2,
    });

    expect(findPane(forged, 0)?.live).toMatchObject({
      currentUrl: findPane(two, 0)?.live.currentUrl,
      title: 'Forged',
    });
  });

  test('navigate normalizes and the same address reloads', () => {
    const navigated = workspaceReducer(two, {
      type: 'navigate',
      paneId: 1,
      input: 'b.example',
    });

    expect(findPane(navigated, 1)?.url).toBe('https://b.example');

    expect(navigated.activePaneId).toBe(1);

    const again = workspaceReducer(navigated, {
      type: 'navigate',
      paneId: 1,
      input: 'b.example',
    });

    expect(findPane(again, 1)?.live.reloadToken).toBe(1);

    expect(
      workspaceReducer(two, { type: 'navigate', paneId: 1, input: '  ' }),
    ).toBe(two);
  });

  test('reload and sandbox changes fold the current address into url', () => {
    const moved = workspaceReducer(two, {
      type: 'report',
      paneId: 0,
      url: 'https://a.example/elsewhere',
      title: '',
      historyLength: 2,
    });

    const reloaded = workspaceReducer(moved, { type: 'reload', paneId: 0 });

    expect(findPane(reloaded, 0)).toMatchObject({
      url: 'https://a.example/elsewhere',
      live: { reloadToken: 1 },
    });

    const opened = workspaceReducer(moved, {
      type: 'set-sandboxed',
      paneId: 0,
      sandboxed: false,
    });

    expect(findPane(opened, 0)).toMatchObject({
      url: 'https://a.example/elsewhere',
      sandboxed: false,
    });
  });

  test('split adds a pane beside the one asked for, or the active one', () => {
    const splitted = workspaceReducer(two, {
      type: 'split',
      paneId: 9,
      axis: 'column',
      input: 'c.example',
    });

    expect(paneIdsOf(splitted.root)).toStrictEqual([0, 2, 1]);

    expect(findPane(splitted, 2)?.url).toBe('https://c.example');

    expect(splitted).toMatchObject({ nextPaneId: 3, activePaneId: 2 });
  });

  test('close keeps the last pane and moves the active pane', () => {
    const closed = workspaceReducer(two, { type: 'close', paneId: 0 });

    expect(closed).toMatchObject({ root: paneLeaf(1), activePaneId: 1 });

    expect(closed.panes.map(({ id }) => id)).toStrictEqual([1]);

    expect(workspaceReducer(closed, { type: 'close', paneId: 1 })).toBe(closed);
  });

  test('move swaps in the middle and attaches at a side', () => {
    const swapped = workspaceReducer(two, {
      type: 'move',
      paneId: 0,
      target: 1,
      zone: 'center',
    });

    expect(paneIdsOf(swapped.root)).toStrictEqual([1, 0]);

    expect(swapped.panes).toBe(two.panes);

    const stacked = workspaceReducer(two, {
      type: 'move',
      paneId: 0,
      target: 1,
      zone: 'bottom',
    });

    expect(stacked.root).toStrictEqual(
      split('column', paneLeaf(1), paneLeaf(0)),
    );
  });

  test('apply-preset reuses panes in tree order and creates the rest', () => {
    const three = workspaceReducer(two, {
      type: 'apply-preset',
      presetId: 'columns-3',
    });

    expect(paneIdsOf(three.root)).toStrictEqual([0, 1, 2]);

    expect(findPane(three, 0)?.url).toBe('https://a.example/');

    const one = workspaceReducer(three, {
      type: 'apply-preset',
      presetId: 'single',
    });

    expect(one).toMatchObject({ root: paneLeaf(0), nextPaneId: 3 });

    expect(one.panes.map(({ id }) => id)).toStrictEqual([0]);
  });

  test('zoom steps along the ladder', () => {
    const zoomed = workspaceReducer(two, {
      type: 'zoom',
      paneId: 0,
      step: 'in',
    });

    expect(findPane(zoomed, 0)?.zoom).toBe(1.1);
  });
});

test('a split view stops splitting at the most panes it may have', () => {
  const full = Array.from({ length: maxPaneCount - 1 }).reduce<Workspace>(
    (workspace) =>
      workspaceReducer(workspace, {
        type: 'split',
        paneId: undefined,
        axis: 'row',
        input: '',
      }),
    { ...two, root: paneLeaf(0), panes: [createPane(0)], nextPaneId: 1 },
  );

  expect(full.panes).toHaveLength(maxPaneCount);

  expect(
    workspaceReducer(full, {
      type: 'split',
      paneId: undefined,
      axis: 'row',
      input: '',
    }),
  ).toBe(full);
});

describe('stored workspaces', () => {
  test('repairs panes, ids and the active pane', () => {
    const workspace = workspaceFromStored({
      version: 1,
      root: split('row', paneLeaf(3), paneLeaf(5)),
      panes: [
        { id: 3, url: 'https://a.example/', sandboxed: false, zoom: 1.5 },
        { id: 7, url: 'https://gone.example/', sandboxed: true, zoom: 1 },
      ],
      nextPaneId: 0,
      activePaneId: 7,
    });

    expect(workspace.panes.map(({ id, url }) => [id, url])).toStrictEqual([
      [3, 'https://a.example/'],
      [5, ''],
    ]);

    // Past the dropped pane 7 too, whose id a new pane must not take.
    expect(workspace).toMatchObject({ nextPaneId: 8, activePaneId: 3 });
  });

  test('gives a pane id the tree repeats a pane of its own', () => {
    const workspace = workspaceFromStored({
      version: 1,
      root: split(
        'row',
        paneLeaf(1),
        split('column', paneLeaf(1), paneLeaf(4)),
      ),
      panes: [{ id: 1, url: 'https://a.example/', sandboxed: true, zoom: 1 }],
      nextPaneId: 2,
      activePaneId: 1,
    });

    expect(paneIdsOf(workspace.root)).toStrictEqual([1, 5, 4]);

    expect(workspace.panes.map(({ id, url }) => [id, url])).toStrictEqual([
      [1, 'https://a.example/'],
      [5, ''],
      [4, ''],
    ]);

    expect(workspace.nextPaneId).toBe(6);
  });

  test('a repeat does not take the id of a pane the tree dropped', () => {
    const workspace = workspaceFromStored({
      version: 1,
      root: split('row', paneLeaf(1), paneLeaf(1)),
      panes: [
        { id: 1, url: 'https://a.example/', sandboxed: true, zoom: 1 },
        { id: 2, url: 'https://dropped.example/', sandboxed: true, zoom: 1 },
      ],
      nextPaneId: 2,
      activePaneId: 1,
    });

    expect(workspace.panes.map(({ id, url }) => [id, url])).toStrictEqual([
      [1, 'https://a.example/'],
      [3, ''],
    ]);
  });

  test('stores where the panes are and nothing live', () => {
    const moved = workspaceReducer(two, {
      type: 'report',
      paneId: 0,
      url: 'https://a.example/there',
      title: 'There',
      historyLength: 3,
    });

    expect(workspaceToStored(moved)).toStrictEqual({
      version: 1,
      root: two.root,
      panes: [
        { id: 0, url: 'https://a.example/there', sandboxed: true, zoom: 1 },
        { id: 1, url: '', sandboxed: true, zoom: 1 },
      ],
      nextPaneId: 2,
      activePaneId: 0,
    });

    expect(workspaceToStored({ ...two, title: 'Board' }).title).toBe('Board');
  });

  test('panesInTreeOrder follows the tree, not the array', () => {
    const swapped = workspaceReducer(two, {
      type: 'move',
      paneId: 0,
      target: 1,
      zone: 'center',
    });

    expect(panesInTreeOrder(swapped).map(({ id }) => id)).toStrictEqual([1, 0]);
  });
});
