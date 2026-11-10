import {
  emptyStoredWorkspace,
  encodeWorkspaceRecord,
  formatBackup,
  paneLeaf,
  parseBackup,
  parseList,
  parseOrigins,
  parseStoredWorkspace,
  parseWorkspaceRecord,
  savedAtOfRecord,
  split,
  storageKeys,
  workspaceIdOfKey,
  workspaceKeyOf,
  type StoredWorkspace,
} from '../src/index.mjs';

const stored: StoredWorkspace = {
  version: 1,
  root: split('row', paneLeaf(0), paneLeaf(1), 0.3),
  panes: [
    { id: 0, url: 'https://a.example/', sandboxed: true, zoom: 1 },
    { id: 1, url: '', sandboxed: false, zoom: 1.25 },
  ],
  nextPaneId: 2,
  activePaneId: 1,
  title: 'Board',
} as const;

describe('storage keys', () => {
  test('keep the stored names (contract C2)', () => {
    expect(storageKeys).toStrictEqual({
      list: 'workspaceRegistry',
      workspacePrefix: 'workspace:',
      resetOrigins: 'serviceWorkerResetOrigins',
    });

    expect(workspaceKeyOf('a')).toBe('workspace:a');

    expect(workspaceIdOfKey('workspace:a')).toBe('a');

    expect(workspaceIdOfKey('workspaceRegistry')).toBeUndefined();

    expect(workspaceIdOfKey('workspace:')).toBeUndefined();
  });
});

describe('workspace records', () => {
  test('round-trip', () => {
    // Through JSON, as storage keeps it: `undefined` fields drop out.
    // oxlint-disable-next-line unicorn/prefer-structured-clone
    const record = JSON.parse(
      JSON.stringify(encodeWorkspaceRecord(stored, 42)),
    ) as unknown;

    expect(parseWorkspaceRecord(record)).toStrictEqual(stored);

    expect(savedAtOfRecord(record)).toBe(42);

    expect(savedAtOfRecord('x')).toBe(0);
  });

  test('pane id counters that are not whole numbers are repaired', () => {
    expect(
      parseStoredWorkspace({
        root: { kind: 'pane', paneId: 0 },
        nextPaneId: 2.5,
        activePaneId: -1,
      }),
    ).toMatchObject({ nextPaneId: 0, activePaneId: undefined });
  });

  test('a stored address no pane navigates to is dropped', () => {
    expect(
      parseStoredWorkspace({
        root: { kind: 'pane', paneId: 0 },
        panes: [
          { id: 0, url: 'chrome://settings' },
          { id: 1, url: 'https://a.example/' },
        ],
      })?.panes.map(({ url }) => url),
    ).toStrictEqual(['', 'https://a.example/']);
  });

  test('repair what an earlier version wrote', () => {
    expect(
      parseStoredWorkspace({
        root: {
          kind: 'split',
          axis: 'column',
          ratio: 7,
          fixed: { child: 'second', px: 123.4 },
          first: { kind: 'pane', paneId: 0 },
          second: { kind: 'pane', paneId: 1 },
        },
        panes: [
          { id: 0, url: 'https://a.example/', zoom: 99, title: 'x' },
          { url: 'no id' },
          'junk',
        ],
        title: ' '.repeat(3),
      }),
    ).toStrictEqual({
      version: 1,
      root: {
        kind: 'split',
        axis: 'column',
        ratio: 0.95,
        fixed: { child: 'second', px: 123 },
        first: { kind: 'pane', paneId: 0 },
        second: { kind: 'pane', paneId: 1 },
      },
      panes: [{ id: 0, url: 'https://a.example/', sandboxed: true, zoom: 2 }],
      nextPaneId: 0,
      activePaneId: undefined,
    });
  });

  test.each([
    undefined,
    {},
    {
      root: { kind: 'split', axis: 'row', first: { kind: 'pane', paneId: 0 } },
    },
    { root: { kind: 'pane' } },
    { root: { kind: 'pane', paneId: 1.5 } },
    { root: { kind: 'pane', paneId: -1 } },
  ])('refuse a value with no usable layout: %j', (value) => {
    expect(parseStoredWorkspace(value)).toBeUndefined();
  });
});

test('a layout deeper than a split view can be is refused, not overflowed', () => {
  const deep = Array.from({ length: 10_000 }).reduce<unknown>(
    (inner) => ({ kind: 'split', axis: 'row', first: inner, second: inner }),
    { kind: 'pane', paneId: 0 },
  );

  expect(parseStoredWorkspace({ root: deep })).toBeUndefined();
});

describe('parseList', () => {
  test('drops bad and duplicated entries and repairs activeId', () => {
    expect(
      parseList({
        entries: [
          { id: 'a', name: ' A ', createdAt: 1, pinned: true },
          { id: 'a', name: 'dup' },
          { id: '' },
          { id: 'b' },
          7,
        ],
        activeId: 'gone',
      }),
    ).toStrictEqual({
      version: 1,
      entries: [
        { id: 'a', name: 'A', createdAt: 1, pinned: true },
        { id: 'b', name: 'b', createdAt: 0, pinned: false },
      ],
      activeId: 'a',
    });

    expect(parseList(undefined)).toBeUndefined();

    // Rebuilt from the records, not taken as empty (S3).
    expect(parseList({ entries: null })).toBeUndefined();

    expect(parseList({ entries: [{ id: 3 }] })).toBeUndefined();
  });

  test('parseOrigins keeps strings', () => {
    expect(parseOrigins(['https://a.example', 1, null])).toStrictEqual([
      'https://a.example',
    ]);

    expect(parseOrigins('x')).toStrictEqual([]);
  });
});

describe('backups', () => {
  test('round-trip', () => {
    const text = formatBackup(
      [{ id: 'w', name: 'Work', state: stored }],
      '2026-11-09T00:00:00.000Z',
    );

    expect(text.endsWith('}\n')).toBe(true);

    expect(parseBackup(text)).toStrictEqual([
      { id: 'w', name: 'Work', state: stored },
    ]);
  });

  test('read a raw storage dump, named from the list', () => {
    const dump = JSON.stringify({
      workspaceRegistry: { entries: [{ id: 'w', name: 'Work' }] },
      'workspace:w': { savedAt: 1, state: stored },
      'workspace:v': stored,
      serviceWorkerResetOrigins: [],
    });

    expect(parseBackup(dump)).toStrictEqual([
      { id: 'w', name: 'Work', state: stored },
      { id: 'v', name: 'v', state: stored },
    ]);
  });

  test('an entry with no state becomes an empty view', () => {
    expect(
      parseBackup(JSON.stringify({ workspaces: [{ id: 'x' }, { id: ' ' }] })),
    ).toStrictEqual([{ id: 'x', name: 'x', state: emptyStoredWorkspace }]);
  });

  test.each(['', 'not json', '[]', '{"workspaces":[]}', '{}'])(
    'hold nothing: %j',
    (text) => {
      expect(parseBackup(text)).toBeUndefined();
    },
  );
});
