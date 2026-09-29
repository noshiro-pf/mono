import {
  describeOpenedWorkspaces,
  workspaceTabsToOpen,
  type WorkspaceEntry,
} from '../src/index.mjs';

const entry = (id: string, pinned: boolean = false): WorkspaceEntry =>
  ({
    id,
    name: id,
    createdAt: 0,
    pinned,
  }) as const;

describe('workspaceTabsToOpen', () => {
  test('opens the list in its order, pinned ones pinned, all behind', () => {
    assert.deepStrictEqual(
      workspaceTabsToOpen(
        [entry('a'), entry('b', true), entry('c')],
        new Set(),
        undefined,
      ),
      [
        { workspaceId: 'a', pinned: false, active: false },
        { workspaceId: 'b', pinned: true, active: false },
        { workspaceId: 'c', pinned: false, active: false },
      ],
    );
  });

  test('leaves alone the ones already open in a tab', () => {
    assert.deepStrictEqual(
      workspaceTabsToOpen(
        [entry('a'), entry('b'), entry('c')],
        new Set(['b']),
        undefined,
      ),
      [
        { workspaceId: 'a', pinned: false, active: false },
        { workspaceId: 'c', pinned: false, active: false },
      ],
    );
  });

  test('brings the one named to the front, and only that one', () => {
    assert.deepStrictEqual(
      workspaceTabsToOpen([entry('a'), entry('b'), entry('c')], new Set(), 'b'),
      [
        { workspaceId: 'a', pinned: false, active: false },
        { workspaceId: 'b', pinned: false, active: true },
        { workspaceId: 'c', pinned: false, active: false },
      ],
    );

    assert.deepStrictEqual(
      workspaceTabsToOpen([entry('a'), entry('b')], new Set(['b']), 'b'),
      [{ workspaceId: 'a', pinned: false, active: false }],
    );
  });
});

describe('describeOpenedWorkspaces', () => {
  test('says what was opened', () => {
    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 1, alreadyOpen: 0 }),
      'Opened one split view in a tab of its own.',
    );

    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 3, alreadyOpen: 0 }),
      'Opened 3 split views in tabs of their own.',
    );
  });

  test('and what it left alone, which is why nothing seemed to happen', () => {
    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 2, alreadyOpen: 1 }),
      'Opened 2 split views in tabs of their own. One was already open.',
    );

    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 1, alreadyOpen: 4 }),
      'Opened one split view in a tab of its own. 4 were already open.',
    );
  });

  test('and says so when it opened nothing at all', () => {
    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 0, alreadyOpen: 2 }),
      'Every saved split view is already open in a tab.',
    );

    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 0, alreadyOpen: 0 }),
      'There is no saved split view to open.',
    );
  });
});
