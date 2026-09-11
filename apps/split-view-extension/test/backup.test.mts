import { paneNode, parseBackup, splitNode } from '../src/index.mjs';

describe('parseBackup', () => {
  test('reads the envelope the export writes', () => {
    const workspaces = parseBackup(
      JSON.stringify({
        kind: 'split-view-backup',
        version: 1,
        exportedAt: '2026-09-10 12:00:00',
        workspaces: [
          {
            id: 'a',
            name: '調査',
            state: {
              version: 1,
              root: {
                kind: 'split',
                axis: 'row',
                ratio: 0.4,
                first: { kind: 'pane', paneId: 0 },
                second: { kind: 'pane', paneId: 1 },
              },
              panes: [{ id: 0, url: 'https://example.com' }, { id: 1 }],
              nextPaneId: 2,
              activePaneId: 0,
            },
          },
        ],
      }),
    );

    assert.deepStrictEqual(workspaces?.length, 1);

    assert.deepStrictEqual(workspaces?.[0]?.name, '調査');

    assert.deepStrictEqual(
      workspaces?.[0]?.state.root,
      splitNode('row', paneNode(0), paneNode(1), 0.4),
    );

    assert.deepStrictEqual(
      workspaces?.[0]?.state.panes.map((pane) => pane.url),
      ['https://example.com', ''],
    );
  });

  // The way across from an extension id that has already changed: the old id's
  // page can no longer export, but its DevTools console can still print its
  // storage.
  test('reads a raw chrome.storage.local dump, names and all', () => {
    const workspaces = parseBackup(
      JSON.stringify({
        workspaceRegistry: {
          version: 1,
          entries: [{ id: 'default', name: 'PR', createdAt: 1 }],
          activeId: 'default',
        },
        'workspace:default': {
          savedAt: 1,
          state: {
            version: 1,
            root: { kind: 'pane', paneId: 0 },
            panes: [{ id: 0, url: 'https://example.com' }],
            nextPaneId: 1,
          },
        },
        serviceWorkerResetOrigins: ['https://github.com'],
      }),
    );

    assert.deepStrictEqual(workspaces?.length, 1);

    assert.deepStrictEqual(workspaces?.[0]?.id, 'default');

    assert.deepStrictEqual(workspaces?.[0]?.name, 'PR');
  });

  test('falls back to the id when the dump has no names in it', () => {
    const workspaces = parseBackup(
      JSON.stringify({
        'workspace:solo': {
          state: { root: { kind: 'pane', paneId: 0 }, panes: [{ id: 0 }] },
        },
      }),
    );

    assert.deepStrictEqual(workspaces?.[0]?.name, 'solo');
  });

  test('refuses what is not a backup', () => {
    assert.deepStrictEqual(parseBackup('not json'), undefined);

    assert.deepStrictEqual(parseBackup('[]'), undefined);

    assert.deepStrictEqual(
      parseBackup(JSON.stringify({ workspaces: [] })),
      undefined,
    );

    assert.deepStrictEqual(
      parseBackup(JSON.stringify({ someOtherExtension: 1 })),
      undefined,
    );
  });
});
