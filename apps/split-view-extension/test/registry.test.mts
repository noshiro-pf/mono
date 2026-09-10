import {
  activateWorkspaceEntry,
  addWorkspaceEntry,
  moveWorkspaceEntry,
  nextWorkspaceName,
  parseWorkspaceRegistry,
  registryFromStoredWorkspaces,
  removeWorkspaceEntry,
  renameWorkspaceEntry,
  workspaceAtPosition,
  workspaceEntryOf,
  workspacePositionOf,
  type WorkspaceRegistry,
} from '../src/index.mjs';

const registryOf = (
  labels: readonly string[],
  activeId?: string,
): WorkspaceRegistry =>
  ({
    version: 1,
    entries: labels.map((label, index) => ({
      id: `id-${String(index)}`,
      name: label,
      createdAt: index,
    })),
    activeId: activeId ?? 'id-0',
  }) as const;

const labelsOf = (registry: WorkspaceRegistry): readonly string[] =>
  registry.entries.map((entry) => entry.name);

describe('nextWorkspaceName', () => {
  test('is the smallest number no entry is named after', () => {
    assert.deepStrictEqual(
      nextWorkspaceName(registryOf(['split-view-1', 'split-view-3'])),
      'split-view-2',
    );
  });

  test('ignores the names the user has chosen', () => {
    assert.deepStrictEqual(
      nextWorkspaceName(registryOf(['調査', 'split-view-1'])),
      'split-view-2',
    );
  });

  test('is the first one for an empty list', () => {
    assert.deepStrictEqual(nextWorkspaceName(registryOf([])), 'split-view-1');
  });
});

describe('addWorkspaceEntry', () => {
  test('appends the entry', () => {
    const next = addWorkspaceEntry(registryOf(['a']), {
      id: 'new',
      name: 'b',
      createdAt: 5,
    });

    assert.deepStrictEqual(labelsOf(next), ['a', 'b']);
  });

  test('leaves the list alone when the id is already on it', () => {
    const registry = registryOf(['a']);

    assert.isTrue(
      addWorkspaceEntry(registry, {
        id: 'id-0',
        name: 'again',
        createdAt: 5,
      }) === registry,
    );
  });
});

describe('removeWorkspaceEntry', () => {
  // As closing a browser tab does: what is active afterwards is whatever slid
  // into the place the deleted one had.
  test('activates the entry that takes its place', () => {
    const next = removeWorkspaceEntry(
      registryOf(['a', 'b', 'c'], 'id-1'),
      'id-1',
    );

    assert.deepStrictEqual(labelsOf(next), ['a', 'c']);

    assert.deepStrictEqual(next.activeId, 'id-2');

    assert.deepStrictEqual(workspaceEntryOf(next, 'id-1'), undefined);
  });

  test('takes the last one of the list to the one before it', () => {
    const next = removeWorkspaceEntry(registryOf(['a', 'b'], 'id-1'), 'id-1');

    assert.deepStrictEqual(next.activeId, 'id-0');
  });

  test('leaves nothing active when the list is now empty', () => {
    const next = removeWorkspaceEntry(registryOf(['a']), 'id-0');

    assert.deepStrictEqual(next.entries, []);

    assert.deepStrictEqual(next.activeId, undefined);
  });

  test('leaves the list alone when the id is not on it', () => {
    const registry = registryOf(['a']);

    assert.isTrue(removeWorkspaceEntry(registry, 'nope') === registry);
  });
});

describe('renameWorkspaceEntry', () => {
  test('trims what was typed', () => {
    assert.deepStrictEqual(
      labelsOf(renameWorkspaceEntry(registryOf(['a', 'b']), 'id-1', '  PR  ')),
      ['a', 'PR'],
    );
  });

  test('refuses a name that is blank once trimmed', () => {
    const registry = registryOf(['a']);

    assert.isTrue(
      renameWorkspaceEntry(registry, 'id-0', ' '.repeat(3)) === registry,
    );
  });
});

describe('moveWorkspaceEntry', () => {
  test('moves an entry along the list', () => {
    assert.deepStrictEqual(
      labelsOf(moveWorkspaceEntry(registryOf(['a', 'b', 'c']), 'id-2', -1)),
      ['a', 'c', 'b'],
    );
  });

  test('clamps at both ends', () => {
    const registry = registryOf(['a', 'b']);

    assert.isTrue(moveWorkspaceEntry(registry, 'id-0', -1) === registry);

    assert.deepStrictEqual(labelsOf(moveWorkspaceEntry(registry, 'id-0', 9)), [
      'b',
      'a',
    ]);
  });
});

describe('positions', () => {
  test('number the entries from one, in list order', () => {
    const registry = registryOf(['a', 'b', 'c']);

    assert.deepStrictEqual(workspacePositionOf(registry, 'id-1'), 2);

    assert.deepStrictEqual(workspaceAtPosition(registry, 2)?.name, 'b');

    assert.deepStrictEqual(workspaceAtPosition(registry, 4), undefined);
  });

  test('follow a reorder, which is what makes it a way to change Alt+N', () => {
    const reordered = moveWorkspaceEntry(registryOf(['a', 'b']), 'id-1', -1);

    assert.deepStrictEqual(workspacePositionOf(reordered, 'id-1'), 1);
  });
});

describe('activateWorkspaceEntry', () => {
  test('is the same registry when it changes nothing', () => {
    const registry = registryOf(['a']);

    assert.isTrue(activateWorkspaceEntry(registry, 'id-0') === registry);
  });
});

describe('registryFromStoredWorkspaces', () => {
  test('puts the workspace from before there was a list first', () => {
    const registry = registryFromStoredWorkspaces([
      { id: 'zzz', savedAt: 30 },
      { id: 'default', savedAt: 10 },
      { id: 'aaa', savedAt: 20 },
    ]);

    assert.deepStrictEqual(
      registry.entries.map((entry) => entry.id),
      ['default', 'zzz', 'aaa'],
    );

    assert.deepStrictEqual(labelsOf(registry), [
      'split-view-1',
      'split-view-2',
      'split-view-3',
    ]);

    assert.deepStrictEqual(registry.activeId, 'default');
  });

  test('is an empty list for a profile with nothing stored', () => {
    assert.deepStrictEqual(registryFromStoredWorkspaces([]), {
      version: 1,
      entries: [],
      activeId: undefined,
    });
  });
});

describe('parseWorkspaceRegistry', () => {
  test('reads back what was stored', () => {
    assert.deepStrictEqual(
      parseWorkspaceRegistry({
        version: 1,
        entries: [{ id: 'a', name: '調査', createdAt: 7 }],
        activeId: 'a',
      }),
      {
        version: 1,
        entries: [{ id: 'a', name: '調査', createdAt: 7 }],
        activeId: 'a',
      },
    );
  });

  test('drops what it cannot read and keeps the rest', () => {
    const parsed = parseWorkspaceRegistry({
      entries: [
        { id: 'a' },
        { id: 'a', name: 'duplicate' },
        { name: 'no id' },
        7,
      ],
      activeId: 'gone',
    });

    assert.deepStrictEqual(parsed, {
      version: 1,
      entries: [{ id: 'a', name: 'a', createdAt: 0 }],
      activeId: 'a',
    });
  });

  test('refuses a value with no entries field at all', () => {
    assert.deepStrictEqual(parseWorkspaceRegistry(undefined), undefined);

    assert.deepStrictEqual(parseWorkspaceRegistry({ version: 1 }), undefined);
  });
});
